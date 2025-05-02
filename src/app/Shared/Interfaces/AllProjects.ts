
import { ExperienceLevel } from "../Enums/FixedPriceProjectEnum";
import { ProjectType } from "./Proposal";

  
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
    projectType:ProjectType
    // subcategoryId: number;
    // subcategory: Subcategory;  
    // milestones: Milestone[]; 
    experienceLevel: ExperienceLevel;  
    // proposals: Proposal[]; 
    // projectSkills: ProjectSkill[];  
    // isDeleted: boolean; 
  }
  
 
  