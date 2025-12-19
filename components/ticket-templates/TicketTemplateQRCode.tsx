// components/ticket-templates/TicketTemplateQRCode.tsx
"use client";
import React, { useEffect, useRef } from "react";
import QRCode from "qrcode";

interface Props {
	url: string;
}

const TicketTemplateQRCode: React.FC<Props> = ({ url }) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		if (canvasRef.current && url) {
			QRCode.toCanvas(canvasRef.current, url, {
				width: 180,
				margin: 2,
				errorCorrectionLevel: "H",
				color: {
					dark: "#000000",
					light: "#FFFFFF",
				},
			});
		}
	}, [url]);

	return <canvas ref={canvasRef} />;
};

export default TicketTemplateQRCode;