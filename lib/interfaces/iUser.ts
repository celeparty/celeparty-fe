import { eGender } from "../enums/eUser";

export interface iUserReq {
  name: string;
  birthdate: string;
  gender: eGender;
  email: string;
  phone: string;
  accountName: string;
  bankName: string;
  accountNumber: string;
}

export interface iUserRole {
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

export interface iUserProfile {
  id: number;
  documentId: string;
  username: string;
  email: string;
  provider: string;
  password: string;
  resetPasswordToken?: string | null;
  confirmationToken?: string | null;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale?: string | null;
  phone: string;
  address: string;
  name: string;
  birthplace?: string | null;
  birthdate?: string | null;
  nik?: string | null;
  companyName?: string | null;
  serviceLocation?: string | null;
  bankName?: string | null;
  accountNumber?: string | null;
  accountName?: string | null;
  role: iUserRole;
}
