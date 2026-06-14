import type { Database } from './supabase';

type RewardInsert = Omit<
  Database['public']['Tables']['rewards']['Row'],
  'id' | 'created_at' | 'updated_at'
>;

export type ParsedRewardRow = {
  rowNumber: number;
  reward: RewardInsert;
};

export type CsvParseError = {
  rowNumber: number;
  message: string;
};

export type CsvParseResult = {
  rows: ParsedRewardRow[];
  errors: CsvParseError[];
};

const HEADER_ALIASES: Record<string, keyof RewardInsert | 'imageUrl'> = {
  title: 'title',
  name: 'title',
  urun: 'title',
  'ürün': 'title',
  'urun adi': 'title',
  'ürün adı': 'title',
  description: 'description',
  aciklama: 'description',
  açıklama: 'description',
  points: 'points',
  puan: 'points',
  'puan maliyeti': 'points',
  category: 'category',
  kategori: 'category',
  stock: 'stock',
  stok: 'stock',
  image: 'image',
  imageurl: 'image',
  'gorsel url': 'image',
  'görsel url': 'image',
  active: 'active',
  aktif: 'active',
  available: 'active',
  satista: 'active',
  limited: 'limited',
  sinirli: 'limited',
  'sınırlı': 'limited',
  featured: 'featured',
  onecikan: 'featured',
  'öne çıkan': 'featured',
};

const CATEGORY_VALUES: Record<string, string> = {
  coffee: 'coffee',
  kahve: 'coffee',
  pastries: 'pastries',
  pastane: 'pastries',
  food: 'food',
  yemek: 'food',
  drinks: 'drinks',
  icecek: 'drinks',
  içecek: 'drinks',
  'gift-cards': 'gift-cards',
  'gift cards': 'gift-cards',
  'hediye karti': 'gift-cards',
  'hediye kartı': 'gift-cards',
  coupons: 'coupons',
  kupon: 'coupons',
  other: 'coffee',
  diger: 'coffee',
  diğer: 'coffee',
};

export const REWARDS_CSV_TEMPLATE = `title,description,points,category,stock,image,active,limited,featured
Classic Espresso,Rich bold espresso shot,150,coffee,200,https://images.pexels.com/photos/1514063/pexels-photo-1514063.jpeg?auto=compress&cs=tinysrgb&w=300,true,false,false
Cappuccino,Espresso with steamed milk foam,250,coffee,150,https://images.pexels.com/photos/3240797/pexels-photo-3240797.jpeg?auto=compress&cs=tinysrgb&w=300,true,false,false
Croissant,Buttery flaky pastry,200,pastries,100,https://images.pexels.com/photos/11723395/pexels-photo-11723395.jpeg?auto=compress&cs=tinysrgb&w=300,true,false,false
`;

function normalizeHeader(value: string): string {
  return value
    .replace(/^\uFEFF/, '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_\s]+/g, ' ');
}

function parseBool(value: string | undefined, fallback: boolean): boolean {
  if (value == null || value.trim() === '') return fallback;
  const v = value.trim().toLowerCase();
  if (['true', '1', 'yes', 'evet', 'aktif', 'satista', 'satışta'].includes(v)) return true;
  if (['false', '0', 'no', 'hayir', 'hayır', 'pasif'].includes(v)) return false;
  return fallback;
}

function parseIntField(value: string | undefined, fallback: number): number {
  if (value == null || value.trim() === '') return fallback;
  const n = Number.parseInt(value.trim(), 10);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeCategory(value: string | undefined): string {
  if (!value?.trim()) return 'coffee';
  const key = normalizeHeader(value).replace(/[^\w\s-]/g, '').trim();
  return CATEGORY_VALUES[key] ?? CATEGORY_VALUES[key.replace(/\s+/g, '-')] ?? 'coffee';
}

/** Parse a single CSV line respecting quoted fields. */
function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === ',' && !inQuotes) {
      cells.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }

  cells.push(current.trim());
  return cells;
}

export function parseRewardsCsv(text: string): CsvParseResult {
  const lines = text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (lines.length === 0) {
    return { rows: [], errors: [{ rowNumber: 0, message: 'CSV dosyası boş.' }] };
  }

  const headerCells = splitCsvLine(lines[0]).map(normalizeHeader);
  const columnMap = headerCells.map(cell => HEADER_ALIASES[cell] ?? null);

  if (!columnMap.includes('title')) {
    return {
      rows: [],
      errors: [{ rowNumber: 1, message: 'Başlık sütunu bulunamadı. "title" veya "ürün adı" kullanın.' }],
    };
  }

  const rows: ParsedRewardRow[] = [];
  const errors: CsvParseError[] = [];

  for (let i = 1; i < lines.length; i += 1) {
    const rowNumber = i + 1;
    const cells = splitCsvLine(lines[i]);
    const record: Record<string, string> = {};

    columnMap.forEach((field, index) => {
      if (!field) return;
      record[field] = cells[index] ?? '';
    });

    const title = String(record.title ?? '').trim();
    if (!title) {
      errors.push({ rowNumber, message: 'Ürün adı boş olamaz.' });
      continue;
    }

    const points = parseIntField(String(record.points ?? ''), NaN);
    if (!Number.isFinite(points) || points < 1) {
      errors.push({ rowNumber, message: `"${title}" için geçerli puan gerekli (≥ 1).` });
      continue;
    }

    const stock = parseIntField(String(record.stock ?? ''), 100);
    const imageRaw = String(record.image ?? record.imageUrl ?? '').trim();

    rows.push({
      rowNumber,
      reward: {
        title,
        description: String(record.description ?? '').trim(),
        points,
        category: normalizeCategory(String(record.category ?? '')),
        image: imageRaw || null,
        featured: parseBool(String(record.featured ?? ''), false),
        limited: parseBool(String(record.limited ?? ''), false),
        stock: stock < 0 ? 0 : stock,
        expires_at: null,
        active: parseBool(String(record.active ?? ''), true),
      },
    });
  }

  return { rows, errors };
}

export function downloadRewardsCsvTemplate(): void {
  const blob = new Blob([REWARDS_CSV_TEMPLATE], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'urun-sablonu.csv';
  anchor.click();
  URL.revokeObjectURL(url);
}
