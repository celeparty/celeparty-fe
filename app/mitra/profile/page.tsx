"use client";
import Box from "@/components/Box";
import React from "react";

import { useQuery } from "@tanstack/react-query";
import Skeleton from "@/components/Skeleton";
import { getDataToken, putDataToken } from "@/lib/services";
import ErrorNetwork from "@/components/ErrorNetwork";
import { useSession } from "next-auth/react";

import { AiFillCustomerService } from "react-icons/ai";
import { GrFormEdit, GrEdit } from "react-icons/gr";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import Link from "next/link";

type UserData = {
	name?: string | null | undefined;
	email?: string | null | undefined;
	image?: string | null | undefined;
	accessToken?: string | null | undefined; // Add the accessToken property
};

type SessionData = {
	user?: UserData; // Update the type of user to include the accessToken property
};

function ItemInput({ label, children }: any) {
	return (
		<div className="flex justify-items-start w-full gap-2 mb-3 items-center">
			<div className="w-[200px]">{label}</div>
			{children}
		</div>
	);
}

export default function ProfilePage() {
	const session = useSession();
	const dataSession = session?.data as SessionData;
	const [notif, setNotif] = React.useState(false);
	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm<any>();

	const onSubmit: SubmitHandler<any> = async (data) => {
		if (!dataSession?.user?.accessToken) {
			throw new Error("Access token is undefined");
		}
		await putDataToken(`/users`, dataSession?.user?.accessToken, {
			name: data?.name,
			birthdate: data?.birthdate,
			gender: data?.gender,
			address: data?.address,
			province: data?.province,
			city: data?.city,
			region: data?.region,
			area: data?.area,
		});
		setNotif(true);
		setTimeout(() => {
			setNotif(false);
		}, 5000);
	};

	const getQuery = async () => {
		if (!dataSession?.user?.accessToken) {
			throw new Error("Access token is undefined");
		}
		return await getDataToken(
			`/users`,
			`${dataSession?.user?.accessToken}`,
		);
	};
	const query = useQuery({
		queryKey: ["qUserProfile"],
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

	const dataContent = query?.data?.data.data;
	return (
		<div>
			<Box className="mt-0">
				<h4 className="font-semibold text-[16px] mb-1">Info Profil</h4>
				<div className="mt-7">
					{dataContent ? (
						<form onSubmit={handleSubmit(onSubmit)}>
							<ItemInput label="Nama">
								<input
									className="border border-gray-300 rounded-md p-2"
									defaultValue={dataContent?.name}
									{...register("name", { required: true })}
								/>
							</ItemInput>
							<ItemInput label="Nama Usaha">
								<input
									className="border border-gray-300 rounded-md p-2"
									defaultValue={dataContent?.vendor?.name}
									{...register("company", { required: true })}
								/>
							</ItemInput>
							<ItemInput label="Lokasi Pelayanan">
								<input
									className="border border-gray-300 rounded-md p-2"
									defaultValue={dataContent?.area}
									{...register("area", { required: true })}
								/>
							</ItemInput>
							<ItemInput label="Provinsi">
								<input
									className="border border-gray-300 rounded-md p-2"
									defaultValue={dataContent?.province}
									{...register("province", {
										required: true,
									})}
								/>
							</ItemInput>
							<ItemInput label="Kota">
								<input
									className="border border-gray-300 rounded-md p-2"
									defaultValue={dataContent?.city}
									{...register("city", { required: true })}
								/>
							</ItemInput>
							<ItemInput label="Regional">
								<input
									className="border border-gray-300 rounded-md p-2"
									defaultValue={dataContent?.region}
									{...register("region", { required: true })}
								/>
							</ItemInput>
							<ItemInput label="User ID">
								{dataContent?.id}
							</ItemInput>
							<ItemInput label="Email">
								{dataContent?.email}
							</ItemInput>
							<ItemInput label="No Telepon">
								<input
									className="border border-gray-300 rounded-md p-2"
									defaultValue={dataContent?.phonenumber}
									{...register("phonenumber", {
										required: true,
									})}
								/>
							</ItemInput>
							<ItemInput label="Jenis Kelamin">
								<input
									className="border border-gray-300 rounded-md p-2"
									defaultValue={dataContent?.gender}
									{...register("gender", { required: true })}
								/>
							</ItemInput>
							<ItemInput label="Tanggal Lahir">
								<input
									className="border border-gray-300 rounded-md p-2"
									defaultValue={dataContent?.birthdate}
									{...register("birthdate", {
										required: true,
									})}
								/>
							</ItemInput>
							<ItemInput label="Alamat Usaha">
								<input
									className="border border-gray-300 rounded-md p-2"
									defaultValue={dataContent?.address}
									{...register("address", { required: true })}
								/>
							</ItemInput>
							<ItemInput label="Nama Bank">
								{dataContent?.wallet?.bank_name}
							</ItemInput>
							<ItemInput label="Nomor Rekening">
								{dataContent?.wallet?.bank_account_number}
							</ItemInput>
							<ItemInput label="Nama Pemilik Rekening">
								{dataContent?.wallet?.bank_account_name}
							</ItemInput>
							<ItemInput label="">
								<input
									type="submit"
									value="Simpan"
									className="border border-gray-300 rounded-md py-2 px-7 hover:bg-slate-300 cursor-pointer"
								/>
							</ItemInput>
							{notif && (
								<ItemInput label="">
									<div className="text-green-500">
										Data Berhasil disimpan
									</div>
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
						<AiFillCustomerService className="text-3xl" />
						<strong>Bantuan Celeparty Care</strong>
					</Link>
				</div>
			</Box>
		</div>
	);
}
