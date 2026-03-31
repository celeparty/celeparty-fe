declare module "react-hook-form" {
  import * as React from "react";

  export type FieldValues = Record<string, any>;

  export type SubmitHandler<TFieldValues = FieldValues> = (
    data: TFieldValues,
    event?: React.BaseSyntheticEvent
  ) => void | Promise<void>;

  export type ControllerRenderProps = {
    field: any;
    fieldState?: any;
    formState?: any;
  };

  export type ControllerProps = {
    name: string;
    control?: any;
    rules?: any;
    render: (props: ControllerRenderProps) => React.ReactElement | null;
  };

  export const Controller: React.ComponentType<ControllerProps>;
  export const FormProvider: React.ComponentType<any>;
  export function useForm<TFieldValues = FieldValues>(): any;
  export function useFieldArray<TFieldValues = FieldValues, TName extends string = string>(props: {
    control: any;
    name: TName;
  }): any;
  export function useWatch(): any;
  export type RegisterOptions = any;
  export type UseFormReturn<TFieldValues = FieldValues> = any;
}
