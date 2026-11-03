import { CheckCircle2, Clock3, Plus, Search, Star, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { customPresetTemplate, imagePresets, PRESET_CATEGORIES } from '../data/imagePresets';
import { MAX_CANVAS_DIMENSION, validateDimensions } from '../services/imageService';
import PresetCategory from './PresetCategory';
import PresetCard from './PresetCard';
import { deleteCustomPreset, getCustomPresets, getFavoritePresetIds, getRecentPresetIds, saveFavoritePresetIds, saveRecentPresetIds, upsertCustomPreset } from '../utils/presetStorage';
import './PresetLibrary.css';

const ALL_FILTER = 'all';
const FAVORITES_FILTER = 'favorites';
const RECENT_FILTER = 'recent';

const createInitialCustomPreset = () => ({
  ...customPresetTemplate,
  backgroundColor: '#ffffff',
  backgroundType: 'white',
  height: '',
  outputFormat: 'image/webp',
  quality: 80,
  width: '',
});

function createStablePresetId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return `custom-${crypto.randomUUID()}`;
  return `custom-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function PresetLibrary({ onApplyPreset, onPresetDeleted, selectedPresetId }) {
  const [activeFilter, setActiveFilter] = useState(ALL_FILTER);
  const [query, setQuery] = useState('');
  const [customPresets, setCustomPresets] = useState(() => getCustomPresets());
  const [isCreating, setIsCreating] = useState(false);
  const [editingPresetId, setEditingPresetId] = useState('');
  const [customForm, setCustomForm] = useState(createInitialCustomPreset);
  const [formError, setFormError] = useState('');
  const [formFeedback, setFormFeedback] = useState('');
  const [favoriteIds, setFavoriteIds] = useState(() => getFavoritePresetIds());
  const [recentIds, setRecentIds] = useState(() => getRecentPresetIds());

  const allPresets = useMemo(() => {
    const builtInIds = new Set(imagePresets.map((preset) => preset.id));
    const validCustomPresets = Array.isArray(customPresets)
      ? customPresets
        .filter((preset) => preset && typeof preset.id === 'string' && preset.id && typeof preset.name === 'string' && preset.name.trim())
        .filter((preset) => preset.kind === 'dimension' || preset.kind === 'quality')
        .filter((preset) => preset.kind === 'quality' || (Number.isInteger(preset.width) && Number.isInteger(preset.height) && preset.width > 0 && preset.height > 0))
        .filter((preset) => !builtInIds.has(preset.id))
        .map((preset) => {
          const tags = Array.isArray(preset.tags) ? preset.tags.filter((tag) => typeof tag === 'string') : [];
          const description = typeof preset.description === 'string' ? preset.description : 'Saved custom preset.';
          return {
            ...preset,
            categoryId: 'custom-presets',
            description,
            outputFormat: typeof preset.outputFormat === 'string' ? preset.outputFormat : 'image/webp',
            quality: preset.quality === null || Number.isFinite(preset.quality) ? preset.quality : 80,
            searchText: `${preset.name} ${description} ${tags.join(' ')}`.toLowerCase(),
            tags,
          };
        })
      : [];

    return [...imagePresets, ...validCustomPresets];
  }, [customPresets]);

  const categoryCounts = useMemo(() => allPresets.reduce((counts, preset) => ({
    ...counts,
    [preset.categoryId]: (counts[preset.categoryId] || 0) + 1,
  }), {}), [allPresets]);

  const visiblePresets = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return allPresets.filter((preset) => {
      const matchesView = activeFilter === ALL_FILTER
        || (activeFilter === FAVORITES_FILTER && favoriteIds.includes(preset.id))
        || (activeFilter === RECENT_FILTER && recentIds.includes(preset.id))
        || preset.categoryId === activeFilter;
      const matchesQuery = !normalizedQuery || preset.searchText.includes(normalizedQuery);
      return matchesView && matchesQuery;
    });
  }, [activeFilter, allPresets, favoriteIds, query, recentIds]);

  const toggleFavorite = (presetId) => {
    const nextIds = favoriteIds.includes(presetId)
      ? favoriteIds.filter((id) => id !== presetId)
      : [...favoriteIds, presetId];
    setFavoriteIds(nextIds);
    saveFavoritePresetIds(nextIds);
  };

  const visitPreset = (presetId) => {
    const nextIds = [presetId, ...recentIds.filter((id) => id !== presetId)].slice(0, 12);
    setRecentIds(nextIds);
    saveRecentPresetIds(nextIds);
  };

  const updateCustomForm = (field, value) => {
    setFormError('');
    setFormFeedback('');
    setCustomForm((current) => ({ ...current, [field]: value }));
  };

  const startCreating = () => {
    setActiveFilter('custom-presets');
    setEditingPresetId('');
    setCustomForm(createInitialCustomPreset());
    setFormError('');
    setFormFeedback('');
    setIsCreating(true);
  };

  const startEditing = (preset) => {
    setActiveFilter('custom-presets');
    setEditingPresetId(preset.id);
    setCustomForm({
      ...createInitialCustomPreset(),
      ...preset,
      height: String(preset.height),
      quality: preset.quality ?? 80,
      width: String(preset.width),
    });
    setFormError('');
    setFormFeedback('');
    setIsCreating(true);
  };

  const saveCustomPreset = (event) => {
    event.preventDefault();
    const name = customForm.name.trim();
    const width = Number(customForm.width);
    const height = Number(customForm.height);
    const quality = Number(customForm.quality);
    const dimensionError = validateDimensions(width, height);
    const existingCustomPresets = Array.isArray(customPresets) ? customPresets : [];
    const duplicateName = existingCustomPresets.some((preset) => preset?.id !== editingPresetId && preset?.name?.trim().toLowerCase() === name.toLowerCase());

    if (!name) return setFormError('Preset name is required.');
    if (duplicateName) return setFormError('A custom preset with this name already exists.');
    if (dimensionError) return setFormError(dimensionError);
    if (!Number.isInteger(quality) || quality < 0 || quality > 100) return setFormError('Quality must be a whole number between 0 and 100.');

    const preset = {
      ...customForm,
      categoryId: 'custom-presets',
      description: `Custom ${width} × ${height}px ${customForm.outputFormat.replace('image/', '').toUpperCase()} preset.`,
      height,
      id: editingPresetId || createStablePresetId(),
      kind: 'dimension',
      name,
      quality,
      searchText: `${name} custom ${width} ${height} ${customForm.outputFormat} ${customForm.mode} ${customForm.backgroundType}`.toLowerCase(),
      tags: ['custom', customForm.mode, customForm.backgroundType, customForm.outputFormat.replace('image/', '')],
      width,
    };

    if (customForm.outputFormat === 'image/jpeg' && customForm.backgroundType === 'transparent') {
      preset.backgroundType = 'white';
    }

    if (!upsertCustomPreset(preset)) return setFormError('The preset could not be saved in this browser.');
    setCustomPresets((current) => [...(Array.isArray(current) ? current : []).filter((item) => item?.id !== preset.id), preset]);
    setCustomForm(createInitialCustomPreset());
    setEditingPresetId('');
    setFormError('');
    setFormFeedback(editingPresetId ? 'Custom preset updated.' : 'Custom preset saved.');
    setIsCreating(false);
  };

  const removeCustomPreset = (preset) => {
    if (typeof window !== 'undefined' && !window.confirm(`Delete “${preset.name}”? This cannot be undone.`)) return;

    try {
      if (!deleteCustomPreset(preset.id)) {
        setFormError('The preset could not be deleted in this browser.');
        return;
      }
      const nextFavorites = favoriteIds.filter((id) => id !== preset.id);
      const nextRecent = recentIds.filter((id) => id !== preset.id);
      setCustomPresets((current) => (Array.isArray(current) ? current.filter((item) => item?.id !== preset.id) : []));
      setFavoriteIds(nextFavorites);
      setRecentIds(nextRecent);
      saveFavoritePresetIds(nextFavorites);
      saveRecentPresetIds(nextRecent);
      if (editingPresetId === preset.id) {
        setEditingPresetId('');
        setIsCreating(false);
      }
      setFormFeedback('Custom preset deleted.');
      onPresetDeleted?.(preset.id);
    } catch {
      setFormError('The preset could not be deleted in this browser.');
    }
  };

  return (
    <section className="preset-library" aria-labelledby="preset-library-title">
      <div className="preset-library__intro">
        <div>
          <p className="eyebrow">Preset library</p>
          <h2 id="preset-library-title">Start with a canvas that fits.</h2>
          <p>Browse common starting points for social, web, video, commerce, and quality-focused exports.</p>
        </div>
        <div className="preset-library__intro-actions">
          <span className="preset-library__count">{allPresets.length} presets</span>
          <button className="preset-library__create-button" type="button" onClick={startCreating}>
            <Plus size={16} /> Create Custom Preset
          </button>
        </div>
      </div>

      <div className="preset-library__toolbar">
        <label className="preset-library__search">
          <Search size={17} aria-hidden="true" />
          <span className="sr-only">Search presets</span>
          <input type="search" value={query} placeholder="Search presets, tags or use cases" onChange={(event) => setQuery(event.target.value)} />
        </label>
        <div className="preset-library__quick-filters" role="group" aria-label="Preset views">
          <button className={activeFilter === ALL_FILTER ? 'is-active' : ''} type="button" onClick={() => setActiveFilter(ALL_FILTER)}>All Presets</button>
          <button className={activeFilter === FAVORITES_FILTER ? 'is-active' : ''} type="button" onClick={() => setActiveFilter(FAVORITES_FILTER)}><Star size={15} /> Favorites</button>
          <button className={activeFilter === RECENT_FILTER ? 'is-active' : ''} type="button" onClick={() => setActiveFilter(RECENT_FILTER)}><Clock3 size={15} /> Recent</button>
        </div>
      </div>

      <div className="preset-library__body">
        <aside className="preset-library__sidebar" aria-label="Preset categories">
          <span className="preset-library__sidebar-label">Categories</span>
          <PresetCategory active={activeFilter === ALL_FILTER} category={{ id: ALL_FILTER, name: 'All Presets' }} count={allPresets.length} onSelect={setActiveFilter} />
          {PRESET_CATEGORIES.map((category) => <PresetCategory key={category.id} active={activeFilter === category.id} category={category} count={categoryCounts[category.id] || 0} onSelect={setActiveFilter} />)}
        </aside>

        <div className="preset-library__results" aria-live="polite">
          <div className="preset-library__results-heading">
            <span>{visiblePresets.length} matching {visiblePresets.length === 1 ? 'preset' : 'presets'}</span>
            <div className="preset-library__results-actions">
              {activeFilter === 'custom-presets' && <button type="button" onClick={startCreating}><Plus size={14} /> Create Custom Preset</button>}
              {activeFilter !== ALL_FILTER && <button type="button" onClick={() => setActiveFilter(ALL_FILTER)}>Clear view</button>}
            </div>
          </div>
          {activeFilter === 'custom-presets' && isCreating && (
            <form className="custom-preset-form" onSubmit={saveCustomPreset}>
              <div className="custom-preset-form__heading">
                <div><p className="eyebrow">Custom Preset</p><h3>{editingPresetId ? 'Edit custom preset' : 'Create a reusable preset'}</h3></div>
                <button className="custom-preset-form__close" type="button" aria-label="Close custom preset form" onClick={() => setIsCreating(false)}><X size={18} /></button>
              </div>
              <div className="custom-preset-form__grid">
                <label className="custom-preset-form__wide">Preset Name<input required value={customForm.name} onChange={(event) => updateCustomForm('name', event.target.value)} placeholder="e.g. Brand Blog Hero" /></label>
                <label>Width<input required type="number" min="1" max={MAX_CANVAS_DIMENSION} value={customForm.width} onChange={(event) => updateCustomForm('width', event.target.value)} /></label>
                <label>Height<input required type="number" min="1" max={MAX_CANVAS_DIMENSION} value={customForm.height} onChange={(event) => updateCustomForm('height', event.target.value)} /></label>
                <label>Output Format<select value={customForm.outputFormat} onChange={(event) => updateCustomForm('outputFormat', event.target.value)}><option value="image/webp">WebP</option><option value="image/png">PNG</option><option value="image/jpeg">JPEG</option></select></label>
                <label>Quality<input type="number" min="0" max="100" value={customForm.quality} onChange={(event) => updateCustomForm('quality', event.target.value)} /><small>PNG ignores quality during Canvas export.</small></label>
                <label>Resize Mode<select value={customForm.mode} onChange={(event) => updateCustomForm('mode', event.target.value)}><option value="fit">Fit</option><option value="fill">Fill / Crop</option><option value="original">Original Ratio</option></select></label>
                <label>Background<select value={customForm.backgroundType} onChange={(event) => updateCustomForm('backgroundType', event.target.value)}><option value="white">White</option><option value="black">Black</option><option value="transparent">Transparent</option><option value="custom">Custom Color</option><option value="blur">Blur Background</option></select></label>
                {customForm.backgroundType === 'custom' && <label>Custom Color<input type="color" value={customForm.backgroundColor} onChange={(event) => updateCustomForm('backgroundColor', event.target.value)} /></label>}
              </div>
              {customForm.outputFormat === 'image/jpeg' && customForm.backgroundType === 'transparent' && <p className="custom-preset-form__note">JPEG cannot preserve transparency; this preset will save with a white background.</p>}
              {formError && <p className="custom-preset-form__error" role="alert">{formError}</p>}
              <div className="custom-preset-form__actions"><button className="preset-library__results-heading button" type="button" onClick={() => setIsCreating(false)}>Cancel</button><button className="preset-library__create-button" type="submit">Save Preset</button></div>
            </form>
          )}
          {formFeedback && <p className="custom-preset-form__success" role="status"><CheckCircle2 size={16} /> {formFeedback}</p>}
          {visiblePresets.length > 0 ? (
            <div className="preset-library__grid">
              {visiblePresets.map((preset) => <PresetCard key={preset.id} favorite={favoriteIds.includes(preset.id)} onApply={onApplyPreset} onDelete={removeCustomPreset} onEdit={startEditing} onFavoriteToggle={toggleFavorite} onVisit={visitPreset} preset={preset} selected={selectedPresetId === preset.id} />)}
            </div>
          ) : (
            <div className="preset-library__empty">
              <Search size={28} aria-hidden="true" />
              <h3>No presets found</h3>
              <p>Try a different search term or switch to another preset view.</p>
              <button type="button" onClick={() => { setQuery(''); setActiveFilter(ALL_FILTER); }}>Show all presets</button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default PresetLibrary;
