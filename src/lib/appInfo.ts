import Constants from "expo-constants";

/** Marketing version from app.json (e.g. 1.1.0). */
export function getAppVersion(): string {
  return Constants.expoConfig?.version ?? "1.1.0";
}

/** Store build labels when present in the Expo config. */
export function getBuildLabel(): string {
  const ios = Constants.expoConfig?.ios?.buildNumber;
  const android = Constants.expoConfig?.android?.versionCode;
  const parts: string[] = [];
  if (ios) parts.push(`iOS ${ios}`);
  if (android !== undefined) parts.push(`Android ${android}`);
  return parts.length > 0 ? parts.join(" · ") : "development";
}
