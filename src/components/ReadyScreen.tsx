import Screen from "./Screen";
import Button from "./Button";
import type { GameMode } from "../types";
import { GAME_MODE_CONFIG } from "../types";

type Props = {
  mode: GameMode;
  onModeChange: (mode: GameMode) => void;
  onReady: () => void;
  onCancel: () => void;
  countdown: number | null;
};

const MODE_ORDER: GameMode[] = ["chill", "normal", "hard"];

export default function ReadyScreen({ mode, onModeChange, onReady, onCancel, countdown }: Props) {
  if (countdown !== null) {
    return (
      <Screen className="flex flex-col items-center justify-center">
        <span key={countdown} className="text-[12rem] sm:text-[16rem] font-bold leading-none select-none animate-pulse">
          {countdown > 0 ? countdown : "Go!"}
        </span>
      </Screen>
    );
  }

  return (
    <Screen className="flex flex-col items-center justify-center p-6">
      <div className="absolute top-4 left-4 z-10">
        <Button variant="text" size="sm" onClick={onCancel} aria-label="Go back to pack selection">
          ← Go back
        </Button>
      </div>
      <div className="text-center">
        <div className="text-8xl mb-6" aria-hidden="true">
          📱
        </div>
        <h2 className="text-3xl font-bold mb-4">Get Ready!</h2>
        <p className="text-xl text-gray-500 mb-6">Place the screen so that it is facing your foes!</p>

        <fieldset className="mb-8">
          <div className="flex gap-2 justify-center" role="radiogroup" aria-label="Game mode selection">
            {MODE_ORDER.map((m) => {
              const cfg = GAME_MODE_CONFIG[m];
              const selected = m === mode;
              return (
                <Button
                  key={m}
                  size="sm"
                  variant={selected ? "primary" : "secondary"}
                  onClick={() => onModeChange(m)}
                  className="text-sm!"
                  role="radio"
                  aria-checked={selected}
                >
                  {cfg.label}
                </Button>
              );
            })}
          </div>
          <p className="text-sm text-gray-500 mt-2">{GAME_MODE_CONFIG[mode].description}</p>
        </fieldset>

        <div className="flex gap-4 justify-center">
          <Button onClick={onReady} aria-label="Start game">
            Start!
          </Button>
        </div>
      </div>
    </Screen>
  );
}
