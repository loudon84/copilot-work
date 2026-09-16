下面提供一版面向 Cursor Agent 执行的工程级 PRD。

设计目标不是普通需求文档，而是作为 **GES v5 验证案例的输入 Spec**：

流程目标：

```
PRD
 |
Spec Kit
 |
Superpowers Planning
 |
Cursor Agent Implementation
 |
GES Validation
 |
Delivery Evidence
```

Feature 名称：

```
Work User Center & Local Profile Governance
```

覆盖两个需求：

1. Work 登录后用户中心真实展示用户状态，并支持退出；
2. 本地 Desktop 禁止 Agent 多 Profile 切换入口。

文档：

```markdown
# PRD: Work User Center & Local Profile Governance

Version: v1.0.0

Project:
smc-copilot-desktop

Purpose:
GES v5 Engineering Value Validation Feature

Status:
READY FOR IMPLEMENTATION
```

---

# 1. Background

当前 smc-copilot-desktop 已完成：

* Work Backend 登录流程接入
* API Token 保存
* Desktop Client 基础认证能力

但是存在两个用户体验和治理问题：

## Problem 1

用户登录后：

Account 区域仍显示：

```
Sign in to SMC Copilot
```

实际：

* Token 已保存
* Backend 已认证成功
* Frontend 未加载用户身份状态

导致：

用户无法看到：

* 当前登录用户
* 用户信息
* 登录状态
* Logout 操作

---

## Problem 2

Desktop 产品定位：

```
Single User Workspace
```

但是当前 UI 暴露：

```
Switch profile
```

允许：

* default
* alice
* 其它 profiles

切换。

这不符合 Desktop 产品安全模型。

要求：

隐藏用户 Profile Switch UI。

注意：

不是删除 Profile Runtime。

只禁止本地用户操作入口。

---

# 2. Feature Scope

## Included

### Feature A

Work User Center

实现：

* 登录状态展示
* 用户信息展示
* Logout

---

### Feature B

Local Profile Switch Governance

实现：

* 隐藏 Profile Switch UI
* 保留内部 Profile Runtime
* 增加 UI Capability Control

---

## Not Included

本 Feature 不包含：

* 注册流程
* 密码管理
* 多租户权限系统
* Server 端用户管理
* OAuth 重构

---

# 3. Existing Capability Analysis Requirement

实现前必须进行代码分析。

禁止直接新增：

```
UserService
AuthService
ProfileManager
```

必须先确认已有能力：

检查：

```
auth

session

account

profile

workspace

settings

```

如果已有：

必须：

```
Reuse Existing Capability
```

禁止：

```
Create duplicate implementation
```

---

# 4. Feature A - Work User Center

## 4.1 User Story

作为：

已登录 Work 用户

我希望：

在 Desktop Account 区域看到我的账号状态

并且：

可以主动退出登录。

---

# 4.2 UI Requirement

当前：

```
SMC COPILOT ACCOUNT

Sign in to your SMC Copilot account

[Sign in]
```

修改后：

```
SMC COPILOT ACCOUNT


Avatar

User Name

Email


Status:

Connected


[Sign Out]

```

---

# 4.3 Backend Requirement

已有：

```
Login API

Token Storage
```

基础。

需要确认是否存在：

```
GET /me

GET /user/profile

GET /account
```

优先复用。

如果不存在：

新增最小 API：

```
GET /api/user/me
```

Response:

```json
{
  "id":"user-id",
  "name":"username",
  "email":"user@email.com",
  "avatar":"",
  "status":"active"
}
```

---

# 4.4 Frontend Requirement

实现：

Account 状态管理。

要求：

优先使用已有：

```
auth store
session store
user store
```

禁止：

新增：

```
NewAuthManager
NewUserStore
```

---

## State

需要支持：

```typescript
interface UserSession {

 authenticated:boolean;

 user?: {

   id:string;

   name:string;

   email:string;

 };

}
```

---

# 4.5 Logout Requirement

点击：

```
Sign Out
```

必须执行：

## Client

清理：

```
API Token

Session Cache

User Cache

Workspace User State
```

---

## Backend

调用：

```
POST /logout
```

如果 Backend 当前没有：

Client logout 必须保证本地安全清理。

---

# 4.6 Acceptance Criteria

## AC-001

未登录：

显示：

```
Sign in
```

---

## AC-002

登录成功：

显示：

```
username

email

Connected

```

---

