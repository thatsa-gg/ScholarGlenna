1. No SQL code outside of lib/server/database.
2. For icons, prefer Octicon, then Majesticon, then Bootstrap.
3. Don't hard-code URLs. Use either ClientAppUrl or AppUrl.
4. Only the root layout script can return data.

    - Pages should be responsible for their own data.
    - Layout scripts can be used for whole-tree redirects *only*.
5. Use Redis for ephemeral data. Use Postgres for persistent data, even if it's only temporary or they expire.

    - e.g.: Sessions are ephemeral -> Redis. API keys are temporary -> Postgres.
