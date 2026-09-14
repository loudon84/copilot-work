import { act, render, screen, waitFor } from "@testing-library/react";
import type React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DesktopAuthState } from "../../shared/auth/auth-contract";

vi.mock("./screens/Layout/Layout", () => ({
  default: (): React.JSX.Element => <div>Main shell</div>,
}));

vi.mock("./modules/auth/LoginScreen", () => ({
  LoginScreen: (): React.JSX.Element => <div>Login screen</div>,
}));

vi.mock("./screens/SplashScreen/SplashScreen", () => ({
  default: ({ status }: { status?: string }): React.JSX.Element => (
    <div>Splash {status ?? ""}</div>
  ),
}));

vi.mock("./screens/ConnectionError/ConnectionErrorScreen", () => ({
  default: (): React.JSX.Element => <div>Connection error</div>,
}));

vi.mock("./runtime/RuntimeProvider", () => ({
  RuntimeProvider: ({
    children,
  }: {
    children: React.ReactNode;
  }): React.JSX.Element => <>{children}</>,
}));

vi.mock("./runtime/use-runtime", () => ({
  useRuntime: () => ({
    connect: vi.fn(async () => true),
    status: {},
    error: null,
    connecting: false,
    validateHome: vi.fn(),
    adoptHome: vi.fn(),
  }),
}));

vi.mock("./components/settings/SettingsModalProvider", () => ({
  SettingsModalProvider: ({
    children,
  }: {
    children: React.ReactNode;
  }): React.JSX.Element => <>{children}</>,
}));

vi.mock("./components/settings/SettingsModalContext", () => ({
  useSettingsModal: () => ({ openSettings: vi.fn() }),
}));

vi.mock("./components/ThemeProvider", () => ({
  ThemeProvider: ({
    children,
  }: {
    children: React.ReactNode;
  }): React.JSX.Element => <>{children}</>,
}));

vi.mock("./components/FontProvider", () => ({
  FontProvider: ({
    children,
  }: {
    children: React.ReactNode;
  }): React.JSX.Element => <>{children}</>,
}));

vi.mock("./components/profile/ProfileModalProvider", () => ({
  ProfileModalProvider: ({
    children,
  }: {
    children: React.ReactNode;
  }): React.JSX.Element => <>{children}</>,
}));

vi.mock("./update/AppUpdateProvider", () => ({
  AppUpdateProvider: ({
    children,
  }: {
    children: React.ReactNode;
  }): React.JSX.Element => <>{children}</>,
}));

vi.mock("./update/UpdateAvailableDialog", () => ({
  UpdateAvailableDialog: (): null => null,
}));
vi.mock("./update/UpdateDownloadStatus", () => ({
  UpdateDownloadStatus: (): null => null,
}));
vi.mock("./update/UpdateReadyDialog", () => ({
  UpdateReadyDialog: (): null => null,
}));
vi.mock("./utils/analytics", () => ({
  captureScreenView: vi.fn(),
}));
vi.mock("react-hot-toast", () => ({
  Toaster: (): null => null,
}));
vi.mock("./components/ErrorBoundary", () => ({
  default: ({
    children,
  }: {
    children: React.ReactNode;
  }): React.JSX.Element => <>{children}</>,
}));

import App from "./App";

function authState(patch: Partial<DesktopAuthState> = {}): DesktopAuthState {
  return {
    authenticated: true,
    endpointConfig: null,
    user: { id: "u1", username: "alice" },
    expiresAt: null,
    ...patch,
  };
}

describe("App auth gate", () => {
  let authListeners: Array<(state: DesktopAuthState) => void>;

  beforeEach(() => {
    authListeners = [];
    window.desktopAuth = {
      getState: vi.fn(async () => authState()),
      logout: vi.fn(async () => authState({ authenticated: false, user: null })),
      onStateChanged: vi.fn((listener) => {
        authListeners.push(listener);
        return () => {
          authListeners = authListeners.filter((l) => l !== listener);
        };
      }),
      saveEndpointConfig: vi.fn(),
      login: vi.fn(),
      refresh: vi.fn(),
    } as unknown as typeof window.desktopAuth;

    window.hermesAPI = {
      getConnectionConfig: vi.fn(async () => ({ mode: "local" })),
      getConfigHealth: vi.fn(async () => null),
      gatewayStatus: vi.fn(async () => null),
      runtimeGetStatus: vi.fn(async () => ({})),
    } as unknown as typeof window.hermesAPI;

    window.electron = {
      process: { platform: "win32", versions: { chrome: "", electron: "", node: "" } },
    } as unknown as typeof window.electron;
  });

  it("returns to Login screen when desktopAuth becomes unauthenticated", async () => {
    render(<App />);

    await waitFor(
      () => {
        expect(screen.getByText("Main shell")).toBeInTheDocument();
      },
      { timeout: 5000 },
    );

    act(() => {
      for (const listener of authListeners) {
        listener(authState({ authenticated: false, user: null }));
      }
    });

    expect(await screen.findByText("Login screen")).toBeInTheDocument();
  });
});
