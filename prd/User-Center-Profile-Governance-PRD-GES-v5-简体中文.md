---
language: 简体中文
title: SMC Copilot Desktop 工作台用户中心与 Profile 治理方案 PRD
version: GES v5.0
schema: smc.ges.stage-prd.v5
work_item_id: UC-PROFILE-GOV
status: APPROVED
governance_profile: FULL
previous_governance_profile: NONE
grounded_commit: 513f1457966cb344cb6105e5b97bdf7139f83408
source_revision: revision-2026-09-14-ac-parse
review_verdict: PASS
approved_at: 2026-09-14T15:18:34+08:00
---

# SMC Copilot Desktop 工作台用户中心与 Profile 治理方案 PRD

Stage PRD（GES FULL discover）。将草案需求锚定到现有 Portal Auth 与 Profile Runtime，禁止新建平行认证/Profile 体系。

## Objective

登录成功后，在工作台展示真实 Portal 用户信息（用户名、邮箱、头像、登录状态），并支持 Logout；Local Desktop 通过 capability 隐藏 Profile Switch，同时保留 Profile Runtime。

## Out of Scope

本 Stage 不包含：新建 `AuthService`/`UserStoreV2`/`SessionManager`；新增 `GET /api/user/me` 平行身份接口；删除 Profile Runtime / `profiles.ts` IPC；合并 Hermes device-login（Providers 账户卡）与 Portal Auth；Agents 管理页的多 Profile CRUD 改造；Enterprise/Multi-tenant/Server Mode 开启 Profile Switch；Portal Home cookie 同步；Remote/SSH connection OAuth。

## Background

项目 `smc-copilot-desktop` 已完成 Work Portal 登录与 API Token 保存。待解决：用户中心未消费 `DesktopAuthState`、缺少可触达 Logout；Local Desktop 暴露 `Switch profile`，与单用户工作空间定位不符。

草案曾要求 `GET /api/user/me`。源码盘点证明身份接口已存在为 `buildAuthUrl(..., "me")`（默认 `{backendUrl}/api/v1/auth/me`），由 `HttpAuthClient.fetchMe` 在 login/refresh 路径调用。本 Stage **KEEP** 该路径，不 ADD 平行 `/api/user/me`。

## Routing Facts

```json
{
  "existing_owner": true,
  "existing_capability": true,
  "bounded_writes": true,
  "deterministic_verification": true,
  "new_owner": false,
  "public_contract": false,
  "security_boundary": true,
  "schema_migration": false,
  "protocol_change": false,
  "external_dependency": false,
  "lifecycle_change": true,
  "cross_domain_ownership": true,
  "live_acceptance": true,
  "research_intent": false,
  "governed": true,
  "retained_production_change": true,
  "production_write_requested": true,
  "durable_product_artifact_requested": true
}
```

## Governance Rationale

Hard FULL triggers: `security_boundary` (token/session clear and identity display), `lifecycle_change` (return to Login gate after logout), `cross_domain_ownership` (auth + profile capability + shell UI), `live_acceptance` (observable login/logout UI acceptance).

## Current Capability Inventory

