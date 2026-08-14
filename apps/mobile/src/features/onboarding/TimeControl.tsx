import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Platform, StyleSheet, View } from "react-native";

import { TimePickerField } from "../../components";
import { spacing } from "../../theme";

const valueAsDate = (value: string) => {
  const [hours = 0, minutes = 0] = value.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const valueFromDate = (value: Date) =>
  `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`;

const displayTime = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(valueAsDate(value));

interface TimeControlProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  timezone?: string;
  helperText?: string;
  disabled?: boolean;
}

export function TimeControl({
  disabled = false,
  helperText,
  label,
  onChange,
  timezone,
  value,
}: TimeControlProps) {
  const [visible, setVisible] = useState(false);

  const change = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === "android") setVisible(false);
    if (event.type !== "dismissed" && date) onChange(valueFromDate(date));
  };

  return (
    <View style={styles.container}>
      <TimePickerField
        disabled={disabled}
        helperText={helperText}
        label={label}
        onPress={() => setVisible((current) => !current)}
        timezoneLabel={timezone}
        value={displayTime(value)}
      />
      {visible ? (
        <DateTimePicker
          accessibilityLabel={`${label} picker`}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          disabled={disabled}
          mode="time"
          onChange={change}
          value={valueAsDate(value)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs, width: "100%" },
});
