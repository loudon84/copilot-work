/**
 * Main-process reader for Desktop capability flags.
 * Local consumer defaults profileSwitch=false (fail closed).
 */

import {
  DEFAULT_DESKTOP_CAPABILITIES,
  type DesktopCapabilities,
} from "../shared/desktop-capabilities";

function parseEnvFlag(raw: string | undefined): boolean | null {
  if (raw == null || raw.trim() === "") return null;
  const lower = raw.trim().toLowerCase();
  if (lower === "true" || lower === "1" || lower === "yes" || lower === "on") {
    return true;
  }
  if (lower === "false" || lower === "0" || lower === "no" || lower === "off") {
    return false;
  }
  return null;
}

/**
 * Read DesktopCapabilities from env. Missing / invalid → fail-closed false.
 * Enable with ENABLE_PROFILE_SWITCH or HERMES_ENABLE_PROFILE_SWITCH=true.
 */
export function readDesktopCapabilities(): DesktopCapabilities {
  const enabled =
    parseEnvFlag(process.env.HERMES_ENABLE_PROFILE_SWITCH) ??
    parseEnvFlag(process.env.ENABLE_PROFILE_SWITCH) ??
    false;
  return {
    ...DEFAULT_DESKTOP_CAPABILITIES,
    profileSwitch: enabled === true ? true : false,
  };
}
