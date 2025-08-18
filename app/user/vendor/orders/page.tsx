"use client";

import Box from "@/components/Box";
import { UserTicketTransactionTable } from "@/components/profile/UserTicketTransactionTable";
import { UserTransactionTable } from "@/components/profile/UserTransactionTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { iTabNav } from "@/lib/interfaces/iCommon";
import React from "react";

export default function OrderPage() {
  const tabNavs: iTabNav[] = [
    {
      label: "Events",
      value: "events",
    },
    {
      label: "Tiket",
      value: "tickets",
    },
  ];
  return (
    <>
      <Box>
        <h4 className="text-black text-[14px] lg:text-[17px] font-extrabold mb-4">
          Data Pesanan
        </h4>
        <Tabs defaultValue={tabNavs[0]?.value || "events"}>
          <TabsList>
            {tabNavs.map((nav, index) => (
              <React.Fragment key={index}>
                <TabsTrigger value={nav.value}>{nav.label}</TabsTrigger>
              </React.Fragment>
            ))}
          </TabsList>
          {tabNavs.map((nav, index) => (
            <TabsContent key={index} value={nav.value}>
              {nav.value === "events" ? (
                <UserTransactionTable isVendor />
              ) : (
                <UserTicketTransactionTable isVendor />
              )}
            </TabsContent>
          ))}
        </Tabs>
      </Box>
    </>
  );
}
