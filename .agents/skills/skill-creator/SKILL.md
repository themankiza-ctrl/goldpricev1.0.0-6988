---
name: skill-creator
description: "Create new agent skills, improve existing ones, and package them as a folder with SKILL.md. Use this whenever someone asks to create a skill, turn a workflow or reference into a skill, edit a SKILL.md, split a long skill, or check that a skill's name and description follow the Agent Skills spec — even if they only say 'make this a skill' or paste a dump of instructions."
---

# Skill Creator

Turn a workflow, reference, or request into a skill folder another agent can load. A skill is a directory with a `SKILL.md` (YAML frontmatter plus markdown instructions) and, only when needed, `scripts/`, `references/`, and `assets/`.

## When this applies

Use it when the user wants a new skill, wants an existing instruction set converted into skills, or wants a skill's triggering description improved. If they already handed you the full source text, extract the workflow from that text and write the files. Do not wait for a second interview when the source already answers what the skill does, when it fires, and what the output looks like.

Skip test-harness runs (with-skill vs without-skill, variance benchmarks, description-optimizer scripts) unless the user asks to measure the skill. Those need a runner this environment does not ship.

## Write the skill

1. Pick `name`: 1–64 chars, lowercase letters, digits, hyphens; no leading, trailing, or doubled hyphen. The folder name must match `name`.
2. Write `description` (1–1024 chars) so it says both what the skill does and when to use it, including phrases a person would actually type. Put every trigger in the description, not only in the body. Lean slightly pushy — agents under-trigger skills.
3. Optional frontmatter only when it earns its place: `license`, `compatibility` (environment needs, max 500 chars), `metadata` (string-to-string).
4. Body: imperative steps, the output shape, and one or two concrete examples. Explain why a rule exists instead of stacking bare MUSTs. Keep `SKILL.md` under 500 lines. Move long domain notes, checklists, and code catalogs into `references/` and link them with a one-line "read this when…" cue. Point at `scripts/` for anything deterministic and repetitive.

```
skill-name/
├── SKILL.md
├── references/    # loaded only when the task needs them
├── scripts/       # executed, not necessarily read
└── assets/        # templates, icons, fonts used in the output
```

Progressive disclosure is the reason for the split: the name and description stay in context always, the body loads when the skill triggers, and bundled files load one at a time.

## Do not ship

- Malware, exploit-building instructions, or a skill whose contents would surprise someone who only read the description.
- Placeholders (`TODO`, `...rest of skill`) in place of the actual steps.
- A second copy of a huge source pasted into `SKILL.md` when a reference file would do.

## Done when

- Every skill folder contains `SKILL.md`, the `name` matches the directory, and `description` is within 1–1024 characters.
- No `SKILL.md` is over 500 lines; longer material lives in `references/` and is linked from the body.
- A short catalog lists every skill name so a person can find one without opening all of them.
