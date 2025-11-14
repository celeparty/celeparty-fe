import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Image from "next/image";
import React from "react";

interface iImageSliderProps {
	urls: string[];
}

export const ProductImageSlider: React.FC<iImageSliderProps> = ({ urls }) => {
	return (
		<>
			<Carousel>
				<CarouselContent>
					{urls.map((url, index) => (
						<React.Fragment key={index}>
							<CarouselItem>
								<div
									style={{
										position: "relative",
										height: "300px",
										width: "100%",
									}}
								>
									<Image
										src={url ? process.env.BASE_API + url : "/images/no-image.png"}
										alt=""
										fill
										style={{ objectFit: "cover" }}
									/>
								</div>
							</CarouselItem>
						</React.Fragment>
					))}
				</CarouselContent>
				<CarouselPrevious />
				<CarouselNext />
			</Carousel>
		</>
	);
};
