import { Component, OnInit } from '@angular/core';
import { MilestoneService } from '../../../../Shared/Services/Milestone/milestone.service';
import { CommonModule } from '@angular/common';
import { Milestone, MilestoneFile } from '../../../../Shared/Interfaces/milestone';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Environment, Files } from '../../../../base/environment';

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
    private milestoneService: MilestoneService) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.projectId = +params['projectId'];
      console.log(this.projectId);
      this.loadMilestones();
    });
    this.FilesURL = Files.filesUrl;
    console.log(this.FilesURL);
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
  
}