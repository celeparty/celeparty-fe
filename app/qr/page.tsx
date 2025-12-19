"use client";
import { axiosUser } from "@/lib/services";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import React, { useState, useEffect, Suspense, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function getEventStatus(eventDate: string): { active: boolean; label: string } {
	try {
		const event = new Date(eventDate);
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		// Don't reset event time, to allow for same-day events
		return today <= event ? { active: true, label: "Active" } : { active: false, label: "Expired" };
	} catch (error) {
		return { active: false, label: "Invalid Date" };
	}
}

function QRPageContent() {
	const params = useSearchParams();
	const router = useRouter();
	const { data: session } = useSession();
	const ticketCodeFromUrl = params.get("code");

	const [notif, setNotif] = useState<{ message: string; type: "error" | "success" } | null>(null);
	const [loading, setLoading] = useState(false);
	const [ticketDetail, setTicketDetail] = useState<any>(null);
	const [canVerify, setCanVerify] = useState(false);
	const [userData, setUserData] = useState<any>(null);
	const [vendorMatch, setVendorMatch] = useState<boolean | null>(null);
	const [isChecking, setIsChecking] = useState(true);
	const [manualCode, setManualCode] = useState("");

	const isLoggedIn = !!session;

	useEffect(() => {
		const getUserData = async () => {
			if (isLoggedIn && session?.jwt) {
				try {
					const userResponse = await axiosUser("GET", "/api/users/me?populate=role", session.jwt);
					setUserData(userResponse);
				} catch (error) {
					console.error("Error fetching user data:", error);
				}
			} else {
				setIsChecking(false);
			}
		};
		getUserData();
	}, [isLoggedIn, session?.jwt]);

	const checkTicket = useCallback(async (code: string) => {
		if (!isLoggedIn || !userData || userData?.role?.type !== "vendor") {
			setCanVerify(false);
			setIsChecking(false);
			if (isLoggedIn) {
				setNotif({ message: "Hanya akun vendor yang dapat melakukan verifikasi.", type: "error" });
			}
			return;
		}

		setIsChecking(true);
		setNotif(null);
		setTicketDetail(null);
		setVendorMatch(null);
		setCanVerify(false);

		try {
			const res = await fetch(`/api/qr-verify?code=${code}`);
			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.error || "Gagal mengambil data tiket.");
			}

			const detail = data.data.attributes;
			setTicketDetail(data.data);

			const eventStatus = getEventStatus(detail.ticket_product.data.attributes.date);
			const ticketVendorId = detail.ticket_product.data.attributes.vendor?.data?.id;
			const currentUserId = userData?.id;

			const isVendorMatch = ticketVendorId && currentUserId && ticketVendorId === currentUserId;
			setVendorMatch(isVendorMatch);

			if (isVendorMatch && eventStatus.active && !detail.is_verified) {
				setCanVerify(true);
			} else {
				setCanVerify(false);
				if (!isVendorMatch) {
					setNotif({ message: "Anda bukan vendor untuk tiket ini.", type: "error" });
				} else if (!eventStatus.active) {
					setNotif({ message: "Tiket ini sudah kedaluwarsa.", type: "error" });
				} else if (detail.is_verified) {
					setNotif({ message: "Tiket ini sudah pernah diverifikasi.", type: "success" });
				}
			}
		} catch (error: any) {
			setNotif({ message: error.message, type: "error" });
			setCanVerify(false);
			setVendorMatch(null);
		} finally {
			setIsChecking(false);
		}
	}, [isLoggedIn, userData]);

	useEffect(() => {
		if (ticketCodeFromUrl && userData) {
			checkTicket(ticketCodeFromUrl);
		} else if (!ticketCodeFromUrl) {
			setIsChecking(false);
		}
	}, [ticketCodeFromUrl, userData, checkTicket]);

	const handleVerify = async () => {
		if (!canVerify || !ticketDetail) {
			setNotif({ message: "Tidak dapat melakukan verifikasi.", type: "error" });
			return;
		}

		const isConfirmed = window.confirm(
			`Anda akan memverifikasi tiket dengan kode: ${ticketDetail.attributes.ticket_code}\n\nLanjutkan?`,
		);

		if (!isConfirmed) return;

		setLoading(true);
		setNotif(null);

		try {
			const res = await fetch(`/api/ticket-verify`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ ticket_code: ticketDetail.attributes.ticket_code }),
			});

			const data = await res.json();
			if (!res.ok) throw new Error(data.message || "Gagal verifikasi tiket.");

			setNotif({ message: "Tiket berhasil diverifikasi!", type: "success" });
			setCanVerify(false);
			// Re-fetch ticket data to show updated status
			checkTicket(ticketDetail.attributes.ticket_code);
		} catch (err: any) {
			setNotif({ message: err.message, type: "error" });
		} finally {
			setLoading(false);
		}
	};

	const handleManualSearch = () => {
		if (manualCode.trim()) {
			router.push(`/qr?code=${manualCode.trim()}`);
		}
	};

	const renderTicketDetails = () => {
		if (!ticketDetail) return null;
		const { attributes: ticket } = ticketDetail;
		const { attributes: product } = ticket.ticket_product.data;
		const eventStatus = getEventStatus(product.date);

		return (
			<CardContent className="mt-6 space-y-3">
				<div>
					<p className="font-bold text-lg">{product.name}</p>
					<p className="text-sm text-gray-600">{product.location}</p>
				</div>
				<hr />
				<div className="grid grid-cols-2 gap-x-4 gap-y-2">
					<div>
						<p className="text-xs text-gray-500">Kode Tiket</p>
						<p className="font-mono font-bold">{ticket.ticket_code}</p>
					</div>
					<div>
						<p className="text-xs text-gray-500">Tanggal Acara</p>
						<p>{new Date(product.date).toLocaleDateString("id-ID", { dateStyle: "full" })}</p>
					</div>
					<div>
						<p className="text-xs text-gray-500">Pemegang Tiket</p>
						<p>{ticket.recipient_name}</p>
					</div>
					<div>
						<p className="text-xs text-gray-500">Email</p>
						<p>{ticket.recipient_email}</p>
					</div>
				</div>
				<div className="flex justify-between items-center pt-4">
					<Badge variant={eventStatus.active ? "secondary" : "destructive"}>{eventStatus.label}</Badge>
					<Badge variant={ticket.is_verified ? "default" : "outline"}>
						{ticket.is_verified ? "Sudah Diverifikasi" : "Belum Diverifikasi"}
					</Badge>
				</div>
			</CardContent>
		);
	};

	return (
		<div className="max-w-2xl mx-auto my-10 p-4">
			<Card>
				<CardHeader>
					<CardTitle className="text-center text-2xl">Verifikasi E-Ticket</CardTitle>
				</CardHeader>
				<CardContent>
					{!session ? (
						<div className="text-center text-red-600 font-semibold py-8">
							Silahkan login sebagai vendor untuk menggunakan halaman ini.
						</div>
					) : (
						<>
							<div className="flex w-full max-w-sm items-center space-x-2 mx-auto">
								<Input
									type="text"
									placeholder="Masukkan kode tiket..."
									value={manualCode}
									onChange={(e) => setManualCode(e.target.value)}
									onKeyUp={(e) => e.key === "Enter" && handleManualSearch()}
								/>
								<Button type="button" onClick={handleManualSearch}>
									Cari Tiket
								</Button>
							</div>

							{isChecking && (
								<div className="text-center text-gray-600 mt-6">
									<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
									<div>Memeriksa tiket...</div>
								</div>
							)}

							{notif && (
								<div
									className={`mt-4 text-center text-sm font-semibold p-3 rounded-md ${
										notif.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
									}`}
								>
									{notif.message}
								</div>
							)}

							{ticketDetail && vendorMatch && renderTicketDetails()}
							{ticketDetail && vendorMatch === false && !isChecking && (
								<div className="mt-6 text-center text-red-700 font-bold bg-red-100 p-4 rounded-md">
									Anda tidak memiliki akses untuk memverifikasi tiket ini.
								</div>
							)}
						</>
					)}
				</CardContent>

				{canVerify && !ticketDetail?.attributes.is_verified && (
					<div className="p-6 text-center border-t">
						<Button onClick={handleVerify} disabled={loading} size="lg">
							{loading ? "Memverifikasi..." : "Konfirmasi & Verifikasi Tiket"}
						</Button>
					</div>
				)}
			</Card>
		</div>
	);
}

export default function QRPage() {
	return (
		<Suspense
			fallback={
				<div className="max-w-lg mx-auto my-16 p-6 text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					Memuat Halaman Verifikasi...
				</div>
			}
		>
			<QRPageContent />
		</Suspense>
	);
}
