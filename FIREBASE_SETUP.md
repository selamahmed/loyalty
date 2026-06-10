# NexReward — Firebase & Firestore Setup Guide

This document maps every feature found in the current codebase to its required Firestore collection, field schema, and indexing strategy. Implement these collections in order; later ones depend on earlier ones being present.

---

## 1. Firebase Project Initialisation

```bash
npm install firebase
```

```ts
// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore }   from 'firebase/firestore';
import { getAuth }        from 'firebase/auth';
import { getStorage }     from 'firebase/storage';

const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID",
};

export const app       = initializeApp(firebaseConfig);
export const db        = getFirestore(app);
export const auth      = getAuth(app);
export const storage   = getStorage(app);
```

---

## 2. Firebase Authentication

Use **Email/Password** provider for all four roles. After sign-up, write the user document to Firestore with the `role` field. The role is read on every login to redirect users to the correct dashboard.

Roles: `customer` | `store_admin` | `super_admin` | `cashier`

---

## 3. Firestore Collections

### 3.1 `users`

One document per registered user. Created at sign-up; updated on every login, level-up, and point transaction.

```
users/{userId}
├── id              : string          // same as Firebase Auth UID
├── username        : string
├── email           : string
├── avatar          : string          // Storage URL or Pexels URL
├── role            : "customer" | "store_admin" | "super_admin" | "cashier"
├── status          : "active" | "suspended" | "inactive"
│
│   ── Points & Level ──
├── currentPoints   : number          // spendable balance
├── totalPoints     : number          // all-time earned (never decreases)
├── level           : number
├── xp              : number          // XP towards next level
├── xpToNext        : number
├── rank            : number          // global leaderboard position (updated by cloud function)
│
│   ── Engagement ──
├── streak          : number          // consecutive daily login days
├── lastLoginDate   : Timestamp
├── joinDate        : Timestamp
│
│   ── Counters (denormalised for speed) ──
├── achievementCount: number
├── missionCount    : number
└── visitCount      : number
```

**Indexes:** `role ASC, totalPoints DESC` (leaderboard), `status ASC, lastLoginDate DESC` (admin user list).

---

### 3.2 `rewards`

Products / items available in the loyalty shop. Managed by Super Admin or Store Admin.

```
rewards/{rewardId}
├── id          : string
├── title       : string
├── description : string
├── points      : number          // cost in points to redeem
├── category    : "coffee" | "pastries" | "food" | "drinks" | "merchandise"
├── image       : string          // Storage URL
├── featured    : boolean
├── limited     : boolean
├── stock       : number          // decremented on each redemption
├── expiresAt   : Timestamp | null
├── active      : boolean
├── storeId     : string          // which physical store owns this reward
└── createdAt   : Timestamp
```

**Indexes:** `active ASC, featured DESC`, `category ASC, points ASC`.

---

### 3.3 `inventory` (sub-collection under `users`)

Each user's redeemed items. Created when a user redeems a reward from the shop.

```
users/{userId}/inventory/{itemId}
├── id          : string
├── rewardId    : string          // reference to rewards/{rewardId}
├── title       : string          // denormalised for offline display
├── description : string
├── image       : string
├── type        : "coupon" | "reward" | "ticket"
├── points      : number          // cost paid at time of redemption
├── code        : string          // unique redemption code (e.g. "NXR-A1B2-C3D4")
├── barcode     : string          // numeric string for barcode display
├── used        : boolean
├── usedAt      : Timestamp | null
├── usedBy      : string | null   // cashier userId who processed it
├── expires     : Timestamp | null
└── createdAt   : Timestamp
```

---

### 3.4 `transactions`

Immutable audit trail of every point movement. Written by cloud functions — never mutated.

```
transactions/{txId}
├── id          : string
├── userId      : string
├── userName    : string          // denormalised
├── type        : "earned" | "redeemed" | "adjusted" | "expired" | "bonus"
├── points      : number          // positive = earned, negative = spent
├── balanceBefore: number
├── balanceAfter : number
├── description : string          // human-readable, e.g. "QR Scan at Store #42"
├── category    : "qr_scan" | "game" | "mission" | "purchase" | "redemption" | "admin_adjustment" | "daily_bonus" | "event_bonus"
├── rewardId    : string | null   // if a redemption
├── storeId     : string | null   // physical store
├── cashierId   : string | null   // cashier who processed
├── qrCode      : string | null   // raw QR payload if triggered by QR scan
└── createdAt   : Timestamp
```

**Indexes:** `userId ASC, createdAt DESC` (user history), `storeId ASC, createdAt DESC` (store reports), `category ASC, createdAt DESC` (analytics).

---

### 3.5 `achievements`

Master list of all possible achievements. One document per achievement definition (not per user).

