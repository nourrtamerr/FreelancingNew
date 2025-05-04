export interface Review {
    id?: number
    rating: number
    comment: string
    revieweeId: string
    revieweeName?: string
    reviewerId: string
    reviewerName?: string
    projectId?: number;
    sentiment?: string;       // "Positive" or "Negative"
  sentimentScore?: number;  // Confidence score (0.0 - 1.0)
    
  }
  