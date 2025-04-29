export interface BiddingprojectCreateUpdate {
  title: string
  description: string
  currency: number
  minimumPrice: number
  maximumprice: number
  biddingStartDate: string
  biddingEndDate: string
  experienceLevel: number
  expectedDuration: number
  projectSkillsIds: number[]
  subcategoryId: number
}

