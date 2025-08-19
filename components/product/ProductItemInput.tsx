import { ReactNode } from "react";

interface iItemInputProps {
  label: string;
  sublabel?: string;
  children: ReactNode;
  required: boolean;
}

export const ProductItemInput: React.FC<iItemInputProps> = ({
  label,
  sublabel,
  children,
  required,
}) => {
  return (
    <div className="flex flex-col justify-items-start w-full gap-2 mb-5">
      {label ? (
        <div className="w-[full] text-[14px] lg:text-[16px]">
          {label}{" "}
          {required && (
            <>
              <span className="text-c-red">*</span>
            </>
          )}
        </div>
      ) : null}
      {sublabel ? (
        <div className="text-[#DA7E01] text-[13px] lg:text-[10px] ">
          {sublabel}
        </div>
      ) : null}
      {children}
    </div>
  );
};
