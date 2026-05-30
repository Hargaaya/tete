import { useState, useEffect } from "react";
import type { Pack, GameMode } from "./types";
import { defaultPacks } from "./data/packs";
import { getCustomPacks, getSettings, saveSettings, getBestScore, saveBestScore } from "./utils/storage";
import { useGameLogic } from "./hooks/useGameLogic";
import { useGameInput } from "./hooks/useGameInput";
import { resumeAudioContext, playCountdownBeep } from "./utils/audio";
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
  const [countdown, setCountdown] = useState<number | null>(null);
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

  const handleSelectPack = (pack: Pack) => {
    setSelectedPack(pack);
    setIsNewBest(false);
    setBestScore(getBestScore(pack.id, gameMode));
    game.selectPack();
  };

  const handleStartRound = async () => {
    try {
      await resumeAudioContext();

      if (input.hasPermission === null) {
        await input.requestPermission();
      }
    } catch {
      // silently fail - non-blocking
    }

    game.startGame();
    setCountdown(3);
  };

  useEffect(() => {
    if (countdown === null) {
      return;
    }

    if (countdown > 0) {
      playCountdownBeep();
      const timer = setTimeout(() => setCountdown((prev) => (prev ?? 0) - 1), 1000);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setCountdown(null);
      game.beginPlaying();
    }, 700);
    return () => clearTimeout(timer);
  }, [countdown, game]);

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

  const handleCancel = () => {
    setCountdown(null);
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
    return (
      <ReadyScreen mode={gameMode} onModeChange={setGameMode} onReady={handleStartRound} onCancel={handleCancel} countdown={countdown} />
    );
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
