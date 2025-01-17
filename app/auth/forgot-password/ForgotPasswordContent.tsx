"use client";
import Box from "@/components/Box"
import React from 'react'
import { useRouter } from "next/navigation";
import {  useEffect, useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { axiosData } from "@/lib/services";


const passwordSchema = z
	.object({
		email: z
		.string()
		.nonempty({ message: "Email tidak boleh kosong" })
		.email({ message: "Alamat email tidak valid" })

	})
export default function ForgotPasswordContent() {
	const [message, setMessage] = useState(false);
		const {
			register,
			handleSubmit,
			control,
			formState: { errors },
		} = useForm<z.infer<typeof passwordSchema>>({
			resolver: zodResolver(passwordSchema),
			defaultValues: {
				email: ""
			},
		});

	const sendForgot = (values: z.infer<typeof passwordSchema>) => {
		const sendNow = async () => {
			try {
				const data = {
					email: values.email,
				}
				const response = await axiosData("POST", "/api/auth/forgot-password", data);	
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
				<h4 className="text-3xl font-bold mb-5 text-c-gray-text">Masukan email anda</h4>
				<form onSubmit={handleSubmit(sendForgot)} className="flex flex-col gap-4">
					<div className="relative">
						<input type="email"
							placeholder="Email"
							className="text-black border border-[#D9D9D9] px-4 py-2 rounded-lg min-w-[270px] w-full"
							{...register("email")}
						/>
						{errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
					</div>								
					<div className="relative">
						<Button className="h-[42px] text-center text-white rounded-full px-7">
							Submit
						</Button>
					</div>
				</form>
				{message ? (
					<div className="mt-1 text-green-500">
						Link reset password telah dikirim ke email anda
					</div>
				) : null}

				</Box>
			</div>
		</div>
	)
}
