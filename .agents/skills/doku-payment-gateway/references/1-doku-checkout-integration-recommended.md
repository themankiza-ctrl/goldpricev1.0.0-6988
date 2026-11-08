## 1. DOKU Checkout Integration (Recommended)

### Backend: Generate Checkout Payment URL

#### Endpoint
- **HTTP Method**: `POST`
- **Sandbox**: `https://api-sandbox.doku.com/checkout/v1/payment`
- **Production**: `https://api.doku.com/checkout/v1/payment`

#### Mandatory Headers
```http
Client-Id: MCH-0001-10791114622547
Request-Id: 2ebffd22-d23e-4368-95ce-5c38f7ddcf86
Request-Timestamp: 2026-10-03T01:30:00Z
Signature: HMACSHA256=1jap2tpgvWt83tG4J7IhEwUrwmMt71OaIk0oL0e6sPM=
Content-Type: application/json
```

> [!IMPORTANT]
> - `Request-Timestamp` MUST be in ISO8601 UTC+0 (`YYYY-MM-DDTHH:mm:ssZ`). For WIB (UTC+7), subtract 7 hours.
> - `Request-Target` is `/checkout/v1/payment`.

#### Signature Generation (Non-SNAP HMAC-SHA256)
1. **Calculate Digest**:
   ```typescript
   const jsonBody = JSON.stringify(body);
   const digest = crypto.createHash('sha256').update(jsonBody, 'utf8').digest('base64');
   ```
2. **Assemble Component String**:
   ```text
   Client-Id:<client-id>\nRequest-Id:<request-id>\nRequest-Timestamp:<timestamp>\nRequest-Target:<request-target>\nDigest:<digest>
   ```
3. **Calculate HMAC-SHA256**:
   ```typescript
   const hmac = crypto.createHmac('sha256', secretKey).update(componentString, 'utf8').digest('base64');
   const signatureHeader = `HMACSHA256=${hmac}`;
   ```

#### Full Request Payload Schema
```json
{
  "order": {
    "amount": 150000,
    "invoice_number": "INV-20261003-0001",
    "currency": "IDR",
    "callback_url": "https://myapp.com/checkout/return",
    "callback_url_cancel": "https://myapp.com/checkout/cancel",
    "callback_url_result": "https://myapp.com/checkout/result",
    "language": "EN",
    "auto_redirect": true,
    "disable_retry_payment": true,
    "recover_abandoned_cart": true,
    "expired_recovered_cart": 60,
    "line_items": [
      {
        "id": "ITEM-1",
        "name": "Pro SaaS Annual Subscription",
        "quantity": 1,
        "price": 150000,
        "sku": "SAAS-PRO-Y",
        "category": "services"
      }
    ]
  },
  "payment": {
    "payment_due_date": 60,
    "payment_method_types": [
      "VIRTUAL_ACCOUNT_BCA",
      "VIRTUAL_ACCOUNT_BANK_MANDIRI",
      "VIRTUAL_ACCOUNT_BRI",
      "VIRTUAL_ACCOUNT_BNI",
      "CREDIT_CARD",
      "QRIS",
      "EMONEY_SHOPEEPAY",
      "EMONEY_OVO",
      "EMONEY_DANA"
    ]
  },
  "customer": {
    "id": "CUST-9921",
    "name": "Alex",
    "last_name": "Kusuma",
    "email": "alex.kusuma@example.com",
    "phone": "6281234567890",
    "address": "Sudirman Central Business District",
    "city": "Jakarta Selatan",
    "country": "ID"
  },
  "additional_info": {
    "allow_tenor": [0, 3, 6, 12],
    "override_notification_url": "https://myapp.com/api/webhooks/doku/checkout"
  }
}
```

> [!TIP]
> To showcase **all** available channels enabled in your DOKU account, simply omit `payment.payment_method_types`.

