import Box from "@/components/Box"
import React from 'react'
import MainBlog from "./features/MainBlog"
import ListBlog from "./features/ListBlog"

export default function BlogPage() {
    return (
        <div className="relative wrapper py-7">
            <Box title="Artikel Terpopuler">
                <MainBlog />
                <ListBlog />
            </Box>
        </div>
    )
}
