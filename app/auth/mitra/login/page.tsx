"use client";

import Image from "next/image";
import Link from "next/link";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect } from "react";

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

const LoginMitra = () => {
    const { data: session, status } = useSession()
    const router = useRouter();
    const param = useSearchParams()
    const error = param.get('error')
    const form = useForm<z.infer<typeof signInSchema>>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });
    console.log({ error })

    const Login = async (values: z.infer<typeof signInSchema>) => {
        const { email, password } = values;
        const result = await signIn("credentials", {
            email: email,
            password: password,
            callbackUrl: "/mitra/home",
        });

        if (result?.error) {
            console.error('Login failed:', result.error);
        } else {
            router.push("/mitra/home");
        }

    };
    return (
        status !== "authenticated" ?
            <div className="relative wrapper py-7 bg-[#CBD002] my-5 rounded-lg">
                <div className="w-[260px] mx-auto py-8">
                    <div className="flex justify-center">
                        <Image
                            src={"/images/cake-color-white.png"}
                            width={111}
                            height={80}
                            alt="Cake Color.."
                        />
                    </div>
                    <h1 className="text-[26px] text-center font-semibold text-white mb-7">
                        CELEPARTNER
                    </h1>
                    <h2 className="font-hind font-semibold text-[24px] text-white">
                        Login
                    </h2>
                    <div className="mt-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(Login)} className="space-y-8">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    placeholder="Alamat Email"
                                                    className="text-black rounded-xl"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-[9px]" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    placeholder="Kata Sandi"
                                                    className="text-black rounded-xl"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-[9px]" />
                                        </FormItem>
                                    )}
                                />
                                <div className="flex justify-end mt-2">
                                    <Link
                                        href={"/"}
                                        className="font-hind font-semibold text-[12px] text-c-orange"
                                    >
                                        Lupa Kata Sandi?
                                    </Link>
                                </div>
                                <div className="mt-7 flex justify-center">
                                    <div className="flex flex-col gap-2 justify-center">
                                        <Button
                                            type="submit"
                                            className="shadow shadow-indigo-900/90 w-[172px] h-[42px] bg-c-blue text-center text-white rounded-full"
                                        >
                                            Login
                                        </Button>
                                        <div>
                                            <p className="font-hind font-semibold text-white text-[12px] text-center mt-4">
                                                Ingin menjadi Mitra Celeparty? <br />
                                                <Link href={"#"} className="text-red-500">
                                                    Registrasi sebagai Mitra
                                                </Link>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </Form>
                    </div>
                </div>
            </div> : router.push("/mitra/home")
    )
};

export default LoginMitra;
