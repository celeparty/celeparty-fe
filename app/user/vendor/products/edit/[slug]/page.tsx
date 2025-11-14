import Basecontent from "@/components/Basecontent";
import ContentProductEdit from "./ContentProductEdit";

export default async function ProductEdit({ params }: { params: { slug: string } }) {
	return (
		<div className="relative wrapper-big py-7">
			<Basecontent>
				<ContentProductEdit slug={`${params.slug}`} />
			</Basecontent>
		</div>
	);
}
