"use client"
import { axiosData } from "@/lib/services";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function ContentProductEdit(props: any) {
    const [title, setTitle] = useState<string>("")
    const [id, setId] = useState<number>(0)


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
            setId(dataContent.id)
        }
    }, [dataContent])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const updatedData = { title }

            console.log(updatedData)

            const res = await axiosData("PUT", `/api/products/${props.slug}`, {
                data: updatedData,
            })

            console.log("Update Success:", res);
            toast.success("Title updated successfully!");
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
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
          Simpan Perubahan
        </button>
      </form>
    </div>
        </div>
    )
}