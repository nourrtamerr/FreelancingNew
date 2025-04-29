import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FixedPriceProjectService } from '../../../Shared/Services/FixedPriceProject/fixed-price-project.service';
import { BiddingProjectService } from '../../../Shared/Services/BiddingProject/bidding-project.service';
import { BiddingprojectCreateUpdate } from '../../../Shared/Interfaces/BiddingProject/biddingproject-create-update';
import { SkillService } from '../../../Shared/Services/Skill/skill.service';
import { SubCategoryService } from '../../../Shared/Services/SubCategory/sub-category.service';





@Component({
  selector: 'app-create-project',
  standalone: true,  // Make sure this is true for standalone component
  imports: [CommonModule, ReactiveFormsModule],  // Import ReactiveFormsModule here
  templateUrl: './create-project.component.html',
  styleUrls: ['./create-project.component.css']
})
export class CreateProjectComponent implements OnInit {
  projectForm!: FormGroup;
  isBiddingProject: boolean = false; // Flag to track the selected project type

  constructor(
    private fb: FormBuilder,
    private fixedPriceProjectService: FixedPriceProjectService,
    private biddingProjectService: BiddingProjectService,
    private skills:SkillService,
    private subcategorie: SubCategoryService
  ) {}
  availableSkills: any[] = [];
subcategories: any[] = [];

  ngOnInit(): void {
    // Initialize the form with common fields
    this.projectForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(10)]],
      description: ['', [Validators.required, Validators.minLength(30)]],
      currency: ['', Validators.required],
      expectedDuration: ['', [Validators.required, Validators.min(1)]],
      experienceLevel: ['', Validators.required],
      projectType: ['fixed'], // Default project type is 'fixed'
      biddingStartDate: [''], // Start date (Bidding project only)
      biddingEndDate: [''], // End date (Bidding project only),
      subcategoryID: [null, Validators.required], // 🔥 Add this
      projectSkills: [[], Validators.required],     // 🔥 And this
      fixedPrice: [null, [Validators.required, Validators.min(1)]],
      minPrice: [null, Validators.min(1)],   // ✅ ADD THIS
  maxPrice: [null, Validators.min(1)]    // ✅ ADD THIS

      
    });

    this.skills.getSkills().subscribe((res) => {
      this.availableSkills = res;
    });

    this.subcategorie.getAllSubcategories().subscribe((res) => {
      this.subcategories = res;
    });
  }

  currencies = [
    { id: 1, name: 'USD' },
    { id: 2, name: 'EUR' },
    { id: 3, name: 'GBP' },
    { id: 4, name: 'INR' },
  ];  
  

  // Handle project type change (fixed/bidding)
  onProjectTypeChange(type: string): void {
    this.isBiddingProject = type === 'bidding';
  }

  // Submit the form based on project type
  onSubmit(): void {
    if (this.projectForm.invalid) {
      console.log('Form is invalid');
      return;
    }

    const formValue = this.projectForm.value;
    let projectData: any;

    if (formValue.projectType === 'fixed') {
      // Create Fixed Price Project data
      projectData = {
        title: formValue.title,
        description: formValue.description,
        currency: formValue.currency,
        expectedDuration: formValue.expectedDuration,
        experienceLevel: formValue.experienceLevel,
        projectSkills: [], // Assuming project skills are handled elsewhere
        subcategoryId: 1, // Example subcategoryId, you may need to bind this to a form control
       price: formValue.fixedPrice, 
      };

      this.fixedPriceProjectService.createProject(projectData).subscribe({
        next: (response) => {
          console.log('Fixed project created successfully', response);
        },
        error: (err) => {
          console.error('Error creating fixed project:', err);
        }
      });

    } else if (formValue.projectType === 'bidding') {
      // Create Bidding Project data
      projectData = {
        title: formValue.title,
        description: formValue.description,
        currency: formValue.currency,
        minimumPrice: formValue.minPrice,  // ✅
        maximumPrice: formValue.maxPrice,  // ✅
        biddingStartDate: formValue.biddingStartDate,
        biddingEndDate: formValue.biddingEndDate,
        experienceLevel: Number(formValue.experienceLevel), // ✅ should be 0,1,2
        expectedDuration: formValue.expectedDuration,
        projectSkillsIds: formValue.projectSkills, // ✅ must be array of skill IDs
        subcategoryId: formValue.subcategoryID // ✅ single subcategory ID
      };

      this.biddingProjectService.CreateBiddingProject(projectData).subscribe({
        next: (response) => {
          console.log('Bidding project created successfully', response);
        },
        error: (err) => {
          console.error('Error creating bidding project:', err);
        }
      });
    }
  }
}
