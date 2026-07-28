# Contributing to Drivly

Thank you for contributing! To maintain code quality and structural SDE-level consistency, please follow this contribution guide.

---

## 🌿 Branch Naming Conventions

All local branches must use one of these prefixes to bypass git hook push locks:
* `feat/` — Adding a new feature.
* `fix/` — Fixing a bug.
* `test/` — Adding unit, integration, or E2E tests.
* `docs/` — Updating documentation files.
* `chore/` — Setting up tooling, config, or package bundles.
* `refactor/` — Reorganizing existing code structures.

To rename a branch that fails pre-push naming verification checks:
```bash
git branch -m <correct-branch-name>
```

---

## 🛠️ Hook Installation & Testing

Before staging code changes, configure the local hooks and run the QA verification script.

### 1. Install Git Hooks
Copies and activates pre-push checks enforcing SDE branch naming patterns:
```bash
node scripts/install-hooks.js
```

### 2. Execute Test Checks
Verifies JWT unit logic and booking validator boundaries:
```bash
npx tsx tests/check.ts
```

### 3. Compile checks
```bash
npx tsc --noEmit
npm run build
```
---

## 📝 Pull Request Checklist

When submitting a Pull Request, please complete the standard checklist configured in [.github/pull_request_template.md](file:///Users/prajwaljanbandhu/Desktop/IDEAS/.github/pull_request_template.md).
