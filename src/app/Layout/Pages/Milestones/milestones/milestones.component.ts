import { Component, OnInit } from '@angular/core';
import { MilestoneService } from '../../../../Shared/Services/Milestone/milestone.service';
import { CommonModule } from '@angular/common';
import { Milestone, MilestoneFile } from '../../../../Shared/Interfaces/milestone';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Environment, Files } from '../../../../base/environment';
import { ProjectsService } from '../../../../Shared/Services/Projects/projects.service';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from '../../../../Shared/Services/Account/account.service';
import { AppUser } from '../../../../Shared/Interfaces/Account';

@Component({
  selector: 'app-milestones',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './milestones.component.html',
  styleUrl: './milestones.component.css'
})

export class MilestonesComponent implements OnInit{
  projectId: number = 0;
  milestones: Milestone[] = [];
  FilesURL: string = "";
 
  
  getStatusText(status: any): string {
    switch (status) {
      case 1: return 'Completed';
      case 2: return 'In Progress';
      case 0: return 'Pending';
      default: return 'Unknown';
    }
  }
  
  constructor(private route: ActivatedRoute,
    private milestoneService: MilestoneService,
  private projectService:ProjectsService,
private toastr:ToastrService,
private accountservice:AccountService) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.projectId = +params['projectId'];
      console.log(this.projectId);
      this.loadMilestones();
      this.loadproject();
    });
    this.FilesURL = Files.filesUrl;
    console.log(this.FilesURL);
  }



  deleteFile(fileName: string) {
    const fileNameOnly = fileName.split('/').pop(); // Extract filename from URL
    if (fileNameOnly) {
      this.milestoneService.RemoveMilestoneFilesByName(fileNameOnly).subscribe({
        next: () => {
          this.toastr.success('File deleted successfully');
          this.loadMilestones(); // Reload to update the file list
        },
        error: (error) => {
          this.toastr.error('Error deleting file');
          console.error('Error deleting file:', error);
        }
      });
    }
  }
  loadMilestones() {
    this.milestoneService.GetMilestoneByProjectId(this.projectId).subscribe({
      next: (data: any) => {
        this.milestones =Array.isArray(data) ? data : [data];
        console.log(data);
        
        this.milestones.forEach(milestone => {
          if(milestone.id !=undefined){
          this.milestoneService.GetFilesByMilestoneId(milestone.id).subscribe({
            next:(files: MilestoneFile[]) => {
              milestone.files = files.map((f: any) => `${this.FilesURL}${f.fileName}`);
              
                // `${Environment.baseUrl}${f.fileName}`); 
              // 👆 fix the path depending where your backend serves uploaded files

          },
          error: (error) => {
            console.error(`Error loading files for milestone ${milestone.id}:`, error);
            milestone.files = []; 
          }
        } );
      }
        });
      },
      error: (error) => {
        console.error('Error loading milestones:', error);
      }
    });
  }
  isProjectClient:boolean=false;
  isProjectFreelancer:boolean=false;
  projectdata:any;
  
  loadproject()
  {
    console.log(this.projectId);
    this.accountservice.myPorfile().subscribe({
      next:(data2:AppUser)=>{
        console.log(data2);
    this.projectService.getProjectById(this.projectId).subscribe(
      {
        next:(data:any)=>{this.projectdata=data,this.toastr.success("project loaded successfully")
            console.log(data),
            console.log(data2)
            // console.log(data\),
          if(data.clientId==data2.id)
          {
            this.isProjectClient=true;
          }
          if(data.freelancerId==data2.id)
          {
            this.isProjectFreelancer=true;
          }
        },
        error:(err)=>console.log(err)
      })
  },
  error:(err)=>console.log(err)


})
  }

  isFirstPendingMilestone(milestone: Milestone): boolean {
    const firstPendingIndex = this.milestones.findIndex(m => m.status === 0);
    const currentIndex = this.milestones.findIndex(m => m.id === milestone.id);
    return firstPendingIndex === currentIndex;
  }

  getFileType(files: string): string {
    if (!files) return 'other';
    
    const fileExtension = files.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension || '')) {
      return 'image';
    } else if (['mp4', 'webm', 'ogg'].includes(fileExtension || '')) {
      return 'video';
    }
    return 'other';
  }
  confirmMilestone(milestoneId: number) {
    this.milestoneService.UpdateMilestoneStatus(milestoneId,1).subscribe({
      next: (response) => {
        this.toastr.success('Milestone confirmed successfully');
        this.loadMilestones(); // Reload milestones to update the status
      },
      error: (error) => {
        this.toastr.error('Error confirming milestone');
        console.error('Error confirming milestone:', error);
      }
    });
  }

  onFileSelected(event: any, milestoneId: number) {
    const files: File[] = Array.from(event.target.files);
    if (files.length > 0) {
      this.milestoneService.UploadMilestoneFile(files, milestoneId).subscribe({
        next: (response) => {
          this.toastr.success('Files uploaded successfully');
          this.loadMilestones(); // Reload milestones to show new files
        },
        error: (error) => {
          this.toastr.error('Error uploading files');
          console.error('Error uploading files:', error);
        }
      });
    }
  }
}