"use client"
import { axiosData } from "@/lib/services";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

export default function ContentProductEdit(props: any) {
    const [title, setTitle] = useState<string>("")
    const [rate, setRate] = useState<number>(0)
    const [main_price, setMainPrice] = useState<number>(0)
    const [minimal_order, setMinimalOrder] = useState<number>(0)
    const [price_max, setPriceMax] = useState<number>(0)
    const [price_min, setPriceMin] = useState<number>(0)
    const [kabupaten, setKabupaten] = useState<string>("")
    const [description, setDescription] = useState<string>("")
    const router = useRouter()


    const getQuery = async () => {
		return await axiosData("GET", `/api/products/${props.slug}?populate=*`);
	};
	const query = useQuery({
		queryKey: ["qProductDetail"],
		queryFn: getQuery,
	});

	const dataContent = query?.data?.data;

    useEffect(() => {
        if(dataContent) {
            setTitle(dataContent.title)
            setRate(dataContent.rate)
            setMainPrice(dataContent.main_price)
            setMinimalOrder(dataContent.minimal_order)
            setPriceMax(dataContent.price_max)
            setPriceMin(dataContent.price_min)
            setKabupaten(dataContent.kabupaten)
            setDescription(dataContent.description)
        }
    }, [dataContent])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const updatedData = { title, rate, main_price, minimal_order, price_min, price_max, kabupaten, description }

            console.log(updatedData)

            const res = await axiosData("PUT", `/api/products/${props.slug}`, {
                data: updatedData,
            })

            console.log("Update Success:", res);
            toast.success("Title updated successfully!");
            router.push("/user/vendor/products")
        } catch (error) {
            console.error("Update Failed:", error);
            toast.error("Update failed.");
        }

    }

    console.log(dataContent)
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
            value={main_price}
            onChange={(e) => setMainPrice(Number(e.target.value))}
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
            value={price_min}
            onChange={(e) => setPriceMin(Number(e.target.value))}
            id="minimal order"
            name="minimal order"
            type="text"
            className="w-full p-2 border rounded"
            placeholder="Masukkan minimal order produk"
          />
        </div>
        <div>
          <label htmlFor="title" className="block font-medium mb-2">
            Harga Maksimal
          </label>
          <input
            value={price_max}
            onChange={(e) => setPriceMax(Number(e.target.value))}
            id="minimal order"
            name="minimal order"
            type="text"
            className="w-full p-2 border rounded"
            placeholder="Masukkan minimal order produk"
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
            placeholder="Masukkan minimal order produk"
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
            placeholder="Masukkan minimal order produk"
          />
        </div>
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
          Simpan Perubahan
        </button>
      </form>
    </div>
        </div>
    )
}