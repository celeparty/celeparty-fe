"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosUser } from "@/lib/services";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ErrorNetwork from "@/components/ErrorNetwork";
import Skeleton from "@/components/Skeleton";
import { QrCode, Camera, CheckCircle, XCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { BrowserMultiFormatReader } from "@zxing/library";

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

export const TicketScan: React.FC = () => {
  const { data: session } = useSession();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string>("");
  const [ticketDetail, setTicketDetail] = useState<iTicketDetail | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);

  const getVerificationHistory = async () => {
    const response = await axiosUser(
      "GET",
      `/api/transaction-tickets?filters[vendor_id][$eq]=${session?.user?.documentId}&filters[verification][$eq]=true&sort=updatedAt:desc`,
      `${session?.jwt}`
    );
    return response;
  };

  const query = useQuery({
    queryKey: ["verificationHistory"],
    queryFn: getVerificationHistory,
    enabled: !!session?.jwt,
  });

  const getTicketDetail = useMutation({
    mutationFn: async (uniqueToken: string) => {
      const response = await axiosUser(
        "GET",
        `/api/transaction-tickets?filters[unique_token][$eq]=${uniqueToken}&populate=*`,
        `${session?.jwt}`
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
    onError: (error: any) => {
      toast.error("Gagal mengambil detail tiket");
    },
  });

  const verifyTicketMutation = useMutation({
    mutationFn: async (ticketCode: string) => {
      const response = await axiosUser(
        "PUT",
        `/api/qr-verify`,
        `${session?.jwt}`,
        { ticket_code: ticketCode }
      );
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

  const scanContinuously = async () => {
    if (!isScanning || !videoRef.current || !codeReader.current) return;

    try {
      const result = await codeReader.current.decodeOnceFromVideoDevice(undefined, videoRef.current);
      const scannedText = result.getText();
      setScanResult(scannedText);
      getTicketDetail.mutate(scannedText);
      stopScanning();
    } catch (error) {
      // Continue scanning if no QR code found
      if (isScanning) {
        setTimeout(scanContinuously, 100);
      }
    }
  };

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsScanning(true);
        // Start continuous scanning
        scanContinuously();
      }
    } catch (error) {
      toast.error("Tidak dapat mengakses kamera");
    }
  };

  const stopScanning = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setIsScanning(false);
    }
  };

  useEffect(() => {
    codeReader.current = new BrowserMultiFormatReader();
    return () => {
      if (codeReader.current) {
        codeReader.current.reset();
      }
    };
  }, []);

  const captureAndScan = async () => {
    if (videoRef.current && codeReader.current) {
      try {
        const result = await codeReader.current.decodeOnceFromVideoDevice(undefined, videoRef.current);
        const scannedText = result.getText();
        setScanResult(scannedText);
        getTicketDetail.mutate(scannedText);
        stopScanning();
      } catch (error) {
        toast.error("Gagal memindai QR code");
      }
    }
  };

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
            className="flex items-center gap-2 mx-auto"
          >
            <Camera className="h-5 w-5" />
            {isScanning ? "Stop Scan" : "Mulai Scan"}
          </Button>
        </div>

        {isScanning && (
          <div className="text-center mb-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="border rounded-lg mx-auto max-w-sm"
            />
            <canvas ref={canvasRef} className="hidden" />
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
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Tiket</DialogTitle>
            <DialogDescription>
              Informasi lengkap tiket yang dipindai
            </DialogDescription>
          </DialogHeader>
          {ticketDetail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Nama Customer</p>
                  <p className="text-sm">{ticketDetail.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-sm">{ticketDetail.customer_email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Varian</p>
                  <p className="text-sm">{ticketDetail.variant}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status Pembayaran</p>
                  <p className="text-sm">{ticketDetail.payment_status}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Harga</p>
                  <p className="text-sm">Rp {ticketDetail.total_price.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Tanggal Pembelian</p>
                  <p className="text-sm">{new Date(ticketDetail.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-500">Status Verifikasi:</p>
                {ticketDetail.verification ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Sudah Diverifikasi</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-600">
                    <XCircle className="h-4 w-4" />
                    <span className="text-sm">Belum Diverifikasi</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-4">
                {!ticketDetail.verification && (
                  <Button
                    onClick={handleVerify}
                    disabled={verifyTicketMutation.isPending}
                    className="flex-1"
                  >
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
                  className="flex-1"
                >
                  Tutup
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
