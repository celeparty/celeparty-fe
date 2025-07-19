"use client";
import Box from "@/components/Box";
import React, { useEffect, useState } from "react";

import ErrorNetwork from "@/components/ErrorNetwork";
import Skeleton from "@/components/Skeleton";
import { axiosRegion, axiosUser } from "@/lib/services";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

import { DatePickerInput } from "@/components/form-components/DatePicker";
import RegionSubregionSelector from "@/components/profile/vendor/region-subregion-selector";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { eAlertType } from "@/lib/enums/eAlert";
import { iSelectOption } from "@/lib/interfaces/iCommon";
import { iMerchantProfile } from "@/lib/interfaces/iMerchant";
import { isValid, parseISO } from "date-fns";
import Link from "next/link";
import {
  Controller,
  FormProvider,
  type SubmitHandler,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { AiFillCustomerService } from "react-icons/ai";
import { IoMdAddCircleOutline, IoMdRemoveCircleOutline } from "react-icons/io";

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

const getProvinces = async (): Promise<iSelectOption[]> => {
  const response = await axiosRegion("GET", "provinsi");
  return (
    response?.value?.map((item: any) => ({
      value: item.id,
      label: item.name,
    })) || []
  );
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [notif, setNotif] = React.useState(false);

  const { toast } = useToast();

  const formMethods = useForm<iMerchantProfile>();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    control,
    reset,
  } = formMethods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "serviceLocation",
  });

  const sanitizeUserData = (formData: iMerchantProfile) => {
    const {
      role,
      password,
      resetPasswordToken,
      confirmationToken,
      ...cleanData
    } = formData;
    return cleanData;
  };

  const onSubmit: SubmitHandler<iMerchantProfile> = async (
    formData: iMerchantProfile
  ) => {
    const updatedFormData = sanitizeUserData(formData);
    try {
      const response = await axiosUser(
        "PUT",
        `/api/users/${formData.id}`,
        `${session && session?.jwt}`,
        updatedFormData
      );

      if (response) {
        toast({
          title: "Sukses",
          description: "Update profile berhasil!",
          className: eAlertType.SUCCESS,
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Gagal",
        description: "Update profile gagal!",
        className: eAlertType.FAILED,
      });
    }
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

  const { data: provinceOptions = [], isLoading } = useQuery({
    queryKey: ["provinces"],
    queryFn: getProvinces,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (query.data && dataContent) {
      formMethods.reset(dataContent);
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
              <FormProvider {...formMethods}>
                <div className="flex items-start align-top">
                  <ItemInput label="Lokasi Pelayanan">
                    <div>
                      {fields.map((field, index) => (
                        <React.Fragment key={index}>
                          <div className="mb-2 flex gap-1">
                            <RegionSubregionSelector
                              index={index}
                              provinceOptions={provinceOptions}
                            />

                            {fields.length > 1 && (
                              <button
                                type="button"
                                className="text-red-500 text-2xl"
                                onClick={() => remove(index)}
                              >
                                <IoMdRemoveCircleOutline />
                              </button>
                            )}
                          </div>
                        </React.Fragment>
                      ))}

                      {fields.length >= 5 && (
                        <p className="text-red-500 text-sm mt-2">
                          Maximum Province Allowed is 5
                        </p>
                      )}

                      {fields.length < 5 && (
                        <button
                          type="button"
                          className="flex gap-1 items-center bg-c-blue py-2 px-5 text-white"
                          onClick={() =>
                            append({
                              region: "",
                              subregion: "",
                              id: "",
                              idSubRegion: "",
                            })
                          }
                        >
                          <IoMdAddCircleOutline /> Tambah Lokasi
                        </button>
                      )}
                    </div>
                  </ItemInput>
                </div>
              </FormProvider>

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
