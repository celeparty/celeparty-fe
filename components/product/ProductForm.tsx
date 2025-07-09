"use client";

import { useToast } from "@/hooks/use-toast";
import { eAlertType } from "@/lib/enums/eAlert";
import {
  iProductImage,
  iProductReq,
  iProductVariant,
} from "@/lib/interfaces/iProduct";
import { axiosUser } from "@/lib/services";
import { fetchAndConvertToFile, formatNumberWithDots } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import React, { ReactNode, useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import Skeleton from "../Skeleton";
import SubTitle from "../SubTitle";
import { Button } from "../ui/button";
import { FileUploader } from "./FileUploader";
import { SchemaProduct } from "./SchemaProduct";
import { ProductVariantItem } from "./ProductVariant";

interface iItemInputProps {
  label: string;
  sublabel?: string;
  children: ReactNode;
  required: boolean;
}

const MAX_IMAGES = 5;

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

  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    getValues,
    control,
    formState: { errors },
  } = useForm<iProductReq>({
    resolver: zodResolver(SchemaProduct),
    defaultValues: {
      ...formDefaultData,
      main_image: formDefaultData?.main_image || [],
      escrow: formDefaultData?.escrow || false,
    },
  });

  const {
    fields: mainImageFields,
    append: appendMainImage,
    remove: removeMainImage,
  } = useFieldArray({
    control,
    name: "main_image",
  });

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control,
    name: "variant",
  });

  const escrowChecked = watch("escrow");

  const convertAndSetEditImages = async () => {
    if (!formDefaultData?.main_image) return;

    // Convert all images to File objects (for preview) while keeping original data
    const processedImages = await Promise.all(
      formDefaultData.main_image.map(async (img) => {
        if (img.url && !img.url.startsWith("blob:")) {
          try {
            const file = await fetchAndConvertToFile(img);
            return {
              ...img,
              file, // Temporary file reference
              url: URL.createObjectURL(file), // Create preview URL
            };
          } catch (error) {
            console.error("Failed to convert image:", error);
            return img;
          }
        }
        return img;
      })
    );

    // Set form values
    setValue("main_image", processedImages);
  };

  // Initialize empty slots for images
  useEffect(() => {
    if (mainImageFields.length === 0) {
      handleAddImage();
    }
  }, []);

  const handleFileChange = async (index: number, file: File | null) => {
    if (file) {
      const imageObj: iProductImage = {
        id: `temp-${Date.now()}`,
        url: URL.createObjectURL(file),
        mime: file.type,
      };

      const currentImages = getValues("main_image");
      currentImages[index] = imageObj;
      setValue("main_image", currentImages, { shouldDirty: true });
    }
  };

  const handleRemoveImage = (index: number) => {
    // Clean up object URL
    const currentImage = getValues(`main_image.${index}`);
    if (currentImage?.url?.startsWith("blob:")) {
      URL.revokeObjectURL(currentImage.url);
    }
    removeMainImage(index);
  };

  const handleAddImage = () => {
    if (mainImageFields.length < MAX_IMAGES) {
      appendMainImage({ id: "", url: "", mime: "" });
    }
  };

  const addVariant = () => {
    appendVariant({
      name: "",
      price: 0,
      quota: "",
      purchase_deadline: "",
    });
  };

  useEffect(() => {
    if (formDefaultData) {
      reset(formDefaultData);
      setStateCategory({
        status: true,
        value: formDefaultData.category?.connect ?? null,
      });

      if (formDefaultData && formDefaultData.main_image) {
        convertAndSetEditImages();
      }
    }
  }, [formDefaultData]);

  const formatPriceReq = (price: string | number) => {
    const formattedPrice = parseInt(String(price).replace(/\./g, ""));
    return formattedPrice;
  };

  const onSubmit = async (data: iProductReq) => {
    try {
      // Get current field values (including unregistered fields)
      const formValues = getValues();

      // Handle image uploads from fields
      const uploadedImages = await Promise.all(
        mainImageFields.map(async (field, index) => {
          const fieldData = formValues.main_image[index];

          // Skip upload if already has ID (existing image)
          if (fieldData?.id) return fieldData;

          // Upload new image if file exists
          if (fieldData?.file) {
            const formData = new FormData();
            formData.append("files", fieldData.file);

            const uploadRes = await axiosUser(
              "POST",
              "/api/upload",
              session?.jwt || "",
              formData
            );

            return {
              id: uploadRes[0].id,
              url: uploadRes[0].url,
              mime: fieldData.file.type,
            };
          }

          return fieldData || { id: "", url: "", mime: "" };
        })
      );

      if (uploadedImages?.length > 0) {
        const variants: iProductVariant[] = variantFields
          ? variantFields.map((v) => ({
              name: v.name ?? "",
              price: Number(v.price) || 0,
              quota: v.quota?.toString() || "0",
              purchase_deadline:
                v.purchase_deadline || new Date().toISOString(),
            }))
          : [];
        let updatedData: iProductReq = {
          ...data,
          main_image: uploadedImages.filter((img) => img?.id), // Filter out empty images
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
          variant: variants,
          escrow: escrowChecked,
        };

        console.log(variantFields, variants);

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
        <SubTitle title="Pilih Foto Produk" className="mb-3" />
        <div className="image-upload-container flex flex-wrap gap-2 mb-5">
          {mainImageFields.map((field, index) => (
            <React.Fragment key={index}>
              <div className="image-item  w-[20%]">
                <FileUploader
                  key={field.id}
                  image={field}
                  onFileChange={(file) => handleFileChange(index, file)}
                  onRemove={() => handleRemoveImage(index)}
                />
              </div>
            </React.Fragment>
          ))}
          <div className="w-full">
            {mainImageFields.length < MAX_IMAGES && (
              <Button
                type="button"
                variant={"default"}
                onClick={handleAddImage}
              >
                Add Image ({mainImageFields.length}/{MAX_IMAGES})
              </Button>
            )}
          </div>
        </div>

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
        <SubTitle title="Tambah Variant Produk" className="mb-3" />
        <div className="w-full mb-3">
          {mainImageFields.length < MAX_IMAGES && (
            <Button type="button" variant={"default"} onClick={addVariant}>
              Add Variant
            </Button>
          )}
        </div>
        {variantFields.map((field, index) => (
          <ProductVariantItem
            key={field.id}
            index={index}
            register={register}
            control={control}
            onRemove={() => removeVariant(index)}
          />
        ))}

        <SubTitle title="Escrow" className="mb-3" />
        <ItemInput label="Enable Escrow" required={false}>
          <Controller
            name="escrow"
            control={control}
            render={({ field }) => (
              <input
                type="checkbox"
                checked={field.value ?? false}
                onChange={(e) => {
                  field.onChange(e.target.checked);
                  if (!e.target.checked) {
                    setValue("escrow", false);
                  } else {
                    setValue("escrow", true);
                  }
                }}
                className="w-fit"
              />
            )}
          />
          {errors.escrow && (
            <p className="text-red-500 text-[10px]">{`${errors.escrow.message}`}</p>
          )}
        </ItemInput>

        {escrowChecked && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-bold mb-2">Catatan:</p>
            <ol className="list-decimal list-inside">
              <li>30% Down Payment, untuk book tanggal acara</li>
              <li>100%, maximum H-1 tanggal loading</li>
              <li>
                Jika sampai H-1 tanggal loading pembayaran belum mencapai 100%,
                sisa dana akan dikembalikan ke User, kecuali dana yang sudah
                masuk Down Payment.
              </li>
            </ol>
          </div>
        )}

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
