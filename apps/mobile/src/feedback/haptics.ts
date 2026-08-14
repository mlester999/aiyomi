import * as Haptics from "expo-haptics";

export const playSelectionHaptic = async () => {
  try {
    await Haptics.selectionAsync();
  } catch {
    // Haptics are optional feedback and must never change a successful action.
  }
};

export const playSuccessHaptic = async () => {
  try {
    await Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success,
    );
  } catch {
    // Persistence already succeeded. Unsupported haptics are safe to ignore.
  }
};
