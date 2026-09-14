import { useCallback, useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import type { DesktopAuthState } from "../../../../shared/auth/auth-contract";
import authEn from "../../../../shared/i18n/locales/en/auth";
import ProfileAvatar from "../../components/common/ProfileAvatar";
import { useI18n } from "../../components/useI18n";

export interface UserCenterProps {
  /** Match ProfileSwitcher compact footprint when the sidebar is collapsed. */
  compact?: boolean;
}

type AuthCatalogKey = keyof typeof authEn;

/**
 * Work User Center — Portal identity + Sign out in the Layout sidebar footer.
 * Subscribes to desktopAuth only; does not create a parallel auth store.
 */
export default function UserCenter({
  compact = false,
}: UserCenterProps): React.JSX.Element {
  const { t } = useI18n();
  const [state, setState] = useState<DesktopAuthState | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const label = useCallback(
    (key: AuthCatalogKey): string => {
      const path = `auth.${key}`;
      const translated = t(path);
      return translated === path ? authEn[key] : translated;
    },
    [t],
  );

  useEffect(() => {
    let cancelled = false;
    void window.desktopAuth.getState().then((next) => {
      if (!cancelled) setState(next);
    });
    const unsubscribe = window.desktopAuth.onStateChanged((next) => {
      if (!cancelled) setState(next);
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  async function handleLogout(): Promise<void> {
    setLoggingOut(true);
    setLogoutError(null);
    try {
      await window.desktopAuth.logout();
    } catch {
      setLogoutError(label("logoutFailed"));
    } finally {
      setLoggingOut(false);
    }
  }

  const user = state?.user ?? null;
  const displayName =
    user?.displayName?.trim() || user?.username?.trim() || "";
  const avatarName = displayName || user?.id || "user";

  return (
    <div
      className={`profile-switcher ${compact ? "compact" : ""}`}
      data-testid="user-center"
    >
      <div
        className="profile-switcher-trigger"
        role="group"
        aria-label={label("signedIn")}
      >
        {state === null ? (
          <span className="profile-switcher-name">
            {label("checkingSession")}
          </span>
        ) : user ? (
          <>
            <ProfileAvatar
              name={avatarName}
              avatar={user.avatarUrl}
              size={compact ? 22 : 18}
              defaultLogo={false}
            />
            {!compact && (
              <span className="profile-switcher-name">
                <span>{user.username}</span>
                {user.email ? (
                  <>
                    <br />
                    <span>{user.email}</span>
                  </>
                ) : null}
                <br />
                <span>{label("signedIn")}</span>
              </span>
            )}
          </>
        ) : (
          <span className="profile-switcher-name">{label("notSignedIn")}</span>
        )}
      </div>
      <button
        type="button"
        className="profile-switch-btn"
        onClick={() => void handleLogout()}
        disabled={loggingOut || state === null}
        title={label("logout")}
        aria-label={label("logout")}
      >
        <LogOut size={16} />
      </button>
      {logoutError ? (
        <span role="alert" className="profile-switcher-name">
          {logoutError}
        </span>
      ) : null}
    </div>
  );
}
