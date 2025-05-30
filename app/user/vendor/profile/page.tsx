"use client";
import Box from "@/components/Box";
import React, { useEffect, useState } from "react";

import ErrorNetwork from "@/components/ErrorNetwork";
import Skeleton from "@/components/Skeleton";
import { axiosUser, getDataToken, putDataToken } from "@/lib/services";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import {
  Controller,
  type SubmitHandler,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { AiFillCustomerService } from "react-icons/ai";
import { GrEdit, GrFormEdit } from "react-icons/gr";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { iMerchantProfile, iServiceLocation } from "@/lib/interfaces/iMerchant";
import { Button } from "@/components/ui/button";
import { DatePickerInput } from "@/components/form-components/DatePicker";
import { format, isValid, parse, parseISO } from "date-fns";

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

function ItemInput({
  label,
  children,
}: {
  label?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-items-start w-full gap-2 mb-3 items-start">
      <div
        className={`${
          label ? "w-[130px] lg:w-[200px]" : "w-0"
        } py-2 text-[14px] lg:text-[16px]`}
      >
        {label}
      </div>
      <div className="flex-1 pt-[6px] lg:pt-[6px] text-[14px] lg:text-[16px]">
        {children}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState<iMerchantProfile>();
  const [notif, setNotif] = React.useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    control,
    reset,
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  } = useForm<iMerchantProfile>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "serviceLocation",
  });

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const onSubmit: SubmitHandler<UserData> = async (data) => {
    console.log(data);
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

  const dataContent: iMerchantProfile = query?.data;

  useEffect(() => {
    if (query.data) {
      reset(query.data);
      setFormData(query.data);
    }
  }, [query.data, reset]);

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

  return (
    <div>
      <Box className="mt-0">
        <h4 className="lg:font-semibold font-extrabold text-[14px] lg:text-[16px] mb-1">
          Info Profil
        </h4>
        <div className="mt-2 lg:mt-7">
          {dataContent ? (
            <form onSubmit={handleSubmit(onSubmit)}>
              <ItemInput label="Nama">
                <input
                  className="border border-[#ADADAD] rounded-md p-2 text-[14px] lg:text-[16px] w-full"
                  defaultValue={dataContent?.name}
                  {...register("name", { required: true })}
                />
              </ItemInput>
              <ItemInput label="Nama Usaha">
                <input
                  className="border border-[#ADADAD] rounded-md p-2 text-[14px] lg:text-[16px] w-full"
                  defaultValue={dataContent?.companyName}
                  {...register("companyName", { required: true })}
                />
              </ItemInput>
              <div className="flex items-start align-top">
                <ItemInput label="Lokasi Pelayanan">
                  <div className="flex flex-col">
                    {fields.map((item: iServiceLocation, i: number) => {
                      return (
                        <div
                          key={i}
                          className="flex lg:flex-row flex-col gap-1 w-full"
                        >
                          <input
                            className="border flex-1 mb-2 border-[#ADADAD] rounded-md p-2 text-[14px] lg:text-[16px]"
                            defaultValue={item?.region}
                            {...register(`serviceLocation.${i}.region`, {
                              required: true,
                            })}
                          />
                          <input
                            className="border flex-1 mb-2 border-[#ADADAD] rounded-md p-2 text-[14px] lg:text-[16px]"
                            defaultValue={item?.subregion}
                            {...register(`serviceLocation.${i}.subregion`, {
                              required: true,
                            })}
                          />
                        </div>
                      );
                    })}
                  </div>
                </ItemInput>
              </div>
              <ItemInput label="User ID">{dataContent?.id}</ItemInput>
              <ItemInput label="Email">{dataContent?.email}</ItemInput>
              <ItemInput label="No Telepon">
                <input
                  className="border border-[#ADADAD] rounded-md p-2 text-[14px] lg:text-[16px] w-full"
                  defaultValue={dataContent?.phone}
                  {...register("phone", {
                    required: true,
                  })}
                />
              </ItemInput>
              <ItemInput label="Tanggal Lahir">
                <Controller
                  name="birthdate"
                  control={control}
                  render={({ field }) => (
                    <>
                      <DatePickerInput
                        textLabel="Tanggal Lahir"
                        onChange={(date) => {
                          if (date instanceof Date && isValid(date)) {
                            field.onChange(
                              date?.toISOString().split("T")[0] ?? null
                            );
                          }
                        }}
                        value={field.value ? parseISO(field.value) : null}
                        className="w-full"
                      />
                    </>
                  )}
                />
              </ItemInput>
              <ItemInput label="Tempat Lahir">
                <input
                  className="border border-[#ADADAD] rounded-md p-2 text-[14px] lg:text-[16px] w-full"
                  defaultValue={dataContent?.birthplace}
                  {...register("birthplace", {
                    required: true,
                  })}
                />
              </ItemInput>
              <ItemInput label="Alamat Usaha">
                <textarea
                  className="border border-[#ADADAD] rounded-md p-2 lg:w-full min-h-[100px] text-[14px] lg:text-[16px] w-full"
                  defaultValue={dataContent?.address}
                  {...register("address", { required: true })}
                />
              </ItemInput>
              <ItemInput label="Nama Bank">
                <input
                  className="border border-[#ADADAD] rounded-md p-2 text-[14px] lg:text-[16px] w-full"
                  defaultValue={dataContent?.bankName}
                  {...register("bankName", {
                    required: true,
                  })}
                />
              </ItemInput>
              <ItemInput label="Nomor Rekening">
                <input
                  className="border border-[#ADADAD] rounded-md p-2 text-[14px] lg:text-[16px] w-full"
                  defaultValue={dataContent?.accountNumber}
                  {...register("accountNumber", {
                    required: true,
                  })}
                />
              </ItemInput>
              <ItemInput label="Nama Pemilik Rekening">
                <input
                  className="border border-[#ADADAD] rounded-md p-2 text-[14px] lg:text-[16px] w-full"
                  defaultValue={dataContent?.accountName}
                  {...register("accountName", {
                    required: true,
                  })}
                />
              </ItemInput>
              <div className="text-right">
                <Button variant={"green"}>Simpan</Button>
              </div>
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
            <strong className="text-[14px] lg:text-[16px]">
              Bantuan Celeparty Care
            </strong>
          </Link>
        </div>
      </Box>
    </div>
  );
}
