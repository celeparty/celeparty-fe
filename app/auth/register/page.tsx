"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"
import { axiosData } from "@/lib/services";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";

const signUpSchema = z.object({
	name: z.string().nonempty({ message: "Nama tidak boleh kosong" }),
	email: z.string().nonempty({ message: "Email tidak boleh kosong" }).email({ message: "Invalid email address" }),
	phone: z.string().nonempty({ message: "No Telepon tidak boleh kosong" }),
	address: z.string().nonempty({ message: "Alamat tidak boleh kosong" }),
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
	const form = useForm<z.infer<typeof signUpSchema>>({
		resolver: zodResolver(signUpSchema),
		defaultValues: {
			name: "",
			email: "",
			phone: "",
			address: "",
			password: "",
			confirmPassword: "",
		},
	});

	const signUp = (values: z.infer<typeof signUpSchema>) => {
		const sendNow = async () => {
			try {
				const data = {
					username: values.name,
					email: values.email,
					phone: values.phone,
					address: values.address,
					password: values.password,
				};
		  
				const response = await axiosData("POST", "/auth/local/register", data);	
				console.log(response)			
			} catch (error) {
				console.error(error);				
			}
		}
		sendNow()		
		form.reset();
		// alert("Selamat!, Proses Register Kamu Berhasil!!");
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
								className="text-black px-4 py-2 rounded-lg min-w-[270px]"
								{...form.register("name")}
							/>
						</div>						
						<div className="relative">
							<input type="email"
								placeholder="Email"
								className="text-black px-4 py-2 rounded-lg min-w-[270px]"
								{...form.register("email")}
							/>
						</div>						
						<div className="relative">
							<input type="text"
								placeholder="No Telepon"
								className="text-black px-4 py-2 rounded-lg min-w-[270px]"
								{...form.register("phone")}
							/>
						</div>						
						<div className="relative">
							<textarea
								placeholder="Address"
								className="text-black px-4 py-2 rounded-lg min-w-[270px]"
								{...form.register("address")}
							/>
						</div>						
						<div className="relative">
							<input type="password"
								placeholder="Kata Sandi"
								className="text-black px-4 py-2 rounded-lg min-w-[270px]"
								{...form.register("password")}
							/>
						</div>						
						<div className="relative">
							<input type="password"
								placeholder="Ulangi Kata Sandi"
								className="text-black px-4 py-2 rounded-lg min-w-[270px]"
								{...form.register("confirmPassword")}
							/>
						</div>						

						<div className="mt-8 flex justify-center">
							<div className="flex flex-col gap-2 justify-center lg:w-[172px] w-[350px]">
								<Button className="h-[42px] text-center text-white rounded-full bg-c-green">
									Register
								</Button>
								<p className="font-hind font-semibold text-[12px] text-center">
									Sudah punya akun?{" "}
									<Link href={"/signin"} className="text-c-orange">
										Login
									</Link>
								</p>
							</div>
						</div>
					</form>
				</Form>
			</div>
		</div>
	);
};

const SignUp = () => {
	return (
		<div className="my-10 lg:w-[973px] w-[400px] h-[745px] bg-c-blue rounded-lg mx-auto text-white flex justify-center">
			<div className="lg:w-[260px] w-[350px]lg:mx-auto py-14">
				<Registration />
			</div>
		</div>
	);
};

export default SignUp;
