"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"
import { axiosData, axiosRegion } from "@/lib/services";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import ErrorNetwork from "@/components/ErrorNetwork";
import Skeleton from "@/components/Skeleton";
import { useQuery } from "@tanstack/react-query";
import { get } from "lodash";
import { IoMdRemoveCircle, IoMdRemoveCircleOutline, IoMdAddCircleOutline } from "react-icons/io";


const signUpSchema = z
	.object({
		name: z.string().nonempty({ message: "Nama tidak boleh kosong" }),
		username: z.string().nonempty({ message: "User Name tidak boleh kosong" }),
		email: z
		.string()
		.nonempty({ message: "Email tidak boleh kosong" })
		.email({ message: "Alamat email tidak valid" }),
		phone: z.string().nonempty({ message: "No Telepon tidak boleh kosong" }),
		address: z.string().nonempty({ message: "Alamat tidak boleh kosong" }),
		birthplace: z.string().nonempty({ message: "Tempat lahir tidak boleh kosong" }),
		birthdate: z.string().nonempty({ message: "Tanggal lahir tidak boleh kosong" }),
		nik: z.string().nonempty({ message: "NIK tidak boleh kosong" }),
		companyName: z.string().nonempty({ message: "Nama usaha tidak boleh kosong" }),
		serviceLocation: z.array(z.any()).nonempty({ message: "Lokasi layanan tidak boleh kosong" }),
		bankName: z.string().nonempty({ message: "Nama bank tidak boleh kosong" }),
		accountNumber: z.string().nonempty({ message: "Nomor rekening tidak boleh kosong" }),
		accountName: z.string().nonempty({ message: "Nama pemegang rekening tidak boleh kosong" }),
		password: z
		.string()
		.nonempty({ message: "Kata Sandi tidak boleh kosong" })
		.min(8, "Kata sandi harus memiliki minimal 8 karakter")
		.regex(/[A-Z]/, "Kata sandi harus mengandung setidaknya satu huruf besar")
		.regex(/[a-z]/, "Kata sandi harus mengandung setidaknya satu huruf kecil")
		.regex(/[0-9]/, "Kata sandi harus mengandung setidaknya satu angka"),
		confirmPassword: z.string().nonempty({ message: "Konfirmasi kata sandi tidak boleh kosong" }),
	})
	.refine((data) => data.password === data.confirmPassword, {
		path: ["confirmPassword"], // Arahkan pesan error ke field `confirmPassword`
		message: "Konfirmasi kata sandi harus sama dengan kata sandi",
	});

