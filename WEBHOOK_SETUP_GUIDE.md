# Midtrans Webhook Setup Guide

## 1. Konfigurasi Webhook di Midtrans Dashboard

### Login ke Midtrans Dashboard
1. Buka https://dashboard.midtrans.com/
2. Login dengan akun merchant Anda

### Set Callback URL
1. Masuk ke menu **Settings** > **Configuration**
2. Pilih tab **Callbacks & Redirect URLs**
3. Isi field **Callback URL** dengan URL webhook Anda:

**Untuk Production:**
```
https://your-domain.com/api/midtrans-webhook
```

**Untuk Development (dengan ngrok):**
```
https://your-ngrok-url.ngrok.io/api/midtrans-webhook
```

**Untuk Local Development:**
```
http://localhost:3000/api/midtrans-webhook
```

### 2. Environment Variables

Pastikan environment variables berikut sudah diset di file `.env.local`:

```env
# Midtrans Configuration
SERVER_KEY=your_midtrans_server_key
NEXT_PUBLIC_CLIENT_KEY=your_midtrans_client_key
MIDTRANS_SIGNATURE_KEY=your_midtrans_signature_key

# Strapi Configuration
BASE_API=https://sub.typestaging.my.id
KEY_API=your_strapi_api_key

# NextAuth URL (untuk webhook internal)
NEXTAUTH_URL=http://localhost:3000
```

### 3. Testing Webhook

#### Test dengan Postman
1. Buka Postman
2. Buat request POST ke: `http://localhost:3000/api/test-webhook`
3. Body JSON:
```json
{
  "order_id": "ORDER-1752685946461-7177",
  "transaction_status": "settlement",
  "fraud_status": "accept"
}
```

#### Test dengan cURL
```bash
curl -X POST http://localhost:3000/api/test-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "ORDER-1752685946461-7177",
    "transaction_status": "settlement",
    "fraud_status": "accept"
  }'
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

### 5. Monitoring Webhook

#### Log di Console Server
Webhook akan mencatat log detail di console server:
- Request yang diterima dari Midtrans
- Pencarian transaksi di Strapi
- Update status yang dilakukan
- Error yang terjadi

#### Test Endpoint
Endpoint `/api/test-webhook` tersedia untuk testing manual webhook functionality.

### 6. Troubleshooting

#### Webhook tidak terpanggil
1. Pastikan Callback URL sudah benar di Midtrans Dashboard
2. Pastikan server bisa diakses dari internet (gunakan ngrok untuk development)
3. Cek log server untuk error

#### Status tidak terupdate
1. Pastikan order_id di Strapi sama dengan order_id dari Midtrans
2. Cek log webhook untuk melihat proses pencarian dan update
3. Pastikan API key Strapi valid

#### Error 404
1. Pastikan endpoint `/api/midtrans-webhook` sudah dibuat
2. Restart development server setelah membuat endpoint baru

### 7. Development dengan ngrok

Untuk testing webhook di development:

1. Install ngrok: `npm install -g ngrok`
2. Jalankan ngrok: `ngrok http 3000`
3. Copy URL ngrok (contoh: `https://abc123.ngrok.io`)
4. Set Callback URL di Midtrans Dashboard: `https://abc123.ngrok.io/api/midtrans-webhook`
5. Test pembayaran dan monitor webhook di console server
