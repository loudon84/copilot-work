/**
 * Preload bridge for `window.desktopCapabilities`.
 */

import { ipcRenderer } from "electron";
import {
  DESKTOP_CAPABILITIES_IPC,
  type DesktopCapabilities,
} from "../shared/desktop-capabilities";

export interface DesktopCapabilitiesAPI {
  get(): Promise<DesktopCapabilities>;
}

export const desktopCapabilitiesApi: DesktopCapabilitiesAPI = {
  get: () => ipcRenderer.invoke(DESKTOP_CAPABILITIES_IPC.get),
};
