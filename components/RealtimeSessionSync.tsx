"use client";

import { useEffect } from "react";
import { useGameStore } from "@/store/useStore";

export function RealtimeSessionSync() {
  const role = useGameStore((state) => state.role);
  const gameId = useGameStore((state) => state.gameId);
  const ensureRealtimeSubscription = useGameStore((state) => state.ensureRealtimeSubscription);

  useEffect(() => {
    if ((role === "admin" || role === "sub-admin") && gameId) {
      ensureRealtimeSubscription(gameId);
    }
  }, [role, gameId, ensureRealtimeSubscription]);

  return null;
}
