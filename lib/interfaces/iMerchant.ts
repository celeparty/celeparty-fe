export interface iServiceLocation {
  region: string;
  subregion: string;
  id: string;
  idSubRegion: string;
}

export interface iRole {
  id: number;
  documentId: string;
  name: string;
  description: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string | null;
}

export interface iMerchantProfile {
  id: number;
  documentId: string;
  username: string;
  email: string;
  provider: string;
  password: string;
  resetPasswordToken: string;
  confirmationToken: string | null;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string | null;
  phone: string;
  address: string;
  name: string;
  birthplace: string;
  birthdate: string; // ISO format (e.g. "2023-01-10")
  nik: string;
  companyName: string;
  serviceLocation: iServiceLocation[];
  bankName: string;
  accountNumber: string;
  accountName: string;
  role: iRole;
  saldo_active: string;
  saldo_refund: string;
}

export interface iSubregionRes {
  id: string;
  id_provinsi: string;
  name: string;
}
