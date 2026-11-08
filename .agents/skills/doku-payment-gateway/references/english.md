## English

### Orchestration & Integration
- **Payments & Multi-Gateway Routing**: `payment-gateway-expert`, `saas-billing`, `agentic-m2m-settlement`, `agentic-micro-economy-architect`
- **AI Agentic Commerce & MCP**: `doku-mcp-server`, `mcp-server-architect`, `ai-llm-integration-expert`
- **Database & Atomic Idempotency**: `database-orm-expert`, `saas-multi-tenant`
- **Security & Post-Quantum Crypto**: `post-quantum-crypto-migrator`, `zero-trust-secret-vault`, `autonomous-red-teamer`
- **Async Processing & Observability**: `async-queue-temporal-expert`, `data-telemetry-expert`
- **Lifecycle & Governance**: `brainstorming`, `zero-to-prod-orchestrator`, `session-memory-manager`, `anti-slop`

### Description
Expert guide for implementing DOKU Payment Gateway based on the official [DOKU Developers Documentation](https://developers.doku.com/).
DOKU offers two primary integration models:
1. **DOKU Checkout** (`/checkout/v1/payment`): Hosted payment page or modal overlay (`jokul-checkout-1.0.0.js`). The fastest, single-integration solution supporting all payment channels (Virtual Accounts, Credit Cards, QRIS, E-Wallets, Convenience Stores, Paylater, Direct Debit) with built-in retry handling and cart recovery. Uses **Non-SNAP HMAC-SHA256** signatures with request digest.
2. **Direct API**:
   - **SNAP BI Standard (Host-to-Host)**: Standardized open banking API mandated by Bank Indonesia. Employs OAuth 2.0 B2B token with Asymmetric RSA-SHA256, and **HMAC-SHA512** for transactional endpoints (Direct VA, Direct QRIS, Direct Debit).
   - **Non-SNAP Direct API**: Dedicated APIs for Credit Card Payment Page (`/credit-card/v1/payment-page`), OVO Push Payment (`/ovo-emoney/v1/payment`), and Direct Paylater.

---

### Integration Architecture Decision Matrix

| Dimension | DOKU Checkout (Hosted / Modal) | Direct API (SNAP BI Standard) | Direct API (Non-SNAP) |
|---|---|---|---|
| **Primary Use Case** | E-commerce, SaaS billing, mobile apps wanting instant multi-channel coverage | Bespoke in-app banking UI, automated dynamic VA generation, native QRIS display | Non-PCI DSS Card custom page, instant OVO push payment to phone |
| **Supported Channels** | All channels in 1 API (VA, CC, QRIS, E-Wallet, Alfa/Indomaret, Paylater, Direct Debit) | Specific endpoints: Bank Virtual Accounts, QRIS, Direct Debit | Credit Card 3DS, OVO Push, LinkAja, Paylater (Kredivo/Akulaku) |
| **Frontend Effort** | Minimal: Redirect to URL or trigger modal via `loadJokulCheckout()` | High: Merchant builds custom payment UI for each channel | Medium: Merchant embeds card iframe/redirect or prompts phone |
| **Signature Algorithm** | `HMACSHA256` with body `Digest` | `HMAC-SHA512` (Transactional) + RSA-SHA256 (B2B Token) | `HMACSHA256` with `Digest` (Card) or SHA256 checksum (OVO) |
| **Endpoint Base** | `/checkout/v1/payment` | `/virtual-accounts/bi-snap-va/v1.1/...`, `/snap-adapter/b2b/v1.0/qr/...` | `/credit-card/v1/payment-page`, `/ovo-emoney/v1/payment` |
| **Check Status** | `GET /orders/v1/status/{invoice_number}` (with order-level status) | Channel status endpoint (e.g. `/transfer-va/status`, `/qr-mpm-query`) | `GET /orders/v1/status/{invoice_number}` |

---

### Core Architecture & Credentials

#### Environment Gateways
| Environment | Base URL | Dashboard Portal | Simulator |
|---|---|---|---|
| **Sandbox** | `https://api-sandbox.doku.com` | `https://sandbox.doku.com` | `https://sandbox.doku.com/gtw-config-v2/simulator` |
| **Production** | `https://api.doku.com` | `https://dashboard.doku.com` | N/A |

#### Frontend JS SDK (for Modal Popup Mode)
- **Sandbox**: `https://sandbox.doku.com/jokul-checkout-js/v1/jokul-checkout-1.0.0.js`
- **Production**: `https://jokul.doku.com/jokul-checkout-js/v1/jokul-checkout-1.0.0.js`

---
