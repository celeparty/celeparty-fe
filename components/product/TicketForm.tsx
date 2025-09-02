import { FileUploader } from "@/components/product/FileUploader";
import { ProductItemInput } from "@/components/product/ProductItemInput";
import { TicketVariantItem } from "@/components/product/TicketVariant";
import SubTitle from "@/components/SubTitle";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { formatYearDate } from "@/lib/dateUtils";
import { eAlertType } from "@/lib/enums/eAlert";
import {
  iProductImage,
  iProductVariant,
  iTicketFormReq,
  iTicketImage,
  iTicketVariant,
} from "@/lib/interfaces/iProduct";
import { axiosUser } from "@/lib/services";
import { fetchAndConvertToFile, formatMoneyReq } from "@/lib/utils";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { DatePickerInput } from "../form-components/DatePicker";
import { parse, isValid as isDateValid, format } from "date-fns";
import { getLowestVariantPrice } from "@/lib/productUtils";

const MAX_IMAGES = 5;

interface iTicketFormProps {
  formDefaultData: iTicketFormReq;
  isEdit: boolean;
}

export const TicketForm: React.FC<iTicketFormProps> = ({
  isEdit,
  formDefaultData,
}) => {
  // TODO: USe when request with selector
  // const [subregionOptions, setSubregionOptions] = useState<iSelectOption[]>([]);
  // const [selectedProvince, setSelectedProvince] = useState<string>("");

  // const getProvinces = async (): Promise<iSelectOption[]> => {
  //   const response = await axiosRegion("GET", "provinsi");
  //   return (
  //     response?.value?.map((item: any) => ({
  //       value: item.id,
  //       label: item.name,
  //     })) || []
  //   );
  // };

  // const { data: provinceOptions = [], isLoading } = useQuery({
  //   queryKey: ["provinces"],
  //   queryFn: getProvinces,
  //   staleTime: 5 * 60 * 1000,
  // });

  const { data: session } = useSession();
  const [form, setForm] = useState<iTicketFormReq>(formDefaultData);
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  const formMethods = useForm<iTicketFormReq>({
    defaultValues: {
      ...formDefaultData,
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    control,
    reset,
    formState: { errors, isValid },
  } = formMethods;

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

  const addVariant = () => {
    appendVariant({
      name: "",
      price: 0,
      quota: "",
    });
  };

  // useEffect(() => {
  //   const fetchSubregion = async () => {
  //     if (!selectedProvince) return;
  //     try {
  //       const response = await axiosRegion(
  //         "GET",
  //         "kabupaten",
  //         selectedProvince
  //       );
  //       setSubregionOptions(
  //         (response?.value || []).map((item: iSubregionRes) => ({
  //           label: item.name,
  //           value: item.id,
  //         }))
  //       );
  //     } catch (error) {
  //       console.error("Error fetching subregions:", error);
  //     }
  //   };

  //   fetchSubregion();
  // }, [selectedProvince]);

  useEffect(() => {
    if (formDefaultData) {
      reset(formDefaultData);
      if (formDefaultData && formDefaultData.main_image) {
        convertAndSetEditImages();
      }
    }
  }, [formDefaultData]);

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

  const handleFileChange = async (index: number, file: File | null) => {
    if (file) {
      const imageObj: iProductImage = {
        id: `temp-${Date.now()}`,
        url: URL.createObjectURL(file),
        mime: file.type,
        file: file,
      };

      const currentImages = getValues("main_image");
      currentImages[index] = imageObj;
      setValue("main_image", currentImages, { shouldDirty: true });
    }
  };

  const handleRemoveImage = (index: number) => {
    const currentImage = getValues(`main_image.${index}`);
    if (currentImage?.url?.startsWith("blob:")) {
      URL.revokeObjectURL(currentImage.url);
    }
    removeMainImage(index);
  };

  const handleAddImage = () => {
    if (mainImageFields.length < MAX_IMAGES) {
      appendMainImage({ id: "" });
    }
  };

  const handleUploadImage = async () => {
    const formValues = getValues();
    const uploadedImages = await Promise.all(
      mainImageFields.map(async (field, index) => {
        const fieldData = formValues.main_image[index];

        // Jika sudah ada id (gambar lama), langsung pakai
        if (fieldData?.id && !String(fieldData.id).startsWith("temp-")) {
          return {
            id: String(fieldData.id),
            url: fieldData.url || undefined,
          };
        }

        // Jika ada file baru, upload ke Strapi
        if (fieldData?.file) {
          const formData = new FormData();
          formData.append("files", fieldData.file);
          try {
            const uploadRes = await axiosUser(
              "POST",
              "/api/upload",
              session?.jwt || "",
              formData
            );
            // uploadRes bisa array of images
            if (uploadRes && Array.isArray(uploadRes) && uploadRes[0]?.id) {
              return {
                id: String(uploadRes[0].id),
                url: uploadRes[0].url || undefined,
                mime: uploadRes[0].mime || fieldData.file.type || undefined,
              };
            }
          } catch (err) {
            console.error("Image upload failed", err);
          }
        }

        // Jika tidak ada file dan tidak ada id, skip
        return null;
      })
    );
    // Filter hanya object yang valid dan punya id string
    const main_image: iTicketImage[] = (uploadedImages as any[])
      .filter(
        (img) =>
          img &&
          typeof img === "object" &&
          typeof img.id === "string" &&
          img.id.length > 0
      )
      .map((img) => ({
        id: img.id,
        url: img.url,
        mime: img.mime,
      }));

    return main_image;
  };

  // Handler submit
  const onSubmit = async (data: iTicketFormReq) => {
    setLoading(true);

    const images = await handleUploadImage();

    const rawVariants = getValues("variant") || [];
    const variants: iTicketVariant[] = rawVariants.map((v: iTicketVariant) => ({
      name: v.name,
      price: formatMoneyReq(v.price),
      quota: v.quota,
    }));
    const lowestPrice = getLowestVariantPrice(variants);
    let payload: any = {
      data: {
        ...data,
        main_image: images,
        event_date: formatYearDate(data.event_date) ?? "",
        minimal_order_date: formatYearDate(data.maximal_order_date) ?? "",
        maximal_order_date: formatYearDate(data.maximal_order_date) ?? "",
        main_price: formatMoneyReq(lowestPrice),
        users_permissions_user: {
          connect: [
            { id: session?.user?.id ? Number(session.user.id) : undefined },
          ],
        },
        user_event_type: {
          connect: [{ id: 16 }],
        },
        variant: variants,
      },
    };

    try {
      Object.keys(payload.data).forEach((k) => {
        if (
          payload.data[k] === undefined ||
          payload.data[k] === null ||
          (Array.isArray(payload.data[k]) && payload.data[k].length === 0)
        ) {
          delete payload.data[k];
        }
      });
      let response: any;
      delete payload.data.documentId;
      delete payload.data.user_event_type;

      if (isEdit) {
        response = await axiosUser(
          "PUT",
          `/api/products/${formDefaultData.documentId}`,
          `${session && session?.jwt}`,
          payload
        );
      } else {
        response = await axiosUser(
          "POST",
          "/api/products?status=draft",
          process.env.KEY_API || "",
          payload
        );
      }

      if (response) {
        toast({
          title: "Sukses",
          description: `Sukses ${isEdit ? "edit" : "menambahkan"} tiket!`,
          className: eAlertType.SUCCESS,
        });
        if (!isEdit) reset({} as iTicketFormReq);
        window.location.reload();
      }
    } catch (error: any) {
      toast({
        title: "Gagal",
        description: `Gagal ${isEdit ? "edit" : "menambahkan"} tiket!`,
        className: eAlertType.FAILED,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                Tambah Gambar ({mainImageFields.length}/{MAX_IMAGES})
              </Button>
            )}
          </div>
        </div>
        <ProductItemInput label="Nama Tiket" required>
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
        </ProductItemInput>
        <ProductItemInput label="Deskripsi Produk" required>
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
        </ProductItemInput>
        <ProductItemInput label="Tanggal Acara" required>
          <Controller
            name="event_date"
            control={control}
            render={({ field }) => {
              const dateValue = field.value
                ? parse(field.value, "yyyy-MM-dd", new Date()) // string -> Date
                : null;

              return (
                <DatePickerInput
                  textLabel="Pilih Tanggal Acara"
                  value={dateValue}
                  onChange={(date) => {
                    if (date instanceof Date && isDateValid(date)) {
                      field.onChange(format(date, "yyyy-MM-dd"));
                    } else {
                      field.onChange("");
                    }
                  }}
                />
              );
            }}
          />
          {errors.event_date && (
            <p className="text-red-500 text-[10px]">{`${errors.event_date.message}`}</p>
          )}
        </ProductItemInput>
        <ProductItemInput label="Waktu Acara" required>
          <input
            className="border border-gray-300 rounded-md py-2 px-5 w-full text-[14px] lg:text-[16px]"
            type="time"
            {...register("waktu_event", {
              required: true,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value;
                setValue("waktu_event", value);
              },
            })}
          />
          {errors.waktu_event && (
            <p className="text-red-500 text-[10px]">{`${errors.waktu_event.message}`}</p>
          )}
        </ProductItemInput>
        <ProductItemInput label="Batas Waktu Pemesanan" required>
          <Controller
            name="maximal_order_date"
            control={control}
            render={({ field }) => {
              const dateValue = field.value
                ? parse(field.value, "yyyy-MM-dd", new Date()) // string -> Date
                : null;

              return (
                <DatePickerInput
                  textLabel="Pilih Batas Waktu Pemesanan"
                  value={dateValue}
                  onChange={(date) => {
                    if (date instanceof Date && isDateValid(date)) {
                      field.onChange(format(date, "yyyy-MM-dd"));
                    } else {
                      field.onChange("");
                    }
                  }}
                />
              );
            }}
          />
          {errors.main_price && (
            <p className="text-red-500 text-[10px]">{`${errors.main_price.message}`}</p>
          )}
        </ProductItemInput>
        <ProductItemInput label="Kota Acara" required>
          <input
            className="border border-gray-300 rounded-md py-2 px-5 w-full text-[14px] lg:text-[16px]"
            placeholder="Kota Acara"
            {...register("kota_event", {
              required: true,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value;
                setValue("kota_event", value);
              },
            })}
          />
          {errors.kota_event && (
            <p className="text-red-500 text-[10px]">{`${errors.kota_event.message}`}</p>
          )}
        </ProductItemInput>
        {/* <ProductItemInput required label="Provinsi Pelayanan">
          <Controller
            name="provinsi_event"
            control={control}
            render={({ field }) => (
              <>
                <SelectInput
                  label="Provinsi"
                  onChange={(id) => {
                    let selectedProvince = provinceOptions.find(
                      (pv) => pv.value === id
                    );
                    if (selectedProvince) {
                      setSelectedProvince(selectedProvince.label);
                    }
                  }}
                  value={field.value || ""}
                  options={provinceOptions}
                />
              </>
            )}
          />
        </ProductItemInput>
        <ProductItemInput required label="Kota Event">
          <Controller
            name="kota_event"
            control={control}
            render={({ field }) => (
              <>
                <SelectInput
                  label="Kota"
                  onChange={(id) => {
                    let selectedCity = subregionOptions.find(
                      (pv) => pv.value === id
                    );
                    if (selectedCity) {
                      setValue("kota_event", selectedCity.label);
                    }
                  }}
                  value={field.value || ""}
                  options={provinceOptions}
                />
              </>
            )}
          />
        </ProductItemInput> */}
        <ProductItemInput label="Lokasi Acara" required>
          <input
            className="border border-gray-300 rounded-md py-2 px-5 w-full text-[14px] lg:text-[16px]"
            placeholder="Lokasi Acara"
            {...register("lokasi_event", {
              required: true,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value;
                setValue("lokasi_event", value);
              },
            })}
          />
          {errors.lokasi_event && (
            <p className="text-red-500 text-[10px]">{`${errors.lokasi_event.message}`}</p>
          )}
        </ProductItemInput>
        <SubTitle title="Tambah Variant Produk" className="mb-3" />
        <div className="item-input">
          <Button type="button" variant={"default"} onClick={addVariant}>
            Tambah Variant
          </Button>
          <div className="py-2">
            {variantFields.map((field, index) => (
              <TicketVariantItem
                key={index}
                index={index}
                register={register}
                control={control}
                onRemove={() => removeVariant(index)}
              />
            ))}
          </div>
        </div>
        <div className="flex justify-center">
          <button
            disabled={!isValid || loading}
            type="submit"
            className="border border-gray-300 rounded-[30px] py-4 px-7 min-w-[250px] hover:bg-slate-300 cursor-pointer bg-c-green text-white shadow text-[14px] lg:text-[16px]"
          >
            Simpan Tiket
          </button>
        </div>
      </form>
    </div>
  );
};
