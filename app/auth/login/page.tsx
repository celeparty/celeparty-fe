"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { get } from "http";
import { Suspense, useEffect, useState } from "react";
import { IoIosEye, IoIosEyeOff } from "react-icons/io";

const signInSchema = z.object({
	email: z
		.string()
		.email({ message: "Email tidak valid" })
		.max(254, { message: "Maksimal karakter untuk email yaitu 254 huruf" }),
	password: z
		.string()
		.min(6, { message: "Kata sandi minimal 6 karakter" })
		.max(64, { message: "Maksimal karakter untuk kata sandi yaitu 64 huruf" }),
});

function LoginPage() {
	const { data: session, status } = useSession();
	const [show, setShow] = useState(false);
	const [message, setMessage] = useState({
		status: false,
		info: "",
		type: "error", // "error" or "unverified"
	});
	const [unverifiedEmail, setUnverifiedEmail] = useState("");
	const [resendLoading, setResendLoading] = useState(false);
	const router = useRouter();
	const params = useSearchParams();
	const getTheme = params.get("theme");

	const form = useForm<z.infer<typeof signInSchema>>({
		resolver: zodResolver(signInSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const Login = async (values: z.infer<typeof signInSchema>, e: any) => {
		const { email, password } = values;
		const result = await signIn("credentials", {
			redirect: false,
			identifier: email,
			password: password,
		});
		
		if (result?.error) {
			setMessage({ status: true, info: "Username atau password salah", type: "error" });
		} else if (result?.ok) {
			setMessage({ status: false, info: "", type: "error" });
			
			// Login successful - redirect to appropriate page
			const redirectUrl = params.get("redirect");
			if (redirectUrl) {
				router.replace(redirectUrl);
			} else {
				router.replace("/user/home");
			}
		}
	};

	const handleResendVerificationEmail = async () => {
		if (!unverifiedEmail) return;

		setResendLoading(true);
		try {
			const response = await fetch("/api/resend-verification-email", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email: unverifiedEmail }),
			});

			const data = await response.json();

			if (response.ok) {
				setMessage({
					status: true,
					info: "Email verifikasi telah dikirim ulang. Silakan cek email Anda.",
					type: "success"
				});
			} else {
				setMessage({
					status: true,
					info: data.message || "Gagal mengirim email verifikasi",
					type: "error"
				});
			}
		} catch (error: any) {
			setMessage({
				status: true,
				info: error.message || "Terjadi kesalahan saat mengirim email",
				type: "error"
			});
		} finally {
			setResendLoading(false);
		}
	};

	return (
		<div className={`relative wrapper py-7 my-5 rounded-lg ${getTheme == "vendor" ? "bg-c-green" : "bg-c-blue"}`}>
			<div className="w-[260px] mx-auto py-8">
				<div className="flex justify-center">
					<Image
						src={`${getTheme == "vendor" ? "/images/cake-color-white.png" : "/images/cake-color.png"}`}
						width={111}
						height={80}
						alt="Cake Color.."
					/>
				</div>
				<h1 className="text-[26px] text-center font-semibold text-white mb-7">
					{getTheme == "vendor" ? "CELEPARTNER" : "CELEPARTY"}
				</h1>
				<h2 className="font-hind font-semibold text-[24px] text-white">Login</h2>
				<div className="mt-6">
					<Form {...form}>
						<form onSubmit={form.handleSubmit(Login)} className="space-y-8">
							<div className="relative">
								<input
									type="text"
									placeholder="Alamat Email"
									className="text-black px-4 py-2 rounded-lg min-w-[270px]"
									{...form.register("email")}
								/>
							</div>
							<div className="relative">
								<input
									type={show ? "text" : "password"}
									placeholder="Password"
									className="text-black px-4 py-2 rounded-lg min-w-[270px]"
									{...form.register("password")}
								/>
								<div
									className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer"
									onClick={() => setShow(!show)}
								>
									{show ? <IoIosEye /> : <IoIosEyeOff />}
								</div>
							</div>
							{message.status ? (
								<div className={`p-3 rounded-lg mb-4 ${
									message.type === "unverified"
										? "bg-yellow-100 border border-yellow-400 text-yellow-800"
										: message.type === "success"
										? "bg-green-100 border border-green-400 text-green-800"
										: "bg-red-100 border border-red-400 text-red-800"
								}`}>
									<p className="text-sm font-medium">{message.info}</p>
									{message.type === "unverified" && unverifiedEmail && (
										<div className="mt-3 flex gap-2">
											<Button
												type="button"
												onClick={handleResendVerificationEmail}
												disabled={resendLoading}
												className="text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 h-auto"
											>
												{resendLoading ? "Mengirim..." : "Kirim Ulang Email"}
											</Button>
										</div>
									)}
								</div>
							) : null}

							<div className="flex justify-end mt-2">
								<Link
									href={"/auth/forgot-password"}
									className="font-hind font-semibold text-[12px] text-c-orange"
								>
									Lupa Kata Sandi?
								</Link>
							</div>
							<div className="mt-7 flex justify-center">
								<div className="flex flex-col gap-2 justify-center">
									<Button
										type="submit"
										className={`w-[172px] h-[42px] text-center text-white rounded-full ${getTheme === "vendor" ? "bg-c-blue hover:bg-c-blue" : "bg-c-green hover:bg-c-green"}`}
									>
										Login
									</Button>
									{getTheme == "vendor" ? (
										<div className="font-hind font-semibold text-white text-center text-[12px]">
											Ingin menjadi Mitra Celeparty?{" "}
											<Link href={"/auth/register/mitra"} className="text-c-orange block">
												Registrasi sebagai Mitra
											</Link>
										</div>
									) : (
										<p className="font-hind font-semibold text-white text-[12px]">
											Belum punya akun?{" "}
											<Link href={"/auth/register"} className="text-c-orange">
												Registrasi
											</Link>
										</p>
									)}
								</div>
							</div>
						</form>
					</Form>
				</div>
			</div>
		</div>
	);
}

export default function page() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<LoginPage />
		</Suspense>
	);
}
