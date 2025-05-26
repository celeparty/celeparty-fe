import { eGender } from "../enums/eUser";

export interface iUserReq {
  name: string;
  birthdate: string;
  gender: eGender;
  email: string;
  phone: string;
}
