"use client";
import Box from "@/components/Box";

import { ProductForm } from "@/components/product/product-form";
import Link from "next/link";
import { AiFillCustomerService } from "react-icons/ai";

export default function ProfilePage() {
  return (
    <div>
      <Box className="mt-0">
        <div className="lg:mt-7">
          <ProductForm isEdit={false}></ProductForm>
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
    </div>
  );
}
