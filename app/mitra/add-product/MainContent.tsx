"use client"
import React, { useState } from 'react'
import { GrFormEdit, GrEdit } from "react-icons/gr";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import Skeleton from "@/components/Skeleton";
import { getDataToken, putDataToken } from "@/lib/services";
import ErrorNetwork from "@/components/ErrorNetwork";
import { useSession } from "next-auth/react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import SubTitle from "@/components/SubTitle";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"


type UserData = {
    name?: string | null | undefined;
    email?: string | null | undefined;
    image?: string | null | undefined;
    accessToken?: string | null | undefined; // Add the accessToken property
};

type SessionData = {
    user?: UserData; // Update the type of user to include the accessToken property
};

function ItemInput({ label, sublabel, children }: any) {
    return (
        <div className="flex flex-col justify-items-start w-full gap-2 mb-5  [&_input]:bg-gray-100 [&_input]:hover:bg-white [&_textarea]:bg-gray-100 [&_textarea]:hover:bg-white">
            {
                label ? <div className="w-[full]">{label}</div> : null
            }
            {
                sublabel ? <div className="text-[#DA7E01] text-[10px] ">{sublabel}</div> : null
            }
            {children}
        </div>
    )
}


export default function MainContentAddProduct() {
    const router = useRouter();
    const session = useSession();
    const dataSession = session?.data as SessionData;
    const [categoryActive, setCategoryActive] = useState(false);
    const [categoryValue, setCategoryValue] = useState(0);
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<any>()


    const onSubmit: SubmitHandler<any> = async (data) => {
        if (!dataSession?.user?.accessToken) {
            throw new Error("Access token is undefined");
        }
        const dataForm = {
            category_id: categoryValue,
            data

        }
        console.log(dataForm)

    }

    const getQuery = async () => {
        if (!dataSession?.user?.accessToken) {
            throw new Error("Access token is undefined");
        }
        return await getDataToken(`/categories`, `${dataSession?.user?.accessToken}`);
    };
    const query = useQuery({
        queryKey: ["qCategories"],
        queryFn: getQuery,
        staleTime: 5000,
        enabled: !!dataSession?.user?.accessToken,
        retry: 3,
    });
    if (query.isLoading) {
        return (
            <div className=" relative flex justify-center ">
                <Skeleton width="100%" height="150px" />
            </div>
        );
    }
    if (query.isError) {
        return <ErrorNetwork />;
    }
    if (query.data?.data.status === false) {
        router.push("/auth/mitra/login")
    }
    const handleCategoryClick = (categoryId: any) => {
        setCategoryValue(categoryId);
        setCategoryActive(categoryId);
    };

    const dataCategory = query?.data?.data.data;
    console.log(errors)
    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <SubTitle title="Pilih Kategori Produk" />
                <div className="flex flex-wrap gap-2 mb-5">
                    {
                        dataCategory?.map((item: any, i: number) => {
                            const isActive = categoryActive === item.id;
                            return (
                                <div
                                    onClick={() => handleCategoryClick(item.id)}
                                    key={item.id}
                                    className={`cursor-pointer hover:bg-c-green hover:text-white hover:border-c-green rounded-3xl border border-solid border-c-gray px-5 py-1 ${isActive ? "bg-c-green text-white border-c-green" : "text-c-black"}`}>
                                    {item.name}
                                </div>
                            )
                        })
                    }
                </div>
                <ItemInput>
                    <input className="border border-gray-300 rounded-md py-2 px-5 w-full" placeholder="Nama Produk" {...register("name", { required: true })} />
                    {errors.name && <p className="text-red-500 text-[10px]">Tidak Boleh Kosong</p>}
                </ItemInput>
                <ItemInput sublabel="Tambah Foto">
                    <div className="w-full">
                        <input type="file" className="border border-gray-300 rounded-md py-2 px-5 w-full" {...register("image_urls", { required: true })} />
                        {errors.name && <p className="text-red-500 text-[10px]">Tidak Boleh Kosong</p>}
                    </div>
                </ItemInput>
                <ItemInput>
                    <input className="border border-gray-300 rounded-md py-2 px-5 w-full" placeholder="Harga Produk (Rp)" {...register("price", { required: true })} />
                    {errors.name && <p className="text-red-500 text-[10px]">Tidak Boleh Kosong</p>}
                </ItemInput>
                <ItemInput>
                    <textarea className="border border-gray-300 rounded-md py-2 px-5 w-full" placeholder="Deskripsi Produk" {...register("desc", { required: true })} />
                    {errors.name && <p className="text-red-500 text-[10px]">Tidak Boleh Kosong</p>}
                </ItemInput>
                <ItemInput label="Minimal Item Pembelian (Optional)">
                    <input className="border border-gray-300 rounded-md py-2 px-5 w-full" placeholder="Jumlah Pcs Minimal" {...register("min_order_qty", { required: false })} />
                </ItemInput>
                <ItemInput label="Maksimal Hari Pemesanan (Optional)">
                    <input className="border border-gray-300 rounded-md py-2 px-5 w-full" placeholder="(x) Hari Maksimal Pemesanan" {...register("min_order_date", { required: false })} />
                </ItemInput>
                <ItemInput label="Tema">
                    <div className="flex flex-wrap gap-2 mb-5">
                        <div
                            className={`cursor-pointer hover:bg-c-green hover:text-white hover:border-c-green rounded-3xl border border-solid border-c-gray px-5 py-1 `}>
                            Semua Tema
                        </div>
                        <div
                            className={`cursor-pointer hover:bg-c-green hover:text-white hover:border-c-green rounded-3xl border border-solid border-c-gray px-5 py-1 `}>
                            Candy's
                        </div>
                    </div>
                    {errors.name && <p className="text-red-500 text-[10px]">Tidak Boleh Kosong</p>}
                </ItemInput>
                <ItemInput label="Varian">
                    <div className="text-[#DA7E01] text-[12px] cursor-pointer">Tambah Varian</div>
                    {errors.name && <p className="text-red-500 text-[10px]">Tidak Boleh Kosong</p>}
                </ItemInput>
                <ItemInput label="Topping">
                    <div className="flex flex-wrap gap-2 mb-5">
                        <div
                            className={`cursor-pointer hover:bg-c-green hover:text-white hover:border-c-green rounded-3xl border border-solid border-c-gray px-5 py-1 `}>
                            Butter
                        </div>
                        <div
                            className={`cursor-pointer hover:bg-c-green hover:text-white hover:border-c-green rounded-3xl border border-solid border-c-gray px-5 py-1 `}>
                            Fondant
                        </div>
                    </div>
                    {errors.name && <p className="text-red-500 text-[10px]">Tidak Boleh Kosong</p>}
                </ItemInput>
                <ItemInput label="Ukuran">
                    <div className="flex flex-wrap gap-2 mb-5">
                        <div
                            className={`cursor-pointer hover:bg-c-green hover:text-white hover:border-c-green rounded-3xl border border-solid border-c-gray px-5 py-1 `}>
                            18 cm
                        </div>
                        <div
                            className={`cursor-pointer hover:bg-c-green hover:text-white hover:border-c-green rounded-3xl border border-solid border-c-gray px-5 py-1 `}>
                            20 cm
                        </div>
                    </div>
                    {errors.name && <p className="text-red-500 text-[10px]">Tidak Boleh Kosong</p>}
                </ItemInput>
                <div className="flex justify-center">
                    <input type="submit" value="Simpan Produk" className="border border-gray-300 rounded-[30px] py-4 px-7 min-w-[250px] hover:bg-slate-300 cursor-pointer bg-c-green text-white shadow" />
                </div>
            </form>

        </div>
    )
}
