import ImageUploader from './components/ImageUploader';
import PresetLibrary from './components/PresetLibrary';
import AppLayout from './layouts/AppLayout';
import { useRef, useState } from 'react';

function App() {
  const imageUploaderRef = useRef(null);
  const [selectedPresetId, setSelectedPresetId] = useState('');

  return (
    <AppLayout>
      <ImageUploader ref={imageUploaderRef} />
      <PresetLibrary selectedPresetId={selectedPresetId} onPresetDeleted={(presetId) => {
        if (selectedPresetId === presetId) setSelectedPresetId('');
      }} onApplyPreset={(preset) => {
        setSelectedPresetId(preset.id);
        imageUploaderRef.current?.applyPreset(preset);
      }} />
    </AppLayout>
  );
}

export default App;
