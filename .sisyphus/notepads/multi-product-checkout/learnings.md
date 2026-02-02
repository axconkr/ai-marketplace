# Learnings

## What worked well
- Prisma generate picked up checkout_session_id fields after running `npx prisma generate`.
- Using a single transaction for order/payment creation kept multi-order writes atomic.

## What did not work as expected
- `npx tsc --noEmit lib/services/cart-checkout.ts` ignores project config, so path aliases and esModuleInterop errors appear.
- Full `npx tsc --noEmit` fails due to pre-existing type errors across the repo.

## What to do differently next time
- Prefer running `npx tsc --noEmit` with an agreed repo baseline or a scoped config for service-only checks.
- Consider `@paralleldrive/cuid2` instead of `cuid` to avoid deprecation warnings.

## Gotchas
- `cuid@3` emits a deprecation warning during install.
