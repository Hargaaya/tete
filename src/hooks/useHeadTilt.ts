import { useState, useEffect, useCallback, useRef } from "react";
import type { TiltState, TiltAction } from "../types";

// Tilt down (correct) = beta decreases significantly from upright
// Tilt up (pass) = beta increases beyond upright
const TILT_DOWN_THRESHOLD = 45;
const TILT_UP_THRESHOLD = 135;
const COOLDOWN_MS = 1000;

type UseHeadTiltOptions = {
  onCorrect?: () => void;
  onPass?: () => void;
  enabled?: boolean;
};

// IOS specific interface extension
declare global {
  interface DeviceOrientationEvent {
    requestPermission?: () => Promise<"granted" | "denied" | "default">;
  }
}

export function useHeadTilt({ onCorrect, onPass, enabled = true }: UseHeadTiltOptions) {
  const [state, setState] = useState<TiltState>({
    isSupported: false,
    hasPermission: null,
    currentAction: "none",
    beta: 0,
    gamma: 0,
  });

  const lastActionTime = useRef<number>(0);
  const lastAction = useRef<TiltAction>("none");

  useEffect(() => setState((prev) => ({ ...prev, isSupported: "DeviceOrientationEvent" in window })), []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      // IOS - check to request permission
      if (
        typeof DeviceOrientationEvent !== "undefined" &&
        typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === "function"
      ) {
        const permission = await (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission();
        const granted = permission === "granted";
        setState((prev) => ({ ...prev, hasPermission: granted }));

        return granted;
      } else {
        // Android/Desktop - permission not required
        setState((prev) => ({ ...prev, hasPermission: true }));

        return true;
      }
    } catch (error) {
      console.error("Something went wrong with requesting device orientation permission:", error);
      setState((prev) => ({ ...prev, hasPermission: false }));

      return false;
    }
  }, []);

  useEffect(() => {
    if (!enabled || state.hasPermission !== true) {
      return;
    }

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const beta = event.beta ?? 0;
      const gamma = event.gamma ?? 0;
      const now = Date.now();

      let currentAction: TiltAction = "none";
      if (beta < TILT_DOWN_THRESHOLD) {
        currentAction = "correct";
      } else if (beta > TILT_UP_THRESHOLD) {
        currentAction = "pass";
      }

      const canTrigger = currentAction !== "none" && currentAction !== lastAction.current && now - lastActionTime.current > COOLDOWN_MS;

      if (canTrigger) {
        lastActionTime.current = now;
        lastAction.current = currentAction;

        if (currentAction === "correct") {
          onCorrect?.();
        } else if (currentAction === "pass") {
          onPass?.();
        }
      }

      if (beta >= TILT_DOWN_THRESHOLD && beta <= TILT_UP_THRESHOLD) {
        lastAction.current = "none";
      }

      setState((prev) => ({
        ...prev,
        beta,
        gamma,
        currentAction,
      }));
    };

    window.addEventListener("deviceorientation", handleOrientation, true);

    return () => window.removeEventListener("deviceorientation", handleOrientation, true);
  }, [enabled, state.hasPermission, onCorrect, onPass]);

  return { ...state, requestPermission };
}
