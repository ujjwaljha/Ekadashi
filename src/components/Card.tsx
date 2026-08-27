import type { ReactNode } from "react";
import { View } from "react-native";

interface CardProps {
  children: ReactNode;
  className?: string;
}

/** Frosted surface container used to group content across the app. */
export function Card({ children, className = "" }: CardProps) {
  return (
    <View
      className={`rounded-3xl border border-white/10 bg-white/5 p-5 ${className}`}
    >
      {children}
    </View>
  );
}
