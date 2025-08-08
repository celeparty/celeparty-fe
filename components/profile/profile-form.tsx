import { DatePickerInput } from "@/components/form-components/DatePicker";
import { SelectInput } from "@/components/form-components/SelectInput";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { eAlertType } from "@/lib/enums/eAlert";
import { eGender } from "@/lib/enums/eUser";
import { iSelectOption } from "@/lib/interfaces/iCommon";
import { iUserReq } from "@/lib/interfaces/iUser";
import { axiosUser } from "@/lib/services";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, isValid, parse } from "date-fns";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "../ui/button";
import { useImageProfileStore } from "@/hooks/use-image-profile";

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

  bankName: z.string().nonempty({
    message: "Nama Bank Tidak Boleh Kosong",
  }),

  accountName: z.string().nonempty({
    message: "Nama Pemilik Akun Bank Tidak Boleh Kosong",
  }),

  accountNumber: z.string().nonempty({
    message: "Nomor Rekening Tidak Boleh Kosong",
  }),
});

export const ProfileForm = () => {
  const { toast } = useToast();
  const { data: session, status } = useSession();
  const [myData, setMyData] = useState<any>();
  const { setProfileImageUrl } = useImageProfileStore();

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
        accountName: myData.accountName || "",
        bankName: myData.bankName || "",
        accountNumber: myData.accountNumber || "",
      });

      setProfileImageUrl(myData.image.url);
    }
  }, [myData, form]);

  useEffect(() => {
    if (status === "authenticated") {
      axiosUser(
        "GET",
        `/api/users/${session?.user.id}?populate=*`,
        `${session && session?.jwt}`
      ).then((res) => {
        setMyData(res);
      });
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
        accountName: values.accountName || "",
        bankName: values.bankName || "",
        accountNumber: values.accountNumber || "",
      };

      const response = await axiosUser(
        "PUT",
        `/api/users/${myData.id}`,
        `${session && session?.jwt}`,
        reqData
      );

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
                <div className="lg:w-[320px] w-[300px]">
                  <FormControl>
                    <Input
                      className="border border-[#ADADAD] rounded-lg"
                      {...field}
                    />
                  </FormControl>
                </div>
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
                <div className="lg:w-[320px] w-[300px]">
                  <FormControl>
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
                <div className="lg:w-[320px] w-[300px]">
                  <FormControl>
                    <SelectInput
                      options={genderOptions}
                      label="Pilih Jenis Kelamin"
                      onChange={(value) => {
                        if (value) {
                          field.onChange(value);
                        }
                      }}
                      value={field.value ?? ""}
                    ></SelectInput>
                  </FormControl>
                </div>
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
                <div className="lg:w-[320px] w-[300px]">
                  <FormControl>
                    <Input
                      className="border border-[#ADADAD] rounded-lg"
                      {...field}
                    />
                  </FormControl>
                </div>
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
                <div className="lg:w-[320px] w-[300px]">
                  <FormControl>
                    <Input
                      className="border border-[#ADADAD] rounded-lg"
                      {...field}
                    />
                  </FormControl>
                </div>
              </div>
              <div className="ml-[160px]">
                <FormMessage className="text-[9px]" />
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bankName"
          render={({ field }) => (
            <FormItem className="mb-4">
              <div className="flex lg:flex-row flex-col items-start lg:items-center gap-1">
                <FormLabel className="lg:w-[30%] w-[50%] text-black font-semibold font-hind lg:text-[16px] text-[14px]">
                  Nama Bank
                </FormLabel>
                <div className="lg:w-[320px] w-[300px]">
                  <FormControl>
                    <Input
                      className="border border-[#ADADAD] rounded-lg"
                      {...field}
                    />
                  </FormControl>
                </div>
              </div>
              <div className="ml-[160px]">
                <FormMessage className="text-[9px]" />
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="accountName"
          render={({ field }) => (
            <FormItem className="mb-4">
              <div className="flex lg:flex-row flex-col items-start lg:items-center gap-1">
                <FormLabel className="lg:w-[30%] w-[50%] text-black font-semibold font-hind lg:text-[16px] text-[14px]">
                  Nama Pemilik Rekening
                </FormLabel>
                <div className="lg:w-[320px] w-[300px]">
                  <FormControl>
                    <Input
                      className="border border-[#ADADAD] rounded-lg"
                      {...field}
                    />
                  </FormControl>
                </div>
              </div>
              <div className="ml-[160px]">
                <FormMessage className="text-[9px]" />
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="accountNumber"
          render={({ field }) => (
            <FormItem className="mb-4">
              <div className="flex lg:flex-row flex-col items-start lg:items-center gap-1">
                <FormLabel className="lg:w-[30%] w-[50%] text-black font-semibold font-hind lg:text-[16px] text-[14px]">
                  Nomor Rekening
                </FormLabel>
                <div className="lg:w-[320px] w-[300px]">
                  <FormControl>
                    <Input
                      className="border border-[#ADADAD] rounded-lg"
                      {...field}
                    />
                  </FormControl>
                </div>
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
