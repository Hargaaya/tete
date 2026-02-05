import Screen from "./Screen";
import type { useGameLogic } from "../hooks/useGameLogic";
import Button from "./Button";

type Props = {
  game: ReturnType<typeof useGameLogic>;
  bestScore: number | null;
  isNewBest: boolean;
  onReplay: () => void;
  onHome: () => void;
};

export default function ResultsScreen({ game, bestScore, isNewBest, onReplay, onHome }: Props) {
  const total = game.results.length;
  const accuracy = total > 0 ? Math.round((game.correctCount / total) * 100) : 0;

  return (
    <Screen className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          {isNewBest && (
            <p className="text-amber-400 font-bold text-lg mb-2" role="status">
              🏆 New Best Score!
            </p>
          )}
          <div className="text-6xl font-bold my-6" aria-label={`${game.correctCount} correct answers`}>
            {game.correctCount}
          </div>
          <p className="text-2xl">Correct Answers</p>
          <div className="flex justify-center gap-6 mt-4 text-sm text-gray-500">
            <span>{game.passCount} passed</span>
            <span aria-label={`${accuracy} percent accuracy`}>{accuracy}% accuracy</span>
            {bestScore !== null && !isNewBest && <span>Best: {bestScore}</span>}
          </div>
        </div>

        <div className="space-y-2 mb-8" role="list" aria-label="Card results">
          {game.results.map((result, index) => (
            <div
              key={index}
              role="listitem"
              className={`p-3 rounded-lg flex justify-between items-center ${result.result === "correct" ? "bg-green-500" : "bg-orange-500"}`}
            >
              <p className="font-semibold">{result.card.text}</p>
              <span className="text-sm opacity-80">{result.result === "correct" ? "✓" : "—"}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={onReplay} aria-label="Play the same pack again">
            Play Again
          </Button>
          <Button variant="secondary" onClick={onHome}>
            Choose Pack
          </Button>
        </div>
      </div>
    </Screen>
  );
}
