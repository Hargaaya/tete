import { useState } from "react";
import type { Pack } from "../types";
import Screen from "./Screen";
import Button from "./Button";
import PackEditorDialog from "./PackEditorDialog";

type Props = {
  packs: Pack[];
  soundEnabled: boolean;
  onToggleSound: () => void;
  onSelectPack: (pack: Pack) => void;
  onSavePack: (pack: Pack) => void;
  onDeletePack: (packId: string) => void;
};

export default function HomeScreen({ packs, soundEnabled, onToggleSound, onSelectPack, onSavePack, onDeletePack }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPack, setEditingPack] = useState<Pack | null>(null);

  const handleCreatePack = () => {
    setEditingPack(null);
    setDialogOpen(true);
  };

  const handleEditPack = (pack: Pack, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPack(pack);
    setDialogOpen(true);
  };

  const handleSurpriseMe = () => onSelectPack(packs[Math.floor(Math.random() * packs.length)]);

  return (
    <Screen background="from-slate-900 to-slate-800" className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex justify-end mb-2">
            <Button
              variant="text"
              onClick={onToggleSound}
              className="text-2xl p-2 fixed top-4 right-4"
              aria-label={soundEnabled ? "Mute sounds" : "Unmute sounds"}
              title={soundEnabled ? "Sound on" : "Sound off"}
            >
              {soundEnabled ? "🔊" : "🔇"}
            </Button>
          </div>
          <h1 className="text-5xl font-bold mb-2">Têtê</h1>
          <p className="text-gray-500">A "Heads Up!" inspired game</p>
        </div>

        <h2 className="text-2xl font-semibold mb-4 text-center">Choose a Pack</h2>

        <div className="flex justify-center mb-4">
          <Button size="sm" onClick={handleSurpriseMe} aria-label="Pick a random pack">
            🎲 Surprise me!
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="list" aria-label="Available card packs">
          {packs.map((pack) => (
            <button
              key={pack.id}
              onClick={() => onSelectPack(pack)}
              className="relative flex p-6 bg-gray-200 hover:bg-gray-300 rounded-xl text-left transition-colors"
              role="listitem"
              aria-label={`${pack.name} — ${pack.cards.length} cards. ${pack.description}`}
            >
              {pack.isCustom && (
                <button
                  onClick={(e) => handleEditPack(pack, e)}
                  className="absolute bottom-2 right-2 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-300 rounded-full transition-colors"
                  aria-label={`Edit ${pack.name} pack`}
                >
                  ⚙️
                </button>
              )}
              <span className="mr-4 flex items-center justify-center" aria-hidden="true">
                <div className="text-6xl">{pack.icon}</div>
              </span>
              <span>
                <h3 className="text-xl font-bold">{pack.name}</h3>
                <p className="text-gray-500 text-sm">{pack.description}</p>
                <p className="text-gray-500 text-xs mt-2">{pack.cards.length} cards</p>
              </span>
            </button>
          ))}

          <button
            onClick={handleCreatePack}
            className="flex flex-col items-center justify-center p-6 bg-gray-200 hover:bg-gray-300 rounded-xl transition-colors border-2 border-dashed border-gray-400"
            aria-label="Create a new custom card pack"
          >
            <div className="text-6xl text-gray-400 mb-2" aria-hidden="true">
              +
            </div>
            <h3 className="text-xl font-bold text-gray-500">Create Pack</h3>
          </button>
        </div>
      </div>

      <PackEditorDialog
        pack={editingPack}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={onSavePack}
        onDelete={onDeletePack}
      />
    </Screen>
  );
}
