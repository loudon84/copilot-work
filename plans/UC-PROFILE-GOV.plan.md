---
name: UC-PROFILE-GOV
overview: Work User Center + Local Profile Switch capability gate on Portal auth reuse
todos:
  - id: t1-work-user-center-surface
    content: "T1 — Work User Center surface [C01, C05, C06, C15]"
    status: completed
  - id: t2-logout
    content: "T2 — Logout wiring + App auth gate [C02, C07]"
    status: completed
  - id: t3-profileswitch-capability
    content: "T3 — profileSwitch capability surface [C03, C09, C10, C11, C12, C13, C14, C16]"
    status: completed
  - id: t4-profileswitcher
    content: "T4 — ProfileSwitcher gate [C04, C08]"
    status: completed
isProject: false
plan_contract: smc.plan.v3.7
plan_id: UC-PROFILE-GOV
domain_contract: smc.ges.domain-activation.v2
consumer_profile: generic@2.0.0
domain_policy_digest: sha256:a046f275b36672c3b375adecd5d99129a77c030795667324818b4121fd13795e
commit_policy: post_review
acceptance_contract: smc.acceptance.v1
source_revision: revision-2026-09-14-ac-parse
grounded_commit: 513f1457966cb344cb6105e5b97bdf7139f83408
grounding_source: committed_baseline
working_tree_fingerprint: clean
governance_profile: FULL
source_prd: prd/User-Center-Profile-Governance-PRD-GES-v5-简体中文.md
source_prd_sha256: sha256:e7dac270c2a6a0e69784435ea9a3631f09b79e5cfc6d7068c98f9e738c935cad
domain_intent_binding_version: 1
domain_intent_digest: sha256:7bedee3049664fb758ecc9dd802660390a992524c35d26d8550dda1e9661bb27
domain_activation_digest: sha256:6a64d331c3130493e3fcb540eca4923d9936bce9124c4156e42246d10f41a025
---

# UC-PROFILE-GOV Implementation Plan

## Approved PRD

[Approved PRD](../prd/User-Center-Profile-Governance-PRD-GES-v5-简体中文.md)

## Scope

- In: Work User Center UI on Portal `DesktopAuthState`; Logout via `desktopAuth.logout`; Local `profileSwitch=false` gate on ProfileSwitcher; Main capability supply patterned on FilesCapabilities
- Out: New `/api/user/me`; parallel AuthStore; delete Profile Runtime; Hermes accountLogout merge; Agents multi-profile CRUD; Enterprise Switch enablement
- Production Owner inherited from PRD: Layout User Center, App auth gate, desktopCapabilities + Main supply, ProfileSwitcher

## Grounding Evidence Ledger

| Change ID | Target | Baseline State | Symbol / Entry Resolution | Caller / Callee Evidence | Existing Reuse Search | Result |
|---|---|---|---|---|---|---|
| C01 | `src/renderer/src/screens/Layout/UserCenter.tsx#UserCenter` | Missing Work user center | New component mounted from Layout sidebar footer | `desktopAuth.getState` / `onStateChanged` | REUSE ProfileAvatar + `en/auth.ts` | MINIMAL_NEW |
| C02 | `src/renderer/src/App.tsx` | Logout IPC exists; App does not react | Subscribe `desktopAuth.onStateChanged`; unauthenticated → LoginScreen | Calls existing `auth:logout` via preload | KEEP `auth-ipc.ts#registerAuthIpc` | MODIFY_EXISTING |
| C03 | `src/renderer/src/screens/Layout/desktopCapabilities.ts#getDesktopCapabilities` | No profileSwitch flag | Renderer-safe reader; Main supply mirrors `toFilesCapabilities` | ProfileSwitcher + Layout consumers | REUSE FilesCapabilities pattern | MINIMAL_NEW |
| C04 | `src/renderer/src/screens/Layout/ProfileSwitcher.tsx` | Switch always visible | Hide switch/picker/Cmd+P when `profileSwitch=false` | Reads desktopCapabilities | KEEP profiles.ts runtime | MODIFY_EXISTING |

## Domain Intent Binding

