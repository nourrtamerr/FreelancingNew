
import { ExperienceLevel } from "../Enums/FixedPriceProjectEnum";

  
export enum ProjectStatus {
  Pending = 0,
  Working = 1,
  Completed = 2
}
  
  
  
  export interface Project {
    id: number;
    title: string;
    description: string;
    createdAt: Date;
    endDate: Date | null;  
    expectedDuration: number; 
    clientId: string; 
    freelancerId?: string | null;  
    status: ProjectStatus;  
    // subcategoryId: number;
    // subcategory: Subcategory;  
    // milestones: Milestone[]; 
    experienceLevel: ExperienceLevel;  
    // proposals: Proposal[]; 
    // projectSkills: ProjectSkill[];  
    // isDeleted: boolean; 
  }
  
 
  