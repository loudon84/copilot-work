import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DesktopAuthState } from "../../../../shared/auth/auth-contract";

vi.mock("../../components/useI18n", () => ({
  useI18n: () => ({
    t: (key: string): string => key,
  }),
}));

vi.mock("../../components/common/ProfileAvatar", () => ({
  default: ({
    name,
    avatar,
  }: {
    name: string;
    avatar?: string | null;
  }): React.JSX.Element => (
    <span data-testid="user-avatar">{avatar || name}</span>
  ),
}));

import UserCenter from "./UserCenter";

function authState(patch: Partial<DesktopAuthState> = {}): DesktopAuthState {
  return {
    authenticated: true,
    endpointConfig: null,
    user: {
      id: "u1",
      username: "alice",
      email: "alice@example.com",
      avatarUrl: "https://example.com/a.png",
    },
    expiresAt: null,
    ...patch,
  };
}

function installDesktopAuth(opts: {
  getState?: () => Promise<DesktopAuthState>;
  logout?: () => Promise<DesktopAuthState>;
  onStateChanged?: (
    listener: (state: DesktopAuthState) => void,
  ) => () => void;
}): void {
  window.desktopAuth = {
    getState: opts.getState ?? vi.fn(async () => authState()),
    logout:
      opts.logout ??
      vi.fn(async () => authState({ authenticated: false, user: null })),
    onStateChanged: opts.onStateChanged ?? vi.fn(() => () => undefined),
    saveEndpointConfig: vi.fn(),
    login: vi.fn(),
    refresh: vi.fn(),
  } as unknown as typeof window.desktopAuth;
}

describe("UserCenter", () => {
  beforeEach(() => {
    installDesktopAuth({});
  });

  it("renders Portal username, email, avatar and signed-in status", async () => {
    render(<UserCenter />);

    expect(await screen.findByText("alice")).toBeInTheDocument();
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
    expect(screen.getByTestId("user-avatar")).toHaveTextContent(
      "https://example.com/a.png",
    );
    expect(screen.getByText("Signed in")).toBeInTheDocument();
  });

  it("shows checking copy while auth state is loading", () => {
    installDesktopAuth({
      getState: vi.fn(() => new Promise(() => {})),
    });

    render(<UserCenter />);

    expect(screen.getByText("Checking session…")).toBeInTheDocument();
  });

  it("shows empty-user copy when there is no Portal user payload", async () => {
    installDesktopAuth({
      getState: vi.fn(async () => authState({ user: null })),
    });

    render(<UserCenter />);

    expect(await screen.findByText("Not signed in")).toBeInTheDocument();
  });

  it("calls desktopAuth.logout from Sign out", async () => {
    const logout = vi.fn(async () =>
      authState({ authenticated: false, user: null }),
    );
    installDesktopAuth({ logout });

    render(<UserCenter />);
    await screen.findByText("alice");
    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));

    await waitFor(() => expect(logout).toHaveBeenCalledTimes(1));
  });

  it("shows logout error when invoke fails", async () => {
    installDesktopAuth({
      logout: vi.fn(async () => {
        throw new Error("network");
      }),
    });

    render(<UserCenter />);
    await screen.findByText("alice");
    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));

    expect(await screen.findByText("Could not sign out")).toBeInTheDocument();
  });
});
