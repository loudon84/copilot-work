/**
 * Renderer-safe DesktopCapabilities reader.
 * Fail closed to profileSwitch=false when preload/IPC is missing.
 */

import {
  DEFAULT_DESKTOP_CAPABILITIES,
  type DesktopCapabilities,
} from "../../../shared/desktop-capabilities";

export async function getDesktopCapabilities(): Promise<DesktopCapabilities> {
  try {
    const api = window.desktopCapabilities;
    if (!api?.get) {
      return { ...DEFAULT_DESKTOP_CAPABILITIES };
    }
    const caps = await api.get();
    return {
      profileSwitch: caps?.profileSwitch === true,
    };
  } catch {
    return { ...DEFAULT_DESKTOP_CAPABILITIES };
  }
}