| Domain | Change ID | Intent SHA256 | Source PRD SHA256 |
|---|---|---|---|
| backend | C02 | `sha256:3c02bb968777ec1b788ed97129a048395caf6416ff1678caa739f54dcba9adea` | `sha256:e7dac270c2a6a0e69784435ea9a3631f09b79e5cfc6d7068c98f9e738c935cad` |
| backend | C03 | `sha256:b2e73ad7c36ff634d7f2229c345baab678997d74fb1e8bb1c774cb0ad84ed131` | `sha256:e7dac270c2a6a0e69784435ea9a3631f09b79e5cfc6d7068c98f9e738c935cad` |
| frontend | C01 | `sha256:86b6f07502b7f290194a887a503db7d2a39fd32c7b28efef5726a54665938341` | `sha256:e7dac270c2a6a0e69784435ea9a3631f09b79e5cfc6d7068c98f9e738c935cad` |
| frontend | C02 | `sha256:a329ce66f1bd90a5ed95eb55c82a36adf3d84691c4354d5c96e2861c76a94667` | `sha256:e7dac270c2a6a0e69784435ea9a3631f09b79e5cfc6d7068c98f9e738c935cad` |
| frontend | C03 | `sha256:b7358aa3bfe8f2f554c7d619a82fc983a77f6d4bfe4089df400ec98fe7ac836a` | `sha256:e7dac270c2a6a0e69784435ea9a3631f09b79e5cfc6d7068c98f9e738c935cad` |
| frontend | C04 | `sha256:8b6433f2fe3d51d4cf53c0ad57b0fa896d153f3d5567fe7b4d070dd8cc0c2dea` | `sha256:e7dac270c2a6a0e69784435ea9a3631f09b79e5cfc6d7068c98f9e738c935cad` |


## Governance Profile

- Profile: `FULL`
- Route rationale: Identity/security boundary, logout lifecycle, auth+profile+shell cross-domain, UI-observable acceptance
- Escalation triggers checked: security_boundary, lifecycle_change, cross_domain_ownership, live_acceptance
- Risk Facts Snapshot: `{"bounded_writes":true,"cross_domain_ownership":true,"deterministic_verification":true,"existing_capability":true,"existing_owner":true,"external_dependency":false,"lifecycle_change":true,"live_acceptance":true,"new_owner":false,"protocol_change":false,"public_contract":false,"schema_migration":false,"security_boundary":true}`
- Source: approved PRD Routing Facts

## Requirement Coverage Ledger

| Requirement | Source | Obligation | Classification | Change IDs | Todo | Verification IDs | Evidence Class | Blocking |
|---|---|---|---|---|---|---|---|---|
| AC-01 | AC | Show real Portal user fields after login | BEHAVIOUR | C01 | T1 | V01 | UNIT | yes |
| AC-02 | AC | Persist login across restart via existing auth:get-state | BEHAVIOUR | C01,C02 | T1,T2 | V02 | UNIT | yes |
| AC-03 | AC | Logout clears session and returns LoginScreen | BEHAVIOUR | C02 | T2 | V03 | UNIT | yes |
| AC-04 | AC | No parallel auth owner; reuse desktopAuth only | CONSTRAINT | C01,C02 | T1,T2 | V04 | REVIEW | yes |
| AC-05 | AC | Local profileSwitch=false hides Switch UI | BEHAVIOUR | C03,C04 | T3,T4 | V05 | UNIT | yes |
| AC-06 | AC | Profile Runtime retained | CONSTRAINT | C04 | T4 | V06 | UNIT | yes |
| AC-07 | AC | profileSwitch=true restores Switch UI | BEHAVIOUR | C03,C04 | T3,T4 | V07 | UNIT | yes |
| AC-08 | AC | Chat/Runtime/Workspace/MCP smoke unaffected | REGRESSION | C01,C02,C03,C04 | T1,T2,T3,T4 | V08 | REGRESSION | yes |
| DOD-01 | DOD | PRD Review PASS + Converge APPROVED | GOVERNANCE | - | - | V09 | ARTIFACT | yes |
| DOD-02 | DOD | Domain preplan tables remain valid | GOVERNANCE | - | - | V09 | ARTIFACT | yes |
| DOD-03 | DOD | smc.plan.v3.7 static valid | GOVERNANCE | - | - | V09 | ARTIFACT | yes |
| DOD-04 | DOD | C01-C04 implemented with claim evidence | DELIVERY | C01,C02,C03,C04 | T1,T2,T3,T4 | V01,V03,V05 | EVIDENCE | yes |
| DOD-05 | DOD | No parallel auth/profile; runtime kept | CONSTRAINT | C01,C04 | T1,T4 | V04,V06 | REVIEW | yes |
| DOD-06 | DOD | Delivery Validation PASS | DELIVERY | C01,C02,C03,C04 | T1,T2,T3,T4 | V10 | EVIDENCE | yes |

