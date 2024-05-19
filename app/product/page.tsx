import React from 'react'
import ProductContent from "./ProductContent"
import Basecontent from "@/components/Basecontent"



export default function ProductPage() {
    return (
        <div className="relative wrapper-main py-7">
            <Basecontent>
                <ProductContent />
            </Basecontent>
        </div>
    )
}
