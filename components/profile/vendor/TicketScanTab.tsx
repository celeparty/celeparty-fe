"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { axiosUser } from "@/lib/services";
import { useMutation, useQuery } from "@tanstack/react-query";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
import { Camera, CheckCircle, XCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import Skeleton from "@/components/Skeleton";
import ErrorNetwork from "@/components/ErrorNetwork";

interface iVerificationHistory {
  id: number;
  ticket_code: string;
  customer_name: string;
  verified_at: string;
  event_name: string;
}

interface iTicketDetail {
  id: number;
  customer_name: string;
  customer_email: string;
  variant: string;
  verification: boolean;
  createdAt: string;
  product_name: string;
  total_price: number;
  payment_status: string;
  unique_token: string;
}

const TicketScanTab: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [scanResult, setScanResult] = useState<string>("");
  const [ticketDetail, setTicketDetail] = useState<iTicketDetail | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useRef<BrowserMultiFormatReader>(new BrowserMultiFormatReader());

  // Fetch verification history
  const getVerificationHistory = async () => {
    const response = await axiosUser(
      "GET",
      `/api/transaction-tickets?filters[verification][$eq]=true&sort=updatedAt:desc`,
      undefined,
    );
    return response;
  };

  const query = useQuery({
    queryKey: ["verificationHistory"],
    queryFn: getVerificationHistory,
  });

  // Mutation to get ticket detail by unique token
  const getTicketDetail = useMutation({
    mutationFn: async (uniqueToken: string) => {
      const response = await axiosUser(
        "GET",
        `/api/transaction-tickets?filters[unique_token][$eq]=${uniqueToken}&populate=*`,
        undefined,
      );
      return response;
    },
    onSuccess: (data) => {
      if (data?.data?.length > 0) {
        setTicketDetail(data.data[0]);
        setShowDetailDialog(true);
      } else {
        toast.error("Tiket tidak ditemukan");
      }
    },
    onError: () => {
      toast.error("Gagal mengambil detail tiket");
    },
  });

  // Mutation to verify ticket by ticket code
  const verifyTicketMutation = useMutation({
    mutationFn: async (ticketCode: string) => {
      const response = await axiosUser("PUT", `/api/qr-verify`, undefined, { ticket_code: ticketCode });
      return response;
    },
    onSuccess: () => {
      toast.success("Tiket berhasil diverifikasi!");
      query.refetch();
      setScanResult("");
      setTicketDetail(null);
      setShowDetailDialog(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error?.message || "Gagal memverifikasi tiket");
    },
  });

  const startScanning = useCallback(async () => {
    try {
      // Check if camera is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error("Kamera tidak didukung di browser ini");
        return;
      }

      // Request camera access with specific constraints
      const constraints = {
        video: {
          facingMode: "environment", // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsScanning(true);

        // Reset any previous scanning
        if (codeReader.current) {
          codeReader.current.reset();
        }

        codeReader.current.decodeFromVideoDevice(null, videoRef.current, (result, err) => {
          if (result) {
            const scannedText = result.getText();
            console.log("QR Code detected:", scannedText);
            setScanResult(scannedText);
            getTicketDetail.mutate(scannedText);
            stopScanning();
          }
          if (err && !(err instanceof NotFoundException)) {
            console.error("Scanning error:", err);
            // Don't show error for NotFoundException as it's normal when no QR code is visible
          }
        });
      }
    } catch (error: any) {
      console.error("Camera error:", error);
      if (error.name === "NotAllowedError") {
        toast.error("Akses kamera ditolak. Harap izinkan akses kamera.");
      } else if (error.name === "NotFoundError") {
        toast.error("Tidak ada kamera yang ditemukan.");
      } else if (error.name === "NotReadableError") {
        toast.error("Kamera sedang digunakan oleh aplikasi lain.");
      } else {
        toast.error("Gagal mengakses kamera. Silakan coba lagi.");
      }
    }
  }, []);

  const stopScanning = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
    setIsInitializing(false);
    if (codeReader.current) {
      codeReader.current.reset();
    }
  }, []);

  useEffect(() => {
    return () => {
      if (codeReader.current) {
        codeReader.current.reset();
      }
    };
  }, []);

  const handleVerify = () => {
    if (scanResult) {
      verifyTicketMutation.mutate(scanResult);
    }
  };

  if (query.isLoading) {
    return <Skeleton width="100%" height="200px" />;
  }

  if (query.isError) {
    return <ErrorNetwork style="mt-0" />;
  }

  const historyData: iVerificationHistory[] = query?.data?.data || [];

  return (
    <div>
      <h5 className="font-bold text-lg mb-4">Scan Tiket</h5>

      {/* Scan Section */}
      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <div className="text-center mb-4">
          <Button
            onClick={isScanning ? stopScanning : startScanning}
            disabled={isInitializing}
            className="flex items-center gap-2 mx-auto"
          >
            <Camera className="h-5 w-5" />
            {isInitializing ? "Memuat Kamera..." : isScanning ? "Stop Scan" : "Mulai Scan"}
          </Button>
        </div>

        {isScanning && (
          <div className="text-center mb-4">
            <video ref={videoRef} autoPlay playsInline className="border rounded-lg mx-auto max-w-sm" />
            <p className="mt-2 text-sm text-gray-600">Kamera aktif - Arahkan ke QR code tiket</p>
          </div>
        )}

        {scanResult && (
          <div className="bg-white p-4 rounded-lg border">
            <p className="font-semibold mb-2">Hasil Scan:</p>
            <p className="text-lg font-mono bg-gray-100 p-2 rounded">{scanResult}</p>
            <div className="mt-4 flex gap-2">
              <Button onClick={handleVerify} disabled={verifyTicketMutation.isPending}>
                {verifyTicketMutation.isPending ? "Memverifikasi..." : "Verifikasi Tiket"}
              </Button>
              <Button variant="outline" onClick={() => setScanResult("")}>
                Scan Ulang
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Ticket Detail Dialog */}
      {showDetailDialog && ticketDetail && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 max-w-md mx-auto">
          <h6 className="font-semibold mb-4">Detail Tiket</h6>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Nama Customer</p>
              <p>{ticketDetail.customer_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p>{ticketDetail.customer_email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Varian</p>
              <p>{ticketDetail.variant}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Status Pembayaran</p>
              <p>{ticketDetail.payment_status}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Harga</p>
              <p>Rp {ticketDetail.total_price.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Tanggal Pembelian</p>
              <p>{new Date(ticketDetail.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <p className="text-sm font-medium text-gray-500">Status Verifikasi:</p>
            {ticketDetail.verification ? (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Sudah Diverifikasi</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-600">
                <XCircle className="h-4 w-4" />
                <span>Belum Diverifikasi</span>
              </div>
            )}
          </div>
          {!ticketDetail.verification && (
            <Button onClick={handleVerify} disabled={verifyTicketMutation.isPending} className="w-full mb-2">
              {verifyTicketMutation.isPending ? "Memverifikasi..." : "Verifikasi Tiket"}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => {
              setShowDetailDialog(false);
              setScanResult("");
              setTicketDetail(null);
            }}
            className="w-full"
          >
            Tutup
          </Button>
        </div>
      )}

      {/* History Table */}
      <div>
        <h6 className="font-semibold mb-4">Riwayat Verifikasi</h6>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kode Tiket</TableHead>
              <TableHead>Nama Customer</TableHead>
              <TableHead>Nama Event</TableHead>
              <TableHead>Waktu Verifikasi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {historyData.length > 0 ? (
              historyData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono">{item.ticket_code}</TableCell>
                  <TableCell>{item.customer_name}</TableCell>
                  <TableCell>{item.event_name}</TableCell>
                  <TableCell>{new Date(item.verified_at).toLocaleString()}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Belum ada riwayat verifikasi
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TicketScanTab;
