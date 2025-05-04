export interface GetReviewsByRevieweeIdDto {
    id: number
  rating: number
  comment: string
  date: string
  reviewerName: string
  projectId: number
  projectTitle: string
  projectType: string
  reviewerId?:string
  sentiment?: string;       // "Positive" or "Negative"
  sentimentScore?: number;  // Confidence score (0.0 - 1.0)
  revieweeId?:string
}