```
achievements/{achievementId}
├── id          : string
├── title       : string
├── description : string
├── icon        : string          // emoji or Storage URL
├── category    : "missions" | "points" | "streak" | "games" | "qr" | "social" | "redeem" | "level"
├── rarity      : "common" | "rare" | "epic" | "legendary"
├── pointReward : number          // awarded when unlocked
├── requirement : number          // threshold (e.g. 10 missions completed)
└── active      : boolean
```

**User progress** is tracked in a sub-collection:

```
users/{userId}/achievementProgress/{achievementId}
├── achievementId : string
├── completed     : boolean
├── progress      : number        // current progress towards requirement
├── completedAt   : Timestamp | null
└── pointsAwarded : boolean       // prevents double-awarding
```

---

### 3.6 `missions`

Daily and weekly short-term tasks. The master list is static; user completion is in a sub-collection.

```
missions/{missionId}
├── id          : string
├── title       : string
├── description : string
├── icon        : string
├── points      : number
├── category    : "daily" | "weekly"
├── requirement : number
└── active      : boolean
```

```
users/{userId}/missionProgress/{missionId}
├── missionId   : string
├── completed   : boolean
├── progress    : number
├── resetDate   : Timestamp       // when this entry expires (daily = midnight, weekly = next Monday)
└── completedAt : Timestamp | null
```

---

### 3.7 `events` (Seasonal Events)

Time-bound campaigns with point multipliers and exclusive rewards.

```
events/{eventId}
├── id            : string
├── title         : string
├── description   : string
├── image         : string
├── startDate     : Timestamp
├── endDate       : Timestamp
├── active        : boolean
├── multiplier    : string        // e.g. "2x", "3x"
├── color         : string        // gradient CSS string
├── totalRewards  : number
└── unlockedRewards: number       // running counter updated by cloud function
```

**Per-user event progress:**

```
users/{userId}/eventProgress/{eventId}
├── eventId     : string
├── progress    : number
└── rewards     : string[]        // IDs of rewards unlocked in this event
```

---

### 3.8 `qr_codes`

QR codes generated by cashiers or the system. Scanned by customers to earn points.

```
qr_codes/{qrId}
├── id          : string
├── code        : string          // unique payload (e.g. "STORE42-BONUS")
├── type        : "store_checkin" | "purchase" | "event" | "cashier_generated"
├── storeId     : string
├── cashierId   : string | null
├── points      : number          // points awarded on scan
├── amount      : number | null   // purchase amount (₺) that generated this code
├── expiresAt   : Timestamp
├── singleUse   : boolean
├── usedBy      : string[]        // userIds who have scanned it
└── createdAt   : Timestamp
```

**Indexes:** `storeId ASC, createdAt DESC`, `code ASC` (unique lookup on scan).

---

### 3.9 `stores`

Physical store locations managed by Super Admin.

```
stores/{storeId}
├── id          : string
├── name        : string
├── address     : string
├── city        : string
├── managerId   : string          // userId of the store_admin
├── cashiers    : string[]        // userIds of assigned cashiers
├── active      : boolean
└── createdAt   : Timestamp
```

---

### 3.10 `game_sessions`

Records every mini-game play to enforce daily limits and compute totals.

```
game_sessions/{sessionId}
├── userId      : string
├── gameType    : "spin_wheel" | "memory" | "quiz" | "cup_catch" | "flappy"
├── pointsEarned: number
├── duration    : number          // seconds
├── score       : number | null   // raw game score
├── playedAt    : Timestamp
└── storeId     : string | null   // location context if applicable
```

**Indexes:** `userId ASC, playedAt DESC`, `gameType ASC, playedAt DESC`.

---

### 3.11 `notifications`

Push and in-app notifications sent to users.

```
notifications/{notificationId}
├── id          : string
├── userId      : string          // null = broadcast
├── title       : string
├── body        : string
├── type        : "reward" | "achievement" | "mission" | "event" | "admin" | "system"
├── read        : boolean
├── actionUrl   : string | null   // deep link within the app
├── sentAt      : Timestamp
└── expiresAt   : Timestamp | null
```

---

### 3.12 `audit_logs`

High-density immutable security log for all admin actions and high-risk user actions. Never deleted; archive to BigQuery after 90 days.

```
audit_logs/{logId}
├── id          : string
├── userId      : string
├── username    : string
├── role        : string
├── action      : string          // e.g. "USER_SUSPENDED", "POINTS_ADJUSTED"
├── actionType  : "auth" | "points" | "reward" | "admin" | "security"
├── details     : map             // action-specific payload (JSON)
├── riskLevel   : "low" | "medium" | "high"
│
│   ── Device & Network (collected on server, not client) ──
├── ipAddress   : string          // server-side only, never expose to client
├── userAgent   : string
├── deviceType  : "mobile" | "tablet" | "desktop"
├── browser     : string
├── os          : string
└── createdAt   : Timestamp
```

