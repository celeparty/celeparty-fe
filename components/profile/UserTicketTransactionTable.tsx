import { iOrderItem } from "@/lib/interfaces/iOrder";
import { getStatusConfig } from "@/lib/orderStatusUtils";
import { axiosUser } from "@/lib/services";
import { formatDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useSession } from "next-auth/react";
import React, { useState } from "react";
import ErrorNetwork from "../ErrorNetwork";
import Skeleton from "../Skeleton";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

interface iTableDataProps {
  isVendor: boolean;
}

export const UserTicketTransactionTable: React.FC<iTableDataProps> = ({
  isVendor,
}) => {
  const { data: session, status } = useSession();

  const documentId = session?.user?.documentId;

  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  const getQuery = async () => {
    const response = await axiosUser(
      "GET",
      `/api/transaction-tickets?filters[${
        isVendor ? "vendor_id" : "documentId"
      }][$eq]=${documentId}`,
      `${session && session?.jwt}`
    );

    return response;
  };

  const query = useQuery({
    queryKey: ["qUserOrder"],
    queryFn: getQuery,
    staleTime: 5000,
    enabled: !!session?.jwt,
    retry: 3,
  });

  if (query.isLoading) {
    return <Skeleton width="100%" height="150px" />;
  }
  if (query.isError) {
    return <ErrorNetwork style="mt-0" />;
  }
  const dataContent: iOrderItem[] = query?.data?.data;

  const toggleRow = (id: number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleStatusAction = async (
    orderId: number,
    action: "process" | "cancel" | "complete"
  ) => {
    // Implement your API call here
    console.log(`Changing order ${orderId} to ${action}`);
    // await updateOrderStatus(orderId, action);
    // refetchOrders();
  };

  return (
    <>
      <Table>
        <TableHeader className="bg-white">
          <TableRow>
            <TableHead className="w-[150px]">Order Date</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dataContent?.length > 0 ? (
            <>
              {dataContent?.map((item, i) => {
                const statusConfig = getStatusConfig(item.payment_status);
                return (
                  <React.Fragment key={item.id}>
                    <TableRow
                      className={i % 2 === 0 ? "bg-slate-100" : "bg-white"}
                    >
                      <TableCell className="font-medium">
                        {formatDate(item.createdAt)}
                      </TableCell>
                      <TableCell>
                        <ul className="list-disc pl-5 space-y-1">
                          {item.products.map((prod) => (
                            <li key={prod.id}>{prod.title}</li>
                          ))}
                        </ul>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}
                        >
                          {statusConfig.text}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {isVendor && (
                            <>
                              {statusConfig.actions.map(
                                ({ label, action, variant }) => (
                                  <Button
                                    key={action}
                                    size="sm"
                                    variant={
                                      variant as "default" | "destructive"
                                    }
                                    onClick={() =>
                                      handleStatusAction(
                                        item.id,
                                        action as
                                          | "process"
                                          | "cancel"
                                          | "complete"
                                      )
                                    }
                                  >
                                    {label}
                                  </Button>
                                )
                              )}
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="link"
                            onClick={() => toggleRow(item.id)}
                          >
                            {expandedRows[item.id] ? (
                              <>
                                Sembunyikan <ChevronUp className="h-4 w-4" />
                              </>
                            ) : (
                              <>
                                Lihat Detail
                                <ChevronDown className="h-4 w-4" />
                              </>
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    {expandedRows[item.id] && (
                      <TableRow className="bg-gray-50">
                        <TableCell colSpan={4}>
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4">
                            <div className="md:col-span-6">
                              <h4 className="font-semibold mb-2">
                                Detail Tiket
                              </h4>
                              <p>
                                <span className="font-medium">Nama:</span>{" "}
                                {item.customer_name}
                              </p>
                              <p>
                                <span className="font-medium">Telepon:</span>{" "}
                                {item.telp}
                              </p>
                              <p>
                                <span className="font-medium">Email:</span>{" "}
                                {item.email}
                              </p>
                            </div>
                            <div className="md:col-span-6">
                              <h4 className="font-semibold mb-2">Info Acara</h4>
                              <p>
                                <span className="font-medium">Alamat:</span>{" "}
                                {item.shipping_location}
                              </p>
                              <p>
                                <span className="font-medium">
                                  Tanggal Acara:
                                </span>{" "}
                                {item.event_date}
                              </p>
                            </div>
                            <div className="md:col-span-2">
                              <p>
                                <span className="font-semibold">Catatan:</span>{" "}
                                {item.note || "-"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </>
          ) : (
            <>
              <TableRow className="bg-gray-50">
                <TableCell colSpan={4}>
                  <div className="text-center">Anda belum memiliki pesanan</div>
                </TableCell>
              </TableRow>
            </>
          )}
        </TableBody>
      </Table>
    </>
  );
};
