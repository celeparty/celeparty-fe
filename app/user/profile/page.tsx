"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import React, { useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { axiosUser } from "@/lib/services";

import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
	name: z.string().nonempty({
		message: "Nama Tidak Boleh Kosong",
	}),

	date: z
		.string()
		.nonempty({ message: "Tanggal Tidak Boleh Kosong" })
		.regex(/^\d{2}-\d{2}-\d{4}$/, {
			message: "Tanggal harus dalam format Hari-Bulan-Tahun dalam angka!",
		}),

	gender: z.string().nonempty({ message: "Jenis kelamin Tidak Boleh Kosong" }),

	email: z.string().nonempty({ message: "Email Tidak Boleh Kosong" }).email({ message: "Email Tidak Valid" }),

	phone: z
		.string()
		.nonempty({ message: "Nomor Telepon Tidak Boleh Kosong" })
		.regex(/^\d+$/, { message: "Nomor telepon harus berisi angka!" })
		.min(10, { message: "Nomor telepon minimal 10 angka!" })
		.max(15, { message: "Nomor telepon maksimal 15 angka!" }),
});

interface NotificationItem {
	title: string;
	description: string;
}



const TableStatus = () => {
	
	return (
		<div className="mt-20 lg:h-[400px] h-auto overflow-x-auto">
			<h1 className="font-hind font-semibold text-[16px] text-black mb-6">Status Pembelian</h1>
			<table className="min-w-full bg-white border-b-2 border-gray-200">
				<thead className="">
					<tr>
						<th className="lg:px-6 px-4 py-3 border-b-4 text-start text-xs font-bold text-[8px] text-black uppercase tracking-wider">
							Order ID
						</th>
						<th className="lg:px-6 px-4 py-3 border-b-4 text-start text-xs font-bold text-[8px] text-black uppercase tracking-wider">
							Item
						</th>
						<th className="lg:px-6 px-4 py-3 border-b-4 text-start text-xs font-bold text-[8px] text-black uppercase tracking-wider">
							Status
						</th>
						<th className="lg:px-6 px-4 py-3 border-b-4 text-start text-xs font-bold text-[8px] text-black uppercase tracking-wider">
							Total
						</th>
						<th className="lg:px-6 px-4 py-3 border-b-4 text-start text-xs font-bold text-[8px] text-black uppercase tracking-wider">
							Vendor
						</th>
					</tr>
				</thead>
				<tbody className="[&_td]:text-start [&_td]:font-normal [&_td]:lg:text-[10px] [&_td]:text-[12px] [&_td]:font-hind [&_td]:text-[#3C3C3C] [&_td]:border-b-4">
					<tr>
						<td className="lg:px-6 px-4 py-4 border-b border-gray-200">2023/01/24/1</td>
						<td className="lg:px-6 px-4 py-4 border-b border-gray-200">Matcha Drip Cake</td>
						<td className="lg:px-6 px-4 py-4 border-b border-gray-200">Pending</td>
						<td className="lg:px-6 px-4 py-4 border-b border-gray-200">Rp. 220.000</td>
						<td className="lg:px-6 px-4 py-4 border-b border-gray-200">ABC Cakes</td>
					</tr>
					<tr>
						<td className="lg:px-6 px-4 py-4 border-b border-gray-200">2023/01/24/2</td>
						<td className="lg:px-6 px-4 py-4 border-b border-gray-200">Matcha Drip Cake</td>
						<td className="lg:px-6 px-4 py-4 border-b border-gray-200">Processing</td>
						<td className="lg:px-6 px-4 py-4 border-b border-gray-200">Rp. 220.000</td>
						<td className="lg:px-6 px-4 py-4 border-b border-gray-200">ABC Cakes</td>
					</tr>
					<tr>
						<td className="lg:px-6 px-4 py-4 border-b border-gray-200">2023/01/24/3</td>
						<td className="lg:px-6 px-4 py-4 border-b border-gray-200">Matcha Drip Cake</td>
						<td className="lg:px-6 px-4 py-4 border-b border-gray-200">Shipping</td>
						<td className="lg:px-6 px-4 py-4 border-b border-gray-200">Rp. 220.000</td>
						<td className="lg:px-6 px-4 py-4 border-b border-gray-200">ABC Cakes</td>
					</tr>
				</tbody>
			</table>
		</div>
	);
};

const NotificationItem: React.FC<NotificationItem> = ({ title, description }) => {
	return (
		<div className="">
			<h3 className="font-hind font-semibold text-[15px] lg:text-[12px] text-black leading-[20px]">{title}</h3>
			<p className="font-hind font-normal text-[13px] lg:text-[10px] leading-[15px] text-[#3C3C3C]">
				{description}
			</p>
		</div>
	);
};

const Notification = () => {
	return (
		<div className="mt-12">
			<h1 className="lg:text-[16px] text-[20px] my-4 leading-[26px] font-hind text-black font-semibold">
				Notifikasi
			</h1>
			<div className="flex flex-col gap-4">
				<NotificationItem
					title="Rating untuk Mitra kami"
					description="Terimakasih sudah mempercayakan mitra kami untuk acara anda, mohon berikan penilaian untuk meningkatakan kualitas pelayanan mitra kami."
				/>
				<NotificationItem
					title="Pesanan Anda sudah closed?"
					description="Terimakasih sudah mempercayakan kami untuk acara anda. Mohon konfirmasi penyelesaian pesanan anda."
				/>
				<NotificationItem
					title="Pembayaranmu terverifikasi"
					description="Selamat pembayaran anda sudah terverifikasi, Mitra kami akan segera memproses pesanan anda."
				/>
			</div>
		</div>
	);
};

