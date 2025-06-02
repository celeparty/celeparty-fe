"use client";

import { useToast } from "@/hooks/use-toast";
import { iProductReq } from "@/lib/interfaces/iProduct";
import { axiosUser } from "@/lib/services";
import { fetchAndConvertToFile, formatNumberWithDots } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { ReactNode, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Skeleton from "../Skeleton";
import SubTitle from "../SubTitle";
import { SchemaProduct } from "./SchemaProduct";
import { eAlertType } from "@/lib/enums/eAlert";

interface iItemInputProps {
  label: string;
  sublabel?: string;
  children: ReactNode;
  required: boolean;
}

const ItemInput: React.FC<iItemInputProps> = ({
  label,
  sublabel,
  children,
  required,
}) => {
  return (
    <div className="flex flex-col justify-items-start w-full gap-2 mb-5  [&_input]:bg-gray-100 [&_input]:hover:bg-white [&_textarea]:bg-gray-100 [&_textarea]:hover:bg-white">
      {label ? (
        <div className="w-[full] text-[14px] lg:text-[16px]">
          {label}{" "}
          {required && (
            <>
              <span className="text-c-red">*</span>
            </>
          )}
        </div>
      ) : null}
      {sublabel ? (
        <div className="text-[#DA7E01] text-[13px] lg:text-[10px] ">
          {sublabel}
        </div>
      ) : null}
      {children}
    </div>
  );
};

interface iProductFormProps {
  formDefaultData: iProductReq;
  isEdit: boolean;
}

export const ProductForm: React.FC<iProductFormProps> = ({
  formDefaultData,
  isEdit,
}) => {
  const { data: session, status } = useSession();
  const [stateCategory, setStateCategory] = useState<{
    status: boolean;
    value: number | null;
  }>({
    status: false,
    value: null,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<iProductReq>({
    resolver: zodResolver(SchemaProduct),
    defaultValues: formDefaultData,
  });

  useEffect(() => {
    if (formDefaultData) {
      reset(formDefaultData);
      setStateCategory({
        status: true,
        value: formDefaultData.category?.connect ?? null,
      });
      const convertFile = async () => {
        const { id, url, mime } = formDefaultData.main_image;
        const file = await fetchAndConvertToFile(formDefaultData.main_image);

        setValue("main_image", {
          id: id,
          url: url,
          mime: mime,
        });
        setSelectedFile(file);
      };

      if (formDefaultData && formDefaultData.main_image) {
        convertFile();
      }
    }
  }, [formDefaultData]);

  const formatPriceReq = (price: string | number) => {
    const formattedPrice = parseInt(String(price).replace(/\./g, ""));
    return formattedPrice;
  };

  const onSubmit = async (data: iProductReq) => {
    const formData: any = new FormData();
    formData.append("files", selectedFile);

    try {
      const uploadRes = await axiosUser(
        "POST",
        "/api/upload",
        `${session && session?.jwt}`,
        formData
      );
      const idImage = uploadRes[0].id;

      if (idImage) {
        let updatedData: iProductReq = {
          ...data,
          main_image: idImage,
          category: stateCategory.value
            ? { connect: parseInt(`${stateCategory.value}`) - 1 }
            : null,
          users_permissions_user: {
            connect: {
              id: session?.user.id,
            },
          },
          main_price: formatPriceReq(data.main_price),
          price_min: formatPriceReq(data.price_min),
          price_max: formatPriceReq(data.price_max),
        };

        let response: any;
        if (isEdit) {
          response =
            stateCategory.value !== null &&
            (await axiosUser(
              "PUT",
              `/api/products/${formDefaultData.documentId}`,
              `${session && session?.jwt}`,
              {
                data: updatedData,
              }
            ));
        } else {
          response =
            stateCategory.value !== null &&
            (await axiosUser(
              "POST",
              "/api/products?status=draft'",
              `${session && session?.jwt}`,
              {
                data: updatedData,
              }
            ));
        }

        if (response) {
          toast({
            title: "Sukses",
            description: `Sukses ${isEdit ? "edit" : "menambahkan"} produk!`,
            className: eAlertType.SUCCESS,
          });
        }
      }
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Gagal",
        description: `Gagal ${isEdit ? "edit" : "menambahkan"} produk!`,
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
    <>
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
                    value: item.id,
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
        <ItemInput label="Nama Produk" required>
          <input
            className="border border-gray-300 rounded-md py-2 px-5 w-full text-[14px] lg:text-[16px]"
            placeholder="Nama Produk"
            {...register("title", {
              required: true,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value;
                setValue("title", value);
              },
            })}
          />
          {errors.title && (
            <p className="text-red-500 text-[10px]">{`${errors.title.message}`}</p>
          )}
        </ItemInput>
        <ItemInput label="Tambah Foto" required>
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
        <ItemInput label="Harga Produk (Rp)" required>
          <input
            className="border border-gray-300 rounded-md py-2 px-5 w-full"
            placeholder="Harga Produk (Rp)"
            {...register("main_price", {
              required: true,
              onChange: (e) => {
                const rawValue = e.target.value.replace(/\D/g, ""); // Only digits
                const formatted = formatNumberWithDots(rawValue);
                if (formatted) {
                  setValue("main_price", formatted);
                }
              },
            })}
          />
          {errors.main_price && (
            <p className="text-red-500 text-[10px]">{`${errors.main_price.message}`}</p>
          )}
        </ItemInput>

        <ItemInput label="Deskripsi Produk" required>
          <textarea
            className="border border-gray-300 rounded-md py-2 px-5 w-full text-[14px] lg:text-[16px]"
            placeholder="Deskripsi Produk"
            {...register("description", {
              required: true,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value;
                setValue("description", value);
              },
            })}
          />
          {errors.description && (
            <p className="text-red-500 text-[10px]">{`${errors.description.message}`}</p>
          )}
        </ItemInput>
        <ItemInput label="Harga Minimal Produk (Rp)" required>
          <input
            className="border border-gray-300 rounded-md py-2 px-5 w-full"
            placeholder="Harga Produk (Rp)"
            {...register("price_min", {
              required: true,
              onChange: (e) => {
                const rawValue = e.target.value.replace(/\D/g, "");
                const formatted = formatNumberWithDots(rawValue);
                if (formatted) {
                  setValue("price_min", formatted);
                }
              },
            })}
          />
          {errors.price_min && (
            <p className="text-red-500 text-[10px]">{`${errors.price_min.message}`}</p>
          )}
        </ItemInput>
        <ItemInput label="Harga Maximal Produk (Rp)" required>
          <input
            className="border border-gray-300 rounded-md py-2 px-5 w-full"
            placeholder="Harga Produk (Rp)"
            {...register("price_max", {
              required: true,
              onChange: (e) => {
                const rawValue = e.target.value.replace(/\D/g, "");
                const formatted = formatNumberWithDots(rawValue);
                if (formatted) {
                  setValue("price_max", formatted);
                }
              },
            })}
          />
          {errors.price_max && (
            <p className="text-red-500 text-[10px]">{`${errors.price_max.message}`}</p>
          )}
        </ItemInput>
        <ItemInput label="Minimal Item Pembelian (Optional)" required={false}>
          <label className="text-sm block italic">
            Masukkan jumlah minimum kuantiti pembelian jika produk atau layanan
            Anda memerlukan batas minimal pesanan tertentu.
          </label>
          <input
            className="border border-gray-300 rounded-md py-2 px-5 w-full text-[14px] lg:text-[16px]"
            placeholder="Jumlah Pcs Minimal"
            {...register("minimal_order", {
              required: false,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value;
                setValue("minimal_order", parseInt(value));
              },
            })}
          />
        </ItemInput>
        <ItemInput label="Maksimal Hari Pemesanan (Optional)" required={false}>
          <label className="text-sm block italic">
            Masukkan jumlah hari maksimal pemesanan jika produk atau layanan
            Anda membutuhkan persiapan lebih dari satu hari sebelum acara.
          </label>
          <input
            className="border border-gray-300 rounded-md py-2 px-5 w-full text-[14px] lg:text-[16px]"
            placeholder="(x) Hari Maksimal Pemesanan"
            {...register("minimal_order_date", {
              required: false,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value;
                setValue("minimal_order_date", value);
              },
            })}
          />
        </ItemInput>
        <ItemInput label="Rate Produk" required={false}>
          <input
            className="border border-gray-300 rounded-md py-2 px-5 w-full text-[14px] lg:text-[16px]"
            placeholder="Rate Produk"
            {...register("rate", {
              required: false,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value;
                setValue("rate", parseInt(value));
              },
            })}
          />
          {errors.title && (
            <p className="text-red-500 text-[10px]">{`${errors.title.message}`}</p>
          )}
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
        {/* <ItemInput label="Varian" required={false}>
          <div className="text-[#DA7E01] text-[13px] lg:text-[12px] cursor-pointer">
            Tambah Varian
          </div>
        </ItemInput> */}
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
      {/* {message ? (
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
      ) : null} */}
    </>
  );
};
