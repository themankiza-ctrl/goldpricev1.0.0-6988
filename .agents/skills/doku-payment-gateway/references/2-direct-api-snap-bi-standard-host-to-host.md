## 2. Direct API — SNAP BI Standard (Host-to-Host)

For merchants requiring fully custom, native checkout experiences for Virtual Accounts, QRIS, or Direct Debit.

### Step 1: B2B Access Token Generation
- **Endpoint**: `POST /authorization/v1/access-token/b2b`
- **Headers**:
  - `X-CLIENT-KEY`: Merchant Client ID
  - `X-TIMESTAMP`: ISO8601 string (`YYYY-MM-DDTHH:mm:ssZ`)
  - `X-SIGNATURE`: `SHA256withRSA(PrivateKey, X-CLIENT-KEY + "|" + X-TIMESTAMP)` (Base64)
- **Body**: `{"grantType": "client_credentials"}`
- **Response**: `accessToken` (Bearer token, valid for 900 seconds).

```typescript
export function generateSnapB2bSignature(clientId: string, timestamp: string, privateKeyPem: string): string {
  const stringToSign = `${clientId}|${timestamp}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(stringToSign);
  return signer.sign(privateKeyPem, 'base64');
}
```

### Step 2: Transactional Endpoints Signature (HMAC-SHA512)
- **Formula**:
  1. `BodyHash = hex(sha256(minifiedBody)).toLowerCase()`
  2. `StringToSign = HTTPMethod + ":" + EndpointUrl + ":" + AccessToken + ":" + BodyHash + ":" + Timestamp`
  3. `X-SIGNATURE = base64(hmacSha512(ClientSecret, StringToSign))`

```typescript
export function generateSnapTransactionalSignature(
  method: string,
  endpointPath: string,
  accessToken: string,
  timestamp: string,
  clientSecret: string,
  body?: object
): string {
  let bodyHash = '';
  if (body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
    bodyHash = crypto.createHash('sha256').update(JSON.stringify(body), 'utf8').digest('hex').toLowerCase();
  }

  const stringToSign = `${method.toUpperCase()}:${endpointPath}:${accessToken}:${bodyHash}:${timestamp}`;
  return crypto.createHmac('sha512', clientSecret).update(stringToSign, 'utf8').digest('base64');
}
```

### Direct Virtual Account API (`/virtual-accounts/bi-snap-va/v1.1/...`)
1. **DOKU Generated Payment Code (DGPC)**:
   - `POST /virtual-accounts/bi-snap-va/v1.1/transfer-va/create-va`
   - DOKU generates the unique VA number using the bank's BIN.
2. **Merchant Generated Payment Code (MGPC)**:
   - Merchant provides their own payment code conforming to bank BIN rules.
3. **Billing Types**:
   - `FIX_BILL`: Exact amount payment (standard e-commerce).
   - `NO_BILL`: Open amount (donations/wallet top-up).
   - `BILL_VARIABLE_AMOUNT`: Range-based amount.
   - `PARTIAL_AMOUNT`: Installment or partial payments (BNI, CIMB, Danamon).
4. **Maintenance Endpoints**:
   - Update VA: `PUT /virtual-accounts/bi-snap-va/v1.1/transfer-va/update-va`
   - Delete VA: `DELETE /virtual-accounts/bi-snap-va/v1.1/transfer-va/delete-va`

### Direct QRIS API (`/snap-adapter/b2b/v1.0/qr/...`)
1. **Generate QRIS**:
   - `POST /snap-adapter/b2b/v1.0/qr/qr-mpm-generate`
   - Request includes `partnerReferenceNo`, `amount.value` (format `10000.00`), `merchantId`, `terminalId`, `additionalInfo.postalCode`.
   - Response returns `qrContent` string (EMVCo payload) for rendering dynamic QR code.
2. **Query QRIS**: `POST /snap-adapter/b2b/v1.0/qr/qr-mpm-query`
3. **Cancel / Expire QRIS**: `POST /snap-adapter/b2b/v1.0/qr/qr-expire`
4. **Refund QRIS**: `POST /snap-adapter/b2b/v1.0/qr/qr-mpm-refund`

---