## Lifecycle Closure Matrix

| Journey | Requirements | Trigger | Nonterminal State | Success Writer | Failure / Cancel Writer | Evidence IDs |
|---|---|---|---|---|---|---|
| Portal login → authenticated shell | AC-01,AC-02 | auth:login / bootstrap getState | splash/connecting | App.tsx screen writer | LoginScreen remains | V01,V02 |
| Authenticated → Logout → Login | AC-03 | UserCenter Sign out | pending-logout | App.tsx onStateChanged → login | inline/toast on invoke failure; session still cleared by Main | V03 |
| Local profileSwitch gate | AC-05,AC-07 | capabilities load | N/A | ProfileSwitcher conditional render | fail-closed hidden switch | V05,V07 |

## Contract / Data Flow Closure Matrix

| Flow | Requirements | Producer | Transport / Schema | Consumer | Required Fields | Validation Owner | Failure Mapping | Retry / Idempotency Identity | Evidence IDs |
|---|---|---|---|---|---|---|---|---|---|
| Portal public auth state | AC-01,AC-02,AC-03 | Main auth-ipc / token-store | IPC `auth:get-state` / `auth:state-changed` → DesktopAuthState | UserCenter + App | authenticated, user.{username,email,avatarUrl} | auth-contract | unauthenticated → LoginScreen | session user id | V01,V02,V03 |
| Logout | AC-03,AC-04 | UserCenter → desktopAuth.logout | IPC auth:logout | token-store clear + App gate | authenticated=false | auth-ipc KEEP | remote logout errors ignored | single logout invoke | V03 |
| profileSwitch capability | AC-05,AC-07 | Main capability supply | IPC/preload Renderer-safe DTO | desktopCapabilities + ProfileSwitcher | profileSwitch boolean | desktopCapabilities | missing → false | config read once per session | V05,V07 |

## Acceptance Claim Ledger

