# 🎫 Ticket Template - Visual Reference & Code Examples

**Created:** December 2, 2025  
**Version:** 1.0.0

---

## 🎨 Visual Layout Diagram

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                                                    ┃
┃                    ╔════════════════════════╗                     ┃
┃                    ║   [LOGO]               ║                     ┃
┃                    ║   CELEPARTY            ║ HEADER              ┃
┃                    ║ (Rayakan Momen Spesial)║ Color: #3E2882      ┃
┃                    ║      (orange slogan)   ║ Height: ~100px      ┃
┃                    ╚════════════════════════╝                     ┃
┃                                                                    ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃                                                                    ┃
┃  ┌─ INFORMASI TIKET ─────────────────────────────────────────┐   ┃
┃  │ Nama Produk:        Concert - The Grand Performance       │   ┃
┃  │ Kode Tiket:         TKT-20241215-001234                   │   ┃
┃  │ Varian Tiket:       VIP Front Row                         │   ┃
┃  │ Tanggal Event:      15 Desember 2024                      │   ┃
┃  │ Lokasi Event:       Jakarta Convention Center             │   ┃
┃  └────────────────────────────────────────────────────────────┘   ┃
┃                                                                    ┃
┃  ┌─ INFORMASI PENERIMA E-TIKET ──────────────────────────────┐   ┃
┃  │ Nama Penerima:      John Doe                              │   ┃
┃  │ Email:              john.doe@example.com                  │   ┃
┃  │ No. Telepon:        +62 812-3456-7890                     │   ┃
┃  │ Tipe Identitas:     KTP                                   │   ┃
┃  │ No. Identitas:      3271234567890123                      │   ┃
┃  └────────────────────────────────────────────────────────────┘   ┃
┃                                                                    ┃
┃  ┌─ DESKRIPSI TIKET ─────────────────────────────────────────┐   ┃
┃  │ Konser musik live dengan artis-artis ternama. Durasi      │   ┃
┃  │ 4 jam dengan berbagai genre musik. Tersedia free snacks   │   ┃
┃  │ dan beverages.                                             │   ┃
┃  └────────────────────────────────────────────────────────────┘   ┃
┃                                BODY                               ┃
┃                          White Background                         ┃
┃                                                                    ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃                                                                    ┃
┃                   SCAN UNTUK VERIFIKASI                           ┃
┃                                                                    ┃
┃                    ┌─────────────────┐                            ┃
┃                    │                 │                            ┃
┃                    │   [QR CODE]     │ Primary Color Border      ┃
┃                    │   200x200px     │ (#3E2882)                ┃
┃                    │   Dynamic Gen   │                            ┃
┃                    │                 │                            ┃
┃                    └─────────────────┘                            ┃
┃                                                                    ┃
┃        Tunjukkan kode di atas kepada petugas untuk               ┃
┃                   memasuki event                                  ┃
┃                              QR CODE SECTION                      ┃
┃                                                                    ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ ══════════════════════════════════════════════════════════════    ┃
┃ (Primary Color Line 4px - #3E2882)                               ┃
┃                                                                    ┃
┃  Tiket dihasilkan pada:         │  CeleParty                     ┃
┃  15 Desember 2024               │  +62 812-3456-7890             ┃
┃                                 │  info@celeparty.com            ┃
┃                                 │  📱 Instagram  🎵 TikTok      ┃
┃                                 │  💬 WhatsApp   f Facebook      ┃
┃                                                                    ┃
┃          Terima kasih telah memilih CeleParty.                   ┃
┃          Nikmati acara Anda!                                      ┃
┃                              FOOTER                               ┃
┃                        Light Gray Background                      ┃
┃                                                                    ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

Max Width: 800px
Font: Lato
Paper: A4 (210 x 297 mm)
```

---

## 💻 Code Examples

### Example 1: Basic Usage

```typescript
'use client';

import { TicketTemplate, iTicketTemplateData } from '@/components/ticket-templates';
import { getDefaultTemplateConfig } from '@/lib/utils/ticket-template';

export default function TicketPage() {
	const ticketData: iTicketTemplateData = {
		product_title: 'Concert 2024',
		ticket_code: 'TKT-20241215-001',
		variant_name: 'VIP',
		recipient_name: 'John Doe',
		recipient_email: 'john@example.com',
		recipient_phone: '+62 812-3456-7890',
		event_date: '2024-12-15',
		event_location: 'Jakarta',
		qr_code_data: 'TKT-20241215-001',
		generated_date: new Date(),
	};

	const config = getDefaultTemplateConfig();

	return (
		<div className="p-8">
			<TicketTemplate data={ticketData} config={config} />
		</div>
	);
}
```

### Example 2: With Download & Email

```typescript
'use client';

import { useRef, useState } from 'react';
import { TicketTemplate } from '@/components/ticket-templates';
import { downloadTicketPDF, getTicketPDFAsBase64 } from '@/lib/utils/ticket-template';
import { getDefaultTemplateConfig } from '@/lib/utils/ticket-template/configTemplate';
import toast from 'react-hot-toast';

export default function TicketWithActions() {
	const ticketRef = useRef<HTMLDivElement>(null);
	const [loading, setLoading] = useState(false);

	const ticketData = { /* ... */ };
	const config = getDefaultTemplateConfig();

	const handleDownload = async () => {
		if (!ticketRef.current) return;
		setLoading(true);
		try {
			await downloadTicketPDF(
				ticketRef.current,
				ticketData,
				`ticket-${ticketData.ticket_code}.pdf`
			);
			toast.success('Tiket berhasil diunduh!');
		} catch (error) {
			toast.error('Gagal mengunduh tiket');
		} finally {
			setLoading(false);
		}
	};

	const handleEmail = async () => {
		if (!ticketRef.current) return;
		setLoading(true);
		try {
			const pdfBase64 = await getTicketPDFAsBase64(
				ticketRef.current,
				ticketData
			);
			
			// Send to backend
			await fetch('/api/email/send-ticket', {
				method: 'POST',
				body: JSON.stringify({
					to: ticketData.recipient_email,
					pdfBase64,
					ticketCode: ticketData.ticket_code,
				}),
			});
			
			toast.success('Tiket berhasil dikirim!');
		} catch (error) {
			toast.error('Gagal mengirim tiket');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="space-y-4">
			<div ref={ticketRef} className="rounded-lg border bg-white p-4">
				<TicketTemplate data={ticketData} config={config} />
			</div>

			<div className="flex gap-2">
				<button
					onClick={handleDownload}
					disabled={loading}
					className="bg-c-blue text-white px-4 py-2 rounded"
				>
					{loading ? 'Downloading...' : 'Download PDF'}
				</button>
				<button
					onClick={handleEmail}
					disabled={loading}
					className="bg-c-orange text-white px-4 py-2 rounded"
				>
					{loading ? 'Sending...' : 'Email Ticket'}
				</button>
			</div>
		</div>
	);
}
```

### Example 3: Using TicketPreview Component

```typescript
'use client';

import { TicketPreview } from '@/components/ticket-templates';

export default function TicketPreviewPage() {
	const ticketData = { /* ... */ };

	return (
		<TicketPreview
			ticketData={ticketData}
			templateConfig={{
				company_name: 'CeleParty',
				primary_color: '#3E2882',
				company_phone: '+62 812-3456-7890',
			}}
			onDownload={(filename) => {
				console.log('Downloaded:', filename);
			}}
			onEmail={(pdfBase64) => {
				console.log('PDF ready for email, size:', pdfBase64.length);
				// Send to backend email service
			}}
			showActions={true}
		/>
	);
}
```

### Example 4: Custom Branding

```typescript
'use client';

import { TicketTemplate } from '@/components/ticket-templates';
import { mergeTemplateConfig } from '@/lib/utils/ticket-template/configTemplate';

const customConfig = mergeTemplateConfig({
	logo_url: 'https://example.com/custom-logo.png',
	company_name: 'My Event Company',
	company_slogan: 'Amazing Events & Experiences',
	primary_color: '#FF0000',
	accent_color: '#00FF00',
	contact_info: {
		phone: '+62 818-888-8888',
		email: 'hello@myevent.com',
		instagram: 'myeventco',
		tiktok: 'myeventco',
		whatsapp: '628188888888',
	},
});

<TicketTemplate data={ticketData} config={customConfig} />
```

### Example 5: Multiple Tickets

```typescript
'use client';

import { generateMultipleTicketPDFs } from '@/lib/utils/ticket-template';

async function downloadAllTickets() {
	const ticketElements = Array.from(
		document.querySelectorAll('.ticket-item')
	);
	const ticketsData = [ /* array of ticket data */ ];

	const pdfBase64Array = await generateMultipleTicketPDFs(
		ticketElements,
		ticketsData,
		{
			scale: 2,
			quality: 100,
		}
	);

	// Send to backend for batch email or storage
	await fetch('/api/tickets/save-pdfs', {
		method: 'POST',
		body: JSON.stringify({ pdfs: pdfBase64Array }),
	});
}
```

### Example 6: Data Validation

```typescript
'use client';

import { validateTicketData, formatTicketDataFromAPI } from '@/lib/utils/ticket-template';

// Format from API
const apiResponse = await fetch('/api/tickets/123').then(r => r.json());
const formattedData = formatTicketDataFromAPI(apiResponse);

// Validate
const { valid, errors } = validateTicketData(formattedData);

if (!valid) {
	console.error('Validation errors:', errors);
	// Handle validation errors
} else {
	// Render template
	<TicketTemplate data={formattedData} config={config} />
}
```

### Example 7: With Error Handling

```typescript
'use client';

import { validateTemplateConfig, checkLogoAvailability } from '@/lib/utils/ticket-template';

async function setupTemplate() {
	// Validate config
	if (!validateTemplateConfig(config)) {
		throw new Error('Invalid template configuration');
	}

	// Check logo availability
	const logoOk = await checkLogoAvailability(config.logo_url);
	if (!logoOk) {
		console.warn('Logo not available, using text only');
		config.logo_url = undefined;
	}

	// Check data
	const { valid, errors } = validateTicketData(ticketData);
	if (!valid) {
		errors.forEach(err => console.error(err));
		return;
	}

	// Safe to render
	return <TicketTemplate data={ticketData} config={config} />;
}
```

---

## 🎨 Color Reference

### Primary Color (Header, Footer Line, QR Border)
```
Hex:        #3E2882
RGB:        62, 40, 130
HSL:        268°, 53%, 34%
Tailwind:   c-blue
Usage:      Header, footer line, QR code border, section titles
```

### Accent Color (Slogan, Dividers, Social Icons)
```
Hex:        #DA7E01
RGB:        218, 126, 1
HSL:        37°, 99%, 43%
Tailwind:   c-orange
Usage:      Slogan text, section dividers, social media links
```

### Text Colors
```
Labels:     #787878 (c-gray-text)
Values:     #000000 (black)
Metadata:   #929292 (c-gray)
Background: #F5F5F5 (c-gray-100)
Borders:    #E5E5E5 (c-gray-200)
```

---

## 📋 Data Structure Reference

### Minimal Data (Required Fields Only)
```typescript
const minimalData = {
	product_title: 'Event Name',
	ticket_code: 'TKT-001',
	variant_name: 'Standard',
	recipient_name: 'Guest',
	recipient_email: 'guest@example.com',
	recipient_phone: '+62 8xx-xxx-xxxxx',
	qr_code_data: 'TKT-001',
	generated_date: new Date(),
};
```

### Full Data (All Fields)
```typescript
const fullData = {
	// Product
	product_title: 'Concert - The Grand Performance',
	product_description: 'Live concert with famous artists...',
	event_date: '2024-12-15',
	event_location: 'Jakarta Convention Center',

	// Ticket
	ticket_code: 'TKT-20241215-001234',
	variant_name: 'VIP Front Row',
	ticket_type: 'Paid',

	// Recipient
	recipient_name: 'John Doe',
	recipient_email: 'john.doe@example.com',
	recipient_phone: '+62 812-3456-7890',
	recipient_identity_type: 'KTP',
	recipient_identity_number: '3271234567890123',

	// QR Code
	qr_code_data: 'TKT-20241215-001234|john.doe@example.com|verified',
	qr_code_image: undefined, // Optional

	// Metadata
	generated_date: new Date(),
	purchase_date: new Date('2024-11-01'),
	ticket_validity_date: '2024-12-15',
};
```

---

## 🔍 Component Property Reference

### TicketTemplate Props
```typescript
interface iTicketTemplateContext {
	data: iTicketTemplateData;
	config: iTicketTemplateConfig;
	className?: string;
}
```

### TicketPreview Props
```typescript
interface TicketPreviewProps {
	ticketData: iTicketTemplateData;
	templateConfig?: Partial<iTicketTemplateConfig>;
	onDownload?: (filename: string) => void;
	onEmail?: (pdfBase64: string) => void;
	showActions?: boolean;
	className?: string;
}
```

---

## 📊 Size Reference

### Component Dimensions
```
Header Height:        ~100px
Body Height:          Variable (200-400px)
QR Code Size:         200x200px
QR Border Width:      2px
QR Margin:            8px
Footer Height:        ~120px
Total Height:         ~500-700px (depending on content)

Max Width:            800px
Content Padding:      24px (0.5rem = 0.5rem)
Section Margin:       24px vertical
Line Height:          1.6
```

### Paper Settings (PDF)
```
Format:               A4
Width:                210 mm (21 cm)
Height:               297 mm (29.7 cm)
Margins:              10 mm all sides
Orientation:          Portrait
Scale:                2 (for quality)
Quality:              100%
```

---

## 🎯 Customization Checklist

- [ ] Update company logo (public/images/logo.png)
- [ ] Update company name
- [ ] Update company slogan
- [ ] Update contact phone
- [ ] Update contact email
- [ ] Update social media handles
- [ ] Verify primary color (#3E2882)
- [ ] Verify accent color (#DA7E01)
- [ ] Test with sample data
- [ ] Test PDF download
- [ ] Test email export
- [ ] Verify on different browsers

---

## ✨ CSS Classes Used

```
Tailwind Classes:
├── Layout:      flex, w-full, mx-auto, gap-X, space-Y
├── Display:     flex-col, flex-row, items-center, justify-between
├── Text:        text-center, text-left, text-right
├── Colors:      text-c-blue, text-c-orange, text-c-gray-text, bg-c-gray-100
├── Size:        p-X, m-X, w-X, h-X, max-w-[800px]
├── Effects:     border, border-b, border-gray-300, rounded, rounded-lg, shadow
├── Animation:   animate-pulse, hover:, disabled:
└── Print:       print:w-full

Custom Styles:
├── Inline:      style={{ fontSize, color, fontFamily, borderColor }}
├── Background:  backgroundColor for sections
├── Borders:     borderColor, borderBottom
└── Typography:  fontWeight, fontFamily, lineHeight
```

---

## 🚀 Performance Tips

```
✅ Do:
├── Use React.memo for components if re-rendering
├── Generate PDF asynchronously
├── Use Base64 for email attachments
├── Cache logo images
└── Validate data before rendering

❌ Don't:
├── Render multiple templates without virtualization
├── Generate PDF synchronously (blocks UI)
├── Load large images without compression
├── Validate in render function
└── Use console.log in production
```

---

## 🐛 Debugging Tips

```typescript
// Check data validity
const validation = validateTicketData(data);
console.log('Valid:', validation.valid);
console.log('Errors:', validation.errors);

// Check config
const configValid = validateTemplateConfig(config);
console.log('Config valid:', configValid);

// Check logo
const logoOk = await checkLogoAvailability(config.logo_url);
console.log('Logo available:', logoOk);

// Monitor PDF generation
const pdf = await getTicketPDFAsBase64(element, data);
console.log('PDF size:', pdf.length, 'bytes');
console.log('PDF sample:', pdf.substring(0, 50));
```

---

**Last Updated:** December 2, 2025  
**Version:** 1.0.0

Ready to customize and deploy! 🎉
