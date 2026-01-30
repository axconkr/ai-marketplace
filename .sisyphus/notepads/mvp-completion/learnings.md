# Learnings - mvp-completion (Task 5: httpOnly cookie migration)

What worked well:
- Removing token fields from auth responses and localStorage was straightforward because cookies were already set up.

What didn't work as expected:
- `npm run build` failed due to timeouts fetching Noto Sans KR fonts from fonts.gstatic.com.

What would I do differently:
- Run the build with `NEXT_DISABLE_FONT_DOWNLOADS=1` in offline/locked-down environments.

Gotchas:
- Auth route files already had unrelated edits staged in the working tree; file-level staging can include those.
- LSP reports a pre-existing `string | undefined` vs `string | null` mismatch in auth routes.
