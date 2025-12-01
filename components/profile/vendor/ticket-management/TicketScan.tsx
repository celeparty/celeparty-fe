"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { axiosUser } from "@/lib/services";
import { iTicketVerificationHistory } from "@/lib/interfaces/iTicketManagement";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { eAlertType } from "@/lib/enums/eAlert";
import { Camera, Square, RotateCcw } from "lucide-react";
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

	// Fetch verification history
	const getVerificationHistory = async () => {
		if (!session?.jwt) return [];
		try {
			const response = await axiosUser(
				"GET",
				"/api/tickets/verification-history",
				session.jwt
			);
			return response?.data || [];
		} catch (error) {
			console.error("Error fetching verification history:", error);
			return [];
		}
	};

	const historyQuery = useQuery({
		queryKey: ["verificationHistory", session?.jwt],
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

	// Stop camera
	const stopCamera = () => {
		if (videoRef.current?.srcObject) {
			const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
			tracks.forEach((track) => track.stop());
			setIsCameraActive(false);
			setScannedTicket(null);
		}
	};

	// Capture dan scan QR code
	const captureQRCode = async () => {
		if (!canvasRef.current || !videoRef.current) return;

		const context = canvasRef.current.getContext("2d");
		if (!context) return;

		canvasRef.current.width = videoRef.current.videoWidth;
		canvasRef.current.height = videoRef.current.videoHeight;
		context.drawImage(videoRef.current, 0, 0);

		// TODO: Integrate dengan QR code scanner library (misal: jsQR atau zxing)
		// Untuk saat ini, kami menggunakan simulasi
		const imageData = context.getImageData(
                  0,
                  0,
                  canvasRef.current.width,
                  canvasRef.current.height
                );
                const qrCode = jsQR(imageData.data, imageData.width, imageData.height);

                if (qrCode) {
                  const uniqueToken = qrCode.data; // atau parse dari JSON
                  // Send to API
                }

		try {
			// Simulasi scan QR code - ganti dengan actual QR scanner logic
			toast({
				title: "Scan Berhasil",
				description: "QR code telah terbaca. Tunggu data tiket dimuat...",
				className: eAlertType.SUCCESS,
			});

			// Fetch ticket data berdasarkan QR code
			const response = await axiosUser(
				"POST",
				"/api/tickets/scan",
				session?.jwt || "",
				{
					// qr_data: decryptedData // dari hasil scan QR
				}
			);

			if (response?.data) {
				setScannedTicket(response.data);
			}
		} catch (error) {
			console.error("Error scanning QR code:", error);
			toast({
				title: "Error",
				description: "Gagal membaca QR code. Silakan coba lagi.",
				className: eAlertType.FAILED,
			});
		}
	};

	// Verifikasi tiket
	const verifyTicket = async () => {
		if (!scannedTicket) return;

		setIsVerifying(true);
		try {
			const response = await axiosUser(
				"POST",
				`/api/tickets/${scannedTicket.id}/verify`,
				session?.jwt || "",
				{}
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
						<video
							ref={videoRef}
							autoPlay
							playsInline
							className="w-full rounded-lg border border-gray-300"
						/>
						<canvas ref={canvasRef} className="hidden" />
						<div className="flex gap-2">
							<Button
								onClick={captureQRCode}
								variant="default"
								className="flex-1 flex items-center justify-center gap-2"
							>
								<Square className="w-4 h-4" />
								Capture QR Code
							</Button>
							<Button
								onClick={stopCamera}
								variant="outline"
								className="flex-1"
							>
								Tutup Kamera
							</Button>
						</div>
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
											{new Date(
												`${item.verification_date}T${item.verification_time}`
											).toLocaleString("id-ID")}
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