---

## 4. Cloud Functions (Required)

| Function | Trigger | Purpose |
|---|---|---|
| `onTransactionCreate` | `transactions` onCreate | Update `users.currentPoints`, `users.totalPoints`, check achievement/mission progress |
| `onRedemptionCreate` | `users/{id}/inventory` onCreate | Decrement `rewards.stock`, mark QR code as used |
| `rebuildLeaderboard` | Scheduled — every 6 hours | Recalculate `users.rank` across all users by `totalPoints DESC` |
| `resetDailyMissions` | Scheduled — midnight daily | Clear `missionProgress` entries for `category: "daily"` |
| `resetWeeklyMissions` | Scheduled — Monday 00:00 | Clear `missionProgress` entries for `category: "weekly"` |
| `expireQRCodes` | Scheduled — every hour | Delete or mark expired `qr_codes` documents |
| `onUserCreate` | Firebase Auth onCreate | Bootstrap the `users` document with default values |

---

## 5. Firestore Security Rules (Skeleton)

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helpers
    function isAuth()        { return request.auth != null; }
    function isSelf(uid)     { return request.auth.uid == uid; }
    function role()          { return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role; }
    function isSuperAdmin()  { return role() == 'super_admin'; }
    function isStoreAdmin()  { return role() == 'store_admin'; }
    function isCashier()     { return role() == 'cashier'; }
    function isCustomer()    { return role() == 'customer'; }

    // Users: read own doc; super_admin reads all; no client writes to role/status
    match /users/{userId} {
      allow read:   if isAuth() && (isSelf(userId) || isSuperAdmin() || isStoreAdmin());
      allow update: if isAuth() && isSelf(userId)
                    && !request.resource.data.keys().hasAny(['role', 'status', 'totalPoints', 'rank']);
      allow write:  if isSuperAdmin();

      match /inventory/{itemId}   { allow read, write: if isAuth() && isSelf(userId); }
      match /achievementProgress/{id} { allow read: if isAuth() && isSelf(userId); }
      match /missionProgress/{id}     { allow read: if isAuth() && isSelf(userId); }
    }

    // Rewards: public read; admin write
    match /rewards/{rewardId} {
      allow read:  if true;
      allow write: if isAuth() && (isSuperAdmin() || isStoreAdmin());
    }

    // Transactions: user reads own; admin reads all; no client writes (cloud functions only)
    match /transactions/{txId} {
      allow read:  if isAuth() && (resource.data.userId == request.auth.uid || isSuperAdmin() || isStoreAdmin() || isCashier());
      allow write: if false; // cloud functions use Admin SDK
    }

    // QR codes: cashier creates; anyone authenticated reads for scanning
    match /qr_codes/{qrId} {
      allow read:  if isAuth();
      allow create: if isAuth() && (isCashier() || isStoreAdmin() || isSuperAdmin());
      allow update: if isAuth(); // mark as used on scan
      allow delete: if isSuperAdmin();
    }

    // Audit logs: super_admin reads only; no client writes
    match /audit_logs/{logId} {
      allow read:  if isAuth() && isSuperAdmin();
      allow write: if false;
    }

    // Notifications
    match /notifications/{notifId} {
      allow read, update: if isAuth() && (resource.data.userId == request.auth.uid || resource.data.userId == null);
      allow write: if isSuperAdmin();
    }

    // Stores
    match /stores/{storeId} {
      allow read:  if isAuth();
      allow write: if isSuperAdmin();
    }

    // Everything else: deny
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 6. Storage Bucket Structure

```
nexreward-storage/
├── avatars/{userId}.jpg          // User profile photos — max 500 KB
├── rewards/{rewardId}.jpg        // Reward product images — max 1 MB
├── events/{eventId}.jpg          // Event banner images — max 2 MB
└── exports/{adminId}/{date}.csv  // Admin data exports — super_admin only
```

Storage rules: users may write only to their own `avatars/` path; admins write to `rewards/` and `events/`; `exports/` is admin-read only.

---

## 7. Migration Path (Mock → Firebase)

1. Replace `import { currentUser } from '../data/mockData'` with `onAuthStateChanged` + Firestore `getDoc`.
2. Replace every `setPoints` call in `AppContext` with a Firestore transaction that writes to `transactions/` and lets the `onTransactionCreate` cloud function update `users.currentPoints`.
3. Replace `InventoryContext` local state with a real-time Firestore listener: `onSnapshot(collection(db, 'users', uid, 'inventory'), ...)`.
4. Replace mock leaderboard array with a Firestore query: `query(collection(db, 'users'), orderBy('totalPoints', 'desc'), limit(50))`.
5. Replace `AdminAuditLogs` mock data with `query(collection(db, 'audit_logs'), orderBy('createdAt', 'desc'), limit(100))`.
