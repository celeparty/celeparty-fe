"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"
import { axiosData } from "@/lib/services";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const signUpSchema = z.object({
	name: z.string().nonempty({ message: "Nama tidak boleh kosong" }),
	username: z.string().nonempty({ message: "User Name tidak boleh kosong" }),
	email: z.string().nonempty({ message: "Email tidak boleh kosong" }).email({ message: "Invalid email address" }),
	phone: z.string().nonempty({ message: "No Telepon tidak boleh kosong" }),
	address: z.string().nonempty({ message: "Alamat tidak boleh kosong" }),
	birthplace: z.string().nonempty({ message: "Tempat lahir boleh kosong" }),
	birthdate: z.string().nonempty({ message: "Tanggal lahir boleh kosong" }),
	nik: z.string().nonempty({ message: "NIK boleh kosong" }),
	companyName: z.string().nonempty({ message: "Nama usaha boleh kosong" }),
	serviceLocation: z.string().nonempty({ message: "Lokasi layanan tidak boleh kosong" }),
	bankName: z.string().nonempty({ message: "Nama bank boleh kosong" }),
	accountNumber: z.string().nonempty({ message: "Nomer rekening boleh kosong" }),
	accountName: z.string().nonempty({ message: "Nama pemegang rekening boleh kosong" }),
	password: z
		.string()
		.nonempty({ message: "Kata Sandi tidak boleh kosong" })
		.min(8, "Kata sandi harus memiliki minimal 8 karakter")
		.regex(/[A-Z]/, "Kata sandi harus mengandung setidaknya satu huruf besar")
		.regex(/[a-z]/, "Kata sandi harus mengandung setidaknya satu huruf kecil")
		.regex(/[0-9]/, "Kata sandi harus mengandung setidaknya satu angka"),
	confirmPassword: z
		.string()
		.nonempty({ message: "Kata Sandi tidak boleh kosong" })
		.min(8, "Kata sandi harus memiliki minimal 8 karakter")
		.regex(/[A-Z]/, "Kata sandi harus mengandung setidaknya satu huruf besar")
		.regex(/[a-z]/, "Kata sandi harus mengandung setidaknya satu huruf kecil")
		.regex(/[0-9]/, "Kata sandi harus mengandung setidaknya satu angka"),
});

const Registration = () => {
	const [message, setMessage] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | boolean | null>(
	  false
	);
  
	const form = useForm<z.infer<typeof signUpSchema>>({
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
			serviceLocation:"",
			bankName:"",
			accountNumber:"",
			accountName:"",			
			password: "",
			confirmPassword: "",
		},
	});

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
		form.reset();
	};
	return (
		<div>
			<h1 className="mb-4 lg:text-start text-center text-2xl font-bold">Registrasi</h1>
			<div className="relative">
				<Form {...form}>
					<form onSubmit={form.handleSubmit(signUp)} className="flex flex-col gap-4">
					<div className="relative">
							<input type="text"
								placeholder="Nama Lengkap"
								className="text-black px-4 py-2 rounded-lg min-w-[270px] w-full"
								{...form.register("name")}
							/>
						</div>						
						<div className="relative">
							<input type="text"
								placeholder="User Name"
								className="text-black px-4 py-2 rounded-lg min-w-[270px] w-full"
								{...form.register("username")}
							/>
						</div>						
						<div className="relative">
							<input type="email"
								placeholder="Email"
								className="text-black px-4 py-2 rounded-lg min-w-[270px] w-full"
								{...form.register("email")}
							/>
						</div>						
						<div className="relative">
							<input type="text"
								placeholder="Tempat Lahir"
								className="text-black px-4 py-2 rounded-lg min-w-[270px] w-full"
								{...form.register("birthplace")}
							/>
						</div>						
						<div className="relative">
							<input type="text"
								placeholder="Tanggal Lahir"
								className="text-black px-4 py-2 rounded-lg min-w-[270px] w-full"
								{...form.register("birthdate")}
							/>
						</div>						
						<div className="relative">
							<input type="text"
								placeholder="NIK"
								className="text-black px-4 py-2 rounded-lg min-w-[270px] w-full"
								{...form.register("nik")}
							/>
						</div>						
						<div className="relative">
							<input type="text"
								placeholder="No Telepon"
								className="text-black px-4 py-2 rounded-lg min-w-[270px] w-full"
								{...form.register("phone")}
							/>
						</div>						
						<div className="relative">
							<input type="password"
								placeholder="Kata Sandi"
								className="text-black px-4 py-2 rounded-lg min-w-[270px] w-full"
								{...form.register("password")}
							/>
						</div>						
						<div className="relative">
							<input type="password"
								placeholder="Ulangi Kata Sandi"
								className="text-black px-4 py-2 rounded-lg min-w-[270px] w-full"
								{...form.register("confirmPassword")}
							/>
						</div>						
						<div className="relative">
							<input type="text"
								placeholder="Nama Usaha"
								className="text-black px-4 py-2 rounded-lg min-w-[270px] w-full"
								{...form.register("companyName")}
							/>
						</div>						
						<div className="relative">
							<input type="text"
								placeholder="Lokasi Pelayanan"
								className="text-black px-4 py-2 rounded-lg min-w-[270px] w-full"
								{...form.register("serviceLocation")}
							/>
						</div>						
						<div className="relative">
							<textarea
								placeholder="Address"
								className="text-black px-4 py-2 rounded-lg min-w-[270px] w-full"
								{...form.register("address")}
							/>
						</div>						
						<div className="relative">
							<input type="text"
								placeholder="Nama Bank"
								className="text-black px-4 py-2 rounded-lg min-w-[270px] w-full"
								{...form.register("bankName")}
							/>
						</div>						
						<div className="relative">
							<input type="text"
								placeholder="Nomor Rekening"
								className="text-black px-4 py-2 rounded-lg min-w-[270px] w-full"
								{...form.register("accountNumber")}
							/>
						</div>						
						<div className="relative">
							<input type="text"
								placeholder="Nama Pemilik Rekening"
								className="text-black px-4 py-2 rounded-lg min-w-[270px] w-full"
								{...form.register("accountName")}
							/>
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
				</Form>
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
