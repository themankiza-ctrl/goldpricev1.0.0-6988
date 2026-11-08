## Two Usage Modes Protocol

On every anti-slop activation, resolve the operational mode in this strict priority:
1. **Explicit Session Instruction**: User specifies `during` or `after` in the prompt. Announce once: `antislop active: <mode> (session override).`
2. **Global Preference**: Read `%APPDATA%\antislop\settings.json` (Windows) or `~/.config/antislop/settings.json` (macOS/Linux).
3. **Default Fallback**: Mode 1 (DURING) for new features/code generation; Mode 2 (AFTER) when auditing existing projects.

### Mode 1: DURING (Active Real-Time Prevention)
- Follow all 38 rules actively while generating code, copy, and UI.
- Prevents slop from being written in the first place.
- Conclude the task with the **Mandatory Delivery Gate** report.

### Mode 2: AFTER (Post-Build Audit & Remediation)
- Audit an existing or completed codebase/project without altering files prematurely.
- Generate a timestamped audit report in `anti-slop/audit-001-YYYY-MM-DD.md` (incrementing sequence).
- Each finding is strictly numbered, citing:
  - Violated Rule ID (`R-XX`)
  - Finding description & exact file/line
  - Priority: Hard Gate = `HIGH`, Purpose-Gate = `MEDIUM`, Quality Lock = `LOW`
- **Hard Gate**: Wait for human approval of specific finding numbers. **Never touch unapproved items.**
- Remediate approved items and deliver a follow-up verification report.

---
