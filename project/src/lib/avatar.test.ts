import { describe, expect, it } from 'vitest';
import { buildAvatarUrl } from './avatar';
import { resolveAvatarSrc } from './avatarCatalog';

const BASE_ALLOWED_PARAMS = [
  'seed',
  'size',
  'backgroundColor',
  'skinColor',
  'scale',
  'rotate',
  'translateX',
  'translateY',
];
const ACCESSORY_ALLOWED_PARAMS = [...BASE_ALLOWED_PARAMS, 'accessoriesVariant', 'accessoriesProbability'];

function queryKeys(url: string): string[] {
  return Array.from(new URL(url).searchParams.keys());
}

describe('avatar URLs', () => {
  it('builds DiceBear Open Peeps URLs with only supported params', () => {
    const url = buildAvatarUrl({
      seed: 'ahmed',
      size: 128,
      backgroundColor: 'ff006e',
      skinColor: 'deceeb',
    });

    const parsed = new URL(url);

    expect(`${parsed.origin}${parsed.pathname}`).toBe('https://api.dicebear.com/10.x/open-peeps/svg');
    expect(parsed.searchParams.get('seed')).toBe('ahmed');
    expect(parsed.searchParams.get('size')).toBe('512');
    expect(parsed.searchParams.get('backgroundColor')).toBe('ff006e');
    expect(parsed.searchParams.get('skinColor')).toBe('deceeb');
    expect(queryKeys(url)).toEqual(BASE_ALLOWED_PARAMS);
  });

  it('supports the custom purple skin color', () => {
    const url = buildAvatarUrl({
      seed: 'ahmed',
      skinColor: '#bcb1f2',
    });

    expect(new URL(url).searchParams.get('skinColor')).toBe('bcb1f2');
  });

  it('adds only supported accessories params for glasses choices', () => {
    const url = buildAvatarUrl({
      seed: 'ahmed',
      accessories: 'glasses2',
      accessoriesProbability: 100,
    });
    const parsed = new URL(url);

    expect(parsed.searchParams.get('accessoriesVariant')).toBe('glasses2');
    expect(parsed.searchParams.get('accessoriesProbability')).toBe('100');
    expect(queryKeys(url)).toEqual(ACCESSORY_ALLOWED_PARAMS);
  });

  it('omits accessories params for no-glasses so the base avatar stays stable', () => {
    const url = buildAvatarUrl({
      seed: 'ahmed',
      accessories: 'blank',
      accessoriesProbability: 100,
    });
    const parsed = new URL(url);

    expect(parsed.searchParams.get('accessoriesVariant')).toBeNull();
    expect(parsed.searchParams.get('accessoriesProbability')).toBeNull();
    expect(queryKeys(url)).toEqual(BASE_ALLOWED_PARAMS);
  });

  it('uses single color values when no colors are provided', () => {
    const url = buildAvatarUrl({ seed: 'ahmed' });
    const parsed = new URL(url);

    expect(parsed.searchParams.get('size')).toBe('512');
    expect(parsed.searchParams.get('backgroundColor')).toBe('ff006e');
    expect(parsed.searchParams.get('skinColor')).toBe('deceeb');
    expect(parsed.searchParams.get('backgroundColor')).not.toContain(',');
    expect(parsed.searchParams.get('skinColor')).not.toContain(',');
  });

  it('removes unsupported params from old DiceBear URLs', () => {
    const dirtyUrl = [
      'https://api.dicebear.com/10.x/open-peeps/svg?seed=ahmed',
      'size=512',
      'backgroundColor=ff006e,8338ec',
      'skinColor=deceeb,e0abb4',
      'scale=100',
      'flip=false',
      'rotate=5',
      'translateX=2',
      'translateY=3',
      'radius=50',
      'maskProbability=0',
      'expressionVariant=smile',
      'headVariant=short1',
      'clothingColor=111827',
    ].join('&');

    const cleanUrl = resolveAvatarSrc(dirtyUrl, 'fallback');
    const parsed = new URL(cleanUrl);

    expect(parsed.searchParams.get('seed')).toBe('ahmed');
    expect(parsed.searchParams.get('backgroundColor')).toBe('ff006e');
    expect(parsed.searchParams.get('skinColor')).toBe('deceeb');
    expect(queryKeys(cleanUrl)).toEqual([
      ...BASE_ALLOWED_PARAMS,
      'headVariant',
      'expressionVariant',
      'clothingColor',
    ]);
  });

  it('preserves valid legacy glasses choices while cleaning stored DiceBear URLs', () => {
    const dirtyUrl = [
      'https://api.dicebear.com/10.x/open-peeps/svg?seed=ahmed',
      'backgroundColor=ff006e',
      'skinColor=deceeb',
      'accessories=glasses4',
      'accessoriesProbability=100',
      'flip=false',
    ].join('&');

    const cleanUrl = resolveAvatarSrc(dirtyUrl, 'fallback');
    const parsed = new URL(cleanUrl);

    expect(parsed.searchParams.get('accessoriesVariant')).toBe('glasses4');
    expect(parsed.searchParams.get('accessoriesProbability')).toBe('100');
    expect(queryKeys(cleanUrl)).toEqual(ACCESSORY_ALLOWED_PARAMS);
  });

  it('turns seed refs and empty avatar URLs into display URLs', () => {
    expect(new URL(resolveAvatarSrc('seed:ahmed')).searchParams.get('seed')).toBe('ahmed');
    expect(new URL(resolveAvatarSrc('', 'fatma')).searchParams.get('seed')).toBe('fatma');
    expect(resolveAvatarSrc('', 'fatma')).not.toBeNull();
  });
});
