"use client"
import Box from "@/components/Box"
import React from 'react'
import { useQuery } from "@tanstack/react-query";
import Skeleton from "@/components/Skeleton";
import { getDataToken } from "@/lib/services";
import ErrorNetwork from "@/components/ErrorNetwork";
import { AiFillCustomerService } from "react-icons/ai";
import Link from "next/link";
import { useSession } from "next-auth/react";

type UserData = {
    name?: string | null | undefined;
    email?: string | null | undefined;
    image?: string | null | undefined;
    accessToken?: string | null | undefined; // Add the accessToken property
};

type SessionData = {
    user?: UserData; // Update the type of user to include the accessToken property
};

function ItemData({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex gap-2 mb-3">
            <div className="min-w-[210px]">{label}</div>
            <div><strong>{value}</strong></div>
        </div>
    )
}
export default function ProfilePage() {

    const session = useSession();
    const dataSession = session?.data as SessionData;

    const getQuery = async () => {
        if (!dataSession?.user?.accessToken) {
            throw new Error("Access token is undefined");
        }
        return await getDataToken(`/users`, `${dataSession?.user?.accessToken}`);
    };
    const query = useQuery({
        queryKey: ["qProducts"],
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
                    <ItemData label="Nama" value={dataContent?.name} />
                    <ItemData label="Nama Usaha" value={dataContent?.vendor.name} />
                    <ItemData label="Lokasi Pelayanan" value={dataContent?.region} />
                    <ItemData label="User ID" value={dataContent?.id} />
                    <ItemData label="Email" value={dataContent?.email} />
                    <ItemData label="No Telepon" value={dataContent?.phonenumber} />
                    <ItemData label="Jenis Kelamin" value={dataContent?.gender} />
                    <ItemData label="Tanggal Lahir" value={dataContent?.birthdate} />
                    <ItemData label="Alamat Usaha" value={dataContent?.address} />
                    <ItemData label="Nama Bank" value={dataContent?.wallet.bank_name} />
                    <ItemData label="Nomor Rekening" value={dataContent?.wallet.bank_account_number} />
                    <ItemData label="Nama Pemilik Rekening" value={dataContent?.wallet.bank_account_name} />
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
