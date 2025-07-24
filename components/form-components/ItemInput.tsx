export function ItemInput({
  label,
  children,
}: {
  label?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-items-start w-full gap-2 mb-3 items-start">
      <div
        className={`${
          label ? "w-[130px] lg:w-[200px]" : "w-0"
        } py-2 text-[14px] lg:text-[16px]`}
      >
        {label}
      </div>
      <div className="flex-1 pt-[6px] lg:pt-[6px] text-[14px] lg:text-[16px]">
        {children}
      </div>
    </div>
  );
}
