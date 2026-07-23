---
description: Update documentation after shipping a new feature or fix
---

After implementing any new feature, improvement, or significant fix to the Social Auditor app, always perform the following three documentation updates before considering the task complete.

## 1. Update Release Notes

File: `src/data/release-notes.ts`

- Add a new entry at the **top** of the `releaseNotes` array
- Bump the version number (patch x.x.1 for fixes, minor x.1.0 for features, major 1.0.0 for large releases)
- Set `date` to today's date in `YYYY-MM-DD` format
- Set `type` to `"major"`, `"minor"`, or `"patch"`
- Write a clear `title` summarising the release
- Group changes under the correct `category`: `"feature"`, `"improvement"`, `"fix"`, or `"security"`
- Use concise, user-facing language for each item (not internal implementation details)

Example entry:
```ts
{
    version: "1.6.0",
    date: "2026-03-05",
    title: "Terms Acceptance & Documentation Updates",
    type: "minor",
    changes: [
        {
            category: "feature",
            items: [
                "Added Terms & Policies acceptance checkbox on the auth page.",
                "Help Center launched with 60+ categorised FAQs.",
            ],
        },
    ],
},
```

## 2. Update Help Center FAQs

File: `src/app/help-center/page.tsx`

- If the feature introduces new user-facing behaviour, add relevant Q&A entries to the most appropriate category in the `categories` array
- If it's a new major feature, consider adding a new category object
- FAQs should answer real user questions: "How do I...?", "Why is...?", "What happens when...?"
- Keep answers clear, concise, and jargon-free
- Update existing answers if the feature changes previously documented behaviour

## 3. Update Terms & Policies (if applicable)

File: `src/app/terms/page.tsx`

Only update this if the change affects:
- What data is collected or stored
- How the user interacts with third-party services
- Account rules or restrictions
- Security model changes
- New limitations or acceptable use considerations

Update the relevant `<Section>` component content and update the **Effective Date** constant at the top of the file.

---

## Checklist to run after every feature ship

```
[ ] Release Notes entry added to src/data/release-notes.ts
[ ] Help Center FAQs updated in src/app/help-center/page.tsx (if user-facing)
[ ] Terms & Policies updated in src/app/terms/page.tsx (if data/legal impact)
```