const Registration = () => {
	const [message, setMessage] = useState(false);
	const [regionCode, setRegionCode] = useState("");
	const [subRegions, setSubRegions] = useState<Array<Array<{ id: string; name: string }>>>([]);
	const [errorMessage, setErrorMessage] = useState<string | boolean | null>(
	  false
	);

	const getQuery = async() => {
		return await axiosRegion("GET", "provinsi",)
	}

	const query = useQuery({
		queryKey: ["qRegion"],
		queryFn: getQuery,
	});

  
	const {
		register,
		handleSubmit,
		control,
		formState: { errors },
	  } = useForm<z.infer<typeof signUpSchema>>({
		resolver: zodResolver(signUpSchema),
		defaultValues: {
			name: "",
			username:"",
			email: "",
			phone: "",
			address: "",
			birthplace:"",
			birthdate:"",
			nik:"",
			companyName:"",
			serviceLocation: [{ region: "", subregion: "" }],
			bankName:"",
			accountNumber:"",
			accountName:"",			
			password: "",
			confirmPassword: "",
		},
	});

	const dataProvince = query?.data?.value

	const { fields, append, remove } = useFieldArray({
		control,
		name: "serviceLocation" // Name of the field array
	  });

	  const getSubRegion = async (regionId: string) => {
		return await axiosRegion("GET", "kabupaten", regionId);
	  };

	  const handleRegionChange = async (regionId: string, index: number) => {
		const response = await getSubRegion(regionId);
		const updatedSubRegions = [...subRegions];
		updatedSubRegions[index] = response?.value || [];
		setSubRegions(updatedSubRegions);
	  };	  

	const signUp = (values: z.infer<typeof signUpSchema>) => {
		const sendNow = async () => {
			try {
				const data = {
					name: values.name,
					username: values.username,
					email: values.email,
					phone: values.phone,
					birthplace: values.birthplace,
					birthdate: values.birthdate,
					nik: values.nik,
					companyName: values.companyName,
					serviceLocation: values.serviceLocation,
					bankName: values.bankName,
					accountNumber: values.accountNumber,
					accountName: values.accountName,					
					address: values.address,
					password: values.password,
					role: 3,
				};
		  
				const response = await axiosData("POST", "/api/auth/custom-register", data);	
				setErrorMessage(false);
				setMessage(true);		
			} catch (error:any) {
				console.error("Error:", error?.response.data.error.message);
				setErrorMessage(error?.response.data.error.message);		
			}
		}
		sendNow()				
	};

	// const getSubRegion = async (id?: string) => {
	// 	return await axiosRegion("GET", "kabupaten", id)
	// }

	useEffect(()=> {
		if (regionCode) {
			getSubRegion(regionCode).then((res) => {
				setSubRegions(res?.value)
			})
		}
	},[regionCode])




	return (
		<div>
			<h1 className="mb-4 lg:text-start text-center text-2xl font-bold">Registrasi</h1>
			<div className="relative">
					<form onSubmit={handleSubmit(signUp)} className="flex flex-col gap-4">
						<div className="relative">
							<input type="text"
								placeholder="Nama Lengkap"
								className="text-black px-4 py-2 rounded-lg min-w-[270px] w-full"
								{...register("name")}
							/>
							{errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
						</div>						
						<div className="relative">
							<input type="text"
								placeholder="User Name"
								className="text-black px-4 py-2 rounded-lg min-w-[270px] w-full"
								{...register("username")}
							/>
							{errors.username && <span className="text-red-500 text-xs">{errors.username.message}</span>}
						</div>						
						<div className="relative">
							<input type="email"
								placeholder="Email"
								className="text-black px-4 py-2 rounded-lg min-w-[270px] w-full"
								{...register("email")}
							/>
							{errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
						</div>						
						<div className="relative">
							<input type="text"
								placeholder="Tempat Lahir"
								className="text-black px-4 py-2 rounded-lg min-w-[270px] w-full"
								{...register("birthplace")}
							/>
							{errors.birthplace && <span className="text-red-500 text-xs">{errors.birthplace.message}</span>}
						</div>						
						<div className="relative">
							<input type="date"
								placeholder="Tanggal Lahir"
								className="text-black px-4 py-2 rounded-lg min-w-[270px] w-full"
								{...register("birthdate")}
							/>
							{errors.birthdate && <span className="text-red-500 text-xs">{errors.birthdate.message}</span>}
						</div>						
						<div className="relative">
							<input type="text"
								placeholder="NIK"
								className="text-black px-4 py-2 rounded-lg min-w-[270px] w-full"
								{...register("nik")}
							/>
							{errors.nik && <span className="text-red-500 text-xs">{errors.nik.message}</span>}
						</div>						
						<div className="relative">
							<input type="text"
								placeholder="No Telepon"
								className="text-black px-4 py-2 rounded-lg min-w-[270px] w-full"
								{...register("phone")}
							/>
							{errors.phone && <span className="text-red-500 text-xs">{errors.phone.message}</span>}
						</div>						
						<div className="relative">
							<input type="password"
								placeholder="Kata Sandi"
								className="text-black px-4 py-2 rounded-lg min-w-[270px] w-full"
								{...register("password")}
							/>
							{errors.password && <span className="text-red-500 text-xs">{errors.password.message}</span>}
						</div>						
						<div className="relative">
							<input type="password"
								placeholder="Ulangi Kata Sandi"
								className="text-black px-4 py-2 rounded-lg min-w-[270px] w-full"
								{...register("confirmPassword")}
							/>
							{errors.confirmPassword && <span className="text-red-500 text-xs">{errors.confirmPassword.message}</span>}
						</div>						
						<div className="relative">
							<input type="text"
								placeholder="Nama Usaha"
								className="text-black px-4 py-2 rounded-lg min-w-[270px] w-full"
								{...register("companyName")}
							/>
							{errors.companyName && <span className="text-red-500 text-xs">{errors.companyName.message}</span>}
						</div>						
						<div className="bg-[#553AA9] px-4 py-5 rounded-lg">
							<h5 className="mb-5">Silahkan isi lokasi pelayanan</h5>
								{fields.map((item, index) => (
									<div key={item.id} className="relative flex flex-col lg:flex-row gap-2 items-center mb-5">
										<select 
											className="text-black px-4 py-2 rounded-lg min-w-[270px] w-full"
											// onChange={(e: any) => setRegionCode(e.target.value)}
											{...register(`serviceLocation.${index}.region`, {
												onChange: async (e) => {
													const regionId = e.target.value;
													await handleRegionChange(regionId, index);
												  },
											  })}
											>
											<option  value="">Provinsi</option>	
											{dataProvince?.map((prov:any) => (
												<option key={prov.id} value={prov.id}>
													{prov.name}
												</option>
		                  					))}
										</select>
										<select
											className="text-black px-4 py-2 rounded-lg min-w-[270px] w-full "
											{...register(`serviceLocation.${index}.subregion`)}
										>
											{
												 subRegions.length > 0 ? subRegions[index]?.map((kab) => (
													<option key={kab.id} value={kab.id}>
													{kab.name}
													</option> 
												)) : <option value="">Kota/Kabupaten</option>
											
											}
										</select>
										<button
											type="button"
											className="text-red-500 text-2xl"
											onClick={() => remove(index)} // Remove the input field
										>
											<IoMdRemoveCircleOutline />
											</button>
									</div>
								))}
							
							{fields.length < 5 && 
								<>
									<button
									type="button"
									className="flex gap-1 items-center bg-c-blue py-2 px-5 "
									onClick={() =>
									append({
										region: "",
										subregion: "",
									})
									}
								><IoMdAddCircleOutline/> Tambah Lokasi</button>
								
							</>
							}
							{fields.length >=5 && <div className="text-red-500">Maximal 5 lokasi pelayanan</div>}
						</div>


						<div className="relative">
							<textarea
								placeholder="Alamat"
								className="text-black px-4 py-2 rounded-lg min-w-[270px] w-full"
								{...register("address")}
							/>
							{errors.address && <span className="text-red-500 text-xs">{errors.address.message}</span>}
						</div>						
						<div className="relative">
							<input type="text"
								placeholder="Nama Bank"
								className="text-black px-4 py-2 rounded-lg min-w-[270px] w-full"
								{...register("bankName")}
							/>
							{errors.bankName && <span className="text-red-500 text-xs">{errors.bankName.message}</span>}
						</div>						
						<div className="relative">
							<input type="text"
								placeholder="Nomor Rekening"
								className="text-black px-4 py-2 rounded-lg min-w-[270px] w-full"
								{...register("accountNumber")}
							/>
							{errors.accountNumber && <span className="text-red-500 text-xs">{errors.accountNumber.message}</span>}
						</div>						
						<div className="relative">
							<input type="text"
								placeholder="Nama Pemilik Rekening"
								className="text-black px-4 py-2 rounded-lg min-w-[270px] w-full"
								{...register("accountName")}
							/>
							{errors.accountName && <span className="text-red-500 text-xs">{errors.accountName.message}</span>}
						</div>						

						<div className="mt-8 flex justify-center">
							<div className="flex flex-col gap-2 justify-center lg:w-[172px] w-[350px]">
								<Button className="h-[42px] text-center text-white rounded-full bg-c-green">
									Register
								</Button>
								<p className="font-hind font-semibold text-[12px] text-center">
									Sudah punya akun?{" "}
									<Link href={"/auth/login"} className="text-c-orange">
										Login
									</Link>
								</p>
							</div>
						</div>
					</form>
				{message ? (
					<div className="mt-1 text-green-500">
					Registrasi berhasil, silahkan cek email anda untuk konfirmasi
					</div>
				) : null}
				{errorMessage ? (
					<div className="text-c-red mt-1">{errorMessage}</div>
				) : null}
			</div>
		</div>
	);
};

const SignUp = () => {
	return (
		<div className="my-10 lg:w-[973px] w-[400px]  bg-c-blue rounded-lg mx-auto text-white flex justify-center">
			<div className="w-full max-w-[700px] px-5 mx-auto py-14">
				<Registration />
			</div>
		</div>
	);
};

export default SignUp;
