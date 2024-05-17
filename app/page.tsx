import Image from 'next/image'
import Link from "next/link"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import MainBanner from "@/components/MainBanner"
import Basecontent from "@/components/Basecontent"
import EventList from "@/components/EventList"
import ProductList from "@/components/product/ProductList"

export default function Home() {
    return (
        <div className="relative wrapper py-7">
            <Basecontent>
                <MainBanner />
                <EventList />
                <ProductList />
            </Basecontent>
        </div>
    )
}
