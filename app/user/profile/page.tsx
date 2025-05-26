"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { axiosData, axiosUser } from "@/lib/services";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";

import { DatePickerInput } from "@/components/form-components/DatePicker";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { eAlertType } from "@/lib/enums/eAlert";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, isValid, parse } from "date-fns";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { iUserReq } from "@/lib/interfaces/iUser";
import { eGender } from "@/lib/enums/eUser";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SelectInput } from "@/components/form-components/SelectInput";
import { iSelectOption } from "@/lib/interfaces/iCommon";

const formSchema = z.object({
  name: z.string().nonempty({
    message: "Nama Tidak Boleh Kosong",
  }),

  birthdate: z
    .string()
    .nonempty({ message: "Tanggal Tidak Boleh Kosong" })
    .regex(/^\d{2}-\d{2}-\d{4}$/, {
      message: "Tanggal harus dalam format Hari-Bulan-Tahun dalam angka!",
    }),

  gender: z.string().nonempty({ message: "Jenis kelamin Tidak Boleh Kosong" }),

  email: z
    .string()
    .nonempty({ message: "Email Tidak Boleh Kosong" })
    .email({ message: "Email Tidak Valid" }),

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
      <h1 className="font-hind font-semibold text-[16px] text-black mb-6">
        Status Pembelian
      </h1>
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
            <td className="lg:px-6 px-4 py-4 border-b border-gray-200">
              2023/01/24/1
            </td>
            <td className="lg:px-6 px-4 py-4 border-b border-gray-200">
              Matcha Drip Cake
            </td>
            <td className="lg:px-6 px-4 py-4 border-b border-gray-200">
              Pending
            </td>
            <td className="lg:px-6 px-4 py-4 border-b border-gray-200">
              Rp. 220.000
            </td>
            <td className="lg:px-6 px-4 py-4 border-b border-gray-200">
              ABC Cakes
            </td>
          </tr>
          <tr>
            <td className="lg:px-6 px-4 py-4 border-b border-gray-200">
              2023/01/24/2
            </td>
            <td className="lg:px-6 px-4 py-4 border-b border-gray-200">
              Matcha Drip Cake
            </td>
            <td className="lg:px-6 px-4 py-4 border-b border-gray-200">
              Processing
            </td>
            <td className="lg:px-6 px-4 py-4 border-b border-gray-200">
              Rp. 220.000
            </td>
            <td className="lg:px-6 px-4 py-4 border-b border-gray-200">
              ABC Cakes
            </td>
          </tr>
          <tr>
            <td className="lg:px-6 px-4 py-4 border-b border-gray-200">
              2023/01/24/3
            </td>
            <td className="lg:px-6 px-4 py-4 border-b border-gray-200">
              Matcha Drip Cake
            </td>
            <td className="lg:px-6 px-4 py-4 border-b border-gray-200">
              Shipping
            </td>
            <td className="lg:px-6 px-4 py-4 border-b border-gray-200">
              Rp. 220.000
            </td>
            <td className="lg:px-6 px-4 py-4 border-b border-gray-200">
              ABC Cakes
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const NotificationItem: React.FC<NotificationItem> = ({
  title,
  description,
}) => {
  return (
    <div className="">
      <h3 className="font-hind font-semibold text-[15px] lg:text-[12px] text-black leading-[20px]">
        {title}
      </h3>
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
  const { toast } = useToast();
  const { data: session, status } = useSession();
  const [myData, setMyData] = useState<any>();

  const genderOptions: iSelectOption[] = [
    {
      label: "Laki-laki",
      value: eGender.male,
    },
    {
      label: "Perempuan",
      value: eGender.female,
    },
  ];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {} as iUserReq,
  });

  useEffect(() => {
    if (myData) {
      form.reset({
        name: myData.name || "",
        birthdate: myData.birthdate || "",
        gender: eGender.male,
        email: myData.email || "",
        phone: myData.phone || "",
      });
    }
  }, [myData, form]);

  useEffect(() => {
    if (status === "authenticated") {
      axiosUser("GET", "/api/users/me", `${session && session?.jwt}`).then(
        (res) => {
          setMyData(res);
        }
      );
    }
  }, [status]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const reqData: iUserReq = {
        name: values.name,
        birthdate: values.birthdate,
        gender: values.gender as eGender,
        phone: values.phone,
        email: values.email,
      };

      const response = await axiosUser(
        "PUT",
        "/api/users/me",
        `${session && session?.jwt}`,
        reqData
      );

      console.log(response);

      if (response) {
        toast({
          title: "Sukses",
          description: "Update profile berhasil!",
          className: eAlertType.SUCCESS,
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Gagal",
        description: "Update profile gagal!",
        className: eAlertType.FAILED,
      });
    }
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="-mt-10 lg:mt-0">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="mb-4">
              <div className="flex lg:flex-row flex-col lg:items-center items-start gap-1">
                <FormLabel className="lg:w-[30%] w-[50%] text-black font-semibold font-hind lg:text-[16px] text-[14px] text-start">
                  Nama
                </FormLabel>
                <FormControl className="lg:w-[320px] w-[300px]">
                  <Input
                    className="border border-[#ADADAD] rounded-lg"
                    {...field}
                  />
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
          name="birthdate"
          render={({ field }) => (
            <FormItem className="mb-4">
              <div className="flex lg:flex-row flex-col items-start lg:items-center gap-1">
                <FormLabel className="lg:w-[30%] w-[50%] text-black font-semibold font-hind lg:text-[16px] text-[14px]">
                  Tanggal Lahir
                </FormLabel>
                <FormControl className="lg:w-[320px] w-[300px]">
                  <DatePickerInput
                    onChange={(date) => {
                      if (date instanceof Date && isValid(date)) {
                        const formatted = format(date, "dd-MM-yyyy");
                        field.onChange(formatted);
                      }
                    }}
                    textLabel="Select Date Of Birth"
                    value={
                      field.value
                        ? parse(field.value, "dd-MM-yyyy", new Date())
                        : null
                    }
                  />
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
                  <SelectInput
                    options={genderOptions}
                    label="Pilih Jenis Kelamin"
                    onChange={(value) => {
                      if (value) {
                        console.log(value);
                        field.onChange(value);
                      }
                    }}
                    value={field.value}
                  ></SelectInput>
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
                  <Input
                    className="border border-[#ADADAD] rounded-lg"
                    {...field}
                  />
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
                  <Input
                    className="border border-[#ADADAD] rounded-lg"
                    {...field}
                  />
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
              Besar file: maksimum 10.000.000 bytes (10 Megabytes). <br />{" "}
              Ekstensi file yang diperbolehkan: .JPG .JPEG .PNG
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
