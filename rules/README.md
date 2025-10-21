# Example Rules Configuration

This directory contains example rule configurations for the moderation system.

## Setup

1. Copy this entire directory to create your production rules:
   ```bash
   cp -r rules.example rules
   ```

2. Edit the files in `rules/` to configure your moderation rules:
   - `accountAge.ts` - Rules for flagging accounts based on age
   - `accountThreshold.ts` - Rules for flagging accounts that exceed thresholds
   - `handles.ts` - Pattern matching rules for handles/usernames
   - `posts.ts` - Pattern matching rules for post content
   - `profiles.ts` - Pattern matching rules for profile descriptions
   - `constants.ts` - Global allow lists and shared constants

3. The `rules/` directory is ignored by git to keep your moderation rules confidential.

## Rule Structure

Each rule type has a specific structure. See the example files for details on required fields and options.

### Common Fields

- `label` - The label to apply when the rule matches
- `comment` - Internal comment/reason for the action
- `reportAcct/reportPost` - Whether to create a report
- `commentAcct/commentPost` - Whether to add a comment
- `toLabel` - Whether to apply a label
- `check` - The pattern/condition to match against

### Optional Fields

- `whitelist` - Patterns that should override the main check (false positives)
- `ignoredDIDs` - DIDs exempt from this specific rule

## Security

Never commit the `rules/` directory to version control. Keep your moderation rules confidential.
