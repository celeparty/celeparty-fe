"use client";
import Skeleton from "@/components/Skeleton";
import SubTitle from "@/components/SubTitle";
import { axiosUser } from "@/lib/services";
import { formatNumberWithDots } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { SchemaProduct } from "./SchemaProduct";

function ItemInput({ label, sublabel, children }: any) {
  return (
    <div className="flex flex-col justify-items-start w-full gap-2 mb-5  [&_input]:bg-gray-100 [&_input]:hover:bg-white [&_textarea]:bg-gray-100 [&_textarea]:hover:bg-white">
      {label ? (
        <div className="w-[full] text-[14px] lg:text-[16px]">{label}</div>
      ) : null}
      {sublabel ? (
        <div className="text-[#DA7E01] text-[13px] lg:text-[10px] ">
          {sublabel}
        </div>
      ) : null}
      {children}
    </div>
  );
}

export default function MainContentAddProduct() {
  const { data: session, status } = useSession();
  const [message, setMessage] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState<string | boolean | null>(
    false
  );
  const [stateCategory, setStateCategory] = useState<any>({
    status: false,
    value: null,
  });
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(SchemaProduct),
    defaultValues: {
      main_price: 0,
    },
  });

  const onSubmit: SubmitHandler<any> = async (values) => {
    const formData: any = new FormData();
    formData.append("files", selectedFile);

    const sendNow = async () => {
      try {
        const uploadRes = await axiosUser(
          "POST",
          "/api/upload",
          `${session && session?.jwt}`,
          formData
        );
        const idImage = uploadRes[0].id;
        const data: any = {
          title: values.title,
          minimal_order: values.minimal_order ? values.minimal_order : 0,
          minimal_order_date: values.minimal_order_date
            ? values.minimal_order_date
            : "2026-12-31",
          main_price: values.main_price ? parseInt(values.main_price) : 0,
          main_image: idImage,
          description: values.description,
          category: stateCategory.value
            ? { connect: parseInt(`${stateCategory.value}`) - 1 }
            : null,
          users_permissions_user: {
            connect: {
              id: session?.user.id,
            },
          },
        };

        const response =
          stateCategory.value !== null &&
          (await axiosUser(
            "POST",
            "/api/products?status=draft'",
            `${session && session?.jwt}`,
            {
              data,
            }
          ));
        if (response) {
          setErrorMessage(false);
          setMessage(true);
        }
      } catch (error: any) {
        console.error("Error:", error);
        setMessage(false);
        setErrorMessage(
          error.message ? error.message : error?.response?.data.error.message
        );
      }
    };
    sendNow();
    //reset()
  };

  const getQuery = async () => {
    if (!session?.jwt) {
      throw new Error("Access token is undefined");
    } else {
      return await axiosUser(
        "GET",
        "/api/categories?populate=*",
        `${session && session?.jwt}`
      );
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
        <SubTitle title="Pilih Kategori Produk" className="mb-3" />
        <div className="flex flex-wrap gap-2 mb-5">
          {dataCategory?.map((item: any, i: number) => {
            const isActive = stateCategory.value === item.id;
            return (
              <div
                onClick={() => {
                  setStateCategory({
                    status: true,
                    value: parseInt(`${item.id}`),
                  });
                }}
                key={item.id}
                className={`cursor-pointer hover:bg-c-green hover:text-white hover:border-c-green rounded-3xl border border-solid border-c-gray px-5 py-1 ${
                  isActive
                    ? "bg-c-green text-white border-c-green"
                    : "text-c-black"
                } text-[14px] lg:text-[16px]`}
              >
                {item.title}
              </div>
            );
          })}
        </div>
        <ItemInput>
          <input
            className="border border-gray-300 rounded-md py-2 px-5 w-full text-[14px] lg:text-[16px]"
            placeholder="Nama Produk"
            {...register("title", { required: true })}
          />
          {errors.title && (
            <p className="text-red-500 text-[10px]">{`${errors.title.message}`}</p>
          )}
        </ItemInput>
        <ItemInput sublabel="Tambah Foto">
          <div className="w-full">
            <input
              type="file"
              className="border border-gray-300 rounded-md py-2 px-5 w-full"
              {...register("main_image", { required: false })}
              onChange={(e: any) => setSelectedFile(e.target.files[0])}
            />
            {errors.main_image && (
              <p className="text-red-500 text-[10px]">
                Gambar produk harus diisi
              </p>
            )}
          </div>
        </ItemInput>
        <ItemInput sublabel="Tambah Foto">
          <div className="w-full">
            <input
              type="file"
              className="border border-gray-300 rounded-md py-2 px-5 w-full"
              {...register("main_image", { required: false })}
              onChange={(e: any) => setSelectedFile(e.target.files[0])}
            />
            {errors.main_image && (
              <p className="text-red-500 text-[10px]">
                Gambar produk harus diisi
              </p>
            )}
          </div>
        </ItemInput>
        <ItemInput label="Harga Produk (Rp)">
          <input
            className="border border-gray-300 rounded-md py-2 px-5 w-full"
            placeholder="Harga Produk (Rp)"
            inputMode="numeric"
            pattern="[0-9]*"
            {...register("main_price", {
              required: true,
              valueAsNumber: true,
              onChange: (e) => {
                const rawValue = e.target.value.replace(/\D/g, ""); // Only digits
                const formatted = formatNumberWithDots(rawValue);
                setValue("main_price", formatted);
              },
            })}
          />
          {errors.main_price && (
            <p className="text-red-500 text-[10px]">{`${errors.main_price.message}`}</p>
          )}
        </ItemInput>
        <ItemInput>
          <textarea
            className="border border-gray-300 rounded-md py-2 px-5 w-full text-[14px] lg:text-[16px]"
            placeholder="Deskripsi Produk"
            {...register("description", { required: true })}
          />
          {errors.description && (
            <p className="text-red-500 text-[10px]">{`${errors.description.message}`}</p>
          )}
        </ItemInput>
        <ItemInput label="Minimal Item Pembelian (Optional)">
          <label className="text-sm block italic">
            Masukkan jumlah minimum kuantiti pembelian jika produk atau layanan
            Anda memerlukan batas minimal pesanan tertentu.
          </label>
          <input
            className="border border-gray-300 rounded-md py-2 px-5 w-full text-[14px] lg:text-[16px]"
            placeholder="Jumlah Pcs Minimal"
            {...register("minimal_order", { required: false })}
          />
        </ItemInput>
        <ItemInput label="Maksimal Hari Pemesanan (Optional)">
          <label className="text-sm block italic">
            Masukkan jumlah hari maksimal pemesanan jika produk atau layanan
            Anda membutuhkan persiapan lebih dari satu hari sebelum acara.
          </label>
          <input
            className="border border-gray-300 rounded-md py-2 px-5 w-full text-[14px] lg:text-[16px]"
            placeholder="(x) Hari Maksimal Pemesanan"
            {...register("minimal_order_date", { required: false })}
          />
        </ItemInput>
        {/* <ItemInput label="Tema">
					<div className="flex flex-wrap gap-2 mb-5">
						{dataThemes?.map((item: any, i: number) => {
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
						})}
					</div>
					{errors.name && <p className="text-red-500 text-[10px]">Tidak Boleh Kosong</p>}
				</ItemInput> */}
        <ItemInput label="Varian">
          <div className="text-[#DA7E01] text-[13px] lg:text-[12px] cursor-pointer">
            Tambah Varian
          </div>
        </ItemInput>
        <div className="flex justify-center">
          {stateCategory.status ? (
            <input
              type="submit"
              value="Simpan Produk"
              className="border border-gray-300 rounded-[30px] py-4 px-7 min-w-[250px] hover:bg-slate-300 cursor-pointer bg-c-green text-white shadow text-[14px] lg:text-[16px]"
            />
          ) : (
            <input
              type="disabled"
              value="Simpan Produk"
              className="border-0 outline-none border-gray-300 text-center rounded-[30px] py-4 px-7 min-w-[250px] bg-slate-300 cursor-default  text-white shadow text-[14px] lg:text-[16px]"
            />
          )}
        </div>
      </form>
      {message ? (
        <div className="lg:mt-1 mt-3 text-green-500 text-[14px] lg:text-[16px] text-center">
          Add product berhasil, produk akan direview oleh admin
        </div>
      ) : null}
      {errorMessage ? (
        <div className="text-red-500 lg:mt-1 mt-3 text-[14px] lg:text-[16px] text-center">
          {errorMessage === "Network Error"
            ? "Pilih gambar lebih kecil"
            : errorMessage}
        </div>
      ) : null}
    </div>
  );
}
