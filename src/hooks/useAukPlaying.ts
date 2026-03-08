import { useEffect, useState } from "react";
import { onAukPlayingChange, getAukPlaying } from "@/lib/aukSound";

export function useAukPlaying() {
  const [playing, setPlaying] = useState(getAukPlaying);
  useEffect(() => onAukPlayingChange(setPlaying), []);
  return playing;
}
