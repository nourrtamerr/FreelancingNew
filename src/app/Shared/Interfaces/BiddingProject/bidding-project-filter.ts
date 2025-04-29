export interface BiddingProjectFilter {
    minprice?: number
    maxPrice?:number
    Currency?: number[]
    Category?: number[]
    SubCategory?: number[]
    Skills?: number[]
    ExperienceLevel?: number[]
    ClientCountry?: number[]
    MinExpectedDuration?: number
    MaxExpectedDuration?: number
    // MinNumOfProposals?: number
    // MaxNumOfProposals?: number
    ProposalRange?: ProposalRangeDTO[]
}

export interface ProposalRangeDTO{
    min:number
    max:number
    isManual?: boolean;

}
