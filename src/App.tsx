import { useState, useRef, useEffect } from "react";
import type { Pack } from "./types";
import { defaultPacks } from "./data/packs";
import { useGameLogic } from "./hooks/useGameLogic";
import { useHeadTilt } from "./hooks/useHeadTilt";
import { resumeAudioContext } from "./utils/audio";
import HomeScreen from "./components/HomeScreen";
import ReadyScreen from "./components/ReadyScreen";
import PlayingScreen from "./components/PlayingScreen";
import ResultsScreen from "./components/ResultsScreen";

export default function App() {
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const game = useGameLogic({ pack: selectedPack });

  const tilt = useHeadTilt({
    onCorrect: game.markCorrect,
    onPass: game.markPass,
    enabled: game.phase === "playing",
  });

  const handleSelectPack = async (pack: Pack) => {
    setSelectedPack(pack);
    try {
      await resumeAudioContext();

      if (tilt.hasPermission === null) {
        await tilt.requestPermission();
      }
    } catch (e) {
      console.warn("Failed to resume audio context:", e);
    }

    game.startGame();
  };

  const handleReady = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      game.beginPlaying();
    }, 1_000);
  };

  const handleCancel = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    game.goHome();
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (game.phase === "home") {
    return <HomeScreen packs={defaultPacks} onSelectPack={handleSelectPack} />;
  }

  if (game.phase === "ready") {
    return <ReadyScreen onReady={handleReady} onCancel={handleCancel} />;
  }

  if (game.phase === "playing") {
    return <PlayingScreen tilt={tilt} game={game} />;
  }

  if (game.phase === "results") {
    return <ResultsScreen game={game} onReplay={() => selectedPack && game.startGame()} onHome={game.goHome} />;
  }

  return null;
}
