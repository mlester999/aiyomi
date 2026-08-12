type MascotVariant = "mori" | "lumi" | "piko";

type MascotProps = {
  variant?: MascotVariant;
  size?: "small" | "medium" | "large";
  mood?: "happy" | "focused" | "sleepy" | "thoughtful" | "proud";
  pose?: "idle" | "wave" | "plan" | "focus" | "reflect" | "celebrate" | "rest";
  accessory?: "none" | "book" | "headphones" | "lantern";
  className?: string;
  label?: string;
  decorative?: boolean;
};

export function Mascot({
  variant = "mori",
  size = "medium",
  mood = "happy",
  pose = "idle",
  accessory = "none",
  className = "",
  label,
  decorative = false,
}: MascotProps) {
  const names: Record<MascotVariant, string> = {
    mori: "Mori, a mint sprout companion",
    lumi: "Lumi, a lavender star companion",
    piko: "Piko, a peach cloud companion",
  };

  return (
    <div
      className={`mascot mascot-${variant} mascot-${size} mascot-${mood} mascot-pose-${pose} mascot-accessory-${accessory} ${className}`}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : (label ?? names[variant])}
      aria-hidden={decorative || undefined}
    >
      <span className="mascot-shadow" />
      <span className="mascot-aura" />
      <span className="mascot-tail"><span /></span>
      <span className="mascot-ear mascot-ear-left" />
      <span className="mascot-ear mascot-ear-right" />
      <span className="mascot-body">
        <span className="mascot-sprout mascot-sprout-left" />
        <span className="mascot-sprout mascot-sprout-right" />
        <span className="mascot-signature" />
        <span className="mascot-arm mascot-arm-left" />
        <span className="mascot-arm mascot-arm-right" />
        <span className="mascot-face">
          <span className="mascot-brow mascot-brow-left" />
          <span className="mascot-brow mascot-brow-right" />
          <span className="mascot-eye mascot-eye-left" />
          <span className="mascot-eye mascot-eye-right" />
          <span className="mascot-mouth" />
          <span className="mascot-cheek mascot-cheek-left" />
          <span className="mascot-cheek mascot-cheek-right" />
        </span>
        <span className="mascot-belly" />
      </span>
      <span className="mascot-foot mascot-foot-left" />
      <span className="mascot-foot mascot-foot-right" />
      <span className="mascot-prop" aria-hidden="true"><span /></span>
    </div>
  );
}
