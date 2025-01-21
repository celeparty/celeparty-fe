"use client";
import ErrorNetwork from "@/components/ErrorNetwork";
import Skeleton from "@/components/Skeleton";
import SubTitle from "@/components/SubTitle";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { axiosUser, getDataToken, putDataToken } from "@/lib/services";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { GrEdit, GrFormEdit } from "react-icons/gr";
import { z } from "zod";

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
			{label ? <div className="w-[full]">{label}</div> : null}
			{sublabel ? <div className="text-[#DA7E01] text-[10px] ">{sublabel}</div> : null}
			{children}
		</div>
	);
}

export default function MainContentAddProduct() {
	const router = useRouter();
	const { data: session, status } = useSession();
	const [message, setMessage] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | boolean | null>(
	  false
	);
	const [stateCategory, setStateCategory] = useState<any>({
		status: false,
		value: 0,
	});
	const [stateTheme, setStateTheme] = useState<any>({
		status: false,
		value: 0,
	});
	const {
		register,
		handleSubmit,
		watch,
		reset,
		formState: { errors },
	} = useForm<any>();

	const onSubmit: SubmitHandler<any> = async (values) => {
		const sendNow = async () => {
			try {
				const data:any = {
					title: values.title,
					minimal_order: values.minimal_order ? values.minimal_order : 0,
					minimal_order_date: values.minimal_order_date ? values.minimal_order_date : "2026-12-31",
					main_price: values.main_price ? values.main_price : 0,
					users_permissions_user: {
						connect: {
							id: session?.user.id
						}
					}
				};
		  
				const response = await axiosUser("POST", "/api/products", `${session && session?.jwt}`, 
					{
						data
					}
				);	
				console.log(data)
				setErrorMessage(false);
				setMessage(true);		
			} catch (error:any) {
				console.error("Error:", error?.response.data.error.message);
				setMessage(false);	
				setErrorMessage(error?.response.data.error.message);		
			}
		}
		sendNow()	
		reset()	
	};
	console.log(session?.jwt)

	const getQuery = async () => {
		if (!session?.jwt) {
			throw new Error("Access token is undefined");
		}
		else {
			return await axiosUser("GET", "/api/categories?populate=*", `${session && session?.jwt}`);
		}
	};
	const query = useQuery({
		queryKey: ["qCategories"],
		queryFn: getQuery,
		staleTime: 5000,
		enabled: !!session?.jwt,
		retry: 3,
	});


	if (query.isLoading) {
		return (
			<div className=" relative flex justify-center ">
				<Skeleton width="100%" height="150px" />
			</div>
		);
	}
	const dataCategory = query?.data?.data;

	return (
		<div>
			<form onSubmit={handleSubmit(onSubmit)}>
				<SubTitle title="Pilih Kategori Produk" />
				<div className="flex flex-wrap gap-2 mb-5">
					{dataCategory?.map((item: any, i: number) => {
						const isActive = stateCategory.value === item.id;
						return (
							<div
								onClick={() => {
									setStateCategory({
										status: true,
										value: item.id,
									});
								}}
								key={item.id}
								className={`cursor-pointer hover:bg-c-green hover:text-white hover:border-c-green rounded-3xl border border-solid border-c-gray px-5 py-1 ${isActive ? "bg-c-green text-white border-c-green" : "text-c-black"}`}
							>
								{item.title}
							</div>
						);
					})}
				</div>
				<ItemInput>
					<input
						className="border border-gray-300 rounded-md py-2 px-5 w-full"
						placeholder="Nama Produk"
						{...register("title", { required: true })}
					/>
					{errors.name && <p className="text-red-500 text-[10px]">Tidak Boleh Kosong</p>}
				</ItemInput>
				<ItemInput sublabel="Tambah Foto">
					<div className="w-full">
						<input
							type="file"
							className="border border-gray-300 rounded-md py-2 px-5 w-full"
							{...register("image_urls", { required: false })}
						/>
						{errors.name && <p className="text-red-500 text-[10px]">Tidak Boleh Kosong</p>}
					</div>
				</ItemInput>
				<ItemInput>
					<input
						className="border border-gray-300 rounded-md py-2 px-5 w-full"
						placeholder="Harga Produk (Rp)"
						{...register("main_price", { required: false })}
					/>
					{errors.name && <p className="text-red-500 text-[10px]">Tidak Boleh Kosong</p>}
				</ItemInput>
				<ItemInput>
					<textarea
						className="border border-gray-300 rounded-md py-2 px-5 w-full"
						placeholder="Deskripsi Produk"
						{...register("description", { required: false })}
					/>
					{errors.name && <p className="text-red-500 text-[10px]">Tidak Boleh Kosong</p>}
				</ItemInput>
				<ItemInput label="Minimal Item Pembelian (Optional)">
					<input
						className="border border-gray-300 rounded-md py-2 px-5 w-full"
						placeholder="Jumlah Pcs Minimal"
						{...register("minimal_order", { required: false })}
					/>
				</ItemInput>
				<ItemInput label="Maksimal Hari Pemesanan (Optional)">
					<input
						className="border border-gray-300 rounded-md py-2 px-5 w-full"
						placeholder="(x) Hari Maksimal Pemesanan"
						{...register("minimal_order_date", { required: false })}
					/>
				</ItemInput>
				<ItemInput label="Tema">
					<div className="flex flex-wrap gap-2 mb-5">
						{/* {dataThemes?.map((item: any, i: number) => {
							const isActive = stateTheme.value === item.id;
							return (
								<div
									onClick={() => {
										setStateTheme({
											status: true,
											value: item.id,
										});
									}}
									key={item.id}
									className={`cursor-pointer hover:bg-c-green hover:text-white hover:border-c-green rounded-3xl border border-solid border-c-gray px-5 py-1 `}
								>
									{item.name}
								</div>
							);
						})} */}
					</div>
					{errors.name && <p className="text-red-500 text-[10px]">Tidak Boleh Kosong</p>}
				</ItemInput>
				<ItemInput label="Varian">
					<div className="text-[#DA7E01] text-[12px] cursor-pointer">Tambah Varian</div>
					{errors.name && <p className="text-red-500 text-[10px]">Tidak Boleh Kosong</p>}
				</ItemInput>
				<div className="flex justify-center">
					<input
						type="submit"
						value="Simpan Produk"
						className="border border-gray-300 rounded-[30px] py-4 px-7 min-w-[250px] hover:bg-slate-300 cursor-pointer bg-c-green text-white shadow"
					/>
				</div>
			</form>
			{message ? (
					<div className="mt-1 text-green-500">
					Add product berhasil
					</div>
				) : null}
				{errorMessage ? (
					<div className="text-c-red mt-1">{errorMessage}</div>
				) : null}

		</div>
	);
}
