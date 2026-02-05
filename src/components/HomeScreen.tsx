import { useState } from "react";
import type { Pack } from "../types";
import Screen from "./Screen";
import PackEditorDialog from "./PackEditorDialog";

type Props = {
  packs: Pack[];
  onSelectPack: (pack: Pack) => void;
  onSavePack: (pack: Pack) => void;
  onDeletePack: (packId: string) => void;
};

export default function HomeScreen({ packs, onSelectPack, onSavePack, onDeletePack }: Props) {
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
          <h1 className="text-5xl font-bold mb-2">Têtê</h1>
          <p className="text-gray-500">A "Heads Up!" inspired game</p>
        </div>

        <h2 className="text-2xl font-semibold mb-4 text-center">Choose a Pack</h2>

        <div className="flex justify-center mb-4">
          <Button size="sm" onClick={handleSurpriseMe} aria-label="Pick a random pack">
            🎲 Surprise me!
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {packs.map((pack) => (
            <button
              key={pack.id}
              onClick={() => onSelectPack(pack)}
              className="relative flex p-6 bg-gray-200 hover:bg-gray-300 rounded-xl text-left transition-colors"
            >
              {pack.isCustom && (
                <button
                  onClick={(e) => handleEditPack(pack, e)}
                  className="absolute bottom-2 right-2 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-300 rounded-full transition-colors"
                  title="Edit pack"
                >
                  ⚙️
                </button>
              )}
              <span className="mr-4 flex items-center justify-center">
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
          >
            <div className="text-6xl text-gray-400 mb-2">+</div>
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
