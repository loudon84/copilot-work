# Consumer Gap Analysis

- Project: `E:\git\smc-copilot-desktop`
- Analyzed at: `2026-09-14T04:18:55Z`
- Overall: `GAPS`

## Layers

### ges

- Verdict: `PARTIAL`
- Missing:
  - `ges.profile`
  - `ges.domain_registry`

### spec_kit

- Verdict: `MISSING`
- Missing:
  - `spec_kit.specify.constitution.md`
  - `spec_kit.specify.templates`
  - `spec_kit.specify.scripts`
  - `spec_kit.specify.specs.README.md`
- Note: provider_status=UNAVAILABLE
- Note: integration_status=NATIVE_ONLY

### superpowers

- Verdict: `PARTIAL`
- Missing:
  - `superpowers.pinned.test-driven-development`
  - `superpowers.pinned.systematic-debugging`
  - `superpowers.shim.brainstorming`
  - `superpowers.shim.writing-plans`
  - `superpowers.shim.finishing-branch`

## Claims

- `ges`: `UNAVAILABLE`
- `spec_kit_provider`: `NATIVE_ONLY`
- `spec_kit_scaffold`: `UNAVAILABLE`
- `superpowers_pinned`: `GES_NATIVE`
- `superpowers_shims`: `GES_NATIVE`

## Codes

- `GES_CAPABILITY_GAP`
- `LAYER_PARTIAL:ges`
- `SPEC_KIT_PROVIDER_UNAVAILABLE`
- `LAYER_MISSING:spec_kit`
- `SUPERPOWERS_CAPABILITY_GAP`
- `LAYER_PARTIAL:superpowers`
- `CONSUMER_GAP_PRESENT`
