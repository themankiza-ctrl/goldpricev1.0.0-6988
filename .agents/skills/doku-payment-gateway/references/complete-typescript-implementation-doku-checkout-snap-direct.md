## Complete TypeScript Implementation (DOKU Checkout & SNAP Direct)

```typescript
import crypto from 'crypto';

export interface DokuConfig {
  clientId: string;
  secretKey: string;
  isProduction: boolean;
  privateKeyPem?: string; // For SNAP B2B RSA token
}

export class DokuService {
  private clientId: string;
  private secretKey: string;
  private baseUrl: string;
  private privateKeyPem?: string;

  constructor(config: DokuConfig) {
    this.clientId = config.clientId;
    this.secretKey = config.secretKey;
    this.baseUrl = config.isProduction ? 'https://api.doku.com' : 'https://api-sandbox.doku.com';
    this.privateKeyPem = config.privateKeyPem;
  }

  // =================== DOKU CHECKOUT (NON-SNAP) ===================
  private generateNonSnapHeaders(targetPath: string, body?: object) {
    const requestId = crypto.randomUUID();
    const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
    let component = `Client-Id:${this.clientId}\nRequest-Id:${requestId}\nRequest-Timestamp:${timestamp}\nRequest-Target:${targetPath}`;

    const headers: Record<string, string> = {
      'Client-Id': this.clientId,
      'Request-Id': requestId,
      'Request-Timestamp': timestamp,
      'Request-Target': targetPath,
    };

    if (body) {
      const minified = JSON.stringify(body);
      const digest = crypto.createHash('sha256').update(minified, 'utf8').digest('base64');
      headers['Digest'] = digest;
      headers['Content-Type'] = 'application/json';
      component += `\nDigest:${digest}`;
    }

    const hmac = crypto.createHmac('sha256', this.secretKey).update(component, 'utf8').digest('base64');
    headers['Signature'] = `HMACSHA256=${hmac}`;

    return headers;
  }

  public async createCheckoutUrl(payload: {
    amount: number;
    invoiceNumber: string;
    customerName: string;
    customerEmail: string;
    callbackUrl?: string;
  }) {
    const targetPath = '/checkout/v1/payment';
    const body = {
      order: {
        amount: payload.amount,
        invoice_number: payload.invoiceNumber,
        currency: 'IDR',
        callback_url: payload.callbackUrl,
        auto_redirect: true,
      },
      payment: { payment_due_date: 60 },
      customer: {
        id: payload.customerEmail,
        name: payload.customerName,
        email: payload.customerEmail,
      },
    };

    const response = await fetch(`${this.baseUrl}${targetPath}`, {
      method: 'POST',
      headers: this.generateNonSnapHeaders(targetPath, body),
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return {
      paymentUrl: data.response.payment.url,
      tokenId: data.response.payment.token_id,
    };
  }

  // =================== SNAP BI DIRECT API ===================
  public async getSnapB2bToken(): Promise<string> {
    if (!this.privateKeyPem) throw new Error('Private key PEM required for SNAP B2B Token');
    const targetPath = '/authorization/v1/access-token/b2b';
    const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
    
    // RSA-SHA256 signature
    const stringToSign = `${this.clientId}|${timestamp}`;
    const signer = crypto.createSign('RSA-SHA256');
    signer.update(stringToSign);
    const signature = signer.sign(this.privateKeyPem, 'base64');

    const response = await fetch(`${this.baseUrl}${targetPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CLIENT-KEY': this.clientId,
        'X-TIMESTAMP': timestamp,
        'X-SIGNATURE': signature,
      },
      body: JSON.stringify({ grantType: 'client_credentials' }),
    });

    const data = await response.json();
    return data.accessToken;
  }

  public async generateDirectQris(accessToken: string, partnerRefNo: string, amount: number, merchantId: string, terminalId: string) {
    const targetPath = '/snap-adapter/b2b/v1.0/qr/qr-mpm-generate';
    const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
    const externalId = crypto.randomUUID();

    const body = {
      partnerReferenceNo: partnerRefNo,
      amount: { value: `${amount.toFixed(2)}`, currency: 'IDR' },
      merchantId,
      terminalId,
      additionalInfo: { postalCode: '12012', feeType: '1' }
    };

    const minified = JSON.stringify(body);
    const bodyHash = crypto.createHash('sha256').update(minified, 'utf8').digest('hex').toLowerCase();
    const stringToSign = `POST:${targetPath}:${accessToken}:${bodyHash}:${timestamp}`;
    const signature = crypto.createHmac('sha512', this.secretKey).update(stringToSign, 'utf8').digest('base64');

    const response = await fetch(`${this.baseUrl}${targetPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'X-PARTNER-ID': this.clientId,
        'X-EXTERNAL-ID': externalId,
        'X-TIMESTAMP': timestamp,
        'X-SIGNATURE': signature,
        'CHANNEL-ID': 'H2H'
      },
      body: minified,
    });

    return await response.json();
  }
}
```

---

### Common Pitfalls to Avoid

| Anti-Pattern | Issue | Solution |
|---|---|---|
| Using HMAC-SHA512 for DOKU Checkout | `401 Unauthorized / Invalid Signature` | DOKU Checkout uses **Non-SNAP HMAC-SHA256** with body `Digest`. |
| Using HMAC-SHA256 for SNAP BI Direct | `401 Unauthorized` | SNAP BI transactional endpoints strictly require **HMAC-SHA512** with lowercase hex SHA-256 body hash. |
| Forgetting `CHANNEL-ID: H2H` in SNAP | Bad request | SNAP BI Direct host-to-host APIs require `CHANNEL-ID: H2H` header. |
| Inverting `Request-Target` in Webhook | Signature validation fails | For incoming webhooks, `Request-Target` is the merchant's endpoint path (e.g., `/api/webhooks/doku/checkout`). |
| OVO Push timeout too short | premature failure | OVO push payments require up to **70 seconds** client timeout while the user confirms on mobile. |
| Non-atomic database updates | Race condition double top-up | Always guard webhook fulfillments with atomic SQL updates (`WHERE status = 'PENDING'`). |

### Sovereign Execution, Token Efficiency & Invariants
| Dimension | Sovereign Mandate & Deterministic Contract |
| :--- | :--- |
| **Frontier Model Cascade** | High Fast / High (`Grok 4.7 High Fast`, `Claude Sonnet 5.5 High`, `Gemini 4 Pro`) |
| **Availability Fallback** | `Gemini 4 Pro` -> `Gemini 3.8 Flash`; `Claude Opus 5.5` -> `Claude Opus 4.6`; `Grok 4.7` -> `Grok 4.6 High Fast` (Zero unhandled missing-model errors) |
| **KV-Cache & Token Protocol** | Pin static instructions & schemas at prompt prefix (`kv-cache-prefix-optimizer`); pass surgical `CONTEXT_MAP.md` slices (<250 tokens/call) during Swarm Fan-Out |
| **SaaT CLI & MCP Dispatch** | CLI: `vibes skill exec doku-payment-gateway <audit\|eval\|verify\|generate\|blueprint>` / MCP: `vibes_skill_dispatch`, `vibes_critic_validate`, `vibes_self_heal`, `vibes_eval_sandbox`, `vibes_verify_invariants` |
| **NFR & Anti-Slop Invariants** | Zero OWASP Top 10 vectors, 0 hardcoded secrets, >= 90% branch coverage on domain logic, 0 Anti-Slop violations; 100% complete zero-placeholder output verified via `node scripts/check-anti-slop.js --strict` |

---


---

<a name="bahasa-indonesia"></a>
