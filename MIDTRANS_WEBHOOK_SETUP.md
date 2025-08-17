# Midtrans Webhook Setup

## Konfigurasi Webhook di Midtrans Dashboard

### 1. Login ke Midtrans Dashboard
- Buka https://dashboard.midtrans.com/
- Login dengan akun merchant Anda

### 2. Konfigurasi Webhook URL
1. Masuk ke menu **Settings** > **Configuration**
2. Pilih tab **Callbacks & Redirect URLs**
3. Isi field **Callback URL** dengan:
   ```
   https://your-domain.com/api/midtrans-webhook
   ```
   atau untuk development:
   ```
   https://your-ngrok-url.ngrok.io/api/midtrans-webhook
   ```

### 3. Environment Variables
Pastikan environment variables berikut sudah diset:

```env
# Midtrans Configuration
SERVER_KEY=your_midtrans_server_key
NEXT_PUBLIC_CLIENT_KEY=your_midtrans_client_key
MIDTRANS_SIGNATURE_KEY=your_midtrans_signature_key

# Strapi Configuration
BASE_API=https://sub.typestaging.my.id
KEY_API=your_strapi_api_key
```

### 4. Status Mapping
Webhook akan mengupdate status payment di Strapi berdasarkan status dari Midtrans:

| Midtrans Status | Strapi Status | Keterangan |
|----------------|---------------|------------|
| `capture` | `success` | Pembayaran berhasil |
| `settlement` | `success` | Pembayaran berhasil |
| `pending` | `pending` | Menunggu pembayaran |
| `deny` | `failed` | Pembayaran ditolak |
| `expire` | `failed` | Pembayaran expired |
| `cancel` | `failed` | Pembayaran dibatalkan |

### 5. Testing Webhook
Untuk testing webhook, Anda bisa menggunakan tools seperti:
- ngrok (untuk development)
- Postman
- Midtrans Sandbox

### 6. Log Monitoring
Webhook akan mencatat log di console server untuk monitoring:
- Request yang diterima
- Status update yang dilakukan
- Error yang terjadi

### 7. Security
Webhook menggunakan signature verification untuk memastikan request berasal dari Midtrans yang sah.