| Claim ID | Requirement | Observable Fact | Blocking | Prior Evidence | Prior Result | Evidence Action | Invalidation Reason | Verification IDs |
|---|---|---|---|---|---|---|---|---|
| CLM-01 | AC-01 | UserCenter fields match desktopAuth.getState().user | yes | none | UNSET | NEW_EVIDENCE | none | V01 |
| CLM-02 | AC-02 | After simulated persisted session, getState remains authenticated and UserCenter renders user | yes | none | UNSET | NEW_EVIDENCE | none | V02 |
| CLM-03 | AC-03 | logout yields authenticated=false, LoginScreen path, cleared session store | yes | auth-ipc.test.ts | UNSET | NEW_EVIDENCE | none | V03 |
| CLM-04 | AC-04 | Diff has no new AuthService/UserStoreV2 or /api/user/me client | yes | none | UNSET | NEW_EVIDENCE | none | V04 |
| CLM-05 | AC-05 | profileSwitch=false hides switch button, picker, Cmd/Ctrl+P | yes | ProfileSwitcher.test.tsx | UNSET | NEW_EVIDENCE | none | V05 |
| CLM-06 | AC-06 | profiles.ts setActiveProfile/listProfiles still exist; profiles tests pass | yes | tests/profiles.test.ts | UNSET | NEW_EVIDENCE | none | V06 |
| CLM-07 | AC-07 | profileSwitch=true shows Switch affordances | yes | none | UNSET | NEW_EVIDENCE | none | V07 |
| CLM-08 | AC-08 | Targeted smoke/unit suite for chat/runtime paths reports no new failures attributable to this Plan | yes | none | UNSET | NEW_EVIDENCE | none | V08 |
| CLM-09 | DOD-01 | PRD status APPROVED and review_verdict PASS | yes | .smc/runs/UC-PROFILE-GOV/review/prd-review-closure.md | PASS | NEW_EVIDENCE | none | V09 |
| CLM-10 | DOD-02 | frontend/backend preplan validators pass on Approved PRD | yes | prd_profile + preplan scan | PASS | NEW_EVIDENCE | none | V09 |
| CLM-11 | DOD-03 | validate_plan_current PASS for this Plan | yes | none | UNSET | NEW_EVIDENCE | none | V09 |
| CLM-12 | DOD-04 | Blocking claims V01/V03/V05 evidence fresh at Delivery | yes | none | UNSET | NEW_EVIDENCE | none | V01,V03,V05 |
| CLM-13 | DOD-05 | AC-04 and AC-06 claims pass | yes | none | UNSET | NEW_EVIDENCE | none | V04,V06 |
| CLM-14 | DOD-06 | smc-plan-delivery completion gates PASS | yes | none | UNSET | NEW_EVIDENCE | - | V10 |

Contract note: scenario and environment matrices below are retained for acceptance-contract shape; this Plan uses LOCAL acceptance modes only.

## Live Scenario Matrix

| Scenario ID | Claim IDs | Verification IDs | Subject / Fixture | Required Capabilities | Preconditions | Stimulus | Oracle | Environment ID |
|---|---|---|---|---|---|---|---|---|

## Live Environment Matrix

| Environment ID | Required Env Vars | Preflight Command | Fault Driver Env | Candidate Mode | Candidate Probe |
|---|---|---|---|---|---|

## Verification Ledger

| Verification ID | Claim IDs | Level | Acceptance Mode | Entry Point / Command | Oracle | Negative / Regression | Evidence Policy | Environment | Evidence Action | Blocking |
|---|---|---|---|---|---|---|---|---|---|---|
| V01 | CLM-01,CLM-12 | UNIT | LOCAL | cmd /c npx vitest run src/renderer/src/screens/Layout/UserCenter.test.tsx | User fields match mocked DesktopAuthState | empty user / loading | LOCAL_DURABLE | none | NEW_EVIDENCE | yes |
| V02 | CLM-02 | UNIT | LOCAL | cmd /c npx vitest run src/renderer/src/screens/Layout/UserCenter.test.tsx | Persisted session → authenticated public state still rendered | expired/cleared session → login | LOCAL_DURABLE | none | NEW_EVIDENCE | yes |
| V03 | CLM-03,CLM-12 | UNIT | LOCAL | cmd /c npx vitest run src/renderer/src/App.test.tsx | logout clears session; App routes to login | remote logout failure still clears local session | LOCAL_DURABLE | none | NEW_EVIDENCE | yes |
| V04 | CLM-04,CLM-13 | REVIEW | LOCAL | python -c "import pathlib,sys; needles=('AuthService','UserStoreV2','/api/user/me'); hits=[f'{p}:{i}' for p in pathlib.Path('src').rglob('*') if p.suffix in ('.ts','.tsx') and 'node_modules' not in p.parts for i,l in enumerate(p.read_text(encoding='utf-8', errors='ignore').splitlines(),1) if any(n in l for n in needles)]; print(chr(10).join(hits)); sys.exit(1 if hits else 0)" | no parallel auth owners added | forbidden new auth modules | LOCAL_TRANSIENT | none | NEW_EVIDENCE | yes |
| V05 | CLM-05,CLM-12 | UNIT | LOCAL | cmd /c npx vitest run src/renderer/src/screens/Layout/ProfileSwitcher.test.tsx | switch/picker/hotkey absent when profileSwitch=false | flag true restores switch | LOCAL_DURABLE | none | NEW_EVIDENCE | yes |
| V06 | CLM-06,CLM-13 | UNIT | LOCAL | cmd /c npx vitest run tests/profiles.test.ts | setActiveProfile/listProfiles still pass | none | LOCAL_DURABLE | none | NEW_EVIDENCE | yes |
| V07 | CLM-07 | UNIT | LOCAL | cmd /c npx vitest run src/renderer/src/screens/Layout/ProfileSwitcher.test.tsx | switch visible when profileSwitch=true | none | LOCAL_DURABLE | none | NEW_EVIDENCE | yes |
| V08 | CLM-08 | REGRESSION | LOCAL | cmd /c npx vitest run src/renderer/src/App.test.tsx src/renderer/src/screens/Layout/UserCenter.test.tsx src/renderer/src/screens/Layout/ProfileSwitcher.test.tsx tests/profiles.test.ts | no new failures in auth/profile suites used as smoke proxy | none | LOCAL_TRANSIENT | none | NEW_EVIDENCE | yes |
| V09 | CLM-09,CLM-10,CLM-11 | ARTIFACT | LOCAL | python .agents/skills/smc-plan-validator/scripts/validate_plan_current.py plans/UC-PROFILE-GOV.plan.md | validator PASS; PRD APPROVED artifacts present | none | LOCAL_TRANSIENT | none | NEW_EVIDENCE | yes |
| V10 | CLM-14 | DELIVERY | LOCAL | python .agents/skills/smc-plan-delivery/scripts/completion_audit.py check --plan plans/UC-PROFILE-GOV.plan.md | Delivery Validation PASS | none | LOCAL_DURABLE | none | NEW_EVIDENCE | yes |

