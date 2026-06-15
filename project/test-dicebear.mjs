import { createAvatar } from '@dicebear/core';
import openPeeps from '@dicebear/styles/open-peeps.json' with { type: 'json' };

const avatar = createAvatar(openPeeps, {
  seed: 'test'
});

console.log(avatar.toString().slice(0, 100));
