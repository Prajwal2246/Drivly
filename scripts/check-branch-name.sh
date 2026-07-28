#!/bin/bash
# Get the active branch name
branch_name=$(git rev-parse --abbrev-ref HEAD)

# Allowed prefix naming patterns
allowed_pattern="^(feat|fix|test|docs|chore|refactor)/"

if [[ "$branch_name" =~ $allowed_pattern || "$branch_name" == "main" || "$branch_name" == "master" || "$branch_name" == "develop" ]]; then
  exit 0
else
  echo "❌ Git Push Denied: Invalid branch name '$branch_name'."
  echo "All branch names must match one of these SDE patterns:"
  echo "  - main | master | develop"
  echo "  - feat/your-feature-details"
  echo "  - fix/your-bugfix-details"
  echo "  - test/your-test-details"
  echo "  - docs/your-doc-details"
  echo "  - chore/your-chore-details"
  echo "  - refactor/your-refactor-details"
  echo "Please rename your branch using: git branch -m <new-name>"
  exit 1
fi
