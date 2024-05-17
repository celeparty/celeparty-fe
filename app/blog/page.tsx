import Box from "@/components/Box"
import React from 'react'
import MainBlog from "./features/MainBlog"

export default function BlogPage() {
    return (
        <div className="relative wrapper py-7">
            <Box title="Artikel Terpopuler">
                <MainBlog />
                <div>Lorem ipsum dolor sit amet consectetur adipisicing elit. Debitis labore libero quae corporis suscipit veniam. Atque illum sit at dolores explicabo magni molestiae vitae vel in. Dicta voluptatibus dolorum enim.</div>
            </Box>
        </div>
    )
}
