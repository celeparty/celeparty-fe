import React, { useState } from "react";
import Box from "../Box";
import { UserTicketTransactionTable } from "./UserTicketTransactionTable";
import { UserTransactionTable } from "./UserTransactionTable";

interface iOrdersBaseContentProps {
  isVendor: boolean;
}
export const OrdersBaseContent: React.FC<iOrdersBaseContentProps> = ({
  isVendor,
}) => {
  const [activeTab, setActiveTab] = useState<string>("events");

  return (
    <>
      <Box>
        <h4 className="text-black text-[14px] lg:text-[17px] font-extrabold mb-4">
          Data Pesanan
        </h4>
        <div className="flex justify-stretch mt-7 rounded-t-lg overflow-hidden">
          <button
            className={`${
              activeTab === "events" ? "bg-c-green text-white" : "bg-slate-300 "
            } flex-1 py-2`}
            onClick={() => setActiveTab("events")}
          >
            Produk
          </button>
          <button
            className={`${
              activeTab === "tickets"
                ? "bg-c-green text-white"
                : "bg-slate-300 "
            } flex-1 py-2`}
            onClick={() => setActiveTab("tickets")}
          >
            Tiket
          </button>
        </div>
        {activeTab === "events" ? (
          <UserTransactionTable isVendor={isVendor} activeTab={activeTab} />
        ) : (
          <UserTicketTransactionTable
            isVendor={isVendor}
            activeTab={activeTab}
          />
        )}
      </Box>
    </>
  );
};
