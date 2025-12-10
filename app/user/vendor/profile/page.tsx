"use client";
import Box from "@/components/Box";
import React, { useEffect, useState } from "react";

import ErrorNetwork from "@/components/ErrorNetwork";
import Skeleton from "@/components/Skeleton";
import { axiosRegion, axiosUser } from "@/lib/services";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

import { DatePickerInput } from "@/components/form-components/DatePicker";
import { ItemInput } from "@/components/form-components/ItemInput";
import { ValidatedInput, ValidatedTextarea } from "@/components/form-components/ValidatedInput";
import RegionSubregionSelector from "@/components/profile/vendor/region-subregion-selector";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { eAlertType } from "@/lib/enums/eAlert";
import { iSelectOption } from "@/lib/interfaces/iCommon";
import { iMerchantProfile } from "@/lib/interfaces/iMerchant";
import { sanitizeVendorData } from "@/lib/utils";
import { isValid, parseISO } from "date-fns";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Controller, FormProvider, type SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { AiFillCustomerService } from "react-icons/ai";
import { IoMdAddCircleOutline, IoMdRemoveCircleOutline } from "react-icons/io";
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";

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

const getProvinces = async (): Promise<iSelectOption[]> => {
	const response = await axiosRegion("GET", "provinsi");
	return (
		response?.value?.map((item: any) => ({
			value: item.id,
			label: item.name,
		})) || []
	);
};

// Email validation regex
const validateEmail = (email: string) => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
};

// Phone validation regex
const validatePhone = (phone: string) => {
	const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
	return phoneRegex.test(phone);
};

// Bank account number validation
const validateBankAccount = (account: string) => {
	return account.length >= 10 && /^[0-9]+$/.test(account);
};

