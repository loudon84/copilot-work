"""Minimal smc.plan.v3.2 structural validator for GES consumer bridge.

Expected by validate_plan_v33.load_legacy(). Baseline package file was absent in
this consumer install; this stub provides the dataclass error interface and
rejects remaining Plan Author placeholders after v3.2 compat transform.
"""
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

REQUIRED_HEADINGS = (
    "Change Matrix",
    "Verification Ledger",
    "Write Ownership Ledger",
    "Requirement Coverage Ledger",
)

PLACEHOLDERS = (
    "<GROUND>",
    "<DECIDE>",
    "<VERIFY>",
    "<CLASSIFY>",
    "<TARGET>",
    "<VERIFY_LEVEL>",
    "<ACCEPTANCE_MODE>",
    "<DECIDE_EVIDENCE_ACTION>",
    "<GROUND_PRIOR_EVIDENCE>",
    "<ENVIRONMENT>",
    "<ASSET_ID_OR_NONE>",
    "<CAPABILITIES>",
    "<PRD CAPABILITY>",
)


@dataclass(frozen=True)
class PlanIssue:
    code: str
    detail: str


def validate_plan(plan: Path) -> list[PlanIssue]:
    text = plan.read_text(encoding="utf-8")
    errors: list[PlanIssue] = []
    for heading in REQUIRED_HEADINGS:
        if f"## {heading}" not in text:
            errors.append(PlanIssue("PLAN_SECTION_MISSING", heading))
    for token in PLACEHOLDERS:
        if token in text:
            errors.append(PlanIssue("PLAN_PLACEHOLDER_REMAINING", token))
    return errors
