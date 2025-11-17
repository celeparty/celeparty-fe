interface iSkeleton {
	height?: string;
	width?: string;
	spaceTop?: string;
	spaceBottom?: any;
	ariaLabel?: string;
}

export default function Skeleton(props: iSkeleton) {
	return (
		<div className="animate-pulse w-full" role="status" aria-label={props.ariaLabel || "Memuat konten"}>
			<div
				className={`rounded-lg bg-slate-200 my-5 mx-auto `}
				style={{
					height: props.height,
					width: props.width,
					marginTop: props.spaceTop,
					marginBottom: props.spaceBottom,
				}}
				aria-hidden="true"
			></div>
			<span className="sr-only">{props.ariaLabel || "Memuat konten"}</span>
		</div>
	);
}
