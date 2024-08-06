"use client"
import React from 'react'
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
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
import Link from "next/link";

const signUpSchema = z.object({
    name: z.string().nonempty({ message: "Nama tidak boleh kosong" }),
    vendor_name: z.string().nonempty("Usaha wajib diisi"),
    vendor_desc: z.string().nonempty("Usaha wajib diisi"),
    vendor_same_city_only: z.string().nonempty("Kota wajib diisi"),
    email: z
        .string()
        .nonempty({ message: "Email tidak boleh kosong" })
        .email({ message: "Invalid email address" }),
    phone: z
        .string()
        .nonempty({ message: "No Telepon tidak boleh kosong" })
        .regex(/^\d+$/, "No Telepon harus berisi angka saja"),

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
    agreement: z
        .boolean()
        .refine((val) => val, "Agreement harus di centang")
});
export default function ContentRegister() {
    const { control, handleSubmit, register, formState: { errors }, watch } = useForm({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            name: "",
            vendor_name: "",
            vendor_desc: "",
            vendor_same_city_only: "",
            email: "",
            phone: "",
            agreement: false,
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit: SubmitHandler<any> = async (data) => {
        console.log(data);
        console.log("he")
    }

    const password = watch("password");
    const confirmPassword = watch("confirmPassword");
    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="w-[270px] lg:w-[491px] lg:mx-auto mx-0">
                    <h1 className="mb-4 text-center lg:text-start">Registrasi</h1>
                    <div className="flex flex-col gap-4 text-c-gray-text [&_input]:text-black">
                        <input {...register("name")} placeholder="Name" />
                        <input {...register("vendor_name")} placeholder="vendor name" />
                        <input {...register("vendor_desc")} placeholder="dekripsi usaha" />
                        <input {...register("vendor_same_city_only")} placeholder="kota" />
                        <input {...register("email")} placeholder="Email" />
                        <input {...register("phone")} placeholder="No Telepon" />

                        <Controller
                            name="password"
                            control={control}
                            render={({ field }) => (
                                <input
                                    {...field}
                                    type="password"
                                    placeholder="Password"
                                />
                            )}
                        />

                        <Controller
                            name="confirmPassword"
                            control={control}
                            render={({ field }) => (
                                <input
                                    {...field}
                                    type="password"
                                    placeholder="Confirm Password"
                                />
                            )}
                        />

                        {password !== confirmPassword && (
                            <p>Password and confirm password must be the same</p>
                        )}
                    </div>
                </div>

                <div className="mt-16 lg:mx-auto">
                    <div className="lg:w-[760px] mx-auto">
                        <div className="font-hind font-semibold text-justify text-[10px] leading-[16px] px-4 lg:px-0">
                            KETENTUAN PENDAFTARAN MITRA CELEPARTY (CELEPARTNER) DENGAN MENGAJUKAN
                            FORMULIR PENDAFTARAN INI, ANDA MEMAHAMI DAN SETUJU BAHWA SETIAP DATA
                            DAN/ATAU INFORMASI (TERMASUK NAMUN TIDAK TERBATAS PADA INFORMASI
                            PRIBADI) YANG ANDA BERIKAN AKAN DAN DAPAT KAMI KUMPULKAN, SIMPAN,
                            GUNAKAN DAN KUASAI SEBAGAI BAGIAN DARI PROSES PENDAFTARAN LAYANAN
                            CELEPARTNER. USAHA ANDA AKAN TERDAFTAR DALAM LAYANAN KAMI DAN ANDA AKAN
                            MENDAPATKAN AKSES KE DALAM WEBSITE CELEPARTNER UNTUK MENGATUR TRANSAKSI
                            PENJUALAN ONLINE ANDA, TERMASUK UNTUK MENERIMA PEMBAYARAN TRANSAKSI DARI
                            PELANGGAN MELALUI DOMPET ELEKTRONIK ANDA. ATAS SETIAP TRANSAKSI YANG
                            DIPROSES MELALUI CELEPARTY, ANDA AKAN DIKENAKAN BIAYA LAYANAN DARI
                            SETIAP TRANSAKSI YANG DILAKUKAN. SETELAH MENGAJUKAN FORMULIR PENDAFTARAN
                            INI, ANDA AKAN DIKIRIMKAN PERJANJIAN DAN SYARAT DAN KETENTUAN LAYANAN
                            CELEPARTNER YANG AKAN DIKIRIMKAN KE EMAIL YANG TERDAFTAR. PERJANJIAN DAN
                            SYARAT DAN KETENTUAN LAYANAN CELEPARTNER HARUS DITANDATANGANI OLEH
                            DIREKTUR PERTAMA/ PEMILIK UTAMA YANG TERDAFTAR UNTUK MENYELESAIKAN
                            PROSES PENDAFTARAN LAYANAN CELEPARTNER.
                        </div>
                        <div className="mt-8 flex gap-4 items-center px-4 lg:px-0">
                            <div className="rounded-lg lg:overflow-hidden">
                                <Input {...register("agreement")} type="checkbox" className="w-[20px] h-[20px] rounded-xl" />

                            </div>
                            <p className="font-hind font-semibold text-[10px] leading-[16px]">
                                SAYA TELAH MEMBACA DAN SETUJU DENGAN KETENTUAN PENDAFTARAN LAYANAN
                                CELEPARTNER DAN{" "}
                                <Link href={"#"} className="text-[#CBD002]">
                                    KEBIJAKAN PRIVASI
                                </Link>
                            </p>
                        </div>
                    </div>
                    <input type="submit" className="text-center cursor-pointer text-white rounded-full bg-c-green" value="Register" />

                </div>

            </form>
        </div>

    )
}
