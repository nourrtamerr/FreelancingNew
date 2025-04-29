import { Currency } from "../Enums/FixedPriceProjectEnum";
import { ExperienceLevel } from "../Enums/FixedPriceProjectEnum";
export interface CreateFixedProjectDTO {
    id?: number;
    title: string;
    description: string;
    currency: Currency;
    expectedDuration: number;
    subcategoryID: number;
    experienceLevel: ExperienceLevel;
    proposalsCount: number;
    projectSkills: number[];
    milestones: MilestoneDto[];
  }
  
  export interface MilestoneDto {
    title: string;
    startdate: string;  // ISO string (Date.toISOString())
    enddate: string;
    amount: number;
    description: string;
    status: MilestoneStatus;
  }
  
//   export enum Currency {
//     USD = 0,
//     EUR = 1,
//     GBP = 2,
//     JPY = 3,
//     AUD = 4,
//     CAD = 5,
//     CHF = 6,
//     CNY = 7,
//     SEK = 8,
//     NZD = 9
//   }
  
//   export enum ExperienceLevel {
//     Entry = 0,
//     Intermediate = 1,
//     Expert = 2
//   }
  
  export enum MilestoneStatus {
    Pending = 0,
    InProgress = 1,
    Completed = 2,
    Cancelled = 3
  }
  