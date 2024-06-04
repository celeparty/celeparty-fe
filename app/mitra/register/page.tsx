"use client";

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

const signUpSchema = z.object({
    name: z.string().nonempty({ message: "Nama tidak boleh kosong" }),
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
    place_of_birthday: z.string().nonempty("Tempat lahir wajib diisi"),
    date: z
        .string()
        .nonempty("Tanggal wajib diisi")
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal harus dalam format YYYY-MM-DD"),
    my_Nik: z
        .string()
        .nonempty("NIK wajib diisi")
        .regex(/^\d+$/, "NIK harus berisi angka saja"),
    business: z.string().nonempty("Usaha wajib diisi"),
    location_business: z.string().nonempty("Lokasi usaha wajib diisi"),
    address_business: z.string().nonempty("Alamat usaha wajib diisi"),
    name_bank: z.string().nonempty("Nama bank wajib diisi"),
    rekening_number: z
        .string()
        .nonempty("Nomor rekening wajib diisi")
        .regex(/^\d+$/, "Nomor rekening harus berisi angka saja"),
    owner_name: z.string().nonempty("Nama pemilik wajib diisi"),
});

const Registration = () => {
    const form = useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            password: "",
            confirmPassword: "",
            place_of_birthday: "",
            date: "",
            my_Nik: "",
            business: "",
            location_business: "",
            address_business: "",
            name_bank: "",
            rekening_number: "",
            owner_name: "",
        },
    });

    const signUp = (values: z.infer<typeof signUpSchema>) => {
        form.reset();
        alert("Selamat!, Proses Register Kamu Berhasil!!");
        console.log(values);
    };
    return (
        <div className="my-10 lg:w-[973px] bg-c-blue rounded-lg mx-auto text-white">
            <div className=" mx-auto py-14">
                <div>
                    <div>
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(signUp)}
                                className="flex flex-col gap-4 items-center lg:items-start"
                            >
                                <div className="w-[270px] lg:w-[491px] lg:mx-auto mx-0">
                                    <h1 className="mb-4 text-center lg:text-start">Registrasi</h1>
                                    <div className="flex flex-col gap-4">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Nama Lengkap"
                                                            className="text-black"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-[9px]" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="place_of_birthday"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Tempat Lahir"
                                                            className="text-black"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-[9px]" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="date"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Tanggal Lahir"
                                                            className="text-black"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-[9px]" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="my_Nik"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="NIK"
                                                            className="text-black"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-[9px]" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Email"
                                                            className="text-black"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-[9px]" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="phone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="No Telepon"
                                                            className="text-black"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-[9px]" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="confirmPassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Ulangi Kata Sandi"
                                                            className="text-black"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-[9px]" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="business"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Nama Usaha"
                                                            className="text-black"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-[9px]" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="location_business"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Lokasi Pelayanan"
                                                            className="text-black"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-[9px]" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="address_business"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Alamat Usaha"
                                                            className="text-black"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-[9px]" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="name_bank"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Nama Bank"
                                                            className="text-black"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-[9px]" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="rekening_number"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Nomor Rekening"
                                                            className="text-black"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-[9px]" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="owner_name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Nama Pemilik Rekening"
                                                            className="text-black"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-[9px]" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                                <div className="mt-16 lg:mx-auto">
                                    <FooterSection />
                                    <div className="mt-16 flex justify-center lg:px-0 px-4">
                                        <div className="flex flex-col gap-2 justify-center lg:w-[172px] w-full h-[42px]">
                                            <Button className="text-center text-white rounded-full bg-c-green">
                                                Register
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </Form>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FooterSection = () => {
    return (
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
                    <Input type="checkbox" className="w-[20px] h-[20px] rounded-xl" />
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
    );
};

const SecondRegister = () => {
    return (
        <div>
            <Registration />
        </div>
    );
};

export default SecondRegister;
