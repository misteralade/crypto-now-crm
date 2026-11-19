# CryptoNow CRM (Admin Operations Console)

The CryptoNow CRM is the back-office management console for operations, treasury, customer support, and platform administration.

## Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/)
- **Routing**: [TanStack Router](https://tanstack.com/router) with type-safe file routes
- **Server State**: [TanStack React Query](https://tanstack.com/query)
- **Client State**: [Redux Toolkit](https://redux-toolkit.js.org/)
- **Form Validation**: [Formik](https://formik.org/) + [Zod](https://zod.dev/)
- **Styling**: Tailwind CSS, CSS Variables for dynamic scaling, Phosphor & Lucide icons

## Operations Modules

### 1. Transaction Management
- Review pending BUY transaction payment proofs.
- Confirm fiat receipt and dispatch outbound cryptocurrency.
- Transaction locking mechanism to prevent simultaneous admin edits.
- Filter orders by type (BUY/SELL), priority (URGENT/NORMAL), and status.

### 2. KYC Verification Queue
- Review customer identity submissions (NIN verification and Didit biometrics).
- View uploaded ID cards, passports, and selfie photos with secure signed URLs.
- Approve, reject (with structured reason codes), or escalate sessions.
- Manage tier limits for daily and monthly trade volumes.

### 3. Dispute Resolution Center
- Real-time customer support dispute threads.
- Inspect attached transaction receipts, on-chain TX hashes, and banking records.
- Send messages directly to users and update dispute status (IN_PROGRESS, RESOLVED, REJECTED).

### 4. Coin & Network Management
- Configure supported cryptocurrencies, symbols, logos, and decimals.
- Toggle `buyEnabled` and `sellEnabled` flags per asset.
- Set minimum and maximum transaction limits for registered and anonymous users.
- Configure active blockchain networks (`SOL`, `ERC20`, `TRC20`, `BTC`) and link CoinGecko IDs.

### 5. Treasury & Sweeps
- Monitor custodial wallet balances across Solana, Ethereum, Bitcoin, and TRON.
- Review and trigger custodial sweep operations to consolidate funds into cold/hot treasury wallets.
- Manage fueling wallets for network gas replenishment.

### 6. Fiat & Banking
- Manage platform receiving bank accounts (NUBAN).
- Set default receiving accounts and synchronize supported bank lists from Nomba.
- Configure payout auto-approval thresholds (`sell_payout_auto_approval_limit_ngn`).

### 7. Administration, Roles & Security
- Admin invitation and role-based access control (RBAC).
- Enforce Two-Factor Authentication (2FA) and temporary password rotation (`mustChangePassword`).
- Comprehensive audit trails logging all administrative actions.

## Development and Scripts

### Available Scripts

- `pnpm dev`: Starts the Vite development server.
- `pnpm build`: Checks TypeScript types and builds the production bundle.
- `pnpm preview`: Previews the production build locally.
- `pnpm lint`: Lints codebase using ESLint.

## Environment Variables

Configure the following variables in `.env` (or `.env.local`):

| Variable | Description |
| --- | --- |
| `VITE_API_BASE_URL` | Backend API base URL (e.g. `http://localhost:5000/api/v1/crypto-now`) |
| `VITE_APP_ENV` | Environment name (`local`, `dev`, `prod`) |
