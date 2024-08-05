"use client"
import React from 'react'
import { useQuery } from "@tanstack/react-query";
import Skeleton from "@/components/Skeleton";
import { getDataToken } from "@/lib/services";
import ErrorNetwork from "@/components/ErrorNetwork";
import { useSession } from "next-auth/react";
import _ from "lodash";
import Box from "@/components/Box";
import ItemProduct from "@/components/product/ItemProduct";
import Image from "next/image";
import Link from "next/link";



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
        return <Skeleton width="100%" height="150px" />
    }
    if (query.isError) {
        return <ErrorNetwork style="mt-0" />
    }
    const dataContent = query?.data?.data.data.wallet
    console.log(dataSession.token)

    return (
        <div>
            <Box className="mt-0" >
                <div className="flex flex-wrap -mx-2">
                    <div className="relative pl-[50px]  w-full max-w-[500px]">
                        <Image src="/images/icon-wallet-2.svg" width={35} height={35} alt="wallet" className="absolute left-0 top-0" />
                        <div className="relatve text-c-gray-text2">
                            <div className="flex items-center justify-between">
                                <div className="relative">
                                    <h5 className="text-black">Total Saldo Aktif</h5>
                                    <div className="text-black font-bold text-2xl">Rp. 1.000.000</div>
                                </div>
                                <div className="bg-c-green text-white shadow-lg py-3 px-10 rounded-3xl cursor-pointer">Tarik Saldo</div>
                            </div>
                            <div className="mt-7">
                                <div className="flex justify-between">
                                    <div>Saldo Penghasilan</div>
                                    <div>Rp. 1.000.000</div>
                                </div>
                                <div className="flex justify-between">
                                    <div>Saldo Refund</div>
                                    <div>Rp. 0</div>
                                </div>
                            </div>
                            <div className="mt-7 [&_label]:min-w-[220px]">
                                <h4 className="text-black text-[17px]">Informasi Rekening</h4>
                                <div className="flex">
                                    <label>Nama Bank</label>
                                    <div>{dataContent?.bank_name}</div>
                                </div>
                                <div className="flex">
                                    <label>Nomor Rekening</label>
                                    <div>{dataContent?.bank_account_number}</div>
                                </div>
                                <div className="flex">
                                    <label>Nama Pemilik Rekening</label>
                                    <div>{dataContent?.bank_account_name}</div>
                                </div>
                            </div>
                            <Link href="/" className="border border-solid border-black py-3 px-10 rounded-xl mt-7 inline-block text-black hover:bg-c-gray hover:text-white">Edit Rekening</Link>
                        </div>
                    </div>
                </div>
            </Box>
        </div>

    )
}