| Capability | Status | Production Owner | Current Behaviour | Decision |
|---|---|---|---|---|
| Portal auth contract / public state | EXISTS | `src/shared/auth/auth-contract.ts#DesktopAuthState` | `authenticated` + `DesktopAuthUser`（id/username/email/avatarUrl）无 token 下发 Renderer | KEEP |
| Auth URL `me` / login / logout / refresh | EXISTS | `src/shared/auth/auth-url.ts#buildAuthUrl` | 默认 prefix `/api/v1/auth`；`me` ≠ `/api/user/me` | KEEP |
| HTTP auth client + fetchMe | EXISTS | `src/main/auth/auth-client.ts#fetchMe` | login/refresh 拉用户信息写入 session | KEEP |
| User mapping / member gate | EXISTS | `src/main/auth/nodeskclaw-auth-response.ts#mapNodeDeskClawUser` | `avatar_url`→`avatarUrl`；inactive/无 org 拒绝 | KEEP |
| Encrypted token/session store | EXISTS | `src/main/auth/token-store.ts#clearStoredSession` | keytar 或 `session.enc`；logout 清理 | KEEP |
| Auth IPC login/logout/getState | EXISTS | `src/main/auth/auth-ipc.ts#registerAuthIpc` | `auth:logout` 清 session + expert/skill-run dispose + files cleanup | KEEP |
| Preload Desktop Auth API | EXISTS | `src/preload/auth-api.ts#authApi` | `window.desktopAuth` | KEEP |
| Login gate / LoginScreen | EXISTS | `src/renderer/src/App.tsx` + `modules/auth/LoginScreen.tsx` | 未认证进 Login；成功后续 bootstrap | KEEP |
| Work User Center UI | MISSING | — | 无 Portal 用户中心；`desktopAuth.logout` 无 Renderer 调用方 | ADD |
| Hermes device account card | EXISTS | `Providers.tsx` / `account-store.ts` | 另一套设备登录账户 UI，非 Portal 用户 | KEEP（不复用为 Work 用户中心） |
| Profile filesystem runtime | EXISTS | `src/main/profiles.ts#setActiveProfile` | list/create/delete/active_profile | KEEP |
| Profile IPC / preload | EXISTS | `src/main/ipc/register.ts` + `src/preload/index.ts` | 始终可切换 | KEEP |
| ProfileSwitcher UI | EXISTS | `src/renderer/src/screens/Layout/ProfileSwitcher.tsx` | Switch profile + Cmd/Ctrl+P；无 capability 门控 | MODIFY |
| Profile switch capability flag | MISSING | — | 草案 `ENABLE_PROFILE_SWITCH` 未落地；可参考 `toFilesCapabilities` 模式 | ADD |
| Connection / workspace mode | EXISTS | `src/main/config.ts` + `App.tsx` `connectionMode` | `local` \| `remote` \| `ssh` | KEEP（Local 默认关 switch） |

## Target Capability Inventory

| Capability | Target Owner | Target Behaviour | Classification |
|---|---|---|---|
| Portal identity read | 现有 auth client + `DesktopAuthState` | 用户中心展示 session 内真实用户字段；启动后 `auth:get-state`/`onStateChanged` 保持登录 | KEEP |
| Work User Center | 新 Renderer surface，挂于已认证 shell（Layout） | 展示 username/email/avatar/login status；操作 Logout | ADD |
| Logout | 现有 `auth-ipc` + App login gate | 调用 `desktopAuth.logout()`；清 Token/Session；UI 回到 LoginScreen | MODIFY（接线，不改 owner） |
| Profile Runtime | `profiles.ts` + IPC | 能力保持，可被未来 Enterprise 重新启用 UI | KEEP |
| Profile switch capability | 新 Main→Renderer capabilities（类比 FilesCapabilities） | Local consumer 默认 `profileSwitch=false`；非删除 runtime | ADD |
| ProfileSwitcher gate | `ProfileSwitcher.tsx`（+ Layout 条件渲染） | capability false 时隐藏 Switch 按钮、picker、Cmd/Ctrl+P | MODIFY |

## Production Owner

| Change ID | Capability | Unique Production Owner | Notes |
|---|---|---|---|
| C01 | Work User Center UI | `src/renderer/src/screens/Layout/` 下新增用户中心 affordance（具体组件名由 Plan 落地；本 PRD 冻结挂载区域与状态源） | 唯一消费 Portal `DesktopAuthState` 的用户中心 |
| C02 | Logout wiring | `src/renderer/src/App.tsx` + User Center 调用 `window.desktopAuth.logout`；`auth-ipc` KEEP | 禁止走 `hermesAPI.accountLogout` |
| C03 | Profile switch capability | `src/renderer/src/screens/Layout/desktopCapabilities.ts`（消费面）+ Main 供给（模式参考 `toFilesCapabilities`） | Local 默认 `false` |
| C04 | Hide Switch Profile | `src/renderer/src/screens/Layout/ProfileSwitcher.tsx` | 仅门控 UI；不删 IPC |

禁止新增平行 owner：`AuthManager`、`UserStoreV2`、`SessionManagerNew`、第二套 Profile Runtime。

## Change Classification

