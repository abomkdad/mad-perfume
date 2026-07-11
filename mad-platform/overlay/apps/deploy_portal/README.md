# MAD PERFUME Deploy Portal

This Vinext/Sites app is the deployable web preview for the MAD PERFUME platform.

It presents:

- Customer commerce preview.
- Admin operations preview.
- Branch POS preview.
- MAD Rewards ledger preview.
- Mobile-store support pages:
  - `/privacy`
  - `/delete-account`
  - `/support`

Commands:

```bash
pnpm --ignore-workspace run lint
pnpm --ignore-workspace run build
pnpm --ignore-workspace run test
```

The production deployment is managed by Sites using `.openai/hosting.json`.