## Immediate Read

- `src/shared/auth/auth-contract.ts#DesktopAuthState`
- `src/main/auth/auth-ipc.ts#registerAuthIpc`
- `src/renderer/src/screens/Layout/ProfileSwitcher.tsx`
- `src/renderer/src/App.tsx`
- `src/main/files/file-config.ts#toFilesCapabilities`

## Triggered Read

- If Main capability IPC missing: `src/main/files/file-service.ts#getCapabilities` and preload files API
- If Layout mount needs more context: `src/renderer/src/screens/Layout/Layout.tsx`
- Otherwise: do not read

## Change Matrix

| Change ID | File / Symbol | Kind | Action | Existing Owner | Todo Owner | Target State | PRD Capability | New File? |
|---|---|---|---|---|---|---|---|---|
| C01 | `src/renderer/src/screens/Layout/UserCenter.tsx#UserCenter` | PROD | ADD | none | T1 | UserCenter shows Portal user in Layout footer | Work User Center surface | yes |
| C05 | `src/renderer/src/screens/Layout/Layout.tsx` | PROD | MODIFY | Layout shell | T1 | Mount UserCenter in sidebar footer | Work User Center surface | no |
| C06 | `src/renderer/src/screens/Layout/UserCenter.test.tsx` | TEST | ADD | none | T1 | UserCenter field/logout tests | Work User Center surface | yes |
| C15 | `src/shared/i18n/locales/en/auth.ts` | PROD | MODIFY | en auth strings | T1 | signedIn/status strings | Work User Center surface | no |
| C02 | `src/renderer/src/App.tsx` | PROD | MODIFY | App bootstrap | T2 | onStateChanged unauthenticated → LoginScreen | Logout wiring | no |
| C07 | `src/renderer/src/App.test.tsx` | TEST | ADD | none | T2 | App logout gate tests | Logout wiring | yes |
| C03 | `src/renderer/src/screens/Layout/desktopCapabilities.ts#getDesktopCapabilities` | PROD | ADD | none | T3 | profileSwitch flag available to shell; Local default false | profileSwitch capability | yes |
| C16 | `src/shared/desktop-capabilities.ts` | PROD | ADD | none | T3 | Shared DesktopCapabilities type | profileSwitch capability | yes |
| C09 | `src/main/desktop-capabilities.ts#readDesktopCapabilities` | PROD | ADD | none | T3 | Main fail-closed flag reader | profileSwitch capability | yes |
| C10 | `src/main/desktop-capabilities-ipc.ts#registerDesktopCapabilitiesIpc` | PROD | ADD | none | T3 | IPC get capabilities | profileSwitch capability | yes |
| C14 | `src/main/app/start.ts` | PROD | MODIFY | startMainProcess | T3 | Register capabilities IPC | profileSwitch capability | no |
| C11 | `src/preload/desktop-capabilities-api.ts` | PROD | ADD | none | T3 | Preload bridge | profileSwitch capability | yes |
| C12 | `src/preload/index.ts` | PROD | MODIFY | preload expose | T3 | expose desktopCapabilities | profileSwitch capability | no |
| C13 | `src/preload/index.d.ts` | PROD | MODIFY | Window types | T3 | Window.desktopCapabilities typing | profileSwitch capability | no |
| C04 | `src/renderer/src/screens/Layout/ProfileSwitcher.tsx` | PROD | MODIFY | ProfileSwitcher | T4 | Switch hidden when !profileSwitch | ProfileSwitcher gate | no |
| C08 | `src/renderer/src/screens/Layout/ProfileSwitcher.test.tsx` | TEST | MODIFY | ProfileSwitcher tests | T4 | Gate tests for profileSwitch | ProfileSwitcher gate | no |

