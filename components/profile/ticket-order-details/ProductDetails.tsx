import { iOrderTicket } from "@/lib/interfaces/iOrder";
import { formatDateToIndonesian } from "@/lib/dateFormatIndonesia";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DetailItem = ({ label, value }: { label: string; value: string | number }) => (
    <div className="flex flex-col sm:flex-row">
      <p className="text-sm font-medium text-gray-500 w-full sm:w-48 shrink-0">{label}</p>
      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 break-words">{value}</p>
    </div>
);

const ProductDetails = ({ item }: { item: iOrderTicket }) => {
  return (
    <Card className="mb-4">
        <CardHeader>
          <CardTitle>Detail Produk</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                <DetailItem label="Nama Tiket" value={item.product_name} />
                <DetailItem label="Tanggal Acara" value={formatDateToIndonesian(item.event_date)} />
                {item.waktu_event && (
                  <DetailItem label="Jam Acara" value={`${item.waktu_event.substring(0, 5)} WIB`} />
                )}
                {/* Data berikut tidak tersedia dari API */}
                <DetailItem label="Tanggal Selesai" value={"N/A (Data tidak tersedia)"} />
                <DetailItem label="Jam Selesai" value={"N/A (Data tidak tersedia)"} />
                <DetailItem label="Kota" value={"N/A (Data tidak tersedia)"} />
                <DetailItem label="Lokasi" value={"N/A (Data tidak tersedia)"} />
            </div>
        </CardContent>
    </Card>
  );
};

export default ProductDetails;