export default function ProfilePage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [notif, setNotif] = React.useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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

	// Watch all fields for live validation
	const name = watch("name");
	const email = watch("email");
	const phone = watch("phone");
	const companyName = watch("companyName");
	const bankName = watch("bankName");
	const accountNumber = watch("accountNumber");
	const accountName = watch("accountName");

	// Live validation
	useEffect(() => {
		const errors: Record<string, string> = {};

		if (name && name.length < 3) {
			errors.name = "Nama minimal 3 karakter";
		} else if (name && name.length > 100) {
			errors.name = "Nama maksimal 100 karakter";
		} else if (name && !/^[a-zA-Z\s]+$/.test(name)) {
			errors.name = "Nama hanya boleh berisi huruf dan spasi";
		} else {
			delete errors.name;
		}

		if (email && !validateEmail(email)) {
			errors.email = "Format email tidak valid";
		} else {
			delete errors.email;
		}

		if (phone && !validatePhone(phone)) {
			errors.phone = "Format nomor telepon tidak valid (gunakan 08xx atau +62)";
		} else {
			delete errors.phone;
		}

		if (companyName && companyName.length < 3) {
			errors.companyName = "Nama usaha minimal 3 karakter";
		} else if (companyName && companyName.length > 100) {
			errors.companyName = "Nama usaha maksimal 100 karakter";
		} else {
			delete errors.companyName;
		}

		if (bankName && bankName.length < 2) {
			errors.bankName = "Nama bank minimal 2 karakter";
		} else {
			delete errors.bankName;
		}

		if (accountNumber && !validateBankAccount(accountNumber)) {
			errors.accountNumber = "Nomor rekening harus angka, minimal 10 digit";
		} else {
			delete errors.accountNumber;
		}

		if (accountName && accountName.length < 3) {
			errors.accountName = "Nama pemilik minimal 3 karakter";
		} else {
			delete errors.accountName;
		}

		setFieldErrors(errors);
	}, [name, email, phone, companyName, bankName, accountNumber, accountName]);

	const onSubmit: SubmitHandler<iMerchantProfile> = async (formData: iMerchantProfile) => {
		if (Object.keys(fieldErrors).length > 0) {
			toast({
				title: "Validasi Gagal",
				description: "Mohon perbaiki error di form sebelum menyimpan",
				className: eAlertType.FAILED,
			});
			return;
		}

		setIsSubmitting(true);
		try {
			console.log("Submitting vendor profile with data:", formData);
			
			// Use documentId if available, otherwise fall back to id
			const userId = formData.documentId || formData.id;
			console.log("User ID to update:", userId, "From documentId:", formData.documentId, "From id:", formData.id);
			
			if (!userId) {
				throw new Error("User ID not found in form data");
			}
			
			
			// Sanitize data but ensure id/documentId are not sent in the PUT payload
			const { id, documentId, ...dataToSubmit } = sanitizeVendorData(formData);
			
			const updatedFormData = { ...dataToSubmit };
			
			console.log("Sanitized data to submit:", updatedFormData);
			
			const response = await axiosUser(
				"PUT",
				`/api/users/${userId}`,
				`${session && session?.jwt}`,
				{ data: updatedFormData }, // Wrap updatedFormData in a 'data' object
			);

			console.log("Profile update response:", response);

			if (response && (response.status === 200 || response.status === 201 || response.data)) {
				setNotif(true);
				toast({
					title: "Sukses",
					description: "Update profile berhasil!",
					className: eAlertType.SUCCESS,
				});
				setTimeout(() => setNotif(false), 3000);
			} else if (!response) {
				console.error("Empty response from profile update");
				toast({
					title: "Gagal",
					description: "Tidak ada respons dari server. Coba lagi.",
					className: eAlertType.FAILED,
				});
			}
		} catch (error: any) {
			console.error("Profile update error:", error);
			console.error("Error response:", error?.response?.data);
			
			const errorMessage = error?.response?.data?.message || error?.message || "Update profile gagal!";
			toast({
				title: "Gagal",
				description: errorMessage,
				className: eAlertType.FAILED,
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const getQuery = async () => {
		if (!session?.jwt) {
			throw new Error("Access token is undefined");
		} else {
			return await axiosUser("GET", "/api/users/me", `${session && session?.jwt}`);
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
		<div className="bg-gray-50 min-h-screen py-8">
			<div className="max-w-4xl mx-auto">
				<Box className="mt-0 shadow-lg">
					<div className="border-b-4 border-c-blue pb-4 mb-6">
						<h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Profil Vendor</h1>
						<p className="text-gray-600 text-sm lg:text-base mt-1">Kelola informasi bisnis Anda</p>
					</div>

					{dataContent ? (
						<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
							{/* Section 1: Informasi Pribadi */}
							<div className="border rounded-lg p-6 bg-white">
								<h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
									<span className="w-6 h-6 bg-c-blue text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
									Informasi Pribadi
								</h2>
								<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
									<ValidatedInput
										label="Nama Lengkap"
										placeholder="Masukkan nama lengkap"
										value={name}
										error={fieldErrors.name}
										{...register("name", { required: true })}
										helperText="Gunakan nama sesuai identitas"
									/>
									<div className="mb-4">
										<label className="block text-sm font-semibold text-gray-700 mb-2">
											Email <span className="text-red-500">*</span>
										</label>
										<input
											type="email"
											disabled
											defaultValue={dataContent?.email}
											className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed text-sm lg:text-base"
										/>
										<p className="text-gray-500 text-xs mt-1">Email tidak dapat diubah</p>
									</div>
								</div>
								<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
									<ValidatedInput
										label="Nomor Telepon"
										placeholder="08xx atau +62xxx"
										value={phone}
										error={fieldErrors.phone}
										{...register("phone", { required: true })}
										helperText="Format: 08xx atau +62xxx"
									/>
									<div>
										<label className="block text-sm font-semibold text-gray-700 mb-2">
											Tanggal Lahir <span className="text-red-500">*</span>
										</label>
										<Controller
											name="birthdate"
											control={control}
											render={({ field }) => (
												<DatePickerInput
													textLabel="Tanggal Lahir"
													onChange={(date) => {
														if (date instanceof Date && isValid(date)) {
															field.onChange(date?.toISOString().split("T")[0] ?? null);
														}
													}}
													value={field.value ? parseISO(field.value) : null}
													className="w-full"
												/>
											)}
										/>
									</div>
								</div>
								<ValidatedInput
									label="Tempat Lahir"
									placeholder="Masukkan tempat lahir"
									{...register("birthplace", { required: true })}
								/>
							</div>

							{/* Section 2: Informasi Usaha */}
							<div className="border rounded-lg p-6 bg-white">
								<h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
									<span className="w-6 h-6 bg-c-blue text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
									Informasi Usaha
								</h2>
								<ValidatedInput
									label="Nama Usaha"
									placeholder="Masukkan nama usaha"
									value={companyName}
									error={fieldErrors.companyName}
									{...register("companyName", { required: true })}
									helperText="Nama resmi perusahaan/toko"
								/>
								<ValidatedTextarea
									label="Alamat Usaha"
									placeholder="Masukkan alamat lengkap usaha"
									{...register("address", { required: true })}
								/>
							</div>

							{/* Section 3: Lokasi Pelayanan */}
							<div className="border rounded-lg p-6 bg-white">
								<h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
									<span className="w-6 h-6 bg-c-blue text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
									Lokasi Pelayanan
								</h2>
								<FormProvider {...formMethods}>
									<div>
										{fields.map((field, index) => (
											<React.Fragment key={index}>
												<div className="mb-4 p-4 border-2 border-dashed border-gray-300 rounded-lg">
													<div className="flex justify-between items-start mb-3">
														<h3 className="font-semibold text-gray-700">Lokasi {index + 1}</h3>
														{fields.length > 1 && (
															<button
																type="button"
																className="text-red-500 hover:text-red-700 text-2xl transition"
																onClick={() => remove(index)}
																title="Hapus lokasi"
															>
																<IoMdRemoveCircleOutline />
															</button>
														)}
													</div>
													<RegionSubregionSelector
														index={index}
														provinceOptions={provinceOptions}
													/>
												</div>
											</React.Fragment>
										))}

										<button
											type="button"
											className="flex gap-2 items-center bg-c-blue hover:bg-c-blue/90 py-3 px-6 text-white rounded-lg transition font-semibold"
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
									</div>
								</FormProvider>
							</div>

							{/* Section 4: Informasi Perbankan */}
							<div className="border rounded-lg p-6 bg-white">
								<h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
									<span className="w-6 h-6 bg-c-blue text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
									Informasi Perbankan
								</h2>
								<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
									<p className="text-blue-700 text-sm">
										💡 Informasi perbankan digunakan untuk proses pembayaran. Pastikan data benar dan sesuai dengan rekening pemilik bisnis.
									</p>
								</div>
								<ValidatedInput
									label="Nama Bank"
									placeholder="BCA, Mandiri, BRI, dsb"
									value={bankName}
									error={fieldErrors.bankName}
									{...register("bankName", { required: true })}
									helperText="Masukkan nama bank"
								/>
								<ValidatedInput
									label="Nomor Rekening"
									placeholder="Masukkan nomor rekening"
									value={accountNumber}
									error={fieldErrors.accountNumber}
									{...register("accountNumber", { required: true })}
									helperText="Minimal 10 digit, hanya angka"
								/>
								<ValidatedInput
									label="Atas Nama Rekening"
									placeholder="Nama pemilik rekening"
									value={accountName}
									error={fieldErrors.accountName}
									{...register("accountName", { required: true })}
									helperText="Sesuai dengan nama di rekening bank"
								/>
							</div>

							{/* Section 5: Informasi Sistem */}
							<div className="border rounded-lg p-6 bg-gray-50">
								<h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
									<span className="w-6 h-6 bg-c-blue text-white rounded-full flex items-center justify-center text-sm font-bold">5</span>
									Informasi Sistem
								</h2>
								<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-semibold text-gray-700 mb-2">ID Vendor</label>
										<input
											type="text"
											disabled
											value={dataContent?.id}
											className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed text-sm"
										/>
									</div>
								</div>
							</div>

							{/* Action Buttons */}
							<div className="flex gap-3 justify-end pt-4 border-t">
								<button
									type="button"
									className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
									onClick={() => router.back()}
								>
									Batal
								</button>
								<button
									type="submit"
									disabled={Object.keys(fieldErrors).length > 0 || isSubmitting}
									className={`px-6 py-3 rounded-lg font-semibold text-white transition ${
										Object.keys(fieldErrors).length > 0
											? 'bg-gray-400 cursor-not-allowed'
											: 'bg-green-500 hover:bg-green-600'
									}`}
								>
									{isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
								</button>
							</div>

							{notif && (
								<div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
									<CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
									<div>
										<h3 className="font-semibold text-green-800">Berhasil!</h3>
										<p className="text-green-700 text-sm">Profil Anda telah diperbarui</p>
									</div>
								</div>
							)}
						</form>
					) : (
						<Skeleton width="100%" height="200px" />
					)}
				</Box>
				<Box>
					<div className="flex justify-center items-center">
						<Link href="/" className="flex gap-2 items-center">
							<AiFillCustomerService className="lg:text-3xl text-2xl" />
							<strong className="text-[14px] lg:text-[16px]">Bantuan Celeparty Care</strong>
						</Link>
					</div>
				</Box>
			</div>
		</div>
	);
}
