export interface iUpdateProduct {
  title: string;
  rate: number;
  main_price: number;
  minimal_order: number;
  price_min: number;
  price_max: number;
  kabupaten: string;
  description: string;
}

export interface iProductReq {
  title: string;
  minimal_order: number;
  minimal_order_date: string;
  main_price: string | number;
  main_image: iProductImage;
  description: string;
  rate: number;
  kabupaten: string;
  price_min: string | number;
  price_max: string | number;
  category: {
    connect: number;
  } | null;
  users_permissions_user: {
    connect: {
      id: string;
    };
  };
}

export interface iUserPermissions {
  id: string;
}

export interface iProductImage {
  id: string;
  url: string;
  mime: string;
}

export interface iProductRes
  extends Omit<iProductReq, "users_permissions_user" | "main_image"> {
  users_permissions_user: iUserPermissions;
  main_image: iProductImage;
}
