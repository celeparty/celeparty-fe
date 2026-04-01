declare module "react-hook-form" {
  import * as React from "react";

  export type FieldValues = Record<string, any>;

  export type SubmitHandler<TFieldValues extends FieldValues = FieldValues> = (
    data: TFieldValues,
    event?: React.BaseSyntheticEvent
  ) => void | Promise<void>;

  export type FieldPath<T> = string;
  export type Path<T> = string;
  export type PathValue<T, P extends Path<T>> = any;

  export type UseFormRegisterReturn = {
    onChange: React.ChangeEventHandler<any>;
    onBlur: React.FocusEventHandler<any>;
    name: string;
    ref: React.LegacyRef<any>;
  };

  export type UseFormRegister<TFieldValues extends FieldValues = FieldValues> = (
    name: FieldPath<TFieldValues>
  ) => UseFormRegisterReturn;

  export type Control<TFieldValues extends FieldValues = FieldValues> = any;

  export type UseFormProps<TFieldValues extends FieldValues = FieldValues> = {
    defaultValues?: Partial<TFieldValues>;
    resolver?: any;
    mode?: string;
    reValidateMode?: string;
    criteriaMode?: string;
    shouldFocusError?: boolean;
    shouldUnregister?: boolean;
  };

  export type FormState<TFieldValues extends FieldValues = FieldValues> = {
    errors: Record<string, any>;
    isDirty: boolean;
    isValid: boolean;
    isSubmitting: boolean;
    isSubmitted: boolean;
    submitCount: number;
  };

  export type UseFormReturn<TFieldValues extends FieldValues = FieldValues> = {
    register: UseFormRegister<TFieldValues>;
    handleSubmit: (callback: SubmitHandler<TFieldValues>) => (event?: React.BaseSyntheticEvent) => void;
    control: Control<TFieldValues>;
    reset: (values?: Partial<TFieldValues>) => void;
    formState: FormState<TFieldValues>;
  } & Record<string, any>;

  export function useForm<TFieldValues extends FieldValues = FieldValues>(props?: UseFormProps<TFieldValues>): UseFormReturn<TFieldValues>;
  export function useFieldArray<TFieldValues extends FieldValues = FieldValues, TName extends string = string>(props: {
    control: Control<TFieldValues>;
    name: TName;
  }): any;
  export function useWatch(): any;
  export function useFormContext<TFieldValues extends FieldValues = FieldValues>(): UseFormReturn<TFieldValues>;

  export type RegisterOptions = any;
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
}
