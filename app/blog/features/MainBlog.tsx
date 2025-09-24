"use client";
import ErrorNetwork from "@/components/ErrorNetwork";
import Skeleton from "@/components/Skeleton";
import { iBlogPost } from "@/lib/interfaces/iPost";
import { axiosData } from "@/lib/services";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MainBlog() {
  const router = useRouter();

  const getQuery = async () => {
    return await axiosData("GET", "/api/blogs?populate=*");
  };

  const query = useQuery({
    queryKey: ["qEventList"],
    queryFn: getQuery,
  });
  if (query.isLoading) {
    return (
      <div className=" relative flex justify-center ">
        <Skeleton width="100%" height="400px" spaceBottom={"10px"} />
      </div>
    );
  }

  if (query.isError) {
    return <ErrorNetwork />;
  }
  const seeDetail = (slug: string) => {
    router.push(slug);
  };

  const dataContent: iBlogPost[] = query?.data?.data;

  return (
    <div className="flex flex-col lg:flex-row gap-3 mt-2 lg:mt-0">
      <div className="relative flex-1">
        <div className="relative w-full min-h-[194px] lg:h-[400px] overflow-hidden">
          <div
            className="relative fill-current w-full h-[194px] lg:h-[400px] cursor-pointer"
            onClick={() => seeDetail(`/blog/${dataContent[0]?.documentId}`)}
          >
            <Image
              src={
                dataContent[0]?.image?.url
                  ? `${process.env.BASE_API}${dataContent[1]?.image?.url}`
                  : "/images/noimage.png"
              }
              fill
              alt="image"
              style={{ objectFit: "cover" }}
            />
          </div>
          <div className="absolute bottom-0 left-0 p-5 text-white bg-[linear-gradient(0deg,rgba(0,0,0,0.75)_6.82%,rgba(0,0,0,0.00)_90.44%)] w-full text-[14px] lg:text-[20px]">
            <Link href={`/blog/${dataContent[0]?.documentId}`}>
              {dataContent[0]?.title}
            </Link>
          </div>
        </div>
      </div>
      <div className="relative flex-1 flex-row justify-between  gap-3 overflow-hidden">
        <div className="relative w-full  mb-3">
          <div className="relative overflow-hidden">
            <div
              className="relative fill-current w-full aspect-auto min-h-[194px] cursor-pointer"
              onClick={() => seeDetail(`/blog/${dataContent[1]?.documentId}`)}
            >
              <Image
                src={
                  dataContent[1]?.image?.url
                    ? `${process.env.BASE_API}${dataContent[1]?.image?.url}`
                    : "/images/noimage.png"
                }
                fill
                alt="image"
                style={{ objectFit: "cover" }}
              />
            </div>
            <div className="absolute bottom-0 left-0 p-5 text-white bg-[linear-gradient(0deg,rgba(0,0,0,0.75)_6.82%,rgba(0,0,0,0.00)_90.44%)] w-full text-[14px] lg:text-[20px]">
              <Link href={`/blog/${dataContent[1]?.documentId}`}>
                {dataContent[1]?.title}
              </Link>
            </div>
          </div>
        </div>
        <div className="relative w-full  ">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative overflow-hidden w-full">
              <div
                className="relative fill-current w-full h-[194px] cursor-pointer"
                onClick={() => seeDetail(`/blog/${dataContent[2]?.documentId}`)}
              >
                <Image
                  src={
                    dataContent[2]?.image?.url
                      ? `${process.env.BASE_API}${dataContent[2]?.image?.url}`
                      : "/images/noimage.png"
                  }
                  fill
                  alt="image"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div className="absolute bottom-0 left-0 p-5 text-white bg-[linear-gradient(0deg,rgba(0,0,0,0.75)_6.82%,rgba(0,0,0,0.00)_90.44%)] w-full text-[14px] lg:text-[20px]">
                <Link href={`/blog/${dataContent[2]?.documentId}`}>
                  {dataContent[2]?.title}
                </Link>
              </div>
            </div>
            <div className="relative overflow-hidden w-full">
              <div
                className="relative fill-current w-full h-[190px] cursor-pointer"
                onClick={() => seeDetail(`/blog/${dataContent[3]?.documentId}`)}
              >
                <Image
                  src={
                    dataContent[3]?.image?.url
                      ? `${process.env.BASE_API}${dataContent[3]?.image?.url}`
                      : "/images/noimage.png"
                  }
                  fill
                  alt="image"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div className="absolute bottom-0 left-0 p-5 text-white bg-[linear-gradient(0deg,rgba(0,0,0,0.75)_6.82%,rgba(0,0,0,0.00)_90.44%)] w-full text-[14px] lg:text-[20px]">
                <Link href={`/blog/${dataContent[3]?.documentId}`}>
                  {dataContent[3]?.title}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
