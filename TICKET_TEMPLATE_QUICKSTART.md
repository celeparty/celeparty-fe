# 🎫 Ticket Template - Quick Start Guide

**Status:** ✅ Ready to Use  
**Last Updated:** December 2, 2025

---

## ⚡ 5-Minute Setup

### 1. Import Komponen

```typescript
import { TicketTemplate } from '@/components/ticket-templates';
import { getDefaultTemplateConfig } from '@/lib/utils/ticket-template';
```

### 2. Siapkan Data Tiket

```typescript
const ticketData = {
	product_title: 'Concert 2024',
	ticket_code: 'TKT-20241215-001',
	variant_name: 'VIP',
	recipient_name: 'John Doe',
	recipient_email: 'john@example.com',
	recipient_phone: '+62 812-3456-7890',
	qr_code_data: 'TKT-20241215-001',
	generated_date: new Date(),
};
```

### 3. Render Template

```typescript
const config = getDefaultTemplateConfig();

<TicketTemplate data={ticketData} config={config} />
```

---

## 🎨 Minimal Example

```typescript
'use client';

import { TicketTemplate, iTicketTemplateData } from '@/components/ticket-templates';
import { getDefaultTemplateConfig } from '@/lib/utils/ticket-template';

export default function MyTicketPage() {
	const ticketData: iTicketTemplateData = {
		product_title: 'My Event',
		ticket_code: 'TKT-001',
		variant_name: 'Standard',
		recipient_name: 'Guest Name',
		recipient_email: 'guest@example.com',
		recipient_phone: '081234567890',
		qr_code_data: 'TKT-001',
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

---

## 📥 Download PDF

```typescript
import { downloadTicketPDF } from '@/lib/utils/ticket-template';

const ticketRef = useRef<HTMLDivElement>(null);

const handleDownload = async () => {
	if (ticketRef.current) {
		await downloadTicketPDF(
			ticketRef.current,
			ticketData,
			'my-ticket.pdf'
		);
	}
};

return (
	<>
		<div ref={ticketRef}>
			<TicketTemplate data={ticketData} config={config} />
		</div>
		<button onClick={handleDownload}>Download</button>
	</>
);
```

---

## 📧 Siapkan untuk Email

```typescript
import { getTicketPDFAsBase64 } from '@/lib/utils/ticket-template';

const handleEmail = async () => {
	if (ticketRef.current) {
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
			}),
		});
	}
};
```

---

## 🎯 Common Tasks

### Format API Response

```typescript
import { formatTicketDataFromAPI } from '@/lib/utils/ticket-template';

const ticketData = formatTicketDataFromAPI(apiResponse);
```

### Validasi Data

```typescript
import { validateTicketData } from '@/lib/utils/ticket-template';

const validation = validateTicketData(ticketData);
if (!validation.valid) {
	console.error(validation.errors);
}
```

### Customized Config

```typescript
import { mergeTemplateConfig } from '@/lib/utils/ticket-template';

const config = mergeTemplateConfig({
	primary_color: '#FF0000',
	company_name: 'My Company',
	company_slogan: 'My Slogan',
});
```

### Preview dengan Actions

```typescript
import { TicketPreview } from '@/components/ticket-templates';

<TicketPreview
	ticketData={ticketData}
	templateConfig={config}
	onDownload={(filename) => console.log('Downloaded:', filename)}
	onEmail={(pdfBase64) => console.log('Ready to email')}
	showActions={true}
/>
```

---

## 🔍 Component Structure

```
TicketTemplate (Main)
├── TicketTemplateHeader
│   ├── Logo
│   ├── Company Name
│   └── Slogan
├── TicketTemplateBody
│   ├── Product Info (name, code, variant, date, location)
│   ├── Recipient Info (name, email, phone, identity)
│   └── Description
├── TicketTemplateQRCode
│   └── Generated QR Code (Primary Color)
└── TicketTemplateFooter
    ├── Primary Color Line
    ├── Generated Date (Left)
    └── Contact & Social (Right)
