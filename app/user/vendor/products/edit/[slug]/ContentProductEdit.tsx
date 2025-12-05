"use client";
import Box from "@/components/Box";
import { ProductForm } from "@/components/product/ProductForm";
import { TicketForm } from "@/components/product/TicketForm";
import { useToast } from "@/hooks/use-toast";
import { eAlertType } from "@/lib/enums/eAlert";
import { eProductType } from "@/lib/enums/eProduct";
import {
  iProductReq,
  iProductRes,
  iTicketFormReq,
  iTicketVariant,
  iUpdateProduct,
} from "@/lib/interfaces/iProduct";
import { axiosData } from "@/lib/services";
import { formatNumberWithDots } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AiFillCustomerService } from "react-icons/ai";

export default function ContentProductEdit(props: any) {
  const searchParams = useSearchParams();
  const productType = searchParams.get('type') || 'product'; // Get type from URL query param
  
  const [defaultProductFormData, setDefaultProductFormData] =
    useState<iProductReq>({
      title: "",
      description: "",
      main_image: [
        {
          id: "",
          url: "",
          mime: "",
        },
      ],
      category: { connect: [] },
      kabupaten: "",
      users_permissions_user: {
        connect: {
          id: "",
        },
      },
      variant: [],
      escrow: false,
    });

  const [defaultTicketFormData, setDefaultTicketFormData] =
    useState<iTicketFormReq>({} as iTicketFormReq);

  const [title, setTitle] = useState<string>("");
  const [rate, setRate] = useState<number>(0);
  const [kabupaten, setKabupaten] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const router = useRouter();
  const { toast } = useToast();

  const [isTicketType, setIsTicketType] = useState<boolean>(productType === 'ticket');
  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);

  const getQuery = async () => {
    let endpoint = productType === 'ticket' ? `/api/tickets/${props.slug}?populate=*` : `/api/products/${props.slug}?populate=*`;
    console.log('Fetching from endpoint:', endpoint);
    
    try {
      const result = await axiosData("GET", endpoint);
      console.log('Query result:', result);
      return result;
    } catch (error: any) {
      // If fetch from products failed and we haven't tried tickets, try tickets as fallback
      if (productType === 'product') {
        console.log('Product fetch failed, trying ticket endpoint as fallback...');
        try {
          const ticketEndpoint = `/api/tickets/${props.slug}?populate=*`;
          const ticketResult = await axiosData("GET", ticketEndpoint);
          console.log('Ticket fallback result:', ticketResult);
          return ticketResult;
        } catch (ticketError) {
          console.error('Both product and ticket fetch failed:', ticketError);
          throw ticketError;
        }
      }
      throw error;
    }
  };
  const query = useQuery({
    queryKey: ["qProductDetail", props.slug, productType],
    queryFn: getQuery,
    enabled: !!props.slug,
  });

  const dataContent: iProductRes = query?.data?.data;

  useEffect(() => {
    console.log('useEffect triggered - isLoading:', query.isLoading, 'dataContent:', dataContent);
    
    if (query.isLoading) {
      return; // Wait for data to load
    }
    
    if (dataContent) {
      console.log('Processing dataContent:', dataContent);
      
      // Auto-detect product type from data structure if not specified
      let actualProductType = productType;
      if (productType === 'product' && dataContent.event_date) {
        // Has event_date = likely ticket
        actualProductType = 'ticket';
      } else if (productType === 'product' && dataContent.kota_event) {
        // Has kota_event = likely ticket
        actualProductType = 'ticket';
      }
      
      if (actualProductType === 'ticket') {
        // Handle ticket type
        const ticketFormData: iTicketFormReq = {
          title: dataContent.title || "",
          description: dataContent.description || "",
          event_date: dataContent.event_date || "",
          waktu_event: dataContent.waktu_event || "",
          end_date: dataContent.end_date || "",
          end_time: dataContent.end_time || "",
          kota_event: dataContent.kota_event || "",
          lokasi_event: dataContent.lokasi_event || "",
          main_image: dataContent.main_image || [],
          variant: (dataContent.variant as iTicketVariant[]) || [],
          terms_conditions: (dataContent as any).terms_conditions || "",
        };
        console.log('Setting ticket form data:', ticketFormData);
        setDefaultTicketFormData(ticketFormData);
        setIsTicketType(true);
        setIsDataLoaded(true);
      } else {
        // Handle product type
        const { user_event_type } = dataContent;
        
        const formData: iProductReq = {
          title: dataContent.title || "",
          description: dataContent.description || "",
          main_image: dataContent.main_image || [],
          kabupaten: dataContent.kabupaten || "",
          category: { connect: dataContent.category?.id || "" },
          users_permissions_user: {
            connect: {
              id: dataContent.users_permissions_user?.id || "",
            },
          },
          variant: dataContent.variant || [],
          escrow: dataContent.escrow || false,
        };

        console.log('Setting product form data:', formData);
        setDefaultProductFormData(formData);
        setIsTicketType(false);
        setIsDataLoaded(true);
      }
    }
  }, [dataContent, productType, query.isLoading]);



  const formatPriceValue = (value: string | number) => {
    const rawValue = value;
    const formatted = formatNumberWithDots(rawValue);
    return formatted;
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">
        Edit {isTicketType ? "Tiket" : "Produk"}
      </h1>
      <Box className="mt-0">
        {query.isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading data...</p>
          </div>
        ) : query.isError ? (
          <div className="text-center py-8">
            <p className="text-red-500">Error loading data. Please try again.</p>
          </div>
        ) : isDataLoaded ? (
          isTicketType ? (
            <>
              <TicketForm
                isEdit={true}
                formDefaultData={defaultTicketFormData}
                slug={props.slug}
              ></TicketForm>
            </>
          ) : (
            <>
              <ProductForm
                isEdit={true}
                formDefaultData={defaultProductFormData}
              ></ProductForm>
            </>
          )
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No data available</p>
          </div>
        )}
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
