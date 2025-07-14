"use client";
import Box from "@/components/Box";

import { ProductForm } from "@/components/product/ProductForm";
import {
  iProductImage,
  iProductReq,
  iProductVariant,
} from "@/lib/interfaces/iProduct";
import Link from "next/link";
import { AiFillCustomerService } from "react-icons/ai";

export default function AddProductPage() {
  const defaultFormData: iProductReq = {
    title: "",
    description: "",
    main_price: "0",
    minimal_order: 0,
    main_image: [{} as iProductImage],
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
    variant: [{} as iProductVariant],
    escrow: false,
  };
  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Tambah Produk</h1>
      <Box className="mt-0">
        <ProductForm
          isEdit={false}
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
