import { useState, useRef, useEffect } from "react";
import type { Pack, GameMode } from "./types";
import { defaultPacks } from "./data/packs";
import { getCustomPacks, getSettings, saveSettings, getBestScore, saveBestScore } from "./utils/storage";
import { useGameLogic } from "./hooks/useGameLogic";
import { useGameInput } from "./hooks/useGameInput";
import { resumeAudioContext } from "./utils/audio";
import { useToast } from "./hooks/useToast";
import HomeScreen from "./components/HomeScreen";
import ReadyScreen from "./components/ReadyScreen";
import PlayingScreen from "./components/PlayingScreen";
import ResultsScreen from "./components/ResultsScreen";

export default function App() {
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null);
  const [customPacks, setCustomPacks] = useState<Pack[]>([]);
  const [gameMode, setGameMode] = useState<GameMode>("normal");
  const [soundEnabled, setSoundEnabledState] = useState(() => getSettings().soundEnabled);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [isNewBest, setIsNewBest] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { addToast } = useToast();

  const packs = [...defaultPacks, ...customPacks];

  const game = useGameLogic({ pack: selectedPack, mode: gameMode });

  const input = useGameInput({
    onCorrect: game.markCorrect,
    onPass: game.markPass,
    enabled: game.phase === "playing",
  });

  useEffect(() => {
    getCustomPacks()
      .then(setCustomPacks)
      .catch(() => addToast("Failed to load custom packs"));
  }, [addToast]);

  const handleToggleSound = () => {
    setSoundEnabledState((prev) => {
      const next = !prev;
      saveSettings({ soundEnabled: next });
      return next;
    });
  };

  const handleSelectPack = async (pack: Pack) => {
    setSelectedPack(pack);
    setIsNewBest(false);
    setBestScore(getBestScore(pack.id, gameMode));
    try {
      await resumeAudioContext();

      if (input.hasPermission === null) {
        await input.requestPermission();
      }
    } catch (e) {
      console.warn("Failed to resume audio context:", e);
    }

    game.startGame(pack);
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

  // Update best score when results phase is reached (state-during-render pattern)
  const [prevPhase, setPrevPhase] = useState(game.phase);
  if (game.phase !== prevPhase) {
    setPrevPhase(game.phase);
    if (game.phase === "results" && selectedPack) {
      const newBest = saveBestScore(selectedPack.id, gameMode, game.correctCount);
      setIsNewBest(newBest);
      setBestScore(getBestScore(selectedPack.id, gameMode));
    }
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (game.phase === "home") {
    return (
      <HomeScreen
        packs={packs}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onSelectPack={handleSelectPack}
        onSavePack={handleSavePack}
        onDeletePack={handleDeletePack}
      />
    );
  }

  if (game.phase === "ready") {
    return <ReadyScreen mode={gameMode} onModeChange={setGameMode} onReady={handleReady} onCancel={handleCancel} />;
  }

  if (game.phase === "playing") {
    return <PlayingScreen input={input} game={game} />;
  }

  if (game.phase === "results") {
    return (
      <ResultsScreen
        game={game}
        bestScore={bestScore}
        isNewBest={isNewBest}
        onReplay={() => selectedPack && game.startGame()}
        onHome={game.goHome}
      />
    );
  }

  return null;
}
