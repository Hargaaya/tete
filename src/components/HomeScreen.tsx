import type { Pack } from "../types";
import Screen from "./Screen";

type Props = {
  packs: Pack[];
  onSelectPack: (pack: Pack) => void;
};

export default function HomeScreen({ packs, onSelectPack }: Props) {
  return (
    <Screen background="from-slate-900 to-slate-800" className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-2">Têtê</h1>
          <p className="text-gray-500">A "Heads Up!" inspired game</p>
        </div>

        <h2 className="text-2xl font-semibold mb-4 text-center">Choose a Pack</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {packs.map((pack) => (
            <button
              key={pack.id}
              onClick={() => onSelectPack(pack)}
              className="flex p-6 bg-gray-200 hover:bg-gray-300 rounded-xl text-left transition-colors"
            >
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
        </div>
      </div>
    </Screen>
  );
}
