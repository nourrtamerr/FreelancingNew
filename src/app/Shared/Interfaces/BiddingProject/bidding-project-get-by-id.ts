export interface BiddingProjectGetById {
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
  biddingStartDate:string
  biddingEndDate: string
  clientIsverified: boolean
  clientCountry: string
  clientCity: string

  clinetAccCreationDate: string
  freelancersubscriptionPlan: string
  freelancerTotalNumber: number
  freelancerRemainingNumberOfBids: number
  clientOtherProjectsIdsNotAssigned: number[]
  clientProjectsTotalCount:number
  
  numOfBids:number
  clientId:string
  expectedDuration:number
  endDate:string
  freelancerId?:string
  currentBid?:number
}
