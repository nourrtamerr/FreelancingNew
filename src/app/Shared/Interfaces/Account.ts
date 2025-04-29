/* Freelancers */
export type Freelancers = FreelancerView[]
export type FreelancersFilterationResult = FreelancerView[]

export interface FreelancerView {
    id: string
    accountCreationDate: string
    firstname: string
    lastname: string
    userName: string
    country: string
    city: string
    email: string
    profilePicture?: string
    isVerified: boolean
    isAvailable: boolean
    userSkills: string[]
    role: string
  }
  
  export interface SingularFreelancer extends FreelancerView {
    languages: string[]
  }
  

  export interface FreelancersFilter {
    isAvailable?: boolean;
    languages?: LanguageEnum[];  // updated to use enum
    ranks?: RankEnum[];          // updated to use enum
    name?: string;
    accountCreationDate?: string; // string in ISO format (e.g., '2025-04-19')
    countryIDs?: number[];
    isVerified?: boolean;
    paymentVerified?: boolean;
    pageSize?: number;
    pageNum?: number;
    numOfPages?: number;
  }

  export enum LanguageEnum {
    English = 'English',
    Spanish = 'Spanish',
    French = 'French',
    German = 'German',
    Italian = 'Italian',
    Russian = 'Russian',
    Chinese = 'Chinese',
    Japanese = 'Japanese',
    Korean = 'Korean',
    Hindi = 'Hindi'
  }

  export enum RankEnum {
    Veteran = 'Veteran',
    RisingStar = 'RisingStar',
    Established = 'Established',
    Pro = 'Pro',
    Elite = 'Elite'
  }

  export interface FilteredFreelancers {
    result: FreelancersFilterationResult
    response: Response
  }
  export interface Response {
    nextPageLink: string
    previousPageLink: string
    numofpages: number
  }


  /* Clients */
  export type ClientsView = ClientView[]
  export type ClientsFilterationResult = ClientView[]

export interface ClientView {
  id: string
  accountCreationDate: string
  firstname: string
  lastname: string
  userName: string
  country: string
  city: string
  email: string
  profilePicture?: string
  isVerified: boolean
  paymentVerified: boolean
}

export interface ClientsFilter {
  ranks?: RankEnum[];          
  name?: string;
  accountCreationDate?: string; // string in ISO format (e.g., '2025-04-19')
  countryIDs?: number[];
  isVerified?: boolean;
  paymentVerified?: boolean;
  pageSize?: number;
  pageNum?: number;
  numOfPages?: number;
}

export interface FilteredClients {
  result: ClientsFilterationResult[]
  response: Response
}



/*users */
export type AppUsers = AppUser[]

export interface AppUser {
  id: string
  userName: string
  firstname:string
  lastname:string
  title:string
  email: string
  phoneNumber?: string
  profilePicture?: string
  city: string
  country: string
  nationalId?:string
  dateOfBirth: string
  description: string
  role: string
  isVerified: boolean
  accountCreationDate: string
  emailConfirmed: boolean
  balance?: number
  isAvailable?: boolean
  paymentVerified?: boolean
}


export type UsersRequestingVerificaiton = UserRequestingVerificaiton[]

export interface UserRequestingVerificaiton {
  id:string
  firstname: string
  lastname: string
  dateOfBirth: string
  city: any
  country: any
  profilePicture?: string
  nationalId: string
}



export interface IdentityVerificationRequest {
  fullName: string;
  nationalId: string;
  idPicture: File; 
}

export interface VerificationDecision {
  isAccepted: boolean;
  userId: string;
  reason: string | null;
}

export interface EditProfileDTO {
  firstname: string;
  lastname: string;
  title:string;
  CityId: number;
  UserName: string;
  Description: string | null;
  DateOfBirth: Date; // Use string for date format 'YYYY-MM-DD'
  PhoneNumber: string;
  Password: string;
  ConfirmPassword: string | null;
  ProfilePicture: File | null; // Use the built-in File type instead of FormFile
}

export interface CreateAdminDTO {
  firstname: string;
  lastname: string;
  cityId: number;
  userName: string;
  dateOfBirth: string; // Use string format 'YYYY-MM-DD'
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string | null;
  profilePicture: File | null; // Use standard File type instead of FormFile
}

export enum UserRole {
  Freelancer = 'Freelancer',
  Client = 'Client',
  Admin = 'Admin',
}

export interface RegisterDTO {
  firstname: string;
  lastname: string;
  cityId: number;
  userName: string;
  dateOfBirth: string;  // Will be in 'YYYY-MM-DD' format
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string | null;
  profilePicture: File | null;
  role: UserRole;
}

export interface LoginDTO {
  usernameoremail: string
  loginPassword: string
}
export interface Tokens{
  token: string
  refreshToken: string
}

export interface RefreshTokenDTO {
  userName: string
  refreshToken: string
}

export interface ForgotPasswordDTO {
  email: string;
  successurl: string;
  errorUrl?: string;
}

export interface ResetPasswordDTO {
  newPassword: string;
  confirmNewPassword: string;
  token: string;
  email: string;
}
