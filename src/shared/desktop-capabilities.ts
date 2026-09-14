/**
 * Renderer-safe Desktop capability flags (no secrets / no Main config dump).
 */
export interface DesktopCapabilities {
  /** When false, ProfileSwitcher hides switch/picker/Cmd+P. Fail-closed default. */
  profileSwitch: boolean;
}

export const DEFAULT_DESKTOP_CAPABILITIES: DesktopCapabilities = {
  profileSwitch: false,
};

export const DESKTOP_CAPABILITIES_IPC = {
  get: "desktop-capabilities:get",
} as const;