## Domain Activation Ledger

| Domain | Pack Version | Trigger Changes | Capabilities | Status |
|---|---:|---|---|---|
| backend | 2.2.0 | - | - | NOT_REQUIRED |
| frontend | 2.2.0 | C01,C05,C06,C02,C07,C03,C04,C08 | engineering,preplan,review,verification | REQUIRED |
| ops | 2.2.0 | - | - | NOT_REQUIRED |

## Frontend Quality Ledger

| Change ID | Surface | Framework | Composition | State Ownership | Design System | Accessibility | Interaction States | Performance | Visual Verification |
|---|---|---|---|---|---|---|---|---|---|
| C01 | Work User Center in authenticated Layout shell | REACT | sidebar-footer-user-affordance | LOCAL:desktopAuth-subscription-no-new-store | REUSE existing shell tokens + auth/agents i18n; no new primitive kit | keyboard-reachable Sign out | loading/authenticated/empty-user/error-logout | unchanged shell budget | INTERACTION |
| C02 | Logout control + App auth gate | REACT | existing App screen switch | LOCAL:desktopAuth-subscription-no-new-store | REUSE `en/auth.ts` logout string | focus returns to LoginScreen | pending-logout/success→LoginScreen/failure-toast-or-inline | unchanged | INTERACTION |
| C03 | Desktop capabilities read surface | REACT | helper module only | SHARED:desktop-capabilities-flag | REUSE FilesCapabilities pattern (no new primitive kit) | N/A helper | missing→fail-closed false | cheap read | COMPONENT |
| C04 | ProfileSwitcher switch gate | REACT | existing sidebar footer chip | SHARED:desktop-capabilities-flag | REUSE agents i18n | no dead hotkey when gated | flag-false: no switch UI; flag-true: current behaviour | unchanged | COMPONENT |
| C05 | Layout sidebar footer mount | REACT | sidebar-footer-user-affordance | LOCAL:desktopAuth-subscription-no-new-store | REUSE existing shell tokens + auth/agents i18n; no new primitive kit | unchanged footer | mount UserCenter adjacent to profile chip | unchanged | INTERACTION |
| C06 | UserCenter tests | REACT | test surface | LOCAL:desktopAuth-subscription-no-new-store | REUSE existing shell tokens + auth/agents i18n; no new primitive kit | N/A | loading/authenticated/empty-user/error-logout | N/A | INTERACTION |
| C07 | App logout gate tests | REACT | existing App screen switch | LOCAL:desktopAuth-subscription-no-new-store | REUSE `en/auth.ts` logout string | N/A | pending-logout/success→LoginScreen | N/A | INTERACTION |
| C08 | ProfileSwitcher gate tests | REACT | existing sidebar footer chip | SHARED:desktop-capabilities-flag | REUSE agents i18n | N/A | flag-false: no switch UI; flag-true: current behaviour | N/A | COMPONENT |

