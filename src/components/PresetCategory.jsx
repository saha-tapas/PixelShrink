import { FolderOpen } from 'lucide-react';

function PresetCategory({ active, category, count, onSelect }) {
  return (
    <button className={`preset-library__category${active ? ' is-active' : ''}`} type="button" onClick={() => onSelect(category.id)}>
      <FolderOpen size={16} aria-hidden="true" />
      <span>{category.name}</span>
      <small>{count}</small>
    </button>
  );
}

export default PresetCategory;
