import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FixedPriceProjectService } from '../../../Shared/Services/FixedPriceProject/fixed-price-project.service';
import { BiddingProjectService } from '../../../Shared/Services/BiddingProject/bidding-project.service';
import { BiddingprojectCreateUpdate } from '../../../Shared/Interfaces/BiddingProject/biddingproject-create-update';
import { SkillService } from '../../../Shared/Services/Skill/skill.service';
import { SubCategoryService } from '../../../Shared/Services/SubCategory/sub-category.service';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { Currency } from '../../../Shared/Enums/currency';
import { ExperienceLevel } from '../../../Shared/Enums/experience-level';
// import { ExperienceLevel } from '../../../Shared/Enums/FixedPriceProjectEnum';
// import { ExperienceLevel } from '../../Shared/Enums/experience-level';







@Component({
  selector: 'app-create-project',
  standalone: true,  // Make sure this is true for standalone component
  imports: [CommonModule, ReactiveFormsModule,RouterModule, FormsModule],  // Import ReactiveFormsModule here
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
    private subcategorie: SubCategoryService,
    private router: Router  // <--- Add this

  ) {}
  availableSkills: any[] = [];
subcategories: any[] = [];
createdProjectId: number | null = null;
currencies=Currency
experienceLevel= ExperienceLevel


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
      // minPrice: [null, Validators.min(1)],   // ✅ ADD THIS
      maxPrice: [null, Validators.min(1)]    // ✅ ADD THIS

      
    });

    this.skills.getSkills().subscribe((res) => {
      this.availableSkills = res;
    });

    this.subcategorie.getAllSubcategories().subscribe((res) => {
      this.subcategories = res;
    });
  }

  // currencies = [
  //   { id: 1, name: 'USD' },
  //   { id: 2, name: 'EUR' },
  //   { id: 3, name: 'GBP' },
  //   { id: 4, name: 'INR' },
  // ];  
  

  // Handle project type change (fixed/bidding)
  onProjectTypeChange(type: string): void {
    this.isBiddingProject = type === 'bidding';
    
    if (type === 'bidding') {
        // Add validators for bidding project fields
        this.projectForm.get('biddingStartDate')?.setValidators([Validators.required]);
        this.projectForm.get('biddingEndDate')?.setValidators([Validators.required]);
        // this.projectForm.get('minPrice')?.setValidators([Validators.required, Validators.min(1)]);
        this.projectForm.get('maxPrice')?.setValidators([Validators.required, Validators.min(1)]);
        // Remove validators from fixed price
        this.projectForm.get('fixedPrice')?.clearValidators();
    } else {
        // Remove validators from bidding fields
        this.projectForm.get('biddingStartDate')?.clearValidators();
        this.projectForm.get('biddingEndDate')?.clearValidators();
        // this.projectForm.get('minPrice')?.clearValidators();
        this.projectForm.get('maxPrice')?.clearValidators();
        // Add validators to fixed price
        this.projectForm.get('fixedPrice')?.setValidators([Validators.required, Validators.min(1)]);
    }

    // Update form validation
    this.projectForm.get('biddingStartDate')?.updateValueAndValidity();
    this.projectForm.get('biddingEndDate')?.updateValueAndValidity();
    // this.projectForm.get('minPrice')?.updateValueAndValidity();
    this.projectForm.get('maxPrice')?.updateValueAndValidity();
    this.projectForm.get('fixedPrice')?.updateValueAndValidity();
}

  // Submit the form based on project type
  getErrorMessage(controlName: string): string {
    const control = this.projectForm.get(controlName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return 'This field is required';
      }
      if (control.errors['minlength']) {
        return `Minimum length is ${control.errors['minlength'].requiredLength} characters`;
      }
      if (control.errors['min']) {
        return `Value must be greater than ${control.errors['min'].min}`;
      }
    }
    return '';
  }


  getEnumValues(enumObj: any): number[] {
    return Object.values(enumObj).filter(value => typeof value === 'number') as number[];
    }

  onSubmit(): void {
    if (this.projectForm.invalid) {
      console.log('Form is invalid');
      return;
    }

    const formValue = this.projectForm.value;
    let projectData: any;

    if (formValue.projectType === 'fixed') {
      // Create Fixed Price Project data
      console.log(formValue.experienceLevel)
      projectData = {
        title: formValue.title,
        description: formValue.description,
        currency: formValue.currency,
        expectedDuration: formValue.expectedDuration,
        experienceLevel: formValue.experienceLevel,

        projectSkills: formValue.projectSkills, // Assuming project skills are handled elsewhere
        subcategoryId: formValue.subcategoryID, // Example subcategoryId, you may need to bind this to a form control
       price: formValue.fixedPrice, 
      };

      this.fixedPriceProjectService.createProject(projectData).subscribe({
        next: (response) => {
          console.log('Fixed project created successfully', response);
          const projectId = response.id; // Make sure your API returns the ID
          this.createdProjectId = response.id;

    this.router.navigate(['/fixed-project', projectId]);  // Navigate to the details page
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
        minimumPrice: 0,  // ✅
        maximumPrice: formValue.maxPrice,  // ✅
        biddingStartDate: formValue.biddingStartDate,
        biddingEndDate: formValue.biddingEndDate,
        experienceLevel: Number(formValue.experienceLevel), // ✅ should be 0,1,2
        expectedDuration: formValue.expectedDuration,
        projectSkillsIds: formValue.projectSkills, // ✅ must be array of skill IDs
        subcategoryId: formValue.subcategoryID // ✅ single subcategory ID
      };
console.log(projectData);
      this.biddingProjectService.CreateBiddingProject(projectData).subscribe({
        next: (response) => {
          console.log('Bidding project created successfully', response);
          const projectId = response.id; // Ensure ID is returned
          this.router.navigate(['/details', projectId]);  // Navigate to the bidding project details page
        },
        error: (err) => {
          console.error('Error creating bidding project:', err);
        }
      });
    }
  }
}