## Test Asset Ledger

| Verification ID | Asset ID | Kind | Path / Entrypoint | Required Capabilities | Action | Impact | Reason |
|---|---|---|---|---|---|---|---|

## Implementation Decisions

| Change ID | Strategy | Root-Cause / Reuse Evidence | Why This Is Minimum |
|---|---|---|---|
| C01 | MINIMAL_NEW UserCenter + Layout mount | No Portal user center today; DesktopAuthState already public | Do not create UserStore; bind existing desktopAuth |
| C02 | MODIFY_EXISTING App + UserCenter logout button | auth:logout exists without Renderer caller; App lacks auth subscription | Do not touch auth-ipc owner beyond KEEP |
| C03 | MINIMAL_NEW capability reader + Main supply | FilesCapabilities pattern already proven | Fail closed false; no Profile Runtime delete |
| C04 | MODIFY_EXISTING ProfileSwitcher gate | Switch always on | Gate UI only |

## Write Ownership Ledger

| Todo | Owns Changes | Writes | Reads | Depends On | Parallel Safe |
|---|---|---|---|---|---|
| T1 | C01,C05,C06,C15 | `src/renderer/src/screens/Layout/UserCenter.tsx#UserCenter`; `src/renderer/src/screens/Layout/Layout.tsx`; `src/renderer/src/screens/Layout/UserCenter.test.tsx`; `src/shared/i18n/locales/en/auth.ts` | auth-contract; ProfileAvatar | none | no |
| T2 | C02,C07 | `src/renderer/src/App.tsx`; `src/renderer/src/App.test.tsx` | desktopAuth logout/onStateChanged; auth-ipc KEEP | T1 | no |
| T3 | C03,C09,C10,C11,C12,C13,C14,C16 | `src/renderer/src/screens/Layout/desktopCapabilities.ts#getDesktopCapabilities`; `src/shared/desktop-capabilities.ts`; `src/main/desktop-capabilities.ts#readDesktopCapabilities`; `src/main/desktop-capabilities-ipc.ts#registerDesktopCapabilitiesIpc`; `src/main/app/start.ts`; `src/preload/desktop-capabilities-api.ts`; `src/preload/index.ts`; `src/preload/index.d.ts` | file-config.ts#toFilesCapabilities pattern | none | no |
| T4 | C04,C08 | `src/renderer/src/screens/Layout/ProfileSwitcher.tsx`; `src/renderer/src/screens/Layout/ProfileSwitcher.test.tsx` | desktopCapabilities | T3 | no |

## Integration Hotspots

- Layout sidebar footer: UserCenter adjacent to ProfileSwitcher chip; avoid duplicate avatars
- App auth subscription must not fight splash/bootstrap races
- profileSwitch default false on Local consumer builds

## Generated Outputs Ledger

None

## Todo T1 — Work User Center surface

**Owns Changes**
- C01
- C05
- C06
- C15

**Goal**
Authenticated Layout shows Portal username/email/avatar/login status from desktopAuth.

**Immediate anchors**
- `src/renderer/src/screens/Layout/Layout.tsx`
- `src/shared/auth/auth-contract.ts#DesktopAuthState`
- `src/preload/auth-api.ts#authApi`

**Writes**
- `src/renderer/src/screens/Layout/UserCenter.tsx#UserCenter`
- `src/renderer/src/screens/Layout/Layout.tsx`
- `src/renderer/src/screens/Layout/UserCenter.test.tsx`
- `src/shared/i18n/locales/en/auth.ts`

**Changes**
- ADD UserCenter affordance in sidebar footer adjacent to profile chip
- Subscribe getState/onStateChanged; include Sign out control calling desktopAuth.logout
- REUSE ProfileAvatar and en auth strings

**Depends On:** none
**Parallel Safe:** no
**Focused Check:** npx vitest run src/renderer/src/screens/Layout/UserCenter.test.tsx

**Stop conditions**
- [ ] CLM-01 observable via V01

**Triggered reads**
- None unless Layout mount conflict

