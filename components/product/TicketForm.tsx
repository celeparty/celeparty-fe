import SubTitle from "@/components/SubTitle";
import { FileUploader } from "@/components/product/FileUploader";
import { ProductItemInput } from "@/components/product/ProductItemInput";
import { TicketVariantItem } from "@/components/product/TicketVariant";
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
import { getLowestVariantPrice } from "@/lib/productUtils";
import { axiosUser } from "@/lib/services";
import { fetchAndConvertToFile, formatMoneyReq } from "@/lib/utils";
import { format, isValid as isDateValid, parse } from "date-fns";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { DatePickerInput } from "../form-components/DatePicker";
import { SearchableSelectInput } from "../form-components/SearchableSelectInput";
import { indonesianRegions } from "@/lib/static/indonesian-regions";
import dynamic from "next/dynamic";
import { zodResolver } from "@hookform/resolvers/zod";
import { SchemaTicket } from "./SchemaTicket";

const CKEditor = dynamic(() => import("@ckeditor/ckeditor5-react").then(mod => mod.CKEditor), {
	ssr: false,
});
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const MAX_IMAGES = 5;

interface iTicketFormProps {
	formDefaultData: iTicketFormReq;
	isEdit: boolean;
	slug?: string;
}

export const TicketForm: React.FC<iTicketFormProps> = ({ isEdit, formDefaultData, slug }) => {
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
		resolver: zodResolver(SchemaTicket),
		defaultValues: {
			...formDefaultData,
			terms_conditions: formDefaultData?.terms_conditions || "",
		},
	});

	const {
		register,
		handleSubmit,
		setValue,
		getValues,
		control,
		reset,
		watch,
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

	// Watch all required fields for live validation
	const watchedFields = watch([
		"title",
		"description",
		"event_date",
		"waktu_event",
		"end_date",
		"end_time",
		"kota_event",
		"lokasi_event"
	]);

	const isFormValid = watchedFields.every(field => field && field.toString().trim() !== "");

	const addVariant = () => {
		appendVariant({
			name: "",
			price: 0,
			quota: "",
			purchase_deadline: "",
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
			// Normalize dates to YYYY-MM-DD format for input
			const normalizedData: iTicketFormReq = {
				...formDefaultData,
				event_date: formDefaultData.event_date ? (formatYearDate(formDefaultData.event_date) || "") : "",
				end_date: formDefaultData.end_date ? (formatYearDate(formDefaultData.end_date) || "") : "",
			};
			reset(normalizedData);
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
			}),
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
                        appendMainImage({ id: "", url: "", mime: "" });
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
						const uploadRes = await axiosUser("POST", "/api/upload", session?.jwt || "", formData);
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
			}),
		);
		// Filter hanya object yang valid dan punya id string
		const main_image: iTicketImage[] = (uploadedImages as any[])
			.filter((img) => img && typeof img === "object" && typeof img.id === "string" && img.id.length > 0)
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
			purchase_deadline: v.purchase_deadline,
		}));
		
		// Ensure dates are in correct format
		const eventDate = formatYearDate(data.event_date);
		const endDate = formatYearDate(data.end_date);
		
		if (!eventDate || !endDate) {
			toast({
				title: "Error",
				description: "Format tanggal tidak valid. Pastikan tanggal acara dan tanggal selesai telah diisi dengan benar.",
				className: eAlertType.FAILED,
			});
			setLoading(false);
			return;
		}
		
		let payloadData: any = {
			...data,
			main_image: images,
			event_date: eventDate,
			end_date: endDate,
			end_time: data.end_time || "",
			users_permissions_user: {
				connect: [{ id: session?.user?.id ? Number(session.user.id) : undefined }],
			},
			user_event_type: {
				connect: [{ id: 16 }],
			},
			variant: variants,
			terms_conditions: data.terms_conditions,
		};

		let payload: any = {
			data: payloadData,
		};

		try {
			// Whitelist approach: hanya hapus field yang truly tidak perlu
			const fieldsToKeep = [
				"title",
				"description",
				"event_date",
				"end_date",
				"waktu_event",
				"end_time",
				"kota_event",
				"lokasi_event",
				"main_image",
				"users_permissions_user",
				"user_event_type",
				"variant",
				"terms_conditions",
			];

			Object.keys(payload.data).forEach((k) => {
				// Hanya hapus jika bukan field yang harus dipertahankan dan empty
				if (
					!fieldsToKeep.includes(k) &&
					(payload.data[k] === undefined ||
						payload.data[k] === null ||
						(Array.isArray(payload.data[k]) && payload.data[k].length === 0))
				) {
					delete payload.data[k];
				}
			});

			let response: any;
			delete payload.data.documentId;
			// Only delete user_event_type for non-ticket products
			if (!isEdit) {
				delete payload.data.user_event_type;
			}

			if (isEdit) {
				const productSlug = slug || (formDefaultData as any).documentId;
				response = await axiosUser(
					"PUT",
					`/api/products/${productSlug}`,
					`${session && session?.jwt}`,
					payload,
				);
			} else {
				response = await axiosUser("POST", "/api/products?status=draft", process.env.KEY_API || "", payload);
			}

			if (response) {
				toast({
					title: "Sukses",
					description: `Sukses ${isEdit ? "edit" : "menambahkan"} tiket!`,
					className: eAlertType.SUCCESS,
				});
				if (!isEdit) reset({} as iTicketFormReq);
				window.location.href = "/user/vendor/products";
			}
		} catch (error: any) {
			console.error("Ticket submission error:", error);
			
			// Parse error message dengan mapping ke bahasa Indonesia
			let errorDescription = "Terjadi kesalahan yang tidak diketahui";
			const apiError = error?.response?.data?.error;
			const rawMessage = error?.response?.data?.error?.message || 
				error?.response?.data?.message || 
				error?.message || 
				"";

			// Mapping error spesifik
			if (rawMessage.includes("invalid key") || rawMessage.includes("end_date")) {
				errorDescription = "Format tanggal selesai tidak valid. Pastikan semua tanggal telah diisi dengan benar.";
			} else if (rawMessage.includes("event_date")) {
				errorDescription = "Format tanggal acara tidak valid. Pastikan tanggal telah diisi dengan benar.";
			} else if (rawMessage.includes("waktu_event") || rawMessage.includes("end_time")) {
				errorDescription = "Format waktu tidak valid. Pastikan jam telah diisi dengan format yang benar (HH:MM).";
			} else if (rawMessage.includes("title")) {
				errorDescription = "Nama tiket harus diisi minimal 3 karakter.";
			} else if (rawMessage.includes("description")) {
				errorDescription = "Deskripsi tiket harus diisi.";
			} else if (rawMessage.includes("variant")) {
				errorDescription = "Variant tiket tidak valid. Pastikan sudah menambahkan variant dan harga variant.";
			} else if (rawMessage.includes("main_image")) {
				errorDescription = "Gambar tiket tidak valid. Pastikan sudah menambahkan minimal 1 gambar.";
			} else if (rawMessage.includes("Unauthorized") || rawMessage.includes("401")) {
				errorDescription = "Sesi Anda telah berakhir. Silakan login kembali.";
			} else if (rawMessage.includes("Forbidden") || rawMessage.includes("403")) {
				errorDescription = "Anda tidak memiliki izin untuk melakukan aksi ini.";
			} else if (rawMessage.includes("Not Found") || rawMessage.includes("404")) {
				errorDescription = "Data tiket tidak ditemukan. Silakan refresh halaman dan coba lagi.";
			} else if (rawMessage.length > 0) {
				errorDescription = `Gagal menyimpan tiket: ${rawMessage}`;
			}

			toast({
				title: "Gagal Menyimpan Tiket",
				description: errorDescription,
				className: eAlertType.FAILED,
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="relative">
			{/* Form Validation Status */}
			{!isFormValid && (
				<div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
					<p className="text-yellow-800 text-sm font-medium mb-2">
						Silakan lengkapi semua field yang wajib diisi:
					</p>
					<ul className="text-yellow-700 text-xs space-y-1">
						{!watch("title") && <li>• Nama Tiket</li>}
						{!watch("description") && <li>• Deskripsi Produk</li>}
						{!watch("event_date") && <li>• Tanggal Acara</li>}
						{!watch("waktu_event") && <li>• Waktu Acara</li>}
						{!watch("end_date") && <li>• Tanggal Selesai</li>}
						{!watch("end_time") && <li>• Jam Selesai</li>}
						{!watch("kota_event") && <li>• Kota Acara</li>}
						{!watch("lokasi_event") && <li>• Lokasi Acara</li>}
					</ul>
				</div>
			)}

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
							<Button type="button" variant={"default"} onClick={handleAddImage}>
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
					{errors.title && <p className="text-red-500 text-[10px]">{`${errors.title.message}`}</p>}
				</ProductItemInput>
				<ProductItemInput label="Deskripsi Produk" required>
					<Controller
						name="description"
						control={control}
						rules={{ required: true }}
						render={({ field }) => (
						<CKEditor
							editor={ClassicEditor as any}
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
							editor={ClassicEditor as any}
							data={field.value}
								onChange={(_, editor) => {
									const data = editor.getData();
									field.onChange(data);
								}}
							/>
						)}
					/>
				</ProductItemInput>

				<ProductItemInput label="Tanggal Acara" required>
					<Controller
						name="event_date"
						control={control}
						render={({ field }) => {
							let dateValue: Date | null = null;
							
							// Only parse if value is non-empty and matches YYYY-MM-DD format
							if (field.value && typeof field.value === 'string' && field.value.trim().length > 0) {
								if (/^\d{4}-\d{2}-\d{2}$/.test(field.value)) {
									const parsed = parse(field.value, "yyyy-MM-dd", new Date());
									if (isDateValid(parsed)) {
										dateValue = parsed;
									}
								}
							}

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
					{errors.event_date && <p className="text-red-500 text-[10px]">{`${errors.event_date.message}`}</p>}
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
				<ProductItemInput label="Tanggal Selesai" required>
					<Controller
						name="end_date"
						control={control}
						render={({ field }) => {
							let dateValue: Date | null = null;
							
							// Only parse if value is non-empty and matches YYYY-MM-DD format
							if (field.value && typeof field.value === 'string' && field.value.trim().length > 0) {
								if (/^\d{4}-\d{2}-\d{2}$/.test(field.value)) {
									const parsed = parse(field.value, "yyyy-MM-dd", new Date());
									if (isDateValid(parsed)) {
										dateValue = parsed;
									}
								}
							}

							return (
								<DatePickerInput
									textLabel="Pilih Tanggal Selesai"
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
					{errors.end_date && <p className="text-red-500 text-[10px]">{`${errors.end_date.message}`}</p>}
				</ProductItemInput>
				<ProductItemInput label="Jam Selesai" required>
					<input
						className="border border-gray-300 rounded-md py-2 px-5 w-full text-[14px] lg:text-[16px]"
						type="time"
						{...register("end_time", {
							required: true,
							onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
								const value = e.target.value;
								setValue("end_time", value);
							},
						})}
					/>
					{errors.end_time && (
						<p className="text-red-500 text-[10px]">{`${errors.end_time.message}`}</p>
					)}
				</ProductItemInput>
				<ProductItemInput label="Kota Acara" required>
					<Controller
						name="kota_event"
						control={control}
						rules={{ required: true }}
						render={({ field }) => (
							<SearchableSelectInput
								label="Kota Acara"
								options={indonesianRegions.map((region) => ({ label: region.label, value: region.value }))}
								value={field.value}
								onChange={(value) => field.onChange(value)}
								placeholder="Pilih Kota Acara"
								required
								showLabel={false}
							/>
						)}
					/>
					{errors.kota_event && <p className="text-red-500 text-[10px]">{`${errors.kota_event.message}`}</p>}
				</ProductItemInput>
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
