export type ProposalsView = ProposalView[]

export interface ProposalView {
  id: number
  coverLetter: string
  price: number
  projectId: number
  freelancerName: string
  freelancerProfilePicture: string
  freelancerskills: string[]
  freelancerLanguages: string[]
  isVerified: boolean
  country: any
  suggestedDuration: number
  suggestedMilestones: SuggestedMilestone[]
  rank: string
}

export interface SuggestedMilestone {
  id: number
  title:string
  description: string
  amount: number
  duration: number
}


export interface CreateProposalDTO {
    coverLetter: string
    projectId: number
    suggestedMilestones: CreateSuggestedMilestoneDTO[]
    type: ProjectType
  }
  
  export interface CreateSuggestedMilestoneDTO {
    title: string
    description: string
    amount: number
    duration: number
  }
  
  export interface UpdateProposalSuggestedMilestoneDTO {
    title: string
    description: string
    amount: number
    duration: number
  }

  export interface UpdateProposalProposalDTO {
    coverLetter: string
    suggestedMilestones: UpdateProposalSuggestedMilestoneDTO[]
    type: ProjectType
  }


  export enum ProjectType {
    Bidding = 'bidding',
    FixedPrice = 'fixedprice'
}