import { useState } from "react";
import { GemMark } from "@/assets/brand/GemMark";

/** Branded launch overlay. Pure CSS timeline; unmounts itself when done. */
export function Splash() {
  const [gone, setGone] = useState(false);
  if (gone) return null;
  return (
    <div
      className="splash"
      onAnimationEnd={(e) => {
        if (e.animationName === "splash-out") setGone(true);
      }}
    >
      <GemMark className="splash-gem" />
    </div>
  );
}