| Change ID | Action | Item | Source Anchor | Required change |
|---|---|---|---|---|
| — | KEEP | Portal auth stack（contract/client/token-store/auth-ipc/preload） | | 不重建认证体系；不新增 `/api/user/me` |
| — | KEEP | `profiles.ts` + profile IPC + chat run profile transition | | 不删除 Profile Runtime |
| — | KEEP | Hermes Providers 账户卡 / remote OAuth | | 与 Portal 用户中心隔离 |
| C01 | ADD | Work User Center surface | `src/renderer/src/screens/Layout/Layout.tsx` | 读取 `desktopAuth.getState` / `onStateChanged`；展示 username、email、avatarUrl、authenticated |
| C02 | MODIFY | Logout 可达性 | `src/renderer/src/App.tsx` | User Center 触发 `desktopAuth.logout()`；App 订阅 auth state 并在未认证时呈现 LoginScreen（`auth-ipc` logout owner 保持 KEEP） |
| C03 | ADD | `profileSwitch`（或等价）capability | `src/renderer/src/screens/Layout/desktopCapabilities.ts` | Renderer-safe capability 读取面；Main 按 `toFilesCapabilities` 模式供给；Local 默认 false |
| C04 | MODIFY | ProfileSwitcher | `src/renderer/src/screens/Layout/ProfileSwitcher.tsx` | flag=false 时隐藏 Switch profile、picker overlay、Cmd/Ctrl+P；可保留当前 profile 只读 chip/编辑入口（非 switch） |

## Boundary / Contract Closure

| Boundary | Decision |
|---|---|
| Identity API | KEEP `GET {backendUrl}{authPrefix}/me` via `buildAuthUrl(..., "me")`。草案 `/api/user/me` **REJECTED**（重复 owner）。 |
| Token exposure | Renderer 仅见 `DesktopAuthState`；token 仅 Main `token-store` |
| Logout cleanup | 复用 `auth:logout`：remote logout best-effort → files cleanup → dispose expert/skill-run → `clearStoredSession` |
| Hermes vs Portal | Work 用户中心只绑定 Portal；Hermes `accountLogout` 不在本 Stage 替换/合并 |
| Profile Runtime vs UI | Runtime/IPC KEEP；仅 UI capability 门控 |
| Desktop internal capability surface | No breaking auth HTTP API change; capability is Renderer-safe Desktop extension only |

## Lifecycle Semantics

1. **Login**：现有 `auth:login` 写 session → public state authenticated → bootstrap 进工作台。
2. **Authenticated session**：User Center 订阅 `onStateChanged` / 初值 `getState`；重启后 `auth:get-state` + `ensureFreshAccessToken` 保持有效登录（AC-02）。
3. **Logout**：User Center → `desktopAuth.logout()` → Main 清理 → `authenticated=false` → App 显示 LoginScreen（文案对齐现有 Sign-in 体验）。
4. **Profile switch capability**：进程/配置加载时确定；Local 默认关闭 switch UI；runtime `setActiveProfile` 仍存在但不被最终用户 UI 触发（本 Stage）。

## Compatibility Decisions

| Topic | Decision |
|---|---|
| `/api/user/me` 草案路径 | 文档修正为现有 `/api/v1/auth/me`（可配置 authPrefix）；不实现别名除非后端另立 Stage |
| Agents 页多 Profile 管理 | 本 Stage Out of Scope；仅门控 ProfileSwitcher switch 能力 |
| Profile 只读 chip / ProfileModal 编辑 | 允许保留（非 Switch）；若与“单用户”冲突由后续 Stage 处理 |
| `ENABLE_PROFILE_SWITCH` 命名 | 逻辑等价 capability；落地名由 Plan 在 desktop capabilities 中确定，语义不变 |

## Clarification Ledger

| ID | Category | Impact | Question | Answer | Affects | Status |
|---|---|---|---|---|---|---|
| Q01 | Integration | HIGH | 是否必须新增 `GET /api/user/me`？ | 否。KEEP 现有 `buildAuthUrl(..., "me")`（默认 `/api/v1/auth/me`）。 | Boundary, C01 | CLOSED |
| Q02 | Scope | HIGH | Agents 管理页是否一并隐藏多 Profile？ | 否。本 Stage 仅门控 ProfileSwitcher 的 Switch/picker/快捷键。 | Out of Scope, C04 | CLOSED |
| Q03 | Security | HIGH | Work Logout 是否可复用 Hermes `accountLogout`？ | 否。必须 `desktopAuth.logout` / `auth:logout`。 | C02 | CLOSED |
| Q04 | UX | MEDIUM | User Center 挂载位置？ | 已认证 Layout shell 可见 affordance（与 sidebar footer/profile 区域相邻）；不新增平行应用壳。 | C01, Frontend Design Intent | CLOSED |

## Frontend Design Intent

