import { PortfolioImage } from "./PortfolioImage";

export interface portfolioProject
 {
   id: number;
   title: string;
   description: string;
   createdAt: string; 
   freelancerId: string;
   images: PortfolioImage[];
 }

 

 export type freelancerportofolioprojects = freelancerportofolioproject[]

 export interface freelancerportofolioproject {
   id: number
   description: string
   freelancerId: string
   title: string
   createdAt: string
   images: Image[]
 }
 
 export interface Image {
   image: string
   id: number
   previousProjectId: number
 }
 

 export interface CreatePortfolioProjectDTO {
  title: string;
  description: string;
  images: File[];
}