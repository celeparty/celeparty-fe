"use client";

import React, { useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { axiosUser } from "@/lib/services";
import Box from "@/components/Box";
import Link from "next/link";
import { AiFillCustomerService } from "react-icons/ai";
import { type SubmitHandler, useForm } from "react-hook-form";

function ItemInput({ label, children }: {label: string, children: React.ReactNode}) {
	return (
		<div className="flex justify-items-start w-full gap-2 mb-3 items-center">
			<div className="w-[200px]">{label}</div>
			{children}
		</div>
	);
}

interface MyDataType {
	username: string;
	name: string;
	address: string;
	documentId: string;
	email: string;
	phone: string
  }

export default function User() {
	const { data: session, status } = useSession();
	const [myData, setMyData] = useState<MyDataType >();
	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	} = useForm<any>();

	const onSubmit =  () => {
		console.log("Hello");
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
	useEffect(() => {
		if (status === "authenticated") {
			axiosUser("GET", "/api/users/me", `${session && session?.jwt}`).then((res) => {
				setMyData(res)
			})
		}
	}, [status]);
	return (
		<div>
		<Box className="mt-0">
			<h4 className="font-semibold text-[16px] mb-1">Info Profil</h4>
			<div className="mt-7">
			<form onSubmit={handleSubmit(onSubmit)}>
						<ItemInput label="Nama">
							<input
								className="border border-gray-300 rounded-md p-2"
								defaultValue={myData?.username || ""}
								{...register("name", { required: true })}
							/>
						</ItemInput>
						<ItemInput label="Nama Usaha">
							<input
								className="border border-gray-300 rounded-md p-2"
								defaultValue={myData?.name}
								{...register("company", { required: true })}
							/>
						</ItemInput>
						<ItemInput label="Regional">
							<input
								className="border border-gray-300 rounded-md p-2"
								defaultValue={myData?.address}
								{...register("region", { required: true })}
							/>
						</ItemInput>
						<ItemInput label="User ID">{myData?.documentId}</ItemInput>
						<ItemInput label="Email">{myData?.email}</ItemInput>
						<ItemInput label="No Telepon">
							<input
								className="border border-gray-300 rounded-md p-2"
								defaultValue={myData?.phone}
								{...register("phonenumber", {
									required: true,
								})}
							/>
						</ItemInput>
						<ItemInput label="">
							<input
								type="submit"
								value="Simpan"
								className="border border-gray-300 rounded-md py-2 px-7 hover:bg-slate-300 cursor-pointer"
							/>
						</ItemInput>
			</form>
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

	)
}
