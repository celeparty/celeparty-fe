import React, { Children } from 'react'

interface iBox {
    children: React.ReactNode
    title?: string
    rounded?: Boolean
}

export default function Box(props: iBox) {
    return (
        <div className={`relative bg-white shadow-lg  py-7 px-9 mt-7 ${!props.rounded ? "rounded-lg" : null}`}>
            {
                props.title ? <h4 className="font-semibold text-[16px] text-c-blue mb-7">{props.title}</h4> : null
            }

            {props.children}
        </div>
    )
}
