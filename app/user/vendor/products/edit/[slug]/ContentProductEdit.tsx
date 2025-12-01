"use client";
import Box from "@/components/Box";
import { ProductForm } from "@/components/product/ProductForm";
import { TicketForm } from "@/components/product/TicketForm";
import { useToast } from "@/hooks/use-toast";
import { eAlertType } from "@/lib/enums/eAlert";
import { eProductType } from "@/lib/enums/eProduct";
import {
  iProductReq,
  iProductRes,
  iTicketFormReq,
  iTicketVariant,
  iUpdateProduct,
} from "@/lib/interfaces/iProduct";
import { axiosData } from "@/lib/services";
import { formatNumberWithDots } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AiFillCustomerService } from "react-icons/ai";

export default function ContentProductEdit(props: any) {
  const [defaultProductFormData, setDefaultProductFormData] =
    useState<iProductReq>({
      title: "",
      description: "",
      main_image: [
        {
          id: "",
          url: "",
          mime: "",
        },
      ],
      category: { connect: [] },
      kabupaten: "",
      users_permissions_user: {
        connect: {
          id: "",
        },
      },
      variant: [],
      escrow: false,
    });

  const [defaultTicketFormData, setDefaultTicketFormData] =
    useState<iTicketFormReq>({} as iTicketFormReq);

  const [title, setTitle] = useState<string>("");
  const [rate, setRate] = useState<number>(0);
  const [kabupaten, setKabupaten] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const router = useRouter();
  const { toast } = useToast();

  const [isTicketType, setIsTicketType] = useState<boolean>(false);

  const getQuery = async () => {
    return await axiosData("GET", `/api/products/${props.slug}?populate=*`);
  };
  const query = useQuery({
    queryKey: ["qProductDetail"],
    queryFn: getQuery,
  });

  const dataContent: iProductRes = query?.data?.data;

  useEffect(() => {
    if (dataContent) {
      const { user_event_type } = dataContent;
      const { name: productTypeName } = user_event_type || {};
      setIsTicketType(productTypeName === eProductType.ticket ? true : false);

      if (productTypeName !== eProductType.ticket) {
        const formData: iProductReq = {
          title: dataContent.title,
          description: dataContent.description,
          main_image: dataContent.main_image,
          kabupaten: dataContent.kabupaten,
          category: { connect: dataContent.category?.id },
          users_permissions_user: {
            connect: {
              id: dataContent.users_permissions_user.id,
            },
          },
          variant: dataContent.variant,
          escrow: dataContent.escrow,
        };

        setDefaultProductFormData(formData);
      } else {
        const ticketFormData: iTicketFormReq = {
          title: dataContent.title,
          description: dataContent.description,
          event_date: dataContent.event_date || "",
          waktu_event: dataContent.waktu_event || "",
          end_date: dataContent.end_date || "",
          end_time: dataContent.end_time || "",
          kota_event: dataContent.kota_event || "",
          lokasi_event: dataContent.lokasi_event || "",
          main_image: dataContent.main_image,
          variant: dataContent.variant as iTicketVariant[],
        };
        setDefaultTicketFormData(ticketFormData);
      }
    }
  }, [dataContent]);



  const formatPriceValue = (value: string | number) => {
    const rawValue = value;
    const formatted = formatNumberWithDots(rawValue);
    return formatted;
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">
        Edit {isTicketType ? "Tiket" : "Produk"}
      </h1>
      <Box className="mt-0">
        {isTicketType ? (
          <>
            <TicketForm
              isEdit={true}
              formDefaultData={defaultTicketFormData}
            ></TicketForm>
          </>
        ) : (
          <>
            <ProductForm
              isEdit={true}
              formDefaultData={defaultProductFormData}
            ></ProductForm>
          </>
        )}
      </Box>
      <Box>
        <div className="flex justify-center items-center">
          <Link href="/" className="flex gap-2 items-center">
            <AiFillCustomerService className="lg:text-3xl text-2xl" />
            <strong className="text-[14px] lg:text-[16px]">
              Bantuan Celeparty Care
            </strong>
          </Link>
        </div>
      </Box>
    </>
  );
}
