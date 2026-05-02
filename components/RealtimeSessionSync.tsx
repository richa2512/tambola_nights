"use client";

import { useEffect } from "react";
import { useGameStore } from "@/store/useStore";
import { ensureAuth } from "@/lib/firebase";

export function RealtimeSessionSync() {
  const role = useGameStore((state) => state.role);
  const gameId = useGameStore((state) => state.gameId);
  const ensureRealtimeSubscription = useGameStore((state) => state.ensureRealtimeSubscription);
  const syncStatus = useGameStore((state) => state.syncStatus);
  const syncError = useGameStore((state) => state.syncError);

  // Kick off anonymous Firebase auth as soon as the app mounts, so all
  // subsequent Firestore reads/writes have a signed-in user.
  useEffect(() => {
    ensureAuth().catch((e) => console.error("ensureAuth failed", e));
  }, []);

  useEffect(() => {
    if ((role === "admin" || role === "sub-admin") && gameId) {
      ensureRealtimeSubscription(gameId);
    }
  }, [role, gameId, ensureRealtimeSubscription]);

  // Surface sync errors so the user (and especially the host) actually
  // sees that their session isn't reaching Firestore.
  if (syncStatus === "error" && syncError) {
    return (
      <div
        role="alert"
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] max-w-md w-[calc(100%-2rem)] bg-red-50 dark:bg-red-950/80 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-200 rounded-xl px-4 py-3 shadow-lg backdrop-blur"
      >
        <p className="font-bold text-sm mb-1">Cloud sync failed</p>
        <p className="text-xs leading-relaxed break-words">{syncError}</p>
      </div>
    );
  }

  return null;
}
