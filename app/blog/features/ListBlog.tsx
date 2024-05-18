"use client"
import React from 'react'
import ItemFeature from "./ItemFeature"

export default function ListBlog() {
    return (
        <div className="relative mt-7">
            <h4 className="font-semibold text-[16px] text-c-blue mb-5">Artikel Terbaru</h4>
            <div className="flex flex-wrap -mx-5">
                <ItemFeature />
                <ItemFeature />
                <ItemFeature />
            </div>
        </div>
    )
}
