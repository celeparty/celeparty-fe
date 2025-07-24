"use client";

import Box from "@/components/Box";
import { UserTransactionTable } from "@/components/profile/UserTransactionTable";

export default function OrderPage() {
  return (
    <>
      <Box>
        <h4 className="text-black text-[14px] lg:text-[17px] font-extrabold mb-4">
          Data Pesanan
        </h4>
        <UserTransactionTable isVendor></UserTransactionTable>
      </Box>
    </>
  );
}
