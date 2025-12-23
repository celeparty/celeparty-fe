// components/ticket-templates/TicketTemplate.tsx
import React from "react";
import { TicketData } from "./interfaces";
import TicketTemplateHeader from "./TicketTemplateHeader";
import TicketTemplateBody from "./TicketTemplateBody";
import TicketTemplateFooter from "./TicketTemplateFooter";

interface Props {
	ticket: TicketData;
	config: iTicketTemplateConfig;
}

const TicketTemplate: React.FC<Props> = ({ ticket }) => {
	return (
		<div
			style={{
				width: "780px",
				margin: "auto",
				border: "1px solid #ddd",
				borderRadius: "15px",
				fontFamily: "Arial, sans-serif",
				boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
				backgroundColor: "white",
			}}
		>
			<TicketTemplateHeader ticket={ticket} />
			<TicketTemplateBody ticket={ticket} />
			<TicketTemplateFooter />
		</div>
	);
};

export default TicketTemplate;
