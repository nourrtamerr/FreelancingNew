export interface PortfolioImage{
    id: number;
    imageUrl: string;
   
}
export interface UploadImageRequest{
    imageFile:File
    projectId:number
}