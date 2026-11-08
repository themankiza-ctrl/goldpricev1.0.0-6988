## 3. Direct API — Non-SNAP Channels

### Credit Card Payment Page (`/credit-card/v1/payment-page`)
For non-PCI DSS merchants wanting a customized branded card checkout page:
- **Method**: `POST`
- **Headers**: Non-SNAP `Client-Id`, `Request-Id`, `Request-Timestamp`, `Signature` (HMAC-SHA256 with Digest).
- **Body**: `order`, `customer`, `payment.type` (`"SALE"` or `"AUTHORIZE"`), `override_configuration.themes` (custom colors and logos).
- **Flow**: Redirects customer to DOKU 3D-Secure authentication, then returns to `callback_url`.

### OVO Push Payment (`/ovo-emoney/v1/payment`)
Initiates an instant push payment notification directly to customer's OVO mobile app:
- **Method**: `POST`
- **Body**:
  ```json
  {
    "client": { "id": "MCH-0001-10791114622547" },
    "order": { "invoice_number": "INV-20261003-0002", "amount": 50000 },
    "ovo_info": { "ovo_id": "081234567890" },
    "security": { "check_sum": "<sha256_checksum>" }
  }
  ```
- **Checksum Calculation**:
  ```typescript
  const checkSum = crypto.createHash('sha256')
    .update(`${amount}${clientId}${invoiceNumber}${ovoId}${secretKey}`, 'utf8')
    .digest('hex');
  ```
- **Wait Time**: The backend request waits up to **70 seconds** for the customer to confirm the payment on their phone.

---
