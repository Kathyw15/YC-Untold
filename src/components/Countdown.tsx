import { useEffect, useState } from "react";

import { colors, fonts } from "@/theme";

import { Text, type TextProps } from "./Text";

export function useRemaining(expiresAt: number | undefined) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  return expiresAt === undefined ? null : Math.max(0, expiresAt - now);
}

export function formatRemaining(ms: number) {
  const total = Math.ceil(ms / 1000);
  const pad = (value: number) => String(value).padStart(2, "0");
  return pad(Math.floor(total / 3600)) + ":" + pad(Math.floor((total % 3600) / 60)) + ":" + pad(total % 60);
}

type CountdownProps = Omit<TextProps, "children"> & {
  expiresAt: number;
  suffix?: string;
  closedLabel?: string;
};

export function Countdown({ expiresAt, suffix = "", closedLabel = "Closed", style, ...rest }: CountdownProps) {
  const remaining = useRemaining(expiresAt) ?? 0;
  if (remaining === 0) {
    return (
      <Text variant="caption" soft {...rest} style={style}>
        {closedLabel}
      </Text>
    );
  }
  return (
    <Text
      variant="caption"
      accessibilityLabel={"Time left " + formatRemaining(remaining)}
      {...rest}
      style={[{ color: colors.pink, fontFamily: fonts.heavy, fontVariant: ["tabular-nums"] }, style]}>
      {formatRemaining(remaining) + suffix}
    </Text>
  );
}
