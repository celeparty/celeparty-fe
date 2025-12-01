"use client";

import dynamic from "next/dynamic";
import { useToast } from "@/hooks/use-toast";
import { formatYearDate } from "@/lib/dateUtils";
import { eAlertType } from "@/lib/enums/eAlert";
import { iProductImage, iProductReq, iProductRes, iProductVariant } from "@/lib/interfaces/iProduct";
import { axiosUser } from "@/lib/services";
import { fetchAndConvertToFile, formatMoneyReq, formatNumberWithDots } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import React, { ReactNode, useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import Skeleton from "../Skeleton";
import SubTitle from "../SubTitle";
import { Button } from "../ui/button";
import { FileUploader } from "./FileUploader";
import { ProductItemInput } from "./ProductItemInput";
import { ProductVariantItem } from "./ProductVariant";
import { SchemaProduct } from "./SchemaProduct";
import { SearchableSelectInput } from "../form-components/SearchableSelectInput";
import { indonesianRegions } from "@/lib/static/indonesian-regions";

const CKEditor = dynamic(() => import("@ckeditor/ckeditor5-react").then(mod => mod.CKEditor), {
	ssr: false,
});
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const MAX_IMAGES = 5;

interface iProductFormProps {
	formDefaultData: iProductReq | iProductRes;
	isEdit: boolean;
	hideCategory?: boolean;
	forceUserEventType?: string;
}

export const ProductForm = ({
	formDefaultData,
	isEdit,
	hideCategory = false,
	forceUserEventType,
}: iProductFormProps): React.ReactElement => {
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

	// Watch all required fields for live validation
	const watchedFields = watch([
		"title",
		"description",
		"kabupaten"
	]);

	const isFormValid = watchedFields.every(field => field && field.toString().trim() !== "") && (hideCategory || stateCategory.status);


	const convertAndSetEditImages = async (): Promise<void> => {
		if (!formDefaultData?.main_image) return;

		// Convert all images to File objects (for preview) while keeping original data
		const processedImages = await Promise.all(
			formDefaultData.main_image.map(async (img: iProductImage) => {
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
			}),
		);

		// Set form values
		setValue("main_image", processedImages);
	};

	// Initialize empty slots for images
	React.useEffect(() => {
		if (mainImageFields.length === 0) {
			handleAddImage();
		}
	}, [mainImageFields.length]);

	const handleFileChange = async (index: number, file: File | null) => {
		if (file) {
			const imageObj: iProductImage = {
				id: `temp-${Date.now()}`,
				url: URL.createObjectURL(file),
				mime: file.type,
				file: file, // add file here
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
		});
	};

	useEffect(() => {
		if (formDefaultData) {
			reset(formDefaultData);
			setStateCategory({
				status: true,
				value: formDefaultData.category?.connect?.[0]?.id ?? null,
			});

			if (formDefaultData && formDefaultData.main_image) {
				convertAndSetEditImages();
			}
		}
	}, [formDefaultData]);

	const onSubmit = async (data: iProductReq) => {
		try {
			// Get current field values (including unregistered fields)
			const formValues = getValues();

			// Handle image uploads from fields
			const uploadedImages = await Promise.all(
				mainImageFields.map(async (field, index) => {
					const fieldData = formValues.main_image[index];

					// If already has id (old image), use as is
					if (fieldData?.id && !String(fieldData.id).startsWith("temp-")) {
						return {
							id: String(fieldData.id),
							url: fieldData.url || undefined,
							mime: fieldData.mime || undefined,
						};
					}

					// If new file, upload to Strapi
					if (fieldData?.file) {
						const formData = new FormData();
						formData.append("files", fieldData.file);
						try {
							const uploadRes = await axiosUser("POST", "/api/upload", session?.jwt || "", formData);
							// uploadRes might be array of images
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

					// If no file and no id, skip
					return null;
				}),
			);
			// Filter only valid objects with id string
			const main_image: iProductImage[] = (uploadedImages as any[])
				.filter((img) => img && typeof img === "object" && typeof img.id === "string" && img.id.length > 0)
				.map((img) => ({
					id: img.id,
					url: img.url,
					mime: img.mime,
				}));
			// Get variant from form values
			const rawVariants = getValues("variant") || [];
			const variants: iProductVariant[] = rawVariants.map((v: any) => ({
				name: v.name,
				price: formatMoneyReq(v.price),
				quota: v.quota,
			}));
			let updatedData: iProductReq = {
				...data,
				main_image,
				category: stateCategory.value ? { connect: [{ id: stateCategory.value }] } : { connect: [] },
				users_permissions_user: {
					connect: {
						id: String(session?.user.id),
					},
				},
                                variant: variants,
                                escrow: escrowChecked,
			};
			// Inject user_event_type if forced
			if (forceUserEventType) {
				(updatedData as any).user_event_type = forceUserEventType;
			}

			let response: any;
			if (isEdit) {
				response =
					stateCategory.value !== null &&
					(await axiosUser(
						"PUT",
						`/api/products/${(formDefaultData as iProductRes).documentId}`,
						`${session && session?.jwt}`,
						{
							data: updatedData,
						},
					));
			} else {
				response =
					stateCategory.value !== null &&
					(await axiosUser("POST", "/api/products?status=draft", `${session && session?.jwt}`, {
						data: updatedData,
					}));
			}
			if (response) {
				toast({
					title: "Sukses",
					description: `Sukses ${isEdit ? "edit" : "menambahkan"} produk!`,
					className: eAlertType.SUCCESS,
				});
				if (!isEdit) reset({} as iProductReq);
				window.location.href = "/user/vendor/products";
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
			return await axiosUser("GET", "/api/categories?populate=*", `${session && session?.jwt}`);
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
			{/* Form Validation Status */}
			{!isFormValid && (
				<div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
					<p className="text-yellow-800 text-sm font-medium mb-2">
						Silakan lengkapi semua field yang wajib diisi:
					</p>
					<ul className="text-yellow-700 text-xs space-y-1">
						{!watch("title") && <li>• Nama Produk</li>}
						{!watch("description") && <li>• Deskripsi Produk</li>}
						{!watch("kabupaten") && <li>• Kota/Kabupaten</li>}
						{!hideCategory && !stateCategory.status && <li>• Kategori Produk</li>}
					</ul>
				</div>
			)}

			<form onSubmit={handleSubmit(onSubmit)}>
				<SubTitle title="Pilih Foto Produk" className="mb-3" />
				<div className="image-upload-container grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 mb-5">
					{mainImageFields.map((field, index) => (
						<React.Fragment key={index}>
							<div className="image-item">
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
							<Button type="button" variant={"default"} onClick={handleAddImage}>
								Tambah Gambar ({mainImageFields.length}/{MAX_IMAGES})
							</Button>
						)}
					</div>
				</div>

				{/* Kategori Produk */}
				{!hideCategory && (
					<>
						<SubTitle title="Pilih Kategori Produk" className="mb-3" />
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 mb-5">
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
										className={`cursor-pointer hover:bg-c-green hover:text-white hover:border-c-green rounded-3xl border border-solid border-c-gray px-3 py-2 text-center transition-colors duration-200 ${
											isActive ? "bg-c-green text-white border-c-green" : "text-c-black"
										} text-[12px] sm:text-[14px] lg:text-[16px]`}
									>
										{item.title}
									</div>
								);
							})}
						</div>
						{!stateCategory.status && (
							<p className="text-red-500 text-[12px] mb-3">Kategori produk harus dipilih</p>
						)}
					</>
				)}
				<ProductItemInput label="Nama Produk" required>
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
					{errors.title && <p className="text-red-500 text-[10px]">{`${errors.title.message}`}</p>}
				</ProductItemInput>

				<ProductItemInput label="Deskripsi Produk" required>
					<Controller
						name="description"
						control={control}
						rules={{ required: true }}
						render={({ field }) => (
							<CKEditor
								editor={ClassicEditor}
								data={field.value}
								onChange={(_, editor) => {
									const data = editor.getData();
									field.onChange(data);
								}}
							/>
						)}
					/>
					{errors.description && (
						<p className="text-red-500 text-[10px]">{`${errors.description.message}`}</p>
					)}
				</ProductItemInput>

				<ProductItemInput label="Terms and Conditions (Optional)" required={false}>
					<Controller
						name="terms_conditions"
						control={control}
						render={({ field }) => (
							<CKEditor
								editor={ClassicEditor}
								data={field.value}
								onChange={(_, editor) => {
									const data = editor.getData();
									field.onChange(data);
								}}
							/>
						)}
					/>
				</ProductItemInput>











				<ProductItemInput label="Kota/Kabupaten" required>
					<Controller
						name="kabupaten"
						control={control}
						rules={{ required: true }}
						render={({ field }) => (
							<SearchableSelectInput
								label="Kota/Kabupaten"
								options={indonesianRegions}
								value={field.value}
								onChange={(value) => {
									field.onChange(value);
									setValue("kabupaten", value);
								}}
								placeholder="Pilih Kota/Kabupaten"
								showLabel={false}
							/>
						)}
					/>
					{errors.kabupaten && <p className="text-red-500 text-[10px]">{`${errors.kabupaten.message}`}</p>}
				</ProductItemInput>

				<SubTitle title="Tambah Variant Produk" className="mb-3" />
				<div className="item-input">
					<Button type="button" variant={"default"} onClick={addVariant}>
						Tambah Variant
					</Button>
					<div className="py-2">
						{variantFields.map((field, index) => (
							<ProductVariantItem
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
						disabled={!watch("title")}
						type="submit"
						className="border border-gray-300 rounded-[30px] py-4 px-7 min-w-[250px] hover:bg-slate-300 cursor-pointer bg-c-green text-white shadow text-[14px] lg:text-[16px]"
					>
						Simpan Produk
					</button>
				</div>
			</form>
		</>
	);
};
