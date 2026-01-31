import { useRef, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import type { Pack } from "../types";
import { savePack, deletePack } from "../utils/storage";
import Button from "./Button";

type Props = {
  pack: Pack | null;
  open: boolean;
  onClose: () => void;
  onSave: (pack: Pack) => void;
  onDelete?: (packId: string) => void;
};

export default function PackEditorDialog({ pack, open, onClose, onSave, onDelete }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("📦");
  const [cards, setCards] = useState<string[]>([]);
  const [newCardText, setNewCardText] = useState("");
  const [error, setError] = useState("");

  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (pack) {
      setName(pack.name);
      setDescription(pack.description);
      setIcon(pack.icon);
      setCards(pack.cards.map((c) => c.text));
    } else {
      setName("");
      setDescription("");
      setIcon("📦");
      setCards([]);
    }

    setNewCardText("");
    setError("");
  }, [pack, open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  const handleAddCard = () => {
    const trimmed = newCardText.trim();
    if (!trimmed) {
      return;
    }

    if (cards.includes(trimmed)) {
      setError("This card already exists in the pack");
      return;
    }

    setCards([...cards, trimmed]);
    setNewCardText("");
    setError("");
  };

  const handleRemoveCard = (index: number) => {
    setCards(cards.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Pack name is required");
      return;
    }

    if (cards.length === 0) {
      setError("Add at least one card");
      return;
    }

    const newPack: Pack = {
      id: pack?.id ?? uuidv4(),
      name: name.trim(),
      description: description.trim(),
      icon: icon || "📦",
      cards: cards.map((text) => ({ text })),
      isCustom: true,
    };

    try {
      await savePack(newPack);
      onSave(newPack);
      onClose();
    } catch (e) {
      setError("Failed to save pack");
      console.error("Failed to save pack:", e);
    }
  };

  const handleDelete = async () => {
    if (!pack || !onDelete) {
      return;
    }

    if (!confirm("Are you sure you want to delete this pack?")) {
      return;
    }

    try {
      await deletePack(pack.id);
      onDelete(pack.id);
      onClose();
    } catch (e) {
      setError("Failed to delete pack");
      console.error("Failed to delete pack:", e);
    }
  };

  const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={handleDialogClick}
      onCancel={onClose}
      className="backdrop:bg-black/50 bg-transparent p-4 max-w-lg w-full m-auto"
    >
      <div className="bg-white rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4">{pack ? "Edit Pack" : "Create New Pack"}</h2>

        {error && <div className="bg-red-500/20 text-red-300 px-4 py-2 rounded-lg mb-4">{error}</div>}

        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Icon (emoji)</label>
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-20 px-3 py-2 bg-gray-200 rounded-lg text-2xl text-center"
              maxLength={2}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Custom Pack"
              className="w-full px-3 py-2 bg-gray-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short description..."
              className="w-full px-3 py-2 bg-gray-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Cards ({cards.length})</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newCardText}
                onChange={(e) => setNewCardText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCard()}
                placeholder="Type a card and press Enter"
                className="flex-1 min-w-0 px-3 py-2 bg-gray-200 rounded-lg"
              />
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {cards.map((card, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-200 px-3 py-2 rounded-lg">
                  <span className="truncate">{card}</span>
                  <button type="button" onClick={() => handleRemoveCard(index)} className="text-red-500 hover:text-red-700 ml-2">
                    ✕
                  </button>
                </div>
              ))}
              {cards.length === 0 && <p className="text-sm text-center py-4">No cards yet, add some above.</p>}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          {pack && onDelete && (
            <Button variant="danger" size="md" onClick={handleDelete}>
              Delete
            </Button>
          )}
          <div className="flex-1" />
          <Button variant="secondary" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="success" size="md" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    </dialog>
  );
}
