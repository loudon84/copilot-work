import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../components/useI18n", () => ({
  useI18n: () => ({
    t: (key: string): string =>
      key === "common.appName" ? "SMC Copilot" : key,
  }),
}));

vi.mock("../../components/profile/ProfileModalContext", () => ({
  useProfileModal: () => ({
    openProfile: vi.fn(),
  }),
}));

vi.mock("../../components/common/ProfileAvatar", () => ({
  default: ({ name }: { name: string }): React.JSX.Element => (
    <span data-testid={`avatar-${name}`} />
  ),
}));

const getDesktopCapabilities = vi.fn();

vi.mock("./desktopCapabilities", () => ({
  getDesktopCapabilities: (...args: unknown[]) =>
    getDesktopCapabilities(...args),
}));

import ProfileSwitcher from "./ProfileSwitcher";

interface ProfileInfo {
  id: string;
  name: string;
  isDefault: boolean;
  isActive: boolean;
  model: string;
  skillCount: number;
  gatewayRunning: boolean;
}

function installHermesAPI(profiles: ProfileInfo[]): void {
  Object.defineProperty(window, "hermesAPI", {
    configurable: true,
    value: {
      listProfiles: vi.fn().mockResolvedValue(profiles),
      setActiveProfile: vi.fn().mockResolvedValue(undefined),
    },
  });
}

function profile(id: string, name = id): ProfileInfo {
  return {
    id,
    name,
    isDefault: id === "default",
    isActive: id === "default",
    model: "",
    skillCount: 0,
    gatewayRunning: false,
  };
}

describe("ProfileSwitcher", () => {
  beforeEach(() => {
    getDesktopCapabilities.mockReset();
    getDesktopCapabilities.mockResolvedValue({ profileSwitch: false });
  });

  it("shows the app name for an unrenamed default profile", async () => {
    installHermesAPI([profile("default")]);

    render(
      <ProfileSwitcher
        activeProfile="default"
        onSwitch={() => {}}
        onManage={() => {}}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("SMC Copilot")).toBeInTheDocument();
    });
  });

  it("shows a custom default profile name when one is set", async () => {
    installHermesAPI([profile("default", "卢姐")]);

    render(
      <ProfileSwitcher
        activeProfile="default"
        onSwitch={() => {}}
        onManage={() => {}}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("卢姐")).toBeInTheDocument();
    });
  });

  it("hides switch button, picker and Cmd/Ctrl+P when profileSwitch=false", async () => {
    installHermesAPI([profile("default"), profile("other", "Other")]);
    getDesktopCapabilities.mockResolvedValue({ profileSwitch: false });

    render(
      <ProfileSwitcher
        activeProfile="default"
        onSwitch={() => {}}
        onManage={() => {}}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("SMC Copilot")).toBeInTheDocument();
    });

    expect(
      screen.queryByRole("button", { name: "agents.switchProfile" }),
    ).toBeNull();

    fireEvent.keyDown(document, { key: "p", ctrlKey: true });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("shows switch affordances when profileSwitch=true", async () => {
    installHermesAPI([profile("default"), profile("other", "Other")]);
    getDesktopCapabilities.mockResolvedValue({ profileSwitch: true });

    render(
      <ProfileSwitcher
        activeProfile="default"
        onSwitch={() => {}}
        onManage={() => {}}
      />,
    );

    expect(
      await screen.findByRole("button", { name: "agents.switchProfile" }),
    ).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "p", ctrlKey: true });
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });
});
