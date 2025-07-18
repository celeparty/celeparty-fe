"use client"
import React from 'react';
import Box from "@/components/Box";
import TicketForm from "./TicketForm";

export default function TicketAdd() {
  return (
    <div>
      <Box className="lg:mt-0 rounded-t-none w-full">
        <TicketForm />
      </Box>
    </div>
  );
}
