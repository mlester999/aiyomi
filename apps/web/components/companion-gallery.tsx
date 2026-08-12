"use client";

import { Check, Heart, Palette, Sparkles } from "lucide-react";
import { useState } from "react";
import { trackEvent } from "@aiyomi/analytics";
import { Mascot } from "./mascot";

type Companion = {
  id: "mori" | "lumi" | "piko";
  name: string;
  kind: string;
  note: string;
  personality: string;
  pose: "wave" | "reflect" | "celebrate";
};

const companions: Companion[] = [
  {
    id: "mori",
    name: "Mori",
    kind: "Meadow companion",
    note: "Calm and thoughtful",
    personality: "Gentle support",
    pose: "wave",
  },
  {
    id: "lumi",
    name: "Lumi",
    kind: "Starlight companion",
    note: "Warm and curious",
    personality: "Balanced support",
    pose: "reflect",
  },
  {
    id: "piko",
    name: "Piko",
    kind: "Sunrise companion",
    note: "Bright and motivating",
    personality: "Coach support",
    pose: "celebrate",
  },
];

export function CompanionGallery() {
  const [selected, setSelected] = useState<Companion>(companions[0]);

  return (
    <div className="companion-gallery">
      <div className="companion-stage">
        <span className="stage-orbit stage-orbit-one" aria-hidden="true" />
        <span className="stage-orbit stage-orbit-two" aria-hidden="true" />
        <span className="stage-star stage-star-one" aria-hidden="true">✦</span>
        <span className="stage-star stage-star-two" aria-hidden="true">✦</span>
        <div className="companion-name-bubble">
          <span>{selected.kind}</span>
          <strong>{selected.name}</strong>
        </div>
        <Mascot key={selected.id} variant={selected.id} size="large" pose={selected.pose} label={`${selected.name}, ${selected.kind}`} />
        <div className="personality-pill"><Heart size={14} fill="currentColor" aria-hidden="true" /> {selected.personality}</div>
      </div>
      <div className="companion-picker" role="group" aria-label="Preview companion concepts">
        {companions.map((companion) => (
          <button
            key={companion.id}
            type="button"
            className={`companion-choice ${selected.id === companion.id ? "is-selected" : ""}`}
            aria-pressed={selected.id === companion.id}
            onClick={() => {
              setSelected(companion);
              trackEvent("companion_section_viewed", { companion: companion.id });
            }}
          >
            <span className="choice-mascot"><Mascot variant={companion.id} size="small" pose={companion.pose} decorative /></span>
            <span className="choice-copy">
              <strong>{companion.name}</strong>
              <small>{companion.note}</small>
            </span>
            <span className="choice-check" aria-hidden="true"><Check /></span>
          </button>
        ))}
        <div className="customize-note">
          <span><Palette aria-hidden="true" /></span>
          <div><strong>Make the support yours</strong><small>Name, style, support mode, and future cosmetics.</small></div>
          <Sparkles aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
