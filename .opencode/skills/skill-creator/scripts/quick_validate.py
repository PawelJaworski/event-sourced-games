#!/usr/bin/env python3
"""
Quick validation for opencode skills.

Checks a skill's SKILL.md frontmatter against opencode's rules so you catch the
"skill silently won't load" class of mistakes before restarting opencode.

Usage:
    python3 quick_validate.py <skill_directory>

Differences from the Anthropic Claude Code validator:
  - `allowed-tools` is NOT a valid opencode skill field. If present, it's
    flagged (tool gating in opencode is done via `permission`, not the skill).
  - The folder name must match the `name` frontmatter field.

Requires: pyyaml  (pip install pyyaml)
"""

import sys
import re
from pathlib import Path

try:
    import yaml
except ImportError:
    print("error: pyyaml is required. Install it with: pip install pyyaml")
    sys.exit(2)

# opencode-supported skill frontmatter fields.
ALLOWED_PROPERTIES = {"name", "description", "license", "compatibility", "metadata"}

# Fields that are valid in other skill systems but NOT in opencode skills.
FOREIGN_PROPERTIES = {"allowed-tools"}


def validate_skill(skill_path):
    """Validate a skill directory. Returns (ok: bool, message: str)."""
    skill_path = Path(skill_path)

    if not skill_path.exists():
        return False, f"Path does not exist: {skill_path}"
    if not skill_path.is_dir():
        return False, f"Not a directory: {skill_path} (point at the skill folder, not SKILL.md)"

    skill_md = skill_path / "SKILL.md"
    if not skill_md.exists():
        return False, "SKILL.md not found in the skill directory"

    content = skill_md.read_text()
    if not content.startswith("---"):
        return False, "No YAML frontmatter found (file must start with '---')"

    match = re.match(r"^---\n(.*?)\n---", content, re.DOTALL)
    if not match:
        return False, "Invalid frontmatter format (expected a leading '---' ... '---' block)"

    try:
        frontmatter = yaml.safe_load(match.group(1))
        if not isinstance(frontmatter, dict):
            return False, "Frontmatter must be a YAML dictionary"
    except yaml.YAMLError as e:
        return False, f"Invalid YAML in frontmatter: {e}"

    keys = set(frontmatter.keys())

    # Foreign fields (helpful, specific message).
    foreign = keys & FOREIGN_PROPERTIES
    if foreign:
        return False, (
            f"Found field(s) not supported by opencode skills: {', '.join(sorted(foreign))}. "
            "opencode does not use 'allowed-tools' — gate tools via `permission` in "
            "opencode.json or agent frontmatter instead. Remove it from SKILL.md."
        )

    # Any other unexpected fields.
    unexpected = keys - ALLOWED_PROPERTIES
    if unexpected:
        return False, (
            f"Unexpected key(s) in SKILL.md frontmatter: {', '.join(sorted(unexpected))}. "
            f"Allowed: {', '.join(sorted(ALLOWED_PROPERTIES))}."
        )

    # Required: name
    if "name" not in frontmatter:
        return False, "Missing 'name' in frontmatter"
    name = frontmatter.get("name", "")
    if not isinstance(name, str):
        return False, f"Name must be a string, got {type(name).__name__}"
    name = name.strip()
    if not name:
        return False, "Name is empty"
    if not re.match(r"^[a-z0-9-]+$", name):
        return False, f"Name '{name}' must be kebab-case (lowercase letters, digits, hyphens only)"
    if name.startswith("-") or name.endswith("-") or "--" in name:
        return False, f"Name '{name}' cannot start/end with a hyphen or contain consecutive hyphens"
    if len(name) > 64:
        return False, f"Name is too long ({len(name)} chars). Maximum is 64."

    # opencode requires the folder name to match `name`.
    folder = skill_path.name
    if folder != name:
        return False, (
            f"Folder name '{folder}' must match the frontmatter name '{name}'. "
            f"Rename the directory to '{name}' (or update the name field)."
        )

    # Required: description
    if "description" not in frontmatter:
        return False, "Missing 'description' in frontmatter (skills without one never trigger)"
    description = frontmatter.get("description", "")
    if not isinstance(description, str):
        return False, f"Description must be a string, got {type(description).__name__}"
    description = description.strip()
    if not description:
        return False, "Description is empty (skills without a description never trigger)"
    if "<" in description or ">" in description:
        return False, "Description cannot contain angle brackets (< or >)"
    if len(description) > 1024:
        return False, f"Description is too long ({len(description)} chars). Maximum is 1024."

    # Optional: compatibility
    compatibility = frontmatter.get("compatibility", "")
    if compatibility:
        if not isinstance(compatibility, str):
            return False, f"Compatibility must be a string, got {type(compatibility).__name__}"
        if len(compatibility) > 500:
            return False, f"Compatibility is too long ({len(compatibility)} chars). Maximum is 500."

    # Optional: metadata (string -> string map)
    metadata = frontmatter.get("metadata")
    if metadata is not None:
        if not isinstance(metadata, dict):
            return False, f"Metadata must be a map, got {type(metadata).__name__}"
        for k, v in metadata.items():
            if not isinstance(k, str) or not isinstance(v, str):
                return False, "Metadata must be a string-to-string map"

    return True, f"Skill '{name}' is valid!"


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python3 quick_validate.py <skill_directory>")
        sys.exit(1)

    ok, message = validate_skill(sys.argv[1])
    print(("OK: " if ok else "INVALID: ") + message)
    sys.exit(0 if ok else 1)