## AC-003

Logout 后：

必须：

* UI 回到未登录状态
* Token 清除
* Session 清除

---

# 5. Feature B - Local Profile Switch Governance

# 5.1 Background

当前：

Desktop UI 暴露：

```
Switch profile
```

但是：

Desktop 产品：

```
one user
one workspace
```

不允许：

用户切换 Agent Profile。

---

# 5.2 Requirement

隐藏：

```
Profile Switch Entry
```

包括：

* Sidebar profile menu
* Ctrl+P profile selector
* Settings profile switch

---

# 5.3 Important Constraint

禁止：

删除：

```
Profile Runtime
```

原因：

未来可能支持：

* Server Mode
* Enterprise Multi Agent
* Admin Management

正确方式：

增加 capability flag。

---

# 5.4 Configuration

新增：

例如：

```typescript
ENABLE_PROFILE_SWITCH=false
```

或者：

```yaml
features:

 profile_switch:

   enabled:false
```

---

# 5.5 UI Behavior

当：

```
profile_switch=false
```

隐藏：

```
Switch profile
Manage profiles
Create profile
```

---

保留：

```
Current Runtime Profile
```

内部使用。

---

# 5.6 Acceptance Criteria

## AC-101

普通用户：

无法看到：

```
Switch profile
```

---

## AC-102

Ctrl+P：

不存在：

Profile Switch Command

---

## AC-103

Runtime:

profile 功能没有破坏。

---

# 6. Engineering Constraints

## Constraint 1

禁止重复代码。

修改前：

必须输出：

```
Existing Capability Report
```

包含：

```
Existing Auth Module:

Existing User State:

Existing Profile Module:
```

---

## Constraint 2

Frontend / Backend 分离。

Plan 必须包含：

```
Frontend Changes

Backend Changes

Shared Contract Changes
```

---

## Constraint 3

保持向后兼容。

不能影响：

* 已登录用户
* 未登录用户
* 本地开发模式

---

# 7. Testing Requirement

## Unit Test

必须覆盖：

```
login state

logout

profile switch flag
```

---

## Integration Test

验证：

流程：

```
Login

↓

Load User Center

↓

Display User

↓

Logout

↓

Token Removed
```

---

## UI Test

验证：

```
Profile Switch hidden
```

---

# 8. Delivery Evidence Requirement (GES)

提交必须包含：

## Code Evidence

修改文件列表：

```
frontend:

backend:

shared:
```

---

## Test Evidence

包含：

```
test result

build result
```

---

## Risk Evidence

说明：

```
Why reuse existing auth

Why not create new profile manager
```

---

# 9. Expected File Impact

执行前生成：

```
impact-analysis.md
```

内容：

```
Modified Files:

New Files:

Deleted Files:

Reuse Components:
```

---

# 10. Definition of Done

Feature 完成必须满足：

## User Center

[ ] 登录状态正确显示

[ ] 用户信息展示

[ ] Logout 可用

[ ] Token 清理

---

## Profile Governance

[ ] Profile Switch UI隐藏

[ ] Runtime 保留

[ ] Feature Flag 控制

---

## Engineering Quality

[ ] 无重复 Auth 模块

[ ] 无重复 User Store

[ ] Frontend/Backend 清晰

[ ] Tests PASS

---

# 11. GES v5 Validation Goals

本 Feature 用于验证：

## Goal 1

重复代码降低：

指标：

```
New duplicated capability count = 0
```

---

## Goal 2

Token 降低：

比较：

```
Native Agent

vs

Spec Kit + Superpowers + GES
```

---

## Goal 3

首次实现成功率：

第一次提交：

```
Build PASS

Test PASS

Review PASS
```

---

## Goal 4

长期维护稳定：

后续新增：

```
Avatar

Organization

Permission
```

Agent 应继续：

```
Extend Existing Auth Capability
```

而不是：

```
Create Auth System V2
```

---

# End

```

---

建议执行方式：

在 `smc-copilot-desktop`：

1. 保存：

```

docs/specs/work-user-center-governance-prd-v1.0.md

```

2. 交给 Cursor：

先要求：

```

Use GES v5 workflow.

Do not implement immediately.

First:

1. Analyze existing auth/session/profile capability.
2. Generate implementation plan.
3. Wait for approval.

```

这样才能真正验证：

```

Spec Kit → Superpowers → GES

```

是否比直接 Cursor Coding 有工程收益。
```
