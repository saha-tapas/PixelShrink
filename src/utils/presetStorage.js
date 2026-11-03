import { imagePresets } from '../data/imagePresets';
import { MAX_CANVAS_DIMENSION, validateDimensions } from '../services/imageService';

export const PRESET_STORAGE_KEYS = Object.freeze({
  custom: 'pixelshrink.custom-presets',
  favorites: 'pixelshrink.favorite-presets',
  recent: 'pixelshrink.recent-presets',
});

const CUSTOM_CATEGORY_ID = 'custom-presets';
const CUSTOM_KINDS = new Set(['dimension', 'quality']);
const OUTPUT_FORMATS = new Set(['image/jpeg', 'image/png', 'image/webp']);
const RESIZE_MODES = new Set(['fit', 'fill', 'original']);
const BACKGROUND_TYPES = new Set(['white', 'black', 'transparent', 'custom', 'blur']);
const BUILT_IN_PRESET_IDS = new Set(imagePresets.map((preset) => preset.id));

function getStorage() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readPresetStorage(key, fallback = []) {
  const storage = getStorage();
  if (!storage) return fallback;

  try {
    const value = storage.getItem(key);
    if (!value) return fallback;
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

export function writePresetStorage(key, value) {
  const storage = getStorage();
  if (!storage) return false;

  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removePresetStorage(key) {
  const storage = getStorage();
  if (!storage) return false;

  try {
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

function normalizeCustomPreset(preset) {
  if (!preset || typeof preset !== 'object' || Array.isArray(preset)) return null;
  if (typeof preset.id !== 'string' || !preset.id || BUILT_IN_PRESET_IDS.has(preset.id)) return null;
  if (preset.categoryId !== CUSTOM_CATEGORY_ID || typeof preset.name !== 'string' || !preset.name.trim()) return null;
  if (!CUSTOM_KINDS.has(preset.kind) || !OUTPUT_FORMATS.has(preset.outputFormat)) return null;
  if (!RESIZE_MODES.has(preset.mode)) return null;
  if (preset.quality !== null && (!Number.isInteger(preset.quality) || preset.quality < 0 || preset.quality > 100)) return null;
  if (preset.kind === 'dimension') {
    if (!Number.isInteger(preset.width) || !Number.isInteger(preset.height) || preset.width < 1 || preset.height < 1) return null;
    if (preset.width > MAX_CANVAS_DIMENSION || preset.height > MAX_CANVAS_DIMENSION || validateDimensions(preset.width, preset.height)) return null;
  }
  if (preset.backgroundType !== undefined && !BACKGROUND_TYPES.has(preset.backgroundType)) return null;
  if (preset.backgroundColor !== undefined && (typeof preset.backgroundColor !== 'string' || !preset.backgroundColor)) return null;

  const tags = Array.isArray(preset.tags) ? preset.tags.filter((tag) => typeof tag === 'string') : [];
  const description = typeof preset.description === 'string' ? preset.description : 'Saved custom preset.';
  return {
    ...preset,
    categoryId: CUSTOM_CATEGORY_ID,
    description,
    searchText: `${preset.name} ${description} ${tags.join(' ')}`.toLowerCase(),
    tags,
  };
}

function getValidCustomPresets(value) {
  if (!Array.isArray(value)) return [];
  const seenIds = new Set();
  return value.reduce((presets, preset) => {
    const normalized = normalizeCustomPreset(preset);
    if (!normalized || seenIds.has(normalized.id)) return presets;
    seenIds.add(normalized.id);
    presets.push(normalized);
    return presets;
  }, []);
}

export function getCustomPresets() {
  return getValidCustomPresets(readPresetStorage(PRESET_STORAGE_KEYS.custom, []));
}

export function saveCustomPresets(presets) {
  if (!Array.isArray(presets)) return false;
  const validPresets = getValidCustomPresets(presets);
  if (validPresets.length !== presets.length) return false;
  return writePresetStorage(PRESET_STORAGE_KEYS.custom, validPresets);
}

export function upsertCustomPreset(preset) {
  const validPreset = normalizeCustomPreset(preset);
  if (!validPreset) return false;
  const presets = getCustomPresets().filter((item) => item.id !== validPreset.id);
  return saveCustomPresets([...presets, validPreset]);
}

export function deleteCustomPreset(presetId) {
  if (typeof presetId !== 'string' || !presetId) return false;
  return saveCustomPresets(getCustomPresets().filter((preset) => preset.id !== presetId));
}

export function getFavoritePresetIds() {
  return readPresetStorage(PRESET_STORAGE_KEYS.favorites, []);
}

export function saveFavoritePresetIds(ids) {
  return writePresetStorage(PRESET_STORAGE_KEYS.favorites, Array.isArray(ids) ? ids : []);
}

export function getRecentPresetIds() {
  return readPresetStorage(PRESET_STORAGE_KEYS.recent, []);
}

export function saveRecentPresetIds(ids) {
  return writePresetStorage(PRESET_STORAGE_KEYS.recent, Array.isArray(ids) ? ids : []);
}
