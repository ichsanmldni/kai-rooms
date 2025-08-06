"use client";
import { useEffect } from "react";

export default function BacksoundPlayer() {
  useEffect(() => {
    const audio = new Audio("/kai-bgm.mp3");
    audio.loop = true;
    audio.volume = 0.3;
    audio.play().catch(() => {
      console.warn("Autoplay ditolak, interaksi user diperlukan.");
    });

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  return null;
}