| Change ID | Surface | Framework | Layout | Component Map | State Ownership | Interaction States | Design System | Responsive | Visual Verification |
|---|---|---|---|---|---|---|---|---|---|
| C01 | Work User Center in authenticated Layout shell | REACT | MODIFY:sidebar-footer-user-affordance-adjacent-to-profile | NEW UserCenter affordance + REUSE ProfileAvatar/i18n auth strings | LOCAL:desktopAuth-subscription-no-new-store | loading/authenticated/empty-user/error-logout | REUSE existing shell tokens + auth/agents i18n; no new primitive kit | UNCHANGED | INTERACTION |
| C02 | Logout control + App auth gate | REACT | UNCHANGED | EXTEND UserCenter Sign out + EXTEND App.tsx onStateChanged→LoginScreen | LOCAL:desktopAuth-subscription-no-new-store | pending-logout/success→LoginScreen/failure-toast-or-inline | REUSE `en/auth.ts` logout string | UNCHANGED | INTERACTION |
| C03 | Desktop capabilities read surface | REACT | UNCHANGED | NEW desktopCapabilities helper/module (profileSwitch flag) | SHARED:desktop-capabilities-flag | missing→fail-closed false | REUSE FilesCapabilities pattern (no new primitive kit) | UNCHANGED | COMPONENT |
| C04 | ProfileSwitcher switch gate | REACT | UNCHANGED | EXTEND ProfileSwitcher hide switch/picker/Cmd-P when !profileSwitch; REUSE chip | SHARED:desktop-capabilities-flag | flag-false: no switch UI; flag-true: current behaviour | REUSE agents i18n | UNCHANGED | COMPONENT |

## Backend Design Intent

| Change ID | Owner | Contract | Data/Transaction | Auth | Idempotency/Concurrency | Failure Semantics | Observability |
|---|---|---|---|---|---|---|---|
| C02 | `src/main/auth/auth-ipc.ts#registerAuthIpc` | UNCHANGED | WRITE | UNCHANGED | UNCHANGED | remote logout errors ignored; local clear always proceeds | existing auth IPC behaviour; no new metrics required this Stage |
| C03 | Main desktop capabilities（模式 `file-config.ts#toFilesCapabilities`） | COMPATIBLE_EXTEND | READ_ONLY | NONE | NOT_APPLICABLE | missing flag defaults to false on Local consumer | config/capability read failures fail closed to hidden switch |

Backend notes: Electron `src/main/**` does not auto-activate the backend domain pack in this consumer profile; rows above document Main-process intent for Plan grounding. C02 WRITE clears the existing token-store session only. C03 READ_ONLY exposes config/env as a Renderer-safe flag. Identity `me` and login/refresh have no backend Change in this Stage (KEEP). C01 is Renderer-only.

## Acceptance Criteria

### 用户中心

- **AC-01**: 登录成功后，用户中心显示与 `DesktopAuthState.user` 一致的真实 username、email、avatar（有则显示）、以及已登录状态。
- **AC-02**: 应用重启后，在 token/session 仍有效时保持已登录，用户中心仍展示同一 Portal 用户（经由现有 `auth:get-state` / refresh 路径）。
- **AC-03**: 退出后 Token/Session 已清理（`clearStoredSession`）；公开 auth state 为未登录；界面回到 LoginScreen / Sign-in 体验；不得残留可操作的已认证用户中心。
- **AC-04**: 禁止新增重复认证体系（无新 AuthService/UserStoreV2/平行 `/api/user/me` owner）；用户中心只消费现有 `desktopAuth`。

### Profile 治理

- **AC-05**: Local 模式（capability `profileSwitch=false`）下，最终用户不可见/不可用 Profile Switch（含 Switch 按钮、picker、Cmd/Ctrl+P）。
- **AC-06**: Profile Runtime（`profiles.ts` / IPC / active_profile）代码与能力保持，不因本 Stage 删除。
- **AC-07**: capability 可在未来 Enterprise/非 Local 配置下重新启用 Switch UI，无需恢复被删 runtime。

### 回归

- **AC-08**: Chat、Agent Runtime、Workspace、MCP 主路径不受本 Stage 回归破坏（冒烟或现有相关测试）。

## Acceptance Claim Baseline

