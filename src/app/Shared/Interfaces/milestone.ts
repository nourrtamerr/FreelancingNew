export interface Milestone {
files?: string[];
  id?: number //null in case of CreateMilestone
  title: string
  description: string
  amount: number
  projectId?: number //null in case of UpdateMilestone
  status: string|number //number in all cases of Post, string in all cases of Get
  startDate: string
  endDate: string
}


export interface MilestoneFile{
    id: number
  fileName: string
}
