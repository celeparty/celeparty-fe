// components/ticket-templates/TicketTemplateFooter.tsx
import React from "react";

const TicketTemplateFooter: React.FC = () => {
	const currentYear = new Date().getFullYear();
	return (
		<div
			style={{
				padding: "20px",
				borderTop: "1px dashed #ccc",
				textAlign: "center",
				fontSize: "12px",
				color: "#666",
			}}
		>
			<p>Terima kasih telah membeli tiket di Celeparty!</p>
			<p>&copy; {currentYear} Celeparty. All rights reserved.</p>
		</div>
	);
};

export default TicketTemplateFooter;