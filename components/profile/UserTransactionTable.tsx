import { useSession } from "next-auth/react";
import Box from "../Box";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { getDataToken } from "@/lib/services";
import { useQuery } from "@tanstack/react-query";
import Skeleton from "../Skeleton";
import ErrorNetwork from "../ErrorNetwork";

export const UserTransactionTable = () => {
  const session = useSession();
  const dataSession = session?.data as any;

  const getQuery = async () => {
    if (!dataSession?.user?.accessToken) {
      throw new Error("Access token is undefined");
    }
    return await getDataToken(
      `/transactions?filters[documentId][$eq]=${dataSession?.user?.documentId}`,
      `${dataSession?.user?.accessToken}`
    );
  };

  const query = useQuery({
    queryKey: ["qUserOrder"],
    queryFn: getQuery,
    enabled: !!dataSession?.user?.accessToken,
  });

  if (query.isLoading) {
    return <Skeleton width="100%" height="150px" />;
  }
  if (query.isError) {
    return <ErrorNetwork style="mt-0" />;
  }
  const dataContent = query?.data?.data;
  console.log(dataContent);

  return (
    <>
      <Box>
        <Table>
          <TableHeader className="bg-white">
            <TableRow>
              <TableHead className="w-[150px] text-xs sm:text-sm">
                ORDER DATE
              </TableHead>
              <TableHead className="text-xs sm:text-sm">ITEM</TableHead>
              <TableHead className="text-xs sm:text-sm">
                STATUS PEMBELIAN
              </TableHead>
              <TableHead className="text-xs sm:text-sm">TOTAL</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dataContent?.map((item: any, i: number) => {
              return (
                <TableRow
                  className={`${i % 2 === 0 ? "bg-slate-200" : "bg-white"}`}
                  key={item.id}
                >
                  <TableCell className="font-medium text-xs sm:text-sm">
                    Tanggal Belom ada di api
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm">
                    {item.name}
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm">
                    {item.status}
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm">
                    {item.price}
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm">
                    {item.price}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
    </>
  );
};
