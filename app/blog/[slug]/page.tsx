import Basecontent from "@/components/Basecontent";
import Box from "@/components/Box";
import { axiosData } from "@/lib/services";
import parse from "html-react-parser";
import moment from "moment";
import Image from "next/image";
import NewArticles from "./NewArticles";
import ItemProduct from "@/components/product/ItemProduct";
import { formatRupiah } from "@/lib/utils";

export default async function BlogDetail({
  params,
}: {
  params: { slug: string };
}) {
  const slug = params.slug;
  const dataBlog = await axiosData(
    "GET",
    `/api/blogs/${slug}?populate[image]=true&populate[category]=true&populate[products][populate][0]=main_image`
  );

  const dataContent = dataBlog?.data ?? null;

  // Ambil url gambar dengan aman
  const imageUrl =
    dataContent?.image?.data?.attributes?.formats?.large?.url
      ? `${process.env.NEXT_PUBLIC_BASE_API}${dataContent.image.data.attributes.formats.large.url}`
      : "/images/noimage.png";

  return (
    <Basecontent>
      <div className="relative py-7">
        <Box rounded={false}>
          <div className="wrapper">
            <div className="flex lg:flex-row flex-col flex-wrap -mx-5">
              <div className="w-11/12 lg:w-8/12 px-5">
                <h1 className="lg:text-[30px] text-[25px] text-black font-bold">
                  {dataContent?.title ?? "Untitled"}
                </h1>
                <div className="relative text-sm text-c-gray-text2 lg:my-2 mb-2">
                  {dataContent?.author ? `Author: ${dataContent.author} - ` : null}
                  {dataContent?.publish_at
                    ? moment(dataContent.publish_at).format("DD MMM YYYY")
                    : ""}
                </div>
              </div>

              <div className="w-4/12 px-5"></div>

              <div className="w-full lg:w-9/12 px-5">
                <div className="relative">
                  {/* Gambar */}
                  <div className="relative fill-current w-full h-[194px] lg:h-[450px] overflow-hidden">
                    <Image
                      src={imageUrl}
                      fill
                      alt={dataContent?.title ?? "No title"}
                      style={{ objectFit: "cover" }}
                    />
                  </div>

                  {/* Konten */}
                  <div className="my-5 text-black lg:text-c-gray-text">
                    {dataContent?.content ? parse(dataContent.content) : null}
                  </div>
                </div>

                {/* Produk terkait */}
                {Array.isArray(dataContent?.products) &&
                  dataContent.products.length > 0 && (
                    <div className="products-wrapper mt-4">
                      <h4 className="font-semibold text-[16px] text-black">
                        Produk Terkait
                      </h4>
                      <div className="flex flex-wrap -mx-2">
                        {dataContent.products.map((item: any) => {
                          const productImg = item.main_image?.[0]?.url
                            ? `${process.env.NEXT_PUBLIC_BASE_API}${item.main_image[0].url}`
                            : "/images/noimage.png";

                          return (
                            <ItemProduct
                              url={`/products/${item.documentId}`}
                              key={item.id}
                              title={item.title}
                              image_url={productImg}
                              price={
                                item.main_price
                                  ? formatRupiah(item.main_price)
                                  : formatRupiah(0)
                              }
                              rate={item.rate ? `${item.rate}` : "1"}
                              sold={item.sold_count ?? 0}
                              location={item.region ?? ""}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}
              </div>

              <div className="w-full lg:w-3/12 px-5">
                <h4 className="font-semibold text-[16px] text-black">
                  Artikel Terbaru
                </h4>
                <div className="my-2">
                  <NewArticles />
                </div>
              </div>
            </div>
          </div>
        </Box>
      </div>
    </Basecontent>
  );
}
