"use client";

import { iOrderTicket } from "@/lib/interfaces/iOrder";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import Skeleton from "../../Skeleton";

// Define a more specific type for recipients if possible, for now 'any' is used as in the original interface.
type Recipient = {
    id: number;
    name: string;
    email: string;
    telp: string;
    identity_type: string;
    identity_number: string;
    ticket_code: string;
    status: 'valid' | 'used' | 'invalid' | string;
};

const DetailItem = ({ label, value }: { label: string; value: string | number }) => (
    <div className="flex flex-col">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 break-words">{value || "N/A"}</p>
    </div>
);

const RecipientCard = ({ recipient }: { recipient: Recipient }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (recipient.ticket_code) {
      QRCode.toDataURL(recipient.ticket_code, { width: 160, margin: 2 })
        .then(setQrCodeUrl)
        .catch(err => console.error("Failed to generate QR code", err))
        .finally(() => setIsLoading(false));
    } else {
        setIsLoading(false);
    }
  }, [recipient.ticket_code]);

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "valid":
        return <Badge variant="success">Valid</Badge>;
      case "used":
        return <Badge variant="secondary">Used</Badge>;
      case "invalid":
        return <Badge variant="destructive">Invalid</Badge>;
      default:
        return <Badge>{status || 'N/A'}</Badge>;
    }
  };

  return (
    <Card className="bg-gray-50/50 dark:bg-gray-900/50 overflow-hidden">
      <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
        <div className="grid grid-cols-2 gap-4">
            <DetailItem label="Nama" value={recipient.name} />
            <DetailItem label="Email" value={recipient.email} />
            <DetailItem label="No. WhatsApp" value={recipient.telp} />
            <DetailItem label="Jenis Identitas" value={recipient.identity_type} />
            <DetailItem label="No. Identitas" value={recipient.identity_number} />
            <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium text-gray-500">Status Tiket</p>
                {getStatusBadge(recipient.status)}
            </div>
        </div>
        <div className="flex flex-col items-center justify-center space-y-2 bg-white dark:bg-black rounded-lg p-2">
          {isLoading ? <Skeleton className="w-40 h-40" /> :
           qrCodeUrl ? <img src={qrCodeUrl} alt={`QR Code for ${recipient.ticket_code}`} className="rounded-md"/> :
           <div className="w-40 h-40 flex items-center justify-center text-center text-xs text-gray-500">QR Code tidak tersedia</div>
          }
          <p className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
            {recipient.ticket_code || "NO_CODE"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};


const TicketRecipientDetails = ({ item }: { item: iOrderTicket }) => {
  return (
    <Card>
        <CardHeader>
          <CardTitle>Detail Penerima Tiket</CardTitle>
          <CardDescription>
            Jumlah tiket dibeli: {item.recipients?.length || 0}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {item.recipients?.map((recipient: Recipient, index) => (
            <RecipientCard key={recipient.id || index} recipient={recipient} />
          ))}
        </CardContent>
    </Card>
  );
};

export default TicketRecipientDetails;