| Claim ID | Binds AC | Observable claim | Blocking |
|---|---|---|---|
| CL-01 | AC-01 | 已登录 UI 展示的用户字段与 `desktopAuth.getState().user` 一致 | YES |
| CL-02 | AC-02 | 重启后仍 authenticated 且用户字段可展示 | YES |
| CL-03 | AC-03 | logout 后 `authenticated=false` 且 LoginScreen 可见；session store 空 | YES |
| CL-04 | AC-04 | 变更 diff 无新平行 auth store/service；无新 `/api/user/me` 客户端 | YES |
| CL-05 | AC-05 | Local + flag false 时 ProfileSwitcher 无 switch 入口且快捷键不打开 picker | YES |
| CL-06 | AC-06 | `profiles.ts` setActiveProfile/listProfiles 仍存在且单测通过 | YES |
| CL-07 | AC-07 | flag true 时 Switch UI 可恢复（单元/组件级即可） | YES |
| CL-08 | AC-08 | Chat/Runtime/Workspace/MCP 冒烟或既有测试无新增失败 | YES |

## Evidence Baseline

| Evidence class | Baseline / reuse |
|---|---|
| Auth unit | 现有 `src/main/auth/auth-ipc.test.ts`、`token-store` 测试 — REUSE；Logout 接线后 EXTEND Renderer/组件测试 |
| Profile unit | `tests/profiles.test.ts`、`ProfileSwitcher.test.tsx` — EXTEND 覆盖 capability=false |
| UI / interaction | User Center 登录态展示 + Logout → Login；Profile switch 隐藏 — NEW/EXTEND 组件测试；LIVE_VISUAL 非本 Stage 强制 |
| Regression | Chat/Runtime 既有测试套件 — REUSE 冒烟 |
| Architecture | 本 PRD Source Anchors + Change IDs — 实施后更新 `lat.md` 若行为文档化需要 |

## Verification Strategy

- Backend/Main：logout 清理与 capability 默认值的单元测试。
- Frontend：User Center 展示/Logout；ProfileSwitcher 门控。
- 回归：Chat、Agent Runtime、Workspace、MCP 冒烟。
- 不做第二份 `.specify/spec.md`；Stage PRD 为唯一需求 SOT。

## Source Anchors

- `src/shared/auth/auth-contract.ts#DesktopAuthState`
- `src/shared/auth/auth-contract.ts#DesktopAuthUser`
- `src/shared/auth/auth-contract.ts#toPublicState`
- `src/shared/auth/auth-url.ts#buildAuthUrl`
- `src/main/auth/auth-client.ts#fetchMe`
- `src/main/auth/auth-ipc.ts#registerAuthIpc`
- `src/main/auth/token-store.ts#clearStoredSession`
- `src/preload/auth-api.ts#authApi`
- `src/renderer/src/App.tsx`
- `src/renderer/src/modules/auth/LoginScreen.tsx`
- `src/main/profiles.ts#setActiveProfile`
- `src/renderer/src/screens/Layout/ProfileSwitcher.tsx`
- `src/renderer/src/screens/Layout/Layout.tsx`
- `src/main/files/file-config.ts#toFilesCapabilities`
- `src/shared/i18n/locales/en/auth.ts`
- `src/shared/i18n/locales/en/agents.ts`

## Risk / Escalation

| Risk | Level | Mitigation |
|---|---|---|
| 误用 Hermes 账户登出当作 Portal Logout | HIGH | AC-04/C02 明确 owner；Review Gate G5 |
| 删除 Profile Runtime | HIGH | AC-06；Out of Scope；C04 仅 UI |
| 平行 `/api/user/me` | HIGH | Boundary REJECTED；KEEP fetchMe |
| capability 默认值错误暴露 Switch | MEDIUM | fail closed `false` on Local |

## Definition of Done

1. 本 Stage PRD Review PASS + Converge APPROVED。
2. Domain preplan 表（本文件 Frontend/Backend Design Intent）保持有效。
3. `smc.plan.v3.7` 由 APPROVED PRD 生成并 Static Valid。
4. C01/A2/B1/B2 实现且 Acceptance Claims 有 Evidence。
5. 无平行认证/Profile 体系；Profile Runtime 保留。
6. Delivery Validation PASS（`smc-plan-delivery`）。

## GES Execution Notes

执行链（canonical）：`smc-work-router`（FULL）→ 本 grounding → `smc-prd-review` → `smc-prd-converge` → `smc-plan-from-approved-prd-ponytail` → `smc-plan-delivery`。

禁止：创建重复认证架构；创建重复 Profile 管理；删除已有 Runtime；绕过 GES Validation；另写 `.specify/spec.md` 作为需求 SOT。
