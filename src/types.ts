export interface Card {
  text: string;
}

export interface Pack {
  id: string;
  name: string;
  description: string;
  icon: string; // Emoji
  cards: Card[];
  isCustom?: boolean;
}

export type GamePhase = "home" | "ready" | "playing" | "results";

export type GameMode = "chill" | "normal" | "hard";

export const GAME_MODE_CONFIG: Record<GameMode, { label: string; duration: number; description: string }> = {
  chill: { label: "Chill", duration: 90, description: "90 seconds — take it easy" },
  normal: { label: "Normal", duration: 60, description: "60 seconds — classic mode" },
  hard: { label: "Hard", duration: 45, description: "45 seconds — fast pace" },
};

export interface GameResult {
  card: Card;
  result: "correct" | "pass";
}

export interface GameState {
  phase: GamePhase;
  currentPack: Pack | null;
  currentCardIndex: number;
  results: GameResult[];
  timeRemaining: number;
}

export type TiltAction = "none" | "correct" | "pass";

export interface TiltState {
  isSupported: boolean;
  hasPermission: boolean | null; // null = not yet requested
  currentAction: TiltAction;
  beta: number; // Front-to-back tilt (-180 to 180)
  gamma: number; // Left-to-right tilt (-90 to 90)
}

export interface Toast {
  id: string;
  message: string;
  type: "error" | "success" | "info";
}
