import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FixedPriceProjectService } from '../../../Shared/Services/FixedPriceProject/fixed-price-project.service';
import { FixedPriceProjectById } from '../../../Shared/Interfaces/FixedPriceProject';

@Component({
  selector: 'app-fixed-project-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fixed-project-details.component.html',
  styleUrl: './fixed-project-details.component.css'
})
export class FixedProjectDetailsComponent implements OnInit {
  project: FixedPriceProjectById | null = null;
  projectid: number = 0;

  constructor(
    private route: ActivatedRoute,
    private projectService: FixedPriceProjectService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.projectid = +params['id'];
      this.loadProjectDetails();
    });
  }

  loadProjectDetails(): void {
    this.projectService.getProjectById(this.projectid).subscribe({
      next: (data) => {
        this.project = data;
        console.log('Project details:', data);
      },
      error: (error) => {
        console.error('Error fetching project details:', error);
      }
    });
  }
}
