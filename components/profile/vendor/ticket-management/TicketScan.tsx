"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { axiosUser } from "@/lib/services";
import { iTicketVerificationHistory } from "@/lib/interfaces/iTicketManagement";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { eAlertType } from "@/lib/enums/eAlert";
import { formatDateIndonesia } from "@/lib/dateFormatIndonesia";
import { Camera, RotateCcw } from "lucide-react";
import Skeleton from "@/components/Skeleton";
import jsQR from "jsqr";

export const TicketScan: React.FC = () => {
	const { data: session } = useSession();
	const { toast } = useToast();
	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [isCameraActive, setIsCameraActive] = useState(false);
	const [scannedTicket, setScannedTicket] = useState<any>(null);
	const [isVerifying, setIsVerifying] = useState(false);
	const [verificationHistory, setVerificationHistory] = useState<
		iTicketVerificationHistory[]
	>([]);
	const scanFrameRef = useRef<number | null>(null);

	// Fetch verification history
	const getVerificationHistory = async () => {
		if (!session?.jwt) return [];
		try {
			// TODO: This endpoint is speculative and needs to be implemented in the backend.
			const response = await axiosUser(
				"GET",
				"/api/transactions/verification-history",
				session.jwt
			);
			return response?.data || [];
		} catch (error) {
			console.error("Error fetching verification history:", error);
			return [];
		}
	};

	const historyQuery = useQuery({
		queryKey: ["transactionVerificationHistory", session?.jwt],
		queryFn: getVerificationHistory,
		enabled: !!session?.jwt,
		staleTime: 2 * 60 * 1000,
		refetchInterval: 3 * 60 * 1000, // Auto refresh setiap 3 menit
	});

	// Inisialisasi camera
	const startCamera = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: "environment" },
			});
			if (videoRef.current) {
				videoRef.current.srcObject = stream;
				setIsCameraActive(true);
				// Start continuous QR scanning
				scanQRContinuous();
			}
		} catch (error) {
			console.error("Error accessing camera:", error);
			toast({
				title: "Error",
				description: "Tidak dapat mengakses kamera. Pastikan Anda telah memberikan izin.",
				className: eAlertType.FAILED,
			});
		}
	};

	// Continuous QR code scanning
	const scanQRContinuous = () => {
		if (!videoRef.current || !canvasRef.current) return;
		
		const canvas = canvasRef.current;
		const video = videoRef.current;
		const context = canvas.getContext("2d");
		
		if (!context) return;
		
		const scan = () => {
			if (!isCameraActive || video.readyState !== video.HAVE_ENOUGH_DATA) {
				scanFrameRef.current = requestAnimationFrame(scan);
				return;
			}
			
			canvas.width = video.videoWidth;
			canvas.height = video.videoHeight;
			context.drawImage(video, 0, 0, canvas.width, canvas.height);
			
			try {
				const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
				const qrCode = jsQR(imageData.data, imageData.width, imageData.height);
				
				if (qrCode) {
					// QR code detected
					const uniqueToken = qrCode.data;
					handleQRDetected(uniqueToken);
				}
			} catch (err) {
				console.warn("QR scan error:", err);
			}
			
			scanFrameRef.current = requestAnimationFrame(scan);
		};
		
		scanFrameRef.current = requestAnimationFrame(scan);
	};

	// Handle detected QR code
	const handleQRDetected = async (uniqueToken: string) => {
		try {
			// TODO: This endpoint is speculative and needs to be implemented in the backend.
			// The response should contain recipient and ticket details.
			const response = await axiosUser(
				"POST",
				"/api/transactions/scan",
				session?.jwt || "",
				{
					encodedToken: uniqueToken,
				}
			);

			if (response?.data) {
				setScannedTicket(response.data);
				toast({
					title: "QR Terdeteksi",
					description: `Tiket ${response.data.ticket_code} siap untuk diverifikasi`,
					className: eAlertType.SUCCESS,
				});
			}
		} catch (error) {
			console.error("Error scanning QR code:", error);
			// Optionally, add a toast for scan failure
		}
	};

	// Stop camera
	const stopCamera = () => {
		if (videoRef.current?.srcObject) {
			const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
			tracks.forEach((track) => track.stop());
		}
		if (scanFrameRef.current) {
			cancelAnimationFrame(scanFrameRef.current);
			scanFrameRef.current = null;
		}
		setIsCameraActive(false);
		setScannedTicket(null);
	};

	// Verifikasi tiket
	const verifyTicket = async () => {
		if (!scannedTicket?.id) return;

		setIsVerifying(true);
		try {
			// TODO: This endpoint is speculative and needs to be implemented in the backend.
			// It should handle the verification of a specific recipient/ticket within a transaction.
			const response = await axiosUser(
				"POST",
				`/api/transactions/verify`,
				session?.jwt || "",
				{ 
					// The new endpoint should accept the unique identifier for the recipient/ticket
					recipientId: scannedTicket.id 
				}
			);

			if (response?.success) {
				toast({
					title: "Sukses",
					description: "Tiket berhasil diverifikasi!",
					className: eAlertType.SUCCESS,
				});
				setScannedTicket(null);
				historyQuery.refetch();
			}
		} catch (error: any) {
			console.error("Error verifying ticket:", error);
			toast({
				title: "Error",
				description: error?.response?.data?.message || "Gagal memverifikasi tiket",
				className: eAlertType.FAILED,
			});
		} finally {
			setIsVerifying(false);
		}
	};

	if (historyQuery.isLoading) {
		return (
			<div className="space-y-4">
				<Skeleton width="100%" height="100px" />
				<Skeleton width="100%" height="300px" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Camera Section */}
			<div className="bg-white rounded-lg border border-gray-200 p-4">
				<h3 className="text-lg font-semibold mb-4">Scan Tiket</h3>

				{!isCameraActive ? (
					<Button
						onClick={startCamera}
						className="w-full flex items-center justify-center gap-2"
					>
						<Camera className="w-4 h-4" />
						Buka Kamera
					</Button>
				) : (
					<div className="space-y-4">
						<div className="bg-black rounded-lg overflow-hidden aspect-video flex items-center justify-center relative">
							<video
								ref={videoRef}
								autoPlay
								playsInline
								muted
								className="w-full h-full object-cover"
								style={{ transform: 'rotateY(0deg)' }}
							/>
							<canvas ref={canvasRef} className="hidden" />
							
							{/* Overlay targeting reticle */}
							<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
								<div className="w-48 h-48 border-2 border-red-500 rounded-lg"></div>
								<div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-red-500/10"></div>
							</div>
							
							{/* Scanning status text */}
							<div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-60 text-white px-3 py-2 rounded-lg text-center">
								<p className="text-sm font-semibold">Arahkan QR Code ke Kamera</p>
								<p className="text-xs text-gray-300">Scanning otomatis...</p>
							</div>
						</div>
						<Button
							onClick={stopCamera}
							variant="outline"
							className="w-full"
						>
							Tutup Kamera
						</Button>
					</div>
				)}
			</div>

			{/* Scanned Ticket Info */}
			{scannedTicket && (
				<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
					<h4 className="font-semibold text-blue-900">Data Tiket Terdeteksi</h4>
					<div className="grid grid-cols-2 gap-3 text-sm">
						<div>
							<p className="text-gray-600">Kode Tiket</p>
							<p className="font-mono font-semibold">{scannedTicket.ticket_code}</p>
						</div>
						<div>
							<p className="text-gray-600">Nama Penerima</p>
							<p className="font-semibold">{scannedTicket.recipient_name}</p>
						</div>
						<div>
							<p className="text-gray-600">Produk Tiket</p>
							<p className="font-semibold">{scannedTicket.product_title}</p>
						</div>
						<div>
							<p className="text-gray-600">Varian</p>
							<p className="font-semibold">{scannedTicket.variant_name}</p>
						</div>
						<div>
							<p className="text-gray-600">Email</p>
							<p className="text-blue-600">{scannedTicket.recipient_email}</p>
						</div>
						<div>
							<p className="text-gray-600">Status</p>
							<p className={`font-semibold ${
								scannedTicket.verification_status === "verified"
									? "text-green-600"
									: "text-red-600"
							}`}>
								{scannedTicket.verification_status === "verified"
									? "Terverifikasi"
									: "Belum Verifikasi"}
							</p>
						</div>
					</div>
					<div className="pt-3 flex gap-2">
						<Button
							onClick={verifyTicket}
							disabled={isVerifying}
							className="flex-1"
						>
							{isVerifying ? "Memverifikasi..." : "Verifikasi Tiket"}
						</Button>
						<Button
							onClick={() => setScannedTicket(null)}
							variant="outline"
							className="flex-1"
						>
							Batal
						</Button>
					</div>
				</div>
			)}

			{/* Verification History */}
			<div className="bg-white rounded-lg border border-gray-200 p-4">
				<h3 className="text-lg font-semibold mb-4">Riwayat Verifikasi Tiket</h3>
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="bg-gray-100 border-b border-gray-200">
								<th className="px-3 py-2 text-left font-semibold">Kode Tiket</th>
								<th className="px-3 py-2 text-left font-semibold">Nama Penerima</th>
								<th className="px-3 py-2 text-left font-semibold">Varian</th>
								<th className="px-3 py-2 text-left font-semibold">Waktu Verifikasi</th>
							</tr>
						</thead>
						<tbody>
						{historyQuery.data && historyQuery.data.length > 0 ? (
							historyQuery.data.map((item: any, idx: number) => (
								<tr
										key={idx}
										className="border-b border-gray-200 hover:bg-gray-50"
									>
										<td className="px-3 py-2 font-mono">{item.ticket_code}</td>
										<td className="px-3 py-2">{item.recipient_name}</td>
										<td className="px-3 py-2">{item.variant_name}</td>
										<td className="px-3 py-2">
											{formatDateIndonesia(`${item.verification_date}T${item.verification_time}`)} {item.verification_time}
										</td>
									</tr>
								))
							) : (
								<tr>
									<td colSpan={4} className="px-3 py-8 text-center text-gray-500">
										Belum ada riwayat verifikasi tiket
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};