## Todo T2 — Logout wiring + App auth gate

**Owns Changes**
- C02
- C07

**Goal**
Sign out clears Portal session and returns LoginScreen without Hermes accountLogout.

**Immediate anchors**
- `src/renderer/src/App.tsx`
- `src/main/auth/auth-ipc.ts#registerAuthIpc`

**Writes**
- `src/renderer/src/App.tsx`
- `src/renderer/src/App.test.tsx`

**Changes**
- App listens onStateChanged; authenticated=false → LoginScreen
- Coordinate with T1 Sign out control (no second logout owner)

**Depends On:** T1
**Parallel Safe:** no
**Focused Check:** npx vitest run src/renderer/src/App.test.tsx

**Stop conditions**
- [ ] CLM-03 via V03

**Triggered reads**
- If App test harness missing: existing renderer test patterns

## Todo T3 — profileSwitch capability surface

**Owns Changes**
- C03
- C09
- C10
- C11
- C12
- C13
- C14
- C16

**Goal**
Expose Renderer-safe profileSwitch flag; Local defaults false; Main supply follows FilesCapabilities pattern.

**Immediate anchors**
- `src/main/files/file-config.ts#toFilesCapabilities`
- `src/renderer/src/screens/Layout/desktopCapabilities.ts`

**Writes**
- `src/renderer/src/screens/Layout/desktopCapabilities.ts#getDesktopCapabilities`
- `src/shared/desktop-capabilities.ts`
- `src/main/desktop-capabilities.ts#readDesktopCapabilities`
- `src/main/desktop-capabilities-ipc.ts#registerDesktopCapabilitiesIpc`
- `src/main/app/start.ts`
- `src/preload/desktop-capabilities-api.ts`
- `src/preload/index.ts`
- `src/preload/index.d.ts`

**Changes**
- ADD shared type + Main reader + IPC + preload + renderer helper
- Fail closed false unless ENABLE_PROFILE_SWITCH/HERMES_ENABLE_PROFILE_SWITCH is true

**Depends On:** none
**Parallel Safe:** no
**Focused Check:** npx vitest run src/renderer/src/screens/Layout/ProfileSwitcher.test.tsx

**Stop conditions**
- [ ] Flag readable; default false on Local

**Triggered reads**
- If IPC pattern needs more context: files getCapabilities path

## Todo T4 — ProfileSwitcher gate

**Owns Changes**
- C04
- C08

**Goal**
Hide Switch profile button, picker, and Cmd/Ctrl+P when profileSwitch=false; keep runtime.

**Immediate anchors**
- `src/renderer/src/screens/Layout/ProfileSwitcher.tsx`
- `src/main/profiles.ts#setActiveProfile`

**Writes**
- `src/renderer/src/screens/Layout/ProfileSwitcher.tsx`
- `src/renderer/src/screens/Layout/ProfileSwitcher.test.tsx`

**Changes**
- EXTEND ProfileSwitcher gating; retain chip/edit non-switch affordances

**Depends On:** T3
**Parallel Safe:** no
**Focused Check:** npx vitest run src/renderer/src/screens/Layout/ProfileSwitcher.test.tsx tests/profiles.test.ts

**Stop conditions**
- [ ] CLM-05 and CLM-07 via V05/V07; CLM-06 via V06

**Triggered reads**
- None unless hotkey still leaks

## Verification

Run all blocking Verification Ledger entries through `smc-plan-delivery/scripts/evidence.py`.

## Completion Gate

| Exit State | Allowed When | Blocking Evidence |
|---|---|---|
| IMPLEMENTED_AND_PROVEN | all Cursor todos completed; completion audit FRESH PASS; implementation review FRESH PASS; all blocking Verification FRESH PASS; durable Evidence Manifest FRESH | V01-V10 via SMC evidence ledger + durable Evidence Manifest |
| IMPLEMENTED_NOT_PROVEN | implementation exists but proof is pending/stale | pending/stale gate IDs |
| BLOCKED | environment/dependency prevents proof | blocker record |
| RETURN_PRD | approved owner/boundary conflicts | PRD revision request |
