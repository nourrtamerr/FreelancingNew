export interface BiddingProjectGetAll {
  id: number
  title: string
  description: string
  projectType: string
  bidAveragePrice: number
  minimumPrice: number
  maximumprice: number
  currency: string
  experienceLevel: string
  projectSkills: string[]
  postedFrom: number
  clientTotalNumberOfReviews: number
  clientRating: number
  clientCountry:string
  numOfBids:number
  clientIsVerified:boolean
  expectedDuration:number
}

export interface BiddingProjectsResponse {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  projects: BiddingProjectGetAll[];
}