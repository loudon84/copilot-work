/**
 * IPC surface for DesktopCapabilities (thin; logic in readDesktopCapabilities).
 */

import { ipcMain } from "electron";
import { DESKTOP_CAPABILITIES_IPC } from "../shared/desktop-capabilities";
import { readDesktopCapabilities } from "./desktop-capabilities";

export function registerDesktopCapabilitiesIpc(): void {
  ipcMain.handle(DESKTOP_CAPABILITIES_IPC.get, () => readDesktopCapabilities());
}
