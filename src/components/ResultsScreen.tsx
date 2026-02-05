import Screen from "./Screen";
import type { useGameLogic } from "../hooks/useGameLogic";
import Button from "./Button";

type Props = {
  game: ReturnType<typeof useGameLogic>;
  onReplay: () => void;
  onHome: () => void;
};

export default function ResultsScreen({ game, onReplay, onHome }: Props) {
  return (
    <Screen className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-6xl font-bold my-6" aria-label={`${game.correctCount} correct answers`}>
            {game.correctCount}
          </div>
          <p className="text-2xl">Correct Answers</p>
        </div>

        <div className="space-y-2 mb-8" role="list" aria-label="Card results">
          {game.results.map((result, index) => (
            <div
              key={index}
              role="listitem"
              className={`p-3 rounded-lg flex justify-between items-center ${result.result === "correct" ? "bg-green-500" : "bg-orange-500"}`}
            >
              <p className="font-semibold">{result.card.text}</p>
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
