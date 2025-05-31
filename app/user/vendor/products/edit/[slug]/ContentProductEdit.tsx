"use client";
import { useToast } from "@/hooks/use-toast";
import { eAlertType } from "@/lib/enums/eAlert";
import { iUpdateProduct } from "@/lib/interfaces/iProduct";
import { axiosData } from "@/lib/services";
import { formatNumberWithDots } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ContentProductEdit(props: any) {
  const [title, setTitle] = useState<string>("");
  const [rate, setRate] = useState<number>(0);
  const [main_price, setMainPrice] = useState<string>("0");
  const [minimal_order, setMinimalOrder] = useState<number>(0);
  const [price_max, setPriceMax] = useState<string>("0");
  const [price_min, setPriceMin] = useState<string>("0");
  const [kabupaten, setKabupaten] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const router = useRouter();
  const { toast } = useToast();

  const getQuery = async () => {
    return await axiosData("GET", `/api/products/${props.slug}?populate=*`);
  };
  const query = useQuery({
    queryKey: ["qProductDetail"],
    queryFn: getQuery,
  });

  const dataContent = query?.data?.data;

  useEffect(() => {
    if (dataContent) {
      setTitle(dataContent.title);
      setRate(dataContent.rate);
      setMainPrice(dataContent.main_price);
      setMinimalOrder(dataContent.minimal_order);
      setPriceMax(dataContent.price_max);
      setPriceMin(dataContent.price_min);
      setKabupaten(dataContent.kabupaten);
      setDescription(dataContent.description);
    }
  }, [dataContent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let formattedMainPrice = parseInt(String(main_price).replace(/\./g, ""));
      let formattedPriceMin = parseInt(String(price_min).replace(/\./g, ""));
      let formattedPriceMax = parseInt(String(price_max).replace(/\./g, ""));

      const updatedData: iUpdateProduct = {
        title,
        rate,
        minimal_order,
        kabupaten,
        description,
        main_price: formattedMainPrice,
        price_min: formattedPriceMin,
        price_max: formattedPriceMax,
      };

      const res = await axiosData("PUT", `/api/products/${props.slug}`, {
        data: updatedData,
      });

      if (res) {
        toast({
          title: "Sukses",
          description: "Update produk berhasil!",
          className: eAlertType.SUCCESS,
        });
        router.push("/user/vendor/products");
      }
    } catch (error) {
      console.error("Update Failed:", error);
      toast({
        title: "Gagal",
        description: "Update produk gagal!",
        className: eAlertType.FAILED,
      });
    }
  };

  const formatPriceValue = (value: string) => {
    const rawValue = value;
    const formatted = formatNumberWithDots(rawValue);
    return formatted;
  };
  return (
    <div>
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Edit Produk</h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="title" className="block font-medium mb-2">
              Title Product
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              id="title"
              name="title"
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Masukkan title produk"
            />
          </div>
          <div>
            <label htmlFor="title" className="block font-medium mb-2">
              Rate Product
            </label>
            <input
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              id="rate"
              name="rate"
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Masukkan rate produk"
            />
          </div>
          <div>
            <label htmlFor="title" className="block font-medium mb-2">
              Harga Product
            </label>
            <input
              value={formatPriceValue(main_price)}
              onChange={(e) => {
                let val = formatPriceValue(e.target.value.replace(/\D/g, ""));
                setMainPrice(val);
              }}
              id="harga utama"
              name="harga utama"
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Masukkan harga utama produk"
            />
          </div>
          <div>
            <label htmlFor="title" className="block font-medium mb-2">
              Minimal Order
              <span className="text-sm block italic">
                Masukkan jumlah minimum kuantiti pembelian jika produk atau
                layanan Anda memerlukan batas minimal pesanan tertentu.
              </span>
            </label>
            <input
              value={minimal_order}
              onChange={(e) => setMinimalOrder(Number(e.target.value))}
              id="minimal order"
              name="minimal order"
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Masukkan minimal order produk"
            />
          </div>
          <div>
            <label htmlFor="title" className="block font-medium mb-2">
              Harga Minimal
            </label>
            <input
              value={formatPriceValue(price_min)}
              onChange={(e) => {
                let val = formatPriceValue(e.target.value.replace(/\D/g, ""));
                setPriceMin(val);
              }}
              id="price_min"
              name="price_min"
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Masukkan harga minimal produk"
            />
          </div>
          <div>
            <label htmlFor="title" className="block font-medium mb-2">
              Harga Maksimal
            </label>
            <input
              value={formatPriceValue(price_max)}
              onChange={(e) => {
                let val = formatPriceValue(e.target.value.replace(/\D/g, ""));
                setPriceMax(val);
              }}
              id="price_max"
              name="price_max"
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Masukkan harga maksimal produk"
            />
          </div>
          <div>
            <label htmlFor="title" className="block font-medium mb-2">
              Kabupaten
            </label>
            <input
              value={kabupaten}
              onChange={(e) => setKabupaten(e.target.value)}
              id="minimal order"
              name="minimal order"
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Masukkan kabupaten anda"
            />
          </div>
          <div>
            <label htmlFor="title" className="block font-medium mb-2">
              Deskripsi
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              id="minimal order"
              name="minimal order"
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Masukkan deskripsi anda"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Simpan Perubahan
          </button>
        </form>
      </div>
    </div>
  );
}
