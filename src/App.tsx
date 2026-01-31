import { useState, useRef, useEffect } from "react";
import type { Pack } from "./types";
import { defaultPacks } from "./data/packs";
import { getCustomPacks } from "./utils/storage";
import { useGameLogic } from "./hooks/useGameLogic";
import { useGameInput } from "./hooks/useGameInput";
import { resumeAudioContext } from "./utils/audio";
import HomeScreen from "./components/HomeScreen";
import ReadyScreen from "./components/ReadyScreen";
import PlayingScreen from "./components/PlayingScreen";
import ResultsScreen from "./components/ResultsScreen";

export default function App() {
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null);
  const [customPacks, setCustomPacks] = useState<Pack[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const packs = [...defaultPacks, ...customPacks];

  const game = useGameLogic({ pack: selectedPack });

  const input = useGameInput({
    onCorrect: game.markCorrect,
    onPass: game.markPass,
    enabled: game.phase === "playing",
  });

  useEffect(() => {
    getCustomPacks()
      .then(setCustomPacks)
      .catch((e) => console.error("Failed to load custom packs:", e));
  }, []);

  const handleSelectPack = async (pack: Pack) => {
    setSelectedPack(pack);
    try {
      await resumeAudioContext();

      if (input.hasPermission === null) {
        await input.requestPermission();
      }
    } catch (e) {
      console.warn("Failed to resume audio context:", e);
    }

    game.startGame();
  };

  const handleSavePack = (pack: Pack) => {
    setCustomPacks((prev) => {
      const existingIndex = prev.findIndex((p) => p.id === pack.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = pack;

        return updated;
      }

      return [...prev, pack];
    });
  };

  const handleDeletePack = (packId: string) => {
    setCustomPacks((prev) => prev.filter((p) => p.id !== packId));
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
    return <HomeScreen packs={packs} onSelectPack={handleSelectPack} onSavePack={handleSavePack} onDeletePack={handleDeletePack} />;
  }

  if (game.phase === "ready") {
    return <ReadyScreen onReady={handleReady} onCancel={handleCancel} />;
  }

  if (game.phase === "playing") {
    return <PlayingScreen input={input} game={game} />;
  }

  if (game.phase === "results") {
    return <ResultsScreen game={game} onReplay={() => selectedPack && game.startGame()} onHome={game.goHome} />;
  }

  return null;
}
