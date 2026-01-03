"use client";

import { useEffect, useRef } from "react";

export default function GameCanvas() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<{ destroy: (removeCanvas: boolean, noReturn?: boolean) => void } | null>(null);

  useEffect(() => {
    if (!hostRef.current) return;
    if (gameRef.current) return;

    let cancelled = false;
    (async () => {
      const { createGame } = await import("@/game/createGame");
      if (cancelled) return;
      const game = await createGame(hostRef.current!);
      if (cancelled) {
        game.destroy(true);
        return;
      }
      gameRef.current = game;
    })();

    return () => {
      cancelled = true;
      try {
        gameRef.current?.destroy(true);
      } catch {
        // ignore
      }
      gameRef.current = null;
    };
  }, []);

  return <div ref={hostRef} style={{ width: "100%", height: "78vh" }} />;
}

