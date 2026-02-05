let audioContext: AudioContext | null = null;

function isSoundEnabled(): boolean {
  try {
    const raw = localStorage.getItem("tete-settings");
    if (!raw) {
      return true;
    }

    return JSON.parse(raw).soundEnabled !== false;
  } catch {
    return true;
  }
}

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }

  return audioContext;
}

function withAudioContext(callback: (ctx: AudioContext) => void): void {
  const ctx = getAudioContext();

  if (ctx.state === "suspended") {
    ctx
      .resume()
      .then(() => callback(ctx))
      .catch((error) => console.warn("Failed to resume audio context:", error));
    return;
  }

  callback(ctx);
}

export async function resumeAudioContext(): Promise<void> {
  const ctx = getAudioContext();
  if (ctx.state === "suspended") {
    await ctx.resume();
  }
}

function playTone(frequency: number, duration: number, type: OscillatorType = "sine"): void {
  if (!isSoundEnabled()) {
    return;
  }

  try {
    withAudioContext((ctx) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      const now = ctx.currentTime;

      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

      oscillator.start(now);
      oscillator.stop(now + duration);
    });
  } catch {
    // silently fail - non-blocking
  }
}

export function playCorrectSound(): void {
  playTone(880, 0.15, "sine");
  setTimeout(() => playTone(1108, 0.2, "sine"), 100);
}

export function playPassSound(): void {
  playTone(260, 0.3, "triangle");
}

export function playCountdownBeep(): void {
  playTone(440, 0.1, "sine");
}

export function vibrate(pattern: number | number[]): void {
  try {
    if ("vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    // silently fail - non-blocking
  }
}
