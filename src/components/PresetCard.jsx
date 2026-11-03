import { Bookmark, BookmarkCheck, Edit3, Maximize2, Sparkles, Trash2 } from 'lucide-react';

function formatOutputFormat(format) {
  return format.replace('image/', '').toUpperCase();
}

function PresetCard({ favorite, onApply, onDelete, onEdit, onFavoriteToggle, onVisit, preset, selected }) {
  const isDimension = preset.kind === 'dimension';
  const isCustom = preset.categoryId === 'custom-presets';

  return (
    <article className={`preset-card preset-card--${preset.kind}${selected ? ' is-selected' : ''}`} tabIndex="0" aria-current={selected ? 'true' : undefined} onClick={() => { onVisit(preset.id); onApply(preset); }} onKeyDown={(event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onVisit(preset.id);
        onApply(preset);
      }
    }}>
      <div className="preset-card__topline">
        <span className="preset-card__type">
          {isDimension ? <Maximize2 size={14} aria-hidden="true" /> : <Sparkles size={14} aria-hidden="true" />}
          {isDimension ? 'Dimensions' : 'Quality'}
        </span>
        <button className="preset-card__favorite" type="button" aria-label={favorite ? `Remove ${preset.name} from favorites` : `Add ${preset.name} to favorites`} aria-pressed={favorite} onClick={(event) => { event.stopPropagation(); onFavoriteToggle(preset.id); }}>
          {favorite ? <BookmarkCheck size={18} fill="currentColor" /> : <Bookmark size={18} />}
        </button>
      </div>
      <h3>{preset.name}</h3>
      <p>{preset.description}</p>
      <div className="preset-card__meta">
        {isDimension ? (
          <strong>{preset.width} × {preset.height}px</strong>
        ) : (
          <>
            <strong>{preset.quality === null ? 'Lossless' : `${preset.quality}% quality`}</strong>
            <span>{formatOutputFormat(preset.outputFormat)}</span>
          </>
        )}
      </div>
      <div className="preset-card__tags">
        {preset.tags.slice(0, 3).map((tag) => <span key={tag}>#{tag}</span>)}
      </div>
      {isCustom && (
        <div className="preset-card__actions">
          <button type="button" onClick={(event) => { event.stopPropagation(); onEdit(preset); }}><Edit3 size={14} /> Edit</button>
          <button type="button" onClick={(event) => { event.stopPropagation(); onDelete(preset); }}><Trash2 size={14} /> Delete</button>
        </div>
      )}
    </article>
  );
}

export default PresetCard;
