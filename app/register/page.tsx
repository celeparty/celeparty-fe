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
  phone: z.string().nonempty({ message: "No Telepon tidak boleh kosong" }),
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
      password: "",
      confirmPassword: "",
    },
  });

  const signUp = (values: z.infer<typeof signUpSchema>) => {
    form.reset();
    alert("Selamat!, Proses Register Kamu Berhasil!!");
    console.log(values);
  };
  return (
    <div>
      <h1 className="mb-4">Registrasi</h1>
      {/* <div className="[&_input]:text-black flex flex-col gap-4 [&_input]:rounded-lg [&_input]:box-border [&_input]:p-2 [&_input]:font-light [&_input]:font-hind [&_input]:text-[14px]">
        <input type="text" placeholder="Nama Lengkap" />
        <input type="text" placeholder="Email" />
        <input type="text" placeholder="No Telpon" />
        <input type="password" placeholder="Kata Sandi" />
        <input type="password" placeholder="Ulangin Kata Sandi" />
      </div> */}
      <div className="">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(signUp)}
            className="flex flex-col gap-4"
          >
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
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Kata Sandi"
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
            <div className="mt-16 flex justify-center">
              <div className="flex flex-col gap-2 justify-center">
                <Button className="w-[172px] h-[42px] text-center text-white rounded-full bg-c-green">
                  Register
                </Button>
                <p className="font-hind font-semibold text-[12px]">
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
    <div className="my-10 w-[973px] h-[745px] bg-c-blue rounded-lg mx-auto text-white">
      <div className="w-[260px] mx-auto py-14">
        <Registration />
      </div>
    </div>
  );
};

export default SignUp;
