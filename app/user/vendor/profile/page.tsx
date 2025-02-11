"use client";
import Box from "@/components/Box";
import React, { useState } from "react";

import ErrorNetwork from "@/components/ErrorNetwork";
import Skeleton from "@/components/Skeleton";
import { axiosUser, getDataToken, putDataToken } from "@/lib/services";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { type SubmitHandler, useForm } from "react-hook-form";
import { AiFillCustomerService } from "react-icons/ai";
import { GrEdit, GrFormEdit } from "react-icons/gr";
import { z } from "zod";

type UserData = {
	name?: string;
	birthdate?: string;
	gender?: string;
	address?: string;
	province?: string;
	city?: string;
	region?: string;
	area?: string;
	accessToken?: string;
};

type SessionData = {
	user?: UserData; // Update the type of user to include the accessToken property
};

function ItemInput({ label, children }: {label?: string, children: React.ReactNode}) {
	return (
		<div className="flex justify-items-start w-full gap-2 mb-3 items-start">
			<div className={`${label ? "w-[130px] lg:w-[200px]" : "w-0"} py-2 text-[14px] lg:text-[16px]`}>{label}</div>
			<div className="flex-1 pt-[6px] lg:pt-[6px] text-[14px] lg:text-[16px]">
				{children}
			</div>
		</div>
	);
}


export default function ProfilePage() {
	const { data: session, status } = useSession();
	const [myData, setMyData] = useState<any>();
	const [notif, setNotif] = React.useState(false);
	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	} = useForm<any>();

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const onSubmit: SubmitHandler<UserData> = async (data) => {
		// if (!dataSession?.user?.accessToken) {
		// 	throw new Error("Access token is undefined");
		// }
		// await putDataToken("/users", dataSession?.user?.accessToken, {
		// 	name: data?.name,
		// 	birthdate: data?.birthdate,
		// 	gender: data?.gender,
		// 	address: data?.address,
		// 	province: data?.province,
		// 	city: data?.city,
		// 	region: data?.region,
		// 	area: data?.area,
		// });
		// setNotif(true);
		// setTimeout(() => {
		// 	setNotif(false);
		// }, 5000);
	};

	const getQuery = async () => {
		if (!session?.jwt) {
			throw new Error("Access token is undefined");
		}
		else {
			return await axiosUser("GET", "/api/users/me", `${session && session?.jwt}`);
		}
	};
	const query = useQuery({
		queryKey: ["qUserProfile"],
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
	if (query.isError) {
		return <ErrorNetwork />;
	}

	const dataContent = query?.data;
	return (
		<div>
			<Box className="mt-0">
				<h4 className="lg:font-semibold font-extrabold text-[14px] lg:text-[16px] mb-1">Info Profil</h4>
				<div className="mt-2 lg:mt-7">
					{dataContent ? (
						<form onSubmit={handleSubmit(onSubmit)}>
							<ItemInput label="Nama">
								<input
									className="border border-gray-300 rounded-md p-2 text-[14px] lg:text-[16px]"
									defaultValue={dataContent?.name}
									{...register("name", { required: true })}
								/>
							</ItemInput>
							<ItemInput label="Nama Usaha">
								<input
									className="border border-gray-300 rounded-md p-2 text-[14px] lg:text-[16px]"
									defaultValue={dataContent?.companyName}
									{...register("company", { required: true })}
								/>
							</ItemInput>
							<div className="flex items-start align-top">
								<ItemInput  label="Lokasi Pelayanan">
								<div className="flex flex-col">
								{
									dataContent?.serviceLocation?.map((item: any, i:number) => {
										return (
											<div key={i} className="flex lg:flex-row flex-col gap-1 w-full">
												<input
													className="border flex-1 mb-2 border-gray-300 rounded-md p-2 text-[14px] lg:text-[16px]"
													defaultValue={item?.region}
													{...register(`${"region-"+i}`, { required: true })}
												/>	
												<input
													className="border flex-1 mb-2 border-gray-300 rounded-md p-2 text-[14px] lg:text-[16px]"
													defaultValue={item?.subregion}
													{...register(`${"subregion-"+i}`, { required: true })}
												/>	
											</div>
										)
									})
								}
								</div>
								</ItemInput>
							</div>
							<ItemInput label="User ID">{dataContent?.id}</ItemInput>
							<ItemInput label="Email">{dataContent?.email}</ItemInput>
							<ItemInput label="No Telepon">
								<input
									className="border border-gray-300 rounded-md p-2 text-[14px] lg:text-[16px]"
									defaultValue={dataContent?.phone}
									{...register("phonenumber", {
										required: true,
									})}
								/>
							</ItemInput>
							<ItemInput label="Tanggal Lahir">
								<input
									className="border border-gray-300 rounded-md p-2 text-[14px] lg:text-[16px]"
									defaultValue={dataContent?.birthdate}
									{...register("birthdate", {
										required: true,
									})}
								/>
							</ItemInput>
							<ItemInput label="Tempat Lahir">
								<input
									className="border border-gray-300 rounded-md p-2 text-[14px] lg:text-[16px]"
									defaultValue={dataContent?.birthplace}
									{...register("birthplace", {
										required: true,
									})}
								/>
							</ItemInput>
							<ItemInput label="Alamat Usaha">
								<textarea
									className="border border-gray-300 rounded-md p-2 w-[210px] lg:w-full min-h-[100px] text-[14px] lg:text-[16px]"
									defaultValue={dataContent?.address}
									{...register("address", { required: true })}
								/>
							</ItemInput>
							<ItemInput label="Nama Bank"><div className="py-2 text-[14px] lg:text-[16px]">{dataContent?.bankName}</div></ItemInput>
							<ItemInput label="Nomor Rekening"><div className="py-2 text-[14px] lg:text-[16px]">{dataContent?.accountNumber}</div></ItemInput>
							<ItemInput label="Nama Pemilik Rekening">
								<div className="py-2 text-[14px] lg:text-[16px]">{dataContent?.accountName}</div>
							</ItemInput>
							<ItemInput>
								<input
									type="submit"
									value="Simpan"
									className="lg:border border-[3px] border-gray-300 rounded-md lg:py-2 py-3 px-7 hover:bg-slate-300 cursor-pointer text-[16px] lg:text-[14px] w-full lg:w-auto lg:font-normal font-extrabold"
								/>
							</ItemInput>
							{notif && (
								<ItemInput label="">
									<div className="text-green-500">Data Berhasil disimpan</div>
								</ItemInput>
							)}
						</form>
					) : (
						<Skeleton width="100%" height="200px" />
					)}
				</div>
			</Box>
			<Box>
				<div className="flex justify-center items-center">
					<Link href="/" className="flex gap-2 items-center">
						<AiFillCustomerService className="lg:text-3xl text-2xl" />
						<strong className="text-[14px] lg:text-[16px]">Bantuan Celeparty Care</strong>
					</Link>
				</div>
			</Box>
		</div>
	);
}
