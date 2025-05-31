"use client";
import Box from "@/components/Box";

import { ProductForm } from "@/components/product/product-form";
import { iProductReq } from "@/lib/interfaces/iProduct";
import Link from "next/link";
import { AiFillCustomerService } from "react-icons/ai";

export default function ProfilePage() {
  const defaultFormData: iProductReq = {
    title: "",
    description: "",
    main_price: "0",
    minimal_order: 0,
    main_image: {
      id: "",
      url: "",
      mime: "",
    },
    price_min: "0",
    price_max: "0",
    category: {
      connect: 0,
    },
    kabupaten: "",
    rate: 0,
    minimal_order_date: "",
    users_permissions_user: {
      connect: {
        id: "",
      },
    },
  };
  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Tambah Produk</h1>
      <Box className="mt-0">
        <div className="lg:mt-7">
          <ProductForm
            isEdit={false}
            formDefaultData={defaultFormData}
          ></ProductForm>
        </div>
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
