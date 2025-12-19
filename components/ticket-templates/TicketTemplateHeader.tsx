// components/ticket-templates/TicketTemplateHeader.tsx
import React from "react";
import { TicketData } from "./interfaces";

interface Props {
	ticket: TicketData;
}

const TicketTemplateHeader: React.FC<Props> = ({ ticket }) => {
	const eventName = ticket.ticket_product.attributes.name;

	return (
		<div
			style={{
				padding: "20px",
				borderBottom: "1px dashed #ccc",
				textAlign: "center",
			}}
		>
			<h1 style={{ fontSize: "24px", margin: 0 }}>{eventName}</h1>
			<p style={{ fontSize: "16px", margin: "5px 0 0" }}>E-Ticket</p>
		</div>
	);
};

export default TicketTemplateHeader;