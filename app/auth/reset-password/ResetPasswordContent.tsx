"use client";
import Box from "@/components/Box"
import React from 'react'
import {  useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { axiosData } from "@/lib/services";


const passwordSchema = z
	.object({
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

export default function ResetPasswordContent() {
	const [message, setMessage] = useState(false);
	const params = useSearchParams();
		const {
			register,
			handleSubmit,
			formState: { errors },
		} = useForm<z.infer<typeof passwordSchema>>({
			resolver: zodResolver(passwordSchema),
			defaultValues: {
				password: "",
				confirmPassword: "",
			},
		});

	const sendForgot = (values: z.infer<typeof passwordSchema>) => {
		const sendNow = async () => {
			try {
				const data = {
					code: params.get("code"),
					password: values.password,
					passwordConfirmation: values.confirmPassword,
				}
				const response = await axiosData("POST", "/api/auth/reset-password", data);	
				setMessage(true);		
			} catch (error:any) {
				console.error("Error:", error?.response.data.error.message);
			}
		}
		sendNow()
	}		

	return (
		<div className="relative wrapper-main py-7">
				<div className="flex justify-between items-start gap-7">
				<Box className=" w-full max-w-[600px] mx-auto mt-0">
				<h4 className="text-3xl font-bold mb-5 text-c-gray-text">Reset Kata Sandi</h4>
				<form onSubmit={handleSubmit(sendForgot)} className="flex flex-col gap-4">
					<div className="relative">
						<input type="password"
							placeholder="Kata Sandi"
							className="text-black border border-[#D9D9D9] px-4 py-2 rounded-lg min-w-[270px] w-full"
							{...register("password")}
						/>
						{errors.password && <span className="text-red-500 text-xs">{errors.password.message}</span>}
					</div>						
					<div className="relative">
						<input type="password"
							placeholder="Ulangi Kata Sandi"
							className="text-black border border-[#D9D9D9] px-4 py-2 rounded-lg min-w-[270px] w-full"
							{...register("confirmPassword")}
						/>
						{errors.confirmPassword && <span className="text-red-500 text-xs">{errors.confirmPassword.message}</span>}
					</div>					
					<div className="relative">
						<Button className="h-[42px] text-center text-white rounded-full px-7">
							Submit
						</Button>
					</div>
				</form>
				{message ? (
					<div className="mt-1 text-green-500">
					Password berhasil diubah
					</div>
				) : null}

				</Box>
			</div>
		</div>
	)
}



