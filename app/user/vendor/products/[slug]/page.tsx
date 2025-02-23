import Basecontent from "@/components/Basecontent";
import ContentProductEdit from "./ContentProductEdit"

export default async function ProductEdit({params}: {params: {slug: string}}) {
    return (
        <div>
            <Basecontent>
                <ContentProductEdit slug={`${params.slug}`}/>
            </Basecontent>
        </div>
    )
}