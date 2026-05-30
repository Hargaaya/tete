import { useState, useEffect, useRef } from "react";
import Screen from "./Screen";
import Button from "./Button";
import type { useGameInput } from "../hooks/useGameInput";
import type { useGameLogic } from "../hooks/useGameLogic";

type Props = {
  input: ReturnType<typeof useGameInput>;
  game: ReturnType<typeof useGameLogic>;
};

export default function PlayingScreen({ input, game }: Props) {
  const [showExitMenu, setShowExitMenu] = useState(false);

  if (!game.currentCard) {
    return (
      <Screen className="relative text-center">
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-6xl font-bold">All cards done!</h1>
        </div>
      </Screen>
    );
  }

  const cardNumber = game.currentCardIndex + 1;
  const exitDialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = exitDialogRef.current;
    if (!dialog) return;

    if (showExitMenu) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [showExitMenu]);

  return (
    <Screen
      background={input.currentAction === "correct" ? "bg-green-500" : input.currentAction === "pass" ? "bg-orange-500" : undefined}
      className="relative text-center"
    >
      <div className="absolute top-4 left-4 z-10">
        <Button variant="text" onClick={() => setShowExitMenu(true)} aria-label="Exit game menu">
          ✕
        </Button>
      </div>
      <div className="absolute top-0 left-0 w-full flex items-center justify-center h-20">
        <span
          className={`text-4xl font-bold ${game.timeRemaining <= 10 ? "text-red-500 animate-pulse" : ""}`}
          role="timer"
          aria-label={`${game.timeRemaining} seconds remaining`}
        >
          {game.timeRemaining}
        </span>
      </div>

      <div className="absolute top-2 right-4">
        <span className="text-sm text-gray-500" aria-label={`Card ${cardNumber} of ${game.totalCards}`}>
          {cardNumber}/{game.totalCards}
        </span>
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <h1 className="text-6xl sm:text-8xl font-bold leading-tight" aria-live="polite">
          {game.currentCard.text}
        </h1>
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

      <dialog
        ref={exitDialogRef}
        className="rounded-xl p-8 max-w-sm w-full shadow-xl backdrop:bg-black/50 border-0 m-auto"
        onClose={() => setShowExitMenu(false)}
      >
        <h2 className="text-2xl font-bold text-center mb-6">Exit game?</h2>
        <div className="flex flex-col gap-3">
          <Button onClick={() => setShowExitMenu(false)} aria-label="Resume game">
            Resume
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setShowExitMenu(false);
              game.goHome();
            }}
            aria-label="Go to home"
          >
            Home
          </Button>
          <Button
            variant="text"
            onClick={() => {
              setShowExitMenu(false);
              game.exitToSetup();
            }}
            aria-label="Restart game"
          >
            Restart
          </Button>
        </div>
      </dialog>
    </Screen>
  );
}
