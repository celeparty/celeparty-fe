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
import { postDataOpen } from "@/lib/services";
import axios from "axios";

const signUpSchema = z.object({
    name: z.string().nonempty({ message: "Nama tidak boleh kosong" }),
    vendor_name: z.string().nonempty("Usaha wajib diisi"),
    vendor_desc: z.string().nonempty("Usaha wajib diisi"),
    vendor_same_city_only: z.boolean().optional(),
    email: z
        .string()
        .nonempty({ message: "Email tidak boleh kosong" })
        .email({ message: "Invalid email address" }),
    phonenumber: z
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
    password_confirmation: z
        .string()
        .nonempty({ message: "Kata Sandi tidak boleh kosong" })
        .min(8, "Kata sandi harus memiliki minimal 8 karakter")
        .regex(/[A-Z]/, "Kata sandi harus mengandung setidaknya satu huruf besar")
        .regex(/[a-z]/, "Kata sandi harus mengandung setidaknya satu huruf kecil")
        .regex(/[0-9]/, "Kata sandi harus mengandung setidaknya satu angka"),
    agreement: z
        .boolean()
        .refine((val) => val, "Agreement harus dichecklist")
});

function ErrorMessage({ children }: { children: React.ReactNode }) {
    return <div className="text-red-400 w-full text-[10px]">{children}</div>;
}
export default function ContentRegister() {
    const [notif, setNotif] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");
    const { control, handleSubmit, register, formState: { errors }, watch } = useForm({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            name: "",
            vendor_name: "",
            vendor_desc: "",
            email: "",
            phonenumber: "",
            agreement: false,
            vendor_same_city_only: false,
            password: "",
            password_confirmation: "",
        },
    });

    const onSubmit: SubmitHandler<any> = async (data) => {
        axios.post(`${process.env.URL_API}/register-vendor`, data)
            .then((res) => {
                console.log({ res })
            }).catch(errors => {
                setErrorMessage(errors.response.data.message)
                console.log({ errors })
                console.log(errors.response.data.message)
            })
        // await postDataOpen(`/register-vendor`, data).then((res) => {
        //     console.log({ res })
        // })

        // setNotif(true)
        // setTimeout(() => {
        //     setNotif(false)
        // }, 5000)
    }

    const password = watch("password");
    const confirmPassword = watch("password_confirmation");
    console.log(errors)
    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="w-[270px] lg:w-[491px] lg:mx-auto mx-0">
                    <h1 className="mb-4 text-center lg:text-start">Registrasi</h1>
                    <div className="flex flex-col gap-4 text-c-gray-text [&_input]:text-black">
                        <input {...register("name")} placeholder="Name" className="w-full px-2 py-2 rounded-md" />
                        {errors.name && <ErrorMessage>{errors.name?.message}</ErrorMessage>}
                        <input {...register("vendor_name")} placeholder="vendor name" className="w-full px-2 py-2 rounded-md" />
                        {errors.vendor_name && <ErrorMessage>{errors.vendor_name?.message}</ErrorMessage>}
                        <input {...register("vendor_desc")} placeholder="dekripsi usaha" className="w-full px-2 py-2 rounded-md" />
                        {errors.vendor_desc && <ErrorMessage>{errors.vendor_desc?.message}</ErrorMessage>}
                        {/* <input {...register("vendor_same_city_only")} placeholder="kota" className="w-full px-2 py-2 rounded-md" />
                        {errors.vendor_same_city_only && <ErrorMessage>{errors.vendor_same_city_only?.message}</ErrorMessage>} */}
                        <input {...register("email")} placeholder="Email" className="w-full px-2 py-2 rounded-md" />
                        {errors.email && <ErrorMessage>{errors.email?.message}</ErrorMessage>}
                        <input {...register("phonenumber")} placeholder="No Telepon" className="w-full px-2 py-2 rounded-md" />
                        {errors.phonenumber && <ErrorMessage>{errors.phonenumber?.message}</ErrorMessage>}
                        <div className="flex gap-2 text-white">
                            <Input {...register("vendor_same_city_only")} type="checkbox" className="w-[20px] h-[20px] rounded-xl" />
                            <div>Di kota yang sama</div>
                        </div>
                        <Controller
                            name="password"
                            control={control}
                            render={({ field }) => (
                                <input
                                    {...field}
                                    type="password"
                                    placeholder="Password"
                                    className="w-full px-2 py-2 rounded-md"
                                />
                            )}
                        />
                        <Controller
                            name="password_confirmation"
                            control={control}
                            render={({ field }) => (
                                <input
                                    {...field}
                                    type="password"
                                    placeholder="Confirm Password"
                                    className="w-full px-2 py-2 rounded-md"
                                />
                            )}
                        />
                        {errors.password && <ErrorMessage>{errors.password?.message}</ErrorMessage>}
                        {password !== confirmPassword && (
                            <ErrorMessage>Password and confirm password harus sama</ErrorMessage>
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
                        <div className="mt-8 mb-2 flex gap-4 items-center px-4 lg:px-0">
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
                        <ErrorMessage>{errors.agreement?.message}</ErrorMessage>
                    </div>
                    <div className="flex justify-center mt-7">
                        <input type="submit" className="text-center cursor-pointer px-3 py-1 min-w-[170px] text-white rounded-full bg-c-green" value="Register" />
                    </div>
                    {
                        notif &&
                        <div className="text-green-500">Data Berhasil dikirim</div>
                    }
                    {
                        errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>
                    }

                </div>

            </form>
        </div>

    )
}
