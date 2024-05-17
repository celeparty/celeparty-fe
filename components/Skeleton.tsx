interface iSkeleton {
    height?: string
    width?: string
    spaceTop?: string
    spaceBottom?: any
}

export default function Skeleton(props: iSkeleton) {
    return (
        <div className="animate-pulse w-full">
            <div className={`rounded-lg bg-slate-200 my-5 mx-auto `} style={{
                height: props.height,
                width: props.width,
                marginTop: props.spaceTop,
                marginBottom: props.spaceBottom,
            }}></div>
        </div>
    )
}
