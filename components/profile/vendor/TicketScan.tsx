"use client";

import React, { useState, useRef } from "react";
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
import ErrorNetwork from "@/components/ErrorNetwork";
import Skeleton from "@/components/Skeleton";
import { QrCode, Camera } from "lucide-react";
import { toast } from "react-hot-toast";

interface iVerificationHistory {
  id: number;
  ticket_code: string;
  customer_name: string;
  verified_at: string;
  event_name: string;
}

export const TicketScan: React.FC = () => {
  const { data: session } = useSession();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getVerificationHistory = async () => {
    const response = await axiosUser(
      "GET",
      `/api/transaction-tickets?filters[vendor_id][$eq]=${session?.user?.documentId}&filters[verification][$eq]=true]&sort=updatedAt:desc`,
      `${session?.jwt}`
    );
    return response;
  };

  const query = useQuery({
    queryKey: ["verificationHistory"],
    queryFn: getVerificationHistory,
    enabled: !!session?.jwt,
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
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error?.message || "Gagal memverifikasi tiket");
    },
  });

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
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

  const captureAndScan = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Here you would integrate with a QR code scanning library
      // For now, we'll simulate scanning
      const mockQRCode = "TICKET-12345";
      setScanResult(mockQRCode);
      stopScanning();
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
            <div className="mt-4">
              <Button onClick={captureAndScan}>
                <QrCode className="h-4 w-4 mr-2" />
                Scan QR Code
              </Button>
            </div>
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