const InputUser = () => {
	const { data: session, status } = useSession();
	const [myData, setMyData] = useState<any>();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			date: "",
			gender: "",
			email: "",
			phone: "",
		},
	});

	useEffect(() => {
		if (myData) {
		  form.reset({
			name: myData.name || "",
			date: myData.birthdate || "",
			gender: "male",
			email: myData.email || "",
			phone: myData.phone || "",
		  });
		}
	  }, [myData, form]);

	useEffect(() => {
		if (status === "authenticated") {
			axiosUser("GET", "/api/users/me", `${session && session?.jwt}`).then((res) => {
				setMyData(res)
			})
		}
	}, [status]);



	function onSubmit(values: z.infer<typeof formSchema>) {
		form.reset();
		alert("Selamat! Data diri anda sudah masuk ke sistem");
		console.log(values);
	}
	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="-mt-10 lg:mt-0">
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem className="mb-4">
							<div className="flex lg:flex-row flex-col lg:items-center items-start lg:gap-8 gap-1">
								<FormLabel className="lg:w-[30%] w-[50%] text-black font-semibold font-hind lg:text-[16px] text-[14px] text-start">
									Nama
								</FormLabel>
								<FormControl className="lg:w-[320px] w-[300px]">
									<Input className="border border-[#ADADAD] rounded-lg" {...field} />
								</FormControl>
							</div>
							<div className="ml-[160px]">
								<FormMessage className="text-[9px]" />
							</div>
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="date"
					render={({ field }) => (
						<FormItem className="mb-4">
							<div className="flex lg:flex-row flex-col items-start lg:items-center gap-1">
								<FormLabel className="lg:w-[30%] w-[50%] text-black font-semibold font-hind lg:text-[16px] text-[14px]">
									Tanggal Lahir
								</FormLabel>
								<FormControl className="lg:w-[320px] w-[300px]">
									<Input className="border border-[#ADADAD] rounded-lg" {...field} />
								</FormControl>
							</div>
							<div className="ml-[160px]">
								<FormMessage className="text-[9px]" />
							</div>
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="gender"
					render={({ field }) => (
						<FormItem className="mb-4">
							<div className="flex lg:flex-row flex-col items-start lg:items-center gap-1">
								<FormLabel className="lg:w-[30%] w-[50%] text-black font-semibold font-hind lg:text-[16px] text-[14px]">
									Jenis Kelamin
								</FormLabel>
								<FormControl className="lg:w-[320px] w-[300px]">
									<Input className="border border-[#ADADAD] rounded-lg" {...field} />
								</FormControl>
							</div>
							<div className="ml-[160px]">
								<FormMessage className="text-[9px]" />
							</div>
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem className="mb-4">
							<div className="flex lg:flex-row flex-col items-start lg:items-center gap-1">
								<FormLabel className="lg:w-[30%] w-[50%] text-black font-semibold font-hind lg:text-[16px] text-[14px]">
									Email
								</FormLabel>
								<FormControl className="lg:w-[320px] w-[300px]">
									<Input className="border border-[#ADADAD] rounded-lg" {...field} />
								</FormControl>
							</div>
							<div className="ml-[160px]">
								<FormMessage className="text-[9px]" />
							</div>
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="phone"
					render={({ field }) => (
						<FormItem className="mb-4">
							<div className="flex lg:flex-row flex-col items-start lg:items-center gap-1">
								<FormLabel className="lg:w-[30%] w-[50%] text-black font-semibold font-hind lg:text-[16px] text-[14px]">
									No HP
								</FormLabel>
								<FormControl className="lg:w-[320px] w-[300px]">
									<Input className="border border-[#ADADAD] rounded-lg" {...field} />
								</FormControl>
							</div>
							<div className="ml-[160px]">
								<FormMessage className="text-[9px]" />
							</div>
						</FormItem>
					)}
				/>
				<div className="flex flex-col gap-4 items-end mt-10">
					<Button
						type="submit"
						className="w-full lg:w-[300px] hover:bg-[#CBD002] bg-[#CBD002] text-white py-2 px-4 rounded-lg font-semibold lg:text-[16px] text-[14px] "
					>
						Submit
					</Button>
					<Button
						type="submit"
						className="w-full lg:w-[300px] hover:bg-white bg-white border-solid border border-black rounded-lg text-black font-semibold lg:text-[16px] text-[14px] "
					>
						Ubah Kata Sandi
					</Button>
				</div>
			</form>
		</Form>
	);
};

const ProfilePage = () => {
	return (
		<div className="wrapper my-10">
			<div className="px-10 lg:py-6 py-2 lg:border-2 lg:border-gray-300 bg-[#F2F2F2] lg:rounded-lg lg:shadow-xl">
				<h1 className="text-[20px] lg:text-[16px] text-center lg:text-start my-4 leading-[26px] font-hind text-black font-semibold">
					Biodata Diri
				</h1>
				<div className="flex lg:flex-row flex-col lg:gap-24 gap-16">
					<div className="w-[300px] mx-auto lg:mx-0">
						<div className="w-full h-[300px] mb-4 bg-black rounded-lg"></div>
						<button className="border-solid border border-black w-full py-2 rounded-lg mb-2">
							Pilih Foto
						</button>
						<p className="font-hind font-normal text-[11px] text-center leading-[20px]">
							Besar file: maksimum 10.000.000 bytes (10 Megabytes). <br /> Ekstensi file yang
							diperbolehkan: .JPG .JPEG .PNG
						</p>
					</div>
					<div className="w-fit">
						<InputUser />
					</div>
				</div>
				{/* <Notification /> */}
				<TableStatus />
			</div>
		</div>
	);
};

export default ProfilePage;
