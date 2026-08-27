---
name: plan-file-authoring
description: Create or update project planning documents in docs/plan using the repository's date-prefixed naming convention, phase-based structure, and monitoring checklist pattern. Use when the user asks to make, write, record, document, or update a plan before implementation.
---

# Plan File Authoring

Use this skill when creating or updating plan documents in `docs/plan`.

## File Naming

- Store plans in `docs/plan/`.
- Use lowercase kebab-case names.
- Prefix the filename with `ddmmyy-`.
- Format:

```text
docs/plan/ddmmyy-short-descriptive-title.md
```

- Example:

```text
docs/plan/210826-admin-academic-period-context.md
```

- Keep the descriptive title specific to the implementation scope, not the internal mechanism only.
  - Good: `210826-admin-academic-period-context.md`
  - Avoid: `210826-updating-periode-session.md`

## Date Prefix

- Use the current local date from the project environment.
- Format date as:

```text
day month year -> ddmmyy
```

- Example: `21 August 2026` becomes `210826`.

## Document Structure

Use this order:

```markdown
# Plan Short Title

## Context

Short explanation of the domain, current state, and expected outcome.

## Checklist Monitoring

### Phase 0: Audit Teknis

- [ ] ...

### Phase 1: ...

- [ ] ...

## Plan Final

### 1. ...

- ...

## Phase Audit dan Pengerjaan

### Phase 0: Audit Teknis

1. ...

Target phase ini: ...

## Urutan Kerja Rekomendasi

...
```

## Writing Rules

- Write in Indonesian unless the surrounding document or user explicitly asks otherwise.
- Keep headings concrete and short.
- Use `Phase 0` for audit before implementation.
- Use unchecked task list items (`- [ ]`) in `Checklist Monitoring`.
- Checklist items must be actionable and easy to mark complete.
- Keep `Plan Final` as the agreed product/technical scope.
- Keep `Phase Audit dan Pengerjaan` as execution sequencing with phase targets.
- Include testing and verification tasks in the last phase.
- Mention exact local paths, class names, tables, fields, routes, or resources when known.
- Do not create extra docs outside `docs/plan` unless the user asks.

## Recommended Phase Pattern

- `Phase 0: Audit Teknis`
  - Review current models, migrations, resources, routes, services, policies, tests, and relevant docs.
  - Produce decisions and file lists before implementation.
- `Phase 1: Fondasi`
  - Add shared services, helpers, middleware, or primitives.
- `Phase 2: Primary Workflow`
  - Implement the main user-facing behavior.
- `Phase 3: Data/Resource Integration`
  - Apply the behavior across resources, queries, forms, tables, and relation managers.
- `Phase 4: Hardening`
  - Add validation, authorization, edge cases, duplicate prevention, and UX safeguards.
- `Phase 5: Supporting Features`
  - Add secondary actions, duplication workflows, exports, imports, or admin tools.
- `Phase 6: Testing & Verifikasi`
  - Add or update focused tests.
  - Run formatter and targeted test commands.

Adapt phase names and count to the task, but keep audit first and verification last.

## Checklist Pattern

For each phase, mirror the execution plan as checklist items. Prefer verbs:

- [ ] Audit ...
- [ ] Putuskan ...
- [ ] Buat ...
- [ ] Tambahkan ...
- [ ] Validasi ...
- [ ] Scope ...
- [ ] Test ...
- [ ] Jalankan ...

Checklist items should be granular enough that progress can be monitored without reading the full phase details.
