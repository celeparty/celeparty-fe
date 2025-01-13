import Basecontent from "@/components/Basecontent";
import Box from "@/components/Box";
import { getData } from "@/lib/services";
import { axiosData } from "@/lib/services";
import parse from "html-react-parser";
import moment from "moment";
import Image from "next/image";
import React from "react";
import Recomended from "../features/Recomended";
import NewArticles from "./NewArticles";

export default async function BlogDetail({
	params,
}: {
	params: { slug: string };
}) {
	const slug = params.slug;
	const dataBlog = await axiosData("GET",`/blogs/${slug}`);
	const dataContent = dataBlog ? dataBlog.data?.data : null;
	return (
		<div className="relative py-7">
			<Box rounded={false}>
				<div className="wrapper">
					<div className="flex lg:flex-row flex-col flex-wrap -mx-5">
						<div className="w-11/12 lg:w-8/12 px-5">
							<h1 className="text-[30px] text-black font-bold">{dataContent?.title}</h1>
							<div className="relative text-sm text-c-gray-text2 my-2">
								{dataContent?.author ? "Author: " + dataContent?.author + " - " : null}
								{moment(dataContent?.publish_at).format("DD MMM YYYY")}
							</div>
						</div>
						<div className="w-4/12 px-5"></div>
						<div className="w-full lg:w-8/12 px-5">
							<div className="relative">
								<div className="relative">
									{dataContent?.thumbnail && (
										<div className="relative fill-current w-full h-[194px] lg:h-[450px] overflow-hidden">
											<Image
												src={dataContent?.thumbnail}
												fill
												alt={dataContent?.title}
												style={{ objectFit: "cover" }}
											/>
										</div>
									)}

									<div className="my-5 text-black lg:text-c-gray-text">
										{parse(`${dataContent?.content}`)}
									</div>
								</div>
							</div>
						</div>
						<div className="w-full lg:w-4/12 px-5">
							<div className="relative">
								<h4 className="font-semibold text-[16px] text-black">Artikel Terbaru</h4>
								<Basecontent>
									<div className="my-2">
										<NewArticles />
									</div>
								</Basecontent>
							</div>
						</div>
					</div>
					<div className="relative">
						<Recomended slug={`${dataContent?.slug}`} />
					</div>
				</div>
			</Box>
		</div>
	);
}
