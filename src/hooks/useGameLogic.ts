import { useState, useCallback, useRef, useEffect } from "react";
import type { Pack, Card, GameResult, GamePhase } from "../types";
import { playCorrectSound, playPassSound, playCountdownBeep, vibrate } from "../utils/audio";
import { shuffleArray } from "../utils/helpers";

const GAME_DURATION = 60;

type UseGameLogicOptions = {
  pack: Pack | null;
};

export function useGameLogic({ pack }: UseGameLogicOptions) {
  const [phase, setPhase] = useState<GamePhase>("home");
  const [shuffledCards, setShuffledCards] = useState<Card[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [results, setResults] = useState<GameResult[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(GAME_DURATION);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastBeepSecond = useRef<number | null>(null);

  const correctCount = results.filter((r) => r.result === "correct").length;
  const passCount = results.filter((r) => r.result === "pass").length;

  const currentCard = shuffledCards[currentCardIndex] ?? null;

  const startGame = useCallback(() => {
    if (!pack) {
      return;
    }

    const cards = shuffleArray(pack.cards);
    setShuffledCards(cards);
    setCurrentCardIndex(0);
    setResults([]);
    setTimeRemaining(GAME_DURATION);
    setPhase("ready");
  }, [pack]);

  const beginPlaying = useCallback(() => setPhase("playing"), []);

  const markCorrect = useCallback(() => {
    if (phase !== "playing" || !currentCard) {
      return;
    }

    playCorrectSound();
    vibrate([100, 50, 100]);

    setResults((prev) => [...prev, { card: currentCard, result: "correct" }]);
    setCurrentCardIndex((prev) => prev + 1);
  }, [phase, currentCard]);

  const markPass = useCallback(() => {
    if (phase !== "playing" || !currentCard) {
      return;
    }

    playPassSound();
    vibrate([200]);

    setResults((prev) => [...prev, { card: currentCard, result: "pass" }]);
    setCurrentCardIndex((prev) => prev + 1);
  }, [phase, currentCard]);

  const endGame = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setPhase("results");
  }, []);

  const goHome = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setPhase("home");
    setShuffledCards([]);
    setCurrentCardIndex(0);
    setResults([]);
    setTimeRemaining(GAME_DURATION);
  }, []);

  useEffect(() => {
    if (phase !== "playing") {
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [phase, endGame]);

  useEffect(() => {
    if (phase === "playing" && currentCardIndex >= shuffledCards.length && shuffledCards.length > 0) {
      endGame();
    }
  }, [phase, currentCardIndex, shuffledCards.length, endGame]);

  useEffect(() => {
    if (phase !== "playing") {
      lastBeepSecond.current = null;
      return;
    }

    if (timeRemaining <= 0 || lastBeepSecond.current === timeRemaining) {
      return;
    }

    if (timeRemaining <= 10) {
      playCountdownBeep();
    }

    lastBeepSecond.current = timeRemaining;
  }, [phase, timeRemaining]);

  return {
    phase,
    currentCard,
    currentCardIndex,
    totalCards: shuffledCards.length,
    results,
    timeRemaining,
    correctCount,
    passCount,
    startGame,
    beginPlaying,
    markCorrect,
    markPass,
    endGame,
    goHome,
  };
}
