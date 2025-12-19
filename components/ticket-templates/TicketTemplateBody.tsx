// components/ticket-templates/TicketTemplateBody.tsx
import React from "react";
import { TicketData } from "./interfaces";
import TicketTemplateQRCode from "./TicketTemplateQRCode";

interface Props {
	ticket: TicketData;
}

const TicketTemplateBody: React.FC<Props> = ({ ticket }) => {
	const eventDate = new Date(ticket.ticket_product.attributes.date).toLocaleDateString("id-ID", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	return (
		<div style={{ display: "flex", padding: "20px" }}>
			<div style={{ flex: 2, paddingRight: "20px" }}>
				<h2 style={{ fontSize: "18px", marginTop: 0 }}>{ticket.ticket_product.attributes.name}</h2>
				<p>
					<strong>Tanggal:</strong> {eventDate}
				</p>
				<p>
					<strong>Lokasi:</strong> {ticket.ticket_product.attributes.location}
				</p>
				<hr style={{ border: "none", borderTop: "1px solid #eee", margin: "20px 0" }} />
				<h3 style={{ fontSize: "16px" }}>Data Pemegang Tiket</h3>
				<p>
					<strong>Nama:</strong> {ticket.recipient_name}
				</p>
				<p>
					<strong>Email:</strong> {ticket.recipient_email}
				</p>
				{ticket.id_type && ticket.id_number && (
					<p>
						<strong>Identitas:</strong> {ticket.id_type} - {ticket.id_number}
					</p>
				)}
				<hr style={{ border: "none", borderTop: "1px solid #eee", margin: "20px 0" }} />
				<h3 style={{ fontSize: "16px" }}>Detail Transaksi</h3>
				<p>
					<strong>Order ID:</strong> {ticket.transaction_ticket.attributes.order_id}
				</p>
				<p>
					<strong>Kode Tiket:</strong>{" "}
					<span style={{ fontWeight: "bold", fontSize: "18px" }}>{ticket.ticket_code}</span>
				</p>
			</div>
			<div style={{ flex: 1, textAlign: "center", alignSelf: "center" }}>
				<TicketTemplateQRCode url={ticket.barcode_url} />
				<p style={{ fontSize: "12px", marginTop: "10px" }}>Pindai untuk Verifikasi</p>
			</div>
		</div>
	);
};

export default TicketTemplateBody;