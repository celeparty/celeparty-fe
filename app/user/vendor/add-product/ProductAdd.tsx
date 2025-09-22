"use client"
import React from 'react'
import { ProductForm } from "@/components/product/ProductForm";
import {
  iProductImage,
  iProductReq,
  iProductVariant,
} from "@/lib/interfaces/iProduct";
import Box from "@/components/Box";

export default function ProductAdd() {
  const defaultFormData: iProductReq = {
    title: "",
    description: "",
    // main_price: "0",
    minimal_order: 0,
    main_image: [{} as iProductImage],
    // price_min: "0",
    // price_max: "0",
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
    <div>
      <Box className="lg:mt-0 rounded-t-none">
        <ProductForm
          isEdit={false}
          formDefaultData={defaultFormData}
        ></ProductForm>
      </Box>
      
    </div>
  )
}
