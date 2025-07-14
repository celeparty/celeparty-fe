"use client";
import Box from "@/components/Box";
import ErrorNetwork from "@/components/ErrorNetwork";
import Skeleton from "@/components/Skeleton";
import ItemProduct from "@/components/product/ItemProduct";
import { Button } from "@/components/ui/button";
import { iMerchantProfile } from "@/lib/interfaces/iMerchant";
import { axiosUser, getDataToken } from "@/lib/services";
import { useQuery } from "@tanstack/react-query";
import _ from "lodash";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Wallet() {
  const { data: session, status } = useSession();

  const getQuery = async () => {
    if (!session?.jwt) {
      throw new Error("Access token is undefined");
    } else {
      return await axiosUser(
        "GET",
        "/api/users/me",
        `${session && session?.jwt}`
      );
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
    return <Skeleton width="100%" height="150px" />;
  }
  if (query.isError) {
    return <ErrorNetwork style="mt-0" />;
  }
  const dataContent: iMerchantProfile = query?.data;

  return (
    <div>
      <Box className="lg:mt-0 mt-2">
        <div className="relative pl-[50px]">
          <Image
            src="/images/icon-wallet-2.svg"
            width={35}
            height={35}
            alt="wallet"
            className="absolute left-0 top-0"
          />
          <div className=" text-c-gray-text2 w-[300px] lg:w-auto p-3 lg:p-0">
            <div className="flex flex-row gap-2 justify-between">
              <div className="l-side">
                <h5 className="text-black text-[14px] lg:text-[16px] lg:font-normal font-bold">
                  Total Saldo Aktif
                </h5>
                <div className="font-bold text-[14px] lg:text-2xl text-c-green">
                  Rp. 1.000.000
                </div>
                <div className="mt-7">
                  <div className="flex gap-5">
                    <div className="l-side">
                      <div className="text-[14px] lg:text-[16px] font-bold text-black">
                        Saldo Penghasilan
                      </div>
                      <div className="text-[14px] lg:text-[16px] font-bold text-black">
                        Saldo Refund
                      </div>
                    </div>
                    <div className="r-side">
                      <div className="text-[14px] lg:text-[16px] text-c-green">
                        Rp. 1.000.000
                      </div>
                      <div className="text-[14px] lg:text-[16px] text-c-green">
                        Rp. 0
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="r-side">
                <div className="btn-wrapper mt-2">
                  <Button variant={"green"}>Tarik Saldo</Button>
                </div>
              </div>
            </div>
            <div className="mt-7 [&_label]:min-w-[220px]">
              <h4 className="text-black text-[14px] lg:text-[17px] font-extrabold">
                Informasi Rekening
              </h4>
              <div className="flex">
                <label className="text-[14px] lg:text-[16px] text-black">
                  Nama Bank
                </label>
                <div className="text-[14px] lg:text-[16px] text-black uppercase">
                  {dataContent?.bankName}
                </div>
              </div>
              <div className="flex py-1">
                <label className="text-[14px] lg:text-[16px] text-black">
                  Nomor Rekening
                </label>
                <div className="text-[14px] lg:text-[16px] text-black capitalize">
                  {dataContent?.accountNumber}
                </div>
              </div>
              <div className="flex">
                <label className="text-[14px] lg:text-[16px] text-black">
                  Nama Pemilik Rekening
                </label>
                <div className="text-[14px] lg:text-[16px] text-black capitalize">
                  {dataContent?.accountName}
                </div>
              </div>
            </div>
            <Link
              href="/user/vendor/profile"
              className="border border-solid border-black text-[14px] lg:text-[16px] py-3 px-10 rounded-xl mt-7 inline-block text-black hover:bg-c-gray hover:text-white w-full lg:w-auto text-center lg:text-start font-extrabold lg:font-normal"
            >
              Edit Rekening
            </Link>
          </div>
        </div>
      </Box>
    </div>
  );
}
