import { iOrderTicket, PaymentStatus } from "@/lib/interfaces/iOrder";
import { formatDateIndonesia, formatDateTimeIndonesia } from "@/lib/dateFormatIndonesia";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const DetailItem = ({ label, value }: { label: string; value: string | number | null | undefined }) => (
    <div className="flex flex-col sm:flex-row">
      <p className="text-sm font-medium text-gray-500 w-full sm:w-48 shrink-0">{label}</p>
      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 break-words">{value || "N/A"}</p>
    </div>
);

const PaymentStatusBadge = ({ status }: { status: PaymentStatus }) => {
    switch (status?.toLowerCase()) {
        case 'paid':
        case 'settlement':
            return <Badge variant="default">Paid</Badge>;
        case 'pending':
            return <Badge variant="default">Pending</Badge>;
        case 'cancelled':
            return <Badge variant="destructive">Cancelled</Badge>;
        default:
            return <Badge>{status || 'N/A'}</Badge>;
    }
};

const TransactionDetails = ({ item }: { item: iOrderTicket }) => {
    const formatCurrency = (amount: number | string) => {
        return new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
        }).format(Number(amount));
    };

    return (
        <Card className="mb-4">
            <CardHeader>
              <CardTitle>Detail Transaksi</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
              <DetailItem label="Kode Invoice" value={item.order_id} />
              <DetailItem label="Waktu Transaksi" value={formatDateTimeIndonesia(item.createdAt)} />
              <DetailItem label="Nama Pemesan" value={item.customer_name} />
              <DetailItem label="Email Pemesan" value={item.customer_mail} />
              <DetailItem label="Jenis Varian" value={item.variant} />
              <DetailItem label="Harga Varian" value={formatCurrency(item.price)} />
              <DetailItem label="Jumlah" value={`${item.quantity} tiket`} />
              <DetailItem label="Total Pembayaran" value={formatCurrency(item.total_price)} />
              <div className="flex items-center pt-1">
                <p className="text-sm font-medium text-gray-500 w-48 shrink-0">Status Pembayaran</p>
                <PaymentStatusBadge status={item.payment_status} />
              </div>
            </CardContent>
        </Card>
    );
};

export default TransactionDetails;
