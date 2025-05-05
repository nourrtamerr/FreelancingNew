export interface Milestone {
    title: string;
    startdate: string;
    enddate: string;
    amount: number;
    description: string;
    status: string;
  }
  
  export interface FixedPriceProject {
    id: number;
    title: string;
    description: string;
    price: number;
    currency: string;
    expectedDuration: number;
    subcategoryID: number;
    experienceLevel: string;
    proposalsCount: number;
    projectSkills: string[];
    milestones: Milestone[];
    clientCountry:string;
    clientRating:number
    postedFrom:number
  }
  // get project by id
  export interface FixedPriceProjectById {
    id: number
    title: string
    description: string
    price: number
    currency: string
    expectedDuration: number
    subcategoryID: number
    experienceLevel: string
    proposalsCount: number
    projectSkills: string[]
    milestones: any[]
    endDate:string
    clientId:string
    clientRating:number
    clientTotalNumberOfReviews: number
    clientIsverified:boolean
    clientCountry:string
    clientCity:string
    freelancerId?:string
    clinetAccCreationDate: string
    freelancersubscriptionPlan: string
    freelancerTotalNumber: number
    freelancerRemainingNumberOfBids: number
    clientOtherProjectsIdsNotAssigned: number[]
    clientProjectsTotalCount:number
    projectType: string
    postedFrom:number
  }
  export interface ProjectsResponse {
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    projects: FixedPriceProject[];
  }