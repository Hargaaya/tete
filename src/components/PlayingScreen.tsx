import Screen from "./Screen";
import type { useGameInput } from "../hooks/useGameInput";
import type { useGameLogic } from "../hooks/useGameLogic";

type Props = {
  input: ReturnType<typeof useGameInput>;
  game: ReturnType<typeof useGameLogic>;
};

export default function PlayingScreen({ input, game }: Props) {
  if (!game.currentCard) {
    return (
      <Screen className="relative text-center">
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-6xl font-bold">All cards done!</h1>
        </div>
      </Screen>
    );
  }

  return (
    <Screen
      background={input.currentAction === "correct" ? "bg-green-500" : input.currentAction === "pass" ? "bg-orange-500" : undefined}
      className="relative text-center"
    >
      <div className="absolute top-0 left-0 w-full flex items-center justify-center h-20">
        <span className={`text-4xl font-bold ${game.timeRemaining <= 10 ? "text-red-500 animate-pulse" : ""}`}>{game.timeRemaining}</span>
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <h1 className="text-6xl sm:text-8xl font-bold leading-tight">{game.currentCard.text}</h1>
      </div>

      <div className="hidden sm:flex absolute bottom-6 left-0 w-full justify-center gap-8 text-gray-500 text-sm">
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-gray-200 rounded border border-gray-300 font-mono">↑</kbd>
          <span>Pass</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-gray-200 rounded border border-gray-300 font-mono">↓</kbd>
          <span>Correct</span>
        </div>
      </div>
    </Screen>
  );
}
