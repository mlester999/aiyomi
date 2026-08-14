import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

export const useReducedMotion = (): boolean => {
  const [reducedMotion, setReducedMotion] = useState(true);

  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (active) setReducedMotion(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReducedMotion,
    );

    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  return reducedMotion;
};
