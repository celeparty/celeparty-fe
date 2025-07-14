"use client";
import Box from "@/components/Box";
import { ProductForm } from "@/components/product/ProductForm";
import { useToast } from "@/hooks/use-toast";
import { eAlertType } from "@/lib/enums/eAlert";
import {
  iProductReq,
  iProductRes,
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
  const [defaultFormData, setDefaultFormData] = useState<iProductReq>({
    title: "",
    description: "",
    main_price: "0",
    minimal_order: 0,
    main_image: [
      {
        id: "",
        url: "",
        mime: "",
      },
    ],
    price_min: "0",
    price_max: "0",
    category: null,
    kabupaten: "",
    rate: 0,
    minimal_order_date: "",
    users_permissions_user: {
      connect: {
        id: "",
      },
    },
    variant: [],
    escrow: false,
  });
  const [title, setTitle] = useState<string>("");
  const [rate, setRate] = useState<number>(0);
  const [main_price, setMainPrice] = useState<string>("0");
  const [minimal_order, setMinimalOrder] = useState<number>(0);
  const [price_max, setPriceMax] = useState<string>("0");
  const [price_min, setPriceMin] = useState<string>("0");
  const [kabupaten, setKabupaten] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const router = useRouter();
  const { toast } = useToast();

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
      const formData: iProductReq = {
        title: dataContent.title,
        description: dataContent.description,
        main_price: formatPriceValue(dataContent.main_price),
        minimal_order: dataContent.minimal_order,
        main_image: dataContent.main_image,
        price_min: formatPriceValue(dataContent.price_min),
        price_max: formatPriceValue(dataContent.price_max),
        kabupaten: dataContent.kabupaten,
        category: { connect: dataContent.category?.id },
        rate: dataContent.rate,
        minimal_order_date: dataContent.minimal_order_date,
        users_permissions_user: {
          connect: {
            id: dataContent.users_permissions_user.id,
          },
        },
        documentId: dataContent.documentId,
        variant: dataContent.variant,
        escrow: dataContent.escrow,
      };

      setDefaultFormData(formData);
    }
  }, [dataContent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let formattedMainPrice = parseInt(String(main_price).replace(/\./g, ""));
      let formattedPriceMin = parseInt(String(price_min).replace(/\./g, ""));
      let formattedPriceMax = parseInt(String(price_max).replace(/\./g, ""));

      const updatedData: iUpdateProduct = {
        title,
        rate,
        minimal_order,
        kabupaten,
        description,
        main_price: formattedMainPrice,
        price_min: formattedPriceMin,
        price_max: formattedPriceMax,
      };

      const res = await axiosData("PUT", `/api/products/${props.slug}`, {
        data: updatedData,
      });

      if (res) {
        toast({
          title: "Sukses",
          description: "Update produk berhasil!",
          className: eAlertType.SUCCESS,
        });
        router.push("/user/vendor/products");
      }
    } catch (error) {
      console.error("Update Failed:", error);
      toast({
        title: "Gagal",
        description: "Update produk gagal!",
        className: eAlertType.FAILED,
      });
    }
  };

  const formatPriceValue = (value: string | number) => {
    const rawValue = value;
    const formatted = formatNumberWithDots(rawValue);
    return formatted;
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Edit Produk</h1>
      <Box className="mt-0">
        <ProductForm
          isEdit={true}
          formDefaultData={defaultFormData}
        ></ProductForm>
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