```

---

## 📋 Data Fields Reference

| Field | Type | Required | Example |
|-------|------|----------|---------|
| `product_title` | string | ✅ | "Concert 2024" |
| `ticket_code` | string | ✅ | "TKT-001" |
| `variant_name` | string | ✅ | "VIP" |
| `recipient_name` | string | ✅ | "John Doe" |
| `recipient_email` | string | ✅ | "john@example.com" |
| `recipient_phone` | string | ✅ | "+62 812-3456-7890" |
| `qr_code_data` | string | ✅ | "TKT-001" |
| `generated_date` | Date | ✅ | new Date() |
| `product_description` | string | ❌ | "Event description" |
| `event_date` | string | ❌ | "2024-12-15" |
| `event_location` | string | ❌ | "Jakarta" |
| `recipient_identity_type` | string | ❌ | "KTP" |
| `recipient_identity_number` | string | ❌ | "327..." |

---

## 🎨 Customization

### Change Colors

```typescript
const config = mergeTemplateConfig({
	primary_color: '#FF0000',
	accent_color: '#00FF00',
	text_color: '#333333',
});
```

### Change Company Info

```typescript
const config = mergeTemplateConfig({
	logo_url: 'https://example.com/logo.png',
	company_name: 'My Event Company',
	company_slogan: 'Amazing Events',
	company_phone: '+62 812-999-9999',
	company_email: 'info@example.com',
});
```

### Change Social Media

```typescript
const config = mergeTemplateConfig({
	contact_info: {
		phone: '+62 812-999-9999',
		email: 'info@example.com',
		instagram: 'myevent',
		tiktok: 'myevent',
		whatsapp: '628129999999',
		facebook: 'myevent',
	},
});
```

### Hide Elements

```typescript
const config = mergeTemplateConfig({
	show_qr_code: false,        // Hide QR code
	show_footer_line: false,     // Hide line
	show_social_media: false,    // Hide social
});
```

---

## 📦 File Locations

```
components/ticket-templates/
├── TicketTemplate.tsx              ← Main component
├── TicketTemplateHeader.tsx        ← Header section
├── TicketTemplateBody.tsx          ← Body section
├── TicketTemplateQRCode.tsx        ← QR code
├── TicketTemplateFooter.tsx        ← Footer section
├── TicketPreview.tsx               ← Preview with actions
├── TicketTemplateDemo.tsx          ← Demo page
├── interfaces.ts                   ← Type definitions
└── index.ts                        ← Exports

lib/utils/ticket-template/
├── pdfGenerator.ts                 ← PDF utilities
├── configTemplate.ts               ← Config helpers
├── helpers.ts                      ← Helper functions
└── index.ts                        ← Exports
```

---

## 🚀 Next Steps

1. **Create Page** - Buat page untuk preview tiket
2. **Add to Ticket Flow** - Integrasikan dengan tiket creation
3. **Test PDF** - Test download dan email
4. **Deploy** - Deploy ke production

---

## 💡 Tips & Tricks

### Untuk Testing

```typescript
import { generateSampleTicketData } from '@/lib/utils/ticket-template';

const sampleData = generateSampleTicketData();
<TicketTemplate data={sampleData} config={config} />
```

### Untuk Debugging

```typescript
// Validate data
const { valid, errors } = validateTicketData(ticketData);
console.log('Is valid:', valid, 'Errors:', errors);

// Check logo
const logoOk = await checkLogoAvailability(config.logo_url);
console.log('Logo available:', logoOk);
```

### Untuk Multiple Tickets

```typescript
const pdfs = await generateMultipleTicketPDFs(
	elements,
	ticketsDataArray,
	{ scale: 2, quality: 100 }
);
```

---

## 🐛 Common Issues

### QR Code not showing?
- Pastikan `qr_code_data` tidak kosong
- Check console untuk error messages

### PDF download tidak bekerja?
- Pastikan element reference valid
- Check browser console untuk error
- Gunakan `getTicketPDFAsBase64` sebagai alternative

### Logo tidak muncul?
- Pastikan logo path benar
- Check network tab di DevTools
- Fallback ke tanpa logo jika perlu

### Styling tidak sesuai?
- Clear browser cache (Ctrl+Shift+Delete)
- Check Tailwind CSS classes
- Verify primary color hex value

---

## 📚 Learn More

- Full Documentation: `TICKET_TEMPLATE_DOCUMENTATION.md`
- Demo Component: `TicketTemplateDemo.tsx`
- API Examples: `lib/utils/ticket-template/`

---

**Ready to use! 🎉**