#### Response Body Highlights
```json
{
  "message": ["SUCCESS"],
  "response": {
    "order": {
      "amount": "150000",
      "invoice_number": "INV-20261003-0001",
      "session_id": "5f6304ca900144c7a4fcf802ad6c0898"
    },
    "payment": {
      "url": "https://sandbox.doku.com/checkout-link-v2/5f6304ca900144c7a4fcf802ad6c0898...",
      "token_id": "5f6304ca900144c7a4fcf802ad6c08982024...",
      "payment_due_date": 60,
      "expired_date": "20261003104531"
    }
  }
}
```

---

### Frontend Integration (Popup Modal vs Redirect)

#### Approach A: Modal Overlay (Pop-Up Mode)
Import the DOKU Checkout JS SDK and trigger `loadJokulCheckout(url)`:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Mandatory for responsive modal scaling -->
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="https://sandbox.doku.com/jokul-checkout-js/v1/jokul-checkout-1.0.0.js"></script>
</head>
<body>
  <button id="pay-button" class="btn-primary">Pay with DOKU</button>

  <script>
    document.getElementById('pay-button').addEventListener('click', async () => {
      // 1. Fetch payment URL from your backend
      const res = await fetch('/api/checkout/initiate', { method: 'POST' });
      const data = await res.json();

      // 2. Open DOKU Checkout modal overlay
      if (data.paymentUrl) {
        window.loadJokulCheckout(data.paymentUrl);
      }
    });
  </script>
</body>
</html>
```

#### Approach B: Direct Redirect Mode
For mobile browsers or standard redirects, navigate directly to `response.payment.url`:
```typescript
window.location.href = data.paymentUrl;
```

---

### Order Status & Check Status API (Non-SNAP)

The Check Status API tracks order-level statuses even before the customer selects a specific channel:
- **Endpoint**: `GET https://api-sandbox.doku.com/orders/v1/status/{invoice_number}`
- **Signature for GET**: Does NOT require a Digest.
  ```text
  Client-Id:<client-id>\nRequest-Id:<request-id>\nRequest-Timestamp:<timestamp>\nRequest-Target:/orders/v1/status/<invoice_number>
  ```
- **Statuses**:
  - `order.status`: `ORDER_GENERATED`, `ORDER_EXPIRED`, `ORDER_RECOVERED`.
  - `transaction.status`: `PENDING`, `SUCCESS`, `FAILED`, `EXPIRED`, `REFUNDED`.

---

### Webhook Verification & Atomic Idempotency (DOKU Checkout)

When a customer completes payment via Checkout, DOKU posts an HTTP Notification with headers:
- `Client-Id`, `Request-Id`, `Request-Timestamp`, `Signature: HMACSHA256=...`

```typescript
import crypto from 'crypto';

export function verifyDokuCheckoutNotification(
  clientId: string,
  secretKey: string,
  requestTarget: string, // path of your notification endpoint e.g., '/api/webhooks/doku/checkout'
  headers: Record<string, string>,
  rawBody: string
): boolean {
  const reqClientId = headers['client-id'];
  const reqId = headers['request-id'];
  const reqTimestamp = headers['request-timestamp'];
  const receivedSig = headers['signature'] || '';

  if (reqClientId !== clientId) return false;

  // 1. Compute Base64 SHA-256 Digest of raw body
  const digest = crypto.createHash('sha256').update(rawBody, 'utf8').digest('base64');

  // 2. Build string component
  const component = `Client-Id:${reqClientId}\nRequest-Id:${reqId}\nRequest-Timestamp:${reqTimestamp}\nRequest-Target:${requestTarget}\nDigest:${digest}`;

  // 3. Compute HMAC-SHA256
  const expectedSig = 'HMACSHA256=' + crypto.createHmac('sha256', secretKey).update(component, 'utf8').digest('base64');

  return crypto.timingSafeEqual(Buffer.from(receivedSig), Buffer.from(expectedSig));
}
```

---
