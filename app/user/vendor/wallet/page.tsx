"use client";
import Box from "@/components/Box";
import ErrorNetwork from "@/components/ErrorNetwork";
import Skeleton from "@/components/Skeleton";
import ItemProduct from "@/components/product/ItemProduct";
import { getDataToken } from "@/lib/services";
import { useQuery } from "@tanstack/react-query";
import _ from "lodash";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Wallet() {
	const session = useSession();
	const dataSession = session?.data as any;

	const getQuery = async () => {
		if (!dataSession?.user?.accessToken) {
			throw new Error("Access token is undefined");
		}
		return await getDataToken(`/users`, `${dataSession?.user?.accessToken}`);
	};
	const query = useQuery({
		queryKey: ["qUserProfile"],
		queryFn: getQuery,
		enabled: !!dataSession?.user?.accessToken,
	});

	if (query.isLoading) {
		return <Skeleton width="100%" height="150px" />;
	}
	if (query.isError) {
		return <ErrorNetwork style="mt-0" />;
	}
	const dataContent = query?.data?.data.data.wallet;

	return (
		<div>
			<Box className="lg:mt-0 mt-2">
				<div className="flex flex-wrap -mx-2">
					<div className="relative pl-[50px]  w-full max-w-[500px]">
						<Image
							src="/images/icon-wallet-2.svg"
							width={35}
							height={35}
							alt="wallet"
							className="absolute left-0 top-0"
						/>
						<div className="relatve text-c-gray-text2 w-[300px] lg:w-auto p-3 lg:p-0">
							<div className="flex flex-row  lg:items-center justify-between">
								<div className="relative">
									<h5 className="text-black text-[14px] lg:text-[16px] lg:font-normal font-bold">Total Saldo Aktif</h5>
									<div className="lg:text-black font-bold text-[14px] lg:text-2xl text-blue-600">Rp. 1.000.000</div>
								</div>
								<div className="bg-c-green text-white shadow-lg lg:py-3 lg:px-10 px-6 py-2 lg:rounded-3xl rounded-xl cursor-pointer text-[14px] lg:text-[16px] max-w-[130px] flex justify-end font-bold lg:font-normal">
									Tarik Saldo
								</div>
							</div>
							<div className="mt-7">
								<div className="flex lg:flex-row flex-col justify-between">
									<div className="text-[14px] lg:text-[16px] font-bold text-black">Saldo Penghasilan</div>
									<div className="text-[14px] lg:text-[16px] font-extrabold text-blue-600 lg:text-black">Rp. 1.000.000</div>
								</div>
								<div className="flex lg:flex-row flex-col justify-between">
									<div className="text-[14px] lg:text-[16px] font-bold text-black">Saldo Refund</div>
									<div className="text-[14px] lg:text-[16px] font-extrabold text-blue-600 lg:text-black">Rp. 0</div>
								</div>
							</div>
							<div className="mt-7 [&_label]:min-w-[220px]">
								<h4 className="text-black text-[14px] lg:text-[17px] font-extrabold lg:font-normal">Informasi Rekening</h4>
								<div className="flex">
									<label className="text-[14px] lg:text-[16px]">Nama Bank</label>
									<div className="text-[14px] lg:text-[16px]">{dataContent?.bank_name}</div>
								</div>
								<div className="flex">
									<label className="text-[14px] lg:text-[16px]">Nomor Rekening</label>
									<div className="text-[14px] lg:text-[16px]">{dataContent?.bank_account_number}</div>
								</div>
								<div className="flex">
									<label className="text-[14px] lg:text-[16px]">Nama Pemilik Rekening</label>
									<div className="text-[14px] lg:text-[16px]">{dataContent?.bank_account_name}</div>
								</div>
							</div>
							<Link
								href="/"
								className="border border-solid border-black text-[14px] lg:text-[16px] py-3 px-10 rounded-xl mt-7 inline-block text-black hover:bg-c-gray hover:text-white w-full lg:w-auto text-center lg:text-start font-extrabold lg:font-normal"
							>
								Edit Rekening
							</Link>
						</div>
					</div>
				</div>
			</Box>
		</div>
	);
}
