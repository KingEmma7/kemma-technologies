# Contact endpoint firewall rollout

The application enforces request shape, body size and field limits. Rate
limiting should sit in Vercel Firewall so it applies consistently across regions
and function instances.

Do not publish a blocking rule without observing real traffic first.

## 1. Link and inspect

```bash
vercel link
vercel firewall overview
vercel firewall rules list --expand
```

Confirm the linked project is `kemma-technologies` before staging anything.

## 2. Stage an observation rule

Start generously at 30 POST requests per IP per minute and log only when the
threshold is exceeded:

```bash
vercel firewall rules add "Observe contact POST rate" \
  --condition '{"type":"path","op":"eq","value":"/api/contact"}' \
  --condition '{"type":"method","op":"eq","value":"POST"}' \
  --action rate_limit \
  --rate-limit-window 60 \
  --rate-limit-requests 30 \
  --rate-limit-keys ip \
  --rate-limit-action log \
  --yes

vercel firewall diff
```

The change is only a draft. Review the diff, then publish it manually:

```bash
vercel firewall publish --yes
```

## 3. Observe before enforcing

Review at least several days of production matches in the Firewall dashboard.
Confirm that legitimate users, preview testing, uptime checks and verified bots
are not being classified as abuse.

## 4. Enforce gradually

After traffic is understood, rename the rule, choose a limit supported by the
observed enquiry pattern, and change the exceeded action from `log` to
`rate_limit` (HTTP 429). Test enforcement in Preview before applying it to
Production. Re-run `vercel firewall diff` before every publish.

Keep the rule limited to `POST /api/contact`; a broad `/api` rule could interfere
with future webhooks or integrations.
