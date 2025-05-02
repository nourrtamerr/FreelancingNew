import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AccountService } from '../../../Shared/Services/Account/account.service';
import { AuthService } from '../../../Shared/Services/Auth/auth.service';
import { AppUser, EditProfileDTO, IdentityVerificationRequest, LanguageEnum } from '../../../Shared/Interfaces/Account';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Country } from '../../../Shared/Interfaces/Country';
import { City } from '../../../Shared/Interfaces/City';
import { CountriesService } from '../../../Shared/Services/Countries/countries.service';
import { CitiesService } from '../../../Shared/Services/Cities/cities.service';
import { Environment, Files, projectImages } from '../../../base/environment';
import { UserSkill } from '../../../Shared/Interfaces/UserSkill';
import { SkillService } from '../../../Shared/Services/Skill/skill.service';
import { FreelancerSkill, nonrecommendedSkill, Skill } from '../../../Shared/Interfaces/Skill';
import { EducationService } from '../../../Shared/Services/Educations/education.service';
import { Education } from '../../../Shared/Interfaces/education';
import { ToastrService } from 'ngx-toastr';
import { ExperienceService } from '../../../Shared/Services/Experiences/experience.service';
import { Experience } from '../../../Shared/Interfaces/experience';
import { freelancerportofolioproject, freelancerportofolioprojects, portfolioProject } from '../../../Shared/Interfaces/PortfolioProject';
import { PortfolioProjectService } from '../../../Shared/Services/Portfolio/portfolio-project.service';
// import { NgbCarouselModule, NgbModule,NgbSlide } from '@ng-bootstrap/ng-bootstrap';
import { PortfolioImageService } from '../../../Shared/Services/PortfolioImage/portfolio-image.service';
import { forkJoin } from 'rxjs';
import { CertificateService } from '../../../Shared/Services/Certificates/certificate.service';
import { Certificate } from '../../../Shared/Interfaces/certificate';
import { BiddingProjectService } from '../../../Shared/Services/BiddingProject/bidding-project.service';
import { BiddingProjectGetAll } from '../../../Shared/Interfaces/BiddingProject/bidding-project-get-all';
import { TimeAgoPipe } from '../../../Pipes/time-ago.pipe';
import { FixedPriceProjectService } from '../../../Shared/Services/FixedPriceProject/fixed-price-project.service';
import { FixedPriceProject } from '../../../Shared/Interfaces/FixedPriceProject';
import { FreelancerLanguage } from '../../../Shared/Interfaces/freelancer-language';
import { FreelancerlanguageService } from '../../../Shared/Services/FreelancerLanguages/freelancerlanguage.service';


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule,TimeAgoPipe,RouterModule],
  providers:[FormBuilder],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  ngOnInit() {
    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        this.activeTab = fragment;
      }
    });
    this.loadCountries();
    this.picturesurl=Files.filesUrl;
    this.loadProfile();
    this.initializeForm();
    this.initializeskills();
    this.initializeNonrecommendedskills();
    // this.loadEducation();
    this.initializeEducationForm();
    this.initializeExperienceForm();
    this.initProjectForm();
    this.initCertificateForm();
    this.initLanguageForm();
    
  }
  
  constructor(private route: ActivatedRoute
    ,private router: Router
    ,private account:AccountService
    ,private authservice:AuthService
    ,private Countryservice:CountriesService
    ,private CityService:CitiesService
    ,private SkillService:SkillService
    ,private fb: FormBuilder
    ,private educationservice:EducationService
    ,private toastr: ToastrService
    ,private experienceservice:ExperienceService
    ,private portfolioprojectservice:PortfolioProjectService
    ,private Portfolioprojectimageservice:PortfolioImageService
    ,private certificatservice:CertificateService
    ,private BiddingProjects:BiddingProjectService
    ,private fixedprojects:FixedPriceProjectService
    ,private freelancerlanguages:FreelancerlanguageService
    ,private cdr: ChangeDetectorRef
  ) {

    
  }


  mylanguages:FreelancerLanguage[]=[];
  missinglanguages:LanguageEnum[]=[];

  loadLanguages(){
    this.freelancerlanguages.getFreelancerLanguageByUserName(this.profile.userName).subscribe(
      {
        next:(data:FreelancerLanguage[])=>{
          this.mylanguages=data;
          this.missinglanguages = allLanguages.filter(lang => 
            !this.mylanguages.some(myLang => 
                myLang.language === lang && !myLang.isDeleted
            )
        );
        },
        error:(err)=>{
          this.error=err;
          this.toastr.error("failed to load languages");
        }
      }
    )
    const allLanguages = Object.values(LanguageEnum);
    
    // Filter out languages that the freelancer already has
   
    
  }


  fixedProjects:FixedPriceProject[]=[]
  biddingprojects:BiddingProjectGetAll[]=[]
  isLanguageModalOpen = false;
languageForm!: FormGroup;


initLanguageForm() {
  this.languageForm = this.fb.group({
      language: ['', Validators.required]
  });
}

openAddLanguageModal() {
  // this.loadLanguages(); // Make sure to get updated list
  this.initLanguageForm();
  this.isLanguageModalOpen = true;
}

closeLanguageModal() {
  this.isLanguageModalOpen = false;
  this.languageForm.reset();
}

submitLanguage() {
  if (this.languageForm.valid) {
      const newLanguage: FreelancerLanguage = {
          language: this.languageForm.value.language,
          isDeleted: false
      };

      this.freelancerlanguages.addFreelancerLanguage(newLanguage).subscribe({
          next: () => {
              this.toastr.success('Language added successfully');
              this.loadLanguages(); // Refresh the languages list
              this.closeLanguageModal();
          },
          error: (err) => {
              this.toastr.error('Failed to add language');
              console.error(err);
          }
      });
  }
}

deleteLanguage(language: FreelancerLanguage) {
  this.freelancerlanguages.deleteFreelancerLanguage(language.id?? 0).subscribe({
      next: () => {
          this.toastr.success('Language removed successfully');
          this.loadLanguages(); // Refresh the languages list
      },
      error: (err) => {
          this.toastr.error('Failed to remove language');
          console.error(err);
      }
  });
}


loadBiddingProjects(){
  this.BiddingProjects.GetmyBiddingprojects().subscribe(
    {
      next:(data:BiddingProjectGetAll[])=>{
        this.biddingprojects=data;
      },
      error:(err)=>{
        this.error=err;
        this.toastr.error("failed to load bidding projects");
      }
    }
  )
  this.fixedprojects.getmyprojects().subscribe(
    {
      next:(data:FixedPriceProject[])=>{
        this.fixedProjects=data;
      },
      error:(err)=>{
        this.error=err;
        this.toastr.error("failed to load bidding projects");
      }
    }
  )
  
}

//#region allprevious
//#region  percentage

// Add this property to your component class
public profileCompletionPercentage: number = 0;

// Add this method to calculate completion percentage
calculateProfileCompletion(): void {
  let percentage = 0;

  // Basic profile data (40%)
  if (this.profile) {
    const requiredFields = [
      this.profile.firstname,
      this.profile.lastname,
      this.profile.email,
      this.profile.city,
      this.profile.phoneNumber,
      this.profile.dateOfBirth,
      this.profile.description
    ];
    
    const filledFields = requiredFields.filter(field => field !== null && field !== undefined && field !== '').length;
    percentage += Math.round((filledFields / requiredFields.length) * 40);
console.log(percentage,"before education")
    // Education (10%)
    if (this.userEducation && Object.keys(this.userEducation).length > 0) {
      percentage += 10;
    }
    console.log(percentage,"before experience and after education")

    // Experience (10%)
    if (Array.isArray(this.userExperiences) && this.userExperiences.length > 0) {
      percentage += 10;
    }
    console.log(percentage,"before certificaties and after experience")

    // Certificates (10%)
    if (Array.isArray(this.userCertificates) && this.userCertificates.length > 0) {
      percentage += 10;
    }
    console.log(percentage,"before verification and after certificates")

    // Verification (10%)
    if (this.profile.isVerified === true) {
      percentage += 10;
    }
    console.log(percentage,"total")

    // Projects (20%)
    if (Array.isArray(this.userPortfolioproject) && this.userPortfolioproject.length > 0) {
      const projectPercentage = Math.min(this.userPortfolioproject.length, 3) * (20/3);
      percentage += Math.round(projectPercentage);
    }
    console.log(percentage,"total after skills")

  }

  this.profileCompletionPercentage = Math.min(100, Math.round(percentage));
}
//#endregion

 //#region certificat
 userCertificates: Certificate[] = [];
 isCertificateModalOpen: boolean = false;
 editingCertificate: any = null;
 certificateForm!: FormGroup;

 private initCertificateForm() {
  this.certificateForm = this.fb.group({
    name: ['', Validators.required],
    issuer: ['', Validators.required],
    issueDate: ['', Validators.required]
  });
}

openAddCertificateModal() {
  this.editingCertificate = null;
  this.certificateForm.reset();
  this.isCertificateModalOpen = true;
}

openEditCertificateModal(certificate: Certificate) {
  this.editingCertificate = certificate;
  this.certificateForm.patchValue({
    name: certificate.name,
    issuer: certificate.issuer,
    issueDate: new Date(certificate.issueDate).toISOString().split('T')[0]
  });
  this.isCertificateModalOpen = true;
}

closeCertificateModal() {
  this.isCertificateModalOpen = false;
  this.editingCertificate = null;
  this.certificateForm.reset();
}

submitCertificate() {
  if (this.certificateForm.valid) {
    const certificateData: Omit<Certificate, 'id'> = this.certificateForm.value;
    
    if (this.editingCertificate) {
      this.updateCertificate(this.editingCertificate.id, certificateData);
    } else {
      this.addCertificate(certificateData);
    }
  }
}

private addCertificate(certificateData: Omit<Certificate, 'id'>) {
  this.certificatservice.addCertificate(certificateData)
    .subscribe({
      next: () => {
        this.loadCertificates();
        this.closeCertificateModal();
        ////this.calculateProfileCompletion();
        this.toastr.success('Certificate added successfully');
      },
      error: (error) => {
        this.toastr.error('Failed to add certificate');
        console.error('Error adding certificate:', error);
      }
    });
}

private updateCertificate(id: number, certificateData: Omit<Certificate, 'id'>) {
  this.certificatservice.updateCertificate(id, certificateData)
    .subscribe({
      next: () => {
        this.loadCertificates();
        this.closeCertificateModal();
        
        this.toastr.success('Certificate updated successfully');
      },
      error: (error) => {
        this.toastr.error('Failed to update certificate');
        console.error('Error updating certificate:', error);
      }
    });
}

deleteCertificate(id: number) {
  if (confirm('Are you sure you want to delete this certificate?')) {
    this.certificatservice.deleteCertificate(id)
      .subscribe({
        next: () => {
          this.loadCertificates();
          ////this.calculateProfileCompletion();
          this.toastr.success('Certificate deleted successfully');
        },
        error: (error) => {
          this.toastr.error('Failed to delete certificate');
          console.error('Error deleting certificate:', error);
        }
      });
  }
}

private loadCertificates() {
  this.certificatservice.getCertificateByUserName(this.profile.userName)
    .subscribe({
      next: (response: any) => {
        this.userCertificates = response;

        this.calculateProfileCompletion();

      },
      error: (error) => {
        console.error('Error loading certificates:', error);
        this.toastr.error('Failed to load certificates');
      }
    });


    this.calculateProfileCompletion()
}
 //#endregion


//#region portofolio project

  isProjectModalOpen: boolean = false;
  projectForm!: FormGroup;
  selectedProjectImages: File[] = [];
  imagePreviewUrls: string[] = [];
  userPortfolioproject:freelancerportofolioprojects=[]
  editingProject: freelancerportofolioproject | null = null;
  projectimagesurl:string=projectImages.filesUrl;
  loadPortofolioProjects(){

  this.portfolioprojectservice.getMyPortfolioProjects().subscribe(
    {
      next:(data) =>{
        console.log("got hereeeee")
          this.userPortfolioproject = data
          console.log(data);
          data.forEach(project => {
            if (project.images?.length > 1) {
              this.startCarouselInterval(project);
            }
          });
          this.toastr.success('Portofolioprojects loaded successfully');
          this.calculateProfileCompletion();

      } ,
      error:(err)=>{this.error=err
        console.log("got hereeeee")

        this.toastr.error('Error loading experiences');
      console.log(err)}
    }
  )
}
carouselIntervals: { [key: number]: any } = {};

private startCarouselInterval(project: any) {
  // Clear existing interval if any
  if (this.carouselIntervals[project.id]) {
    clearInterval(this.carouselIntervals[project.id]);
  }
  
  // Set new interval
  this.carouselIntervals[project.id] = setInterval(() => {
    // Create a mock event object for the carousel
    const mockEvent = new Event('autoplay');
    this.nextImage(project, mockEvent);
  }, 3000); // Change image every 3 seconds
}

private stopCarouselInterval(projectId: number) {
  if (this.carouselIntervals[projectId]) {
    clearInterval(this.carouselIntervals[projectId]);
    delete this.carouselIntervals[projectId];
  }
}

currentImageIndex: { [key: number]: number } = {};

nextImage(project: any, event: Event) {
  event.stopPropagation();
  if (!this.currentImageIndex[project.id]) {
    this.currentImageIndex[project.id] = 0;
  }
  this.currentImageIndex[project.id] = 
    (this.currentImageIndex[project.id] + 1) % project.images.length;
  this.currentImageIndex = { ...this.currentImageIndex };
  
  // Reset the interval
  this.startCarouselInterval(project);
}

previousImage(project: any, event: Event) {
  event.stopPropagation();
  if (!this.currentImageIndex[project.id]) {
    this.currentImageIndex[project.id] = 0;
  }
  this.currentImageIndex[project.id] = 
    (this.currentImageIndex[project.id] - 1 + project.images.length) % project.images.length;
  this.currentImageIndex = { ...this.currentImageIndex };
  
  // Reset the interval
  this.startCarouselInterval(project);
}
ngOnDestroy() {
  // Clear all intervals when component is destroyed
  Object.keys(this.carouselIntervals).forEach(projectId => {
    this.stopCarouselInterval(Number(projectId));
  });
}
private initProjectForm() {
  this.projectForm = this.fb.group({
    title: ['', Validators.required],
    description: ['', [Validators.required, Validators.maxLength(500)]],
    createdAt: ['', Validators.required],
    images: []
  });
}

selectedFiles: File[] = [];

resetProjectForm() {
  this.initProjectForm();
  this.imagePreviewUrls = [];
  this.selectedFiles = [];
}
deleteProjectImage(id2:number)
{
  this.Portfolioprojectimageservice.deletePortfolioProjectImage(id2).subscribe({
    next: (response) => {
      // Remove the deleted image from the editingProject
      if (this.editingProject) {
        this.editingProject.images = this.editingProject.images.filter(img => img.id !== id2);
      }
      // Refresh the project list to reflect changes
      this.loadPortofolioProjects();
      this.toastr.success('Project image deleted successfully');
    },
    error: (error) => {
      console.error('Error deleting project image:', error);
      this.toastr.error('Failed to delete project image');
    }
  });
}
openAddProjectModal() {
  this.editingProject=null;
  this.isProjectModalOpen = true;
  this.projectForm.reset();
  this.selectedProjectImages = [];
  this.imagePreviewUrls = [];
}

closeProjectModal() {
  this.isProjectModalOpen = false;
}

onProjectImageSelected(event: any) {
  const files = event.target.files;
  if (files) {
    this.selectedFiles = Array.from(files);
    this.selectedProjectImages = Array.from(files);
    this.imagePreviewUrls = [];
    
    this.selectedProjectImages.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviewUrls.push(e.target.result);
        console.log("hiii");
      };
      reader.readAsDataURL(file);
    });
  }
}



deleteProject(projectId: number) {
  if (confirm('Are you sure you want to delete this project?')) {
    this.portfolioprojectservice.deletePortfolioProject(projectId).subscribe({
      next: () => {
        this.toastr.success('Project deleted successfully');
        ////this.calculateProfileCompletion();
        this.loadPortofolioProjects();
      },
      error: (error) => {
        this.toastr.error('Error deleting project');
        console.error(error);
      }
    });
  }
}

editProject(project: freelancerportofolioproject) {
  this.projectForm.patchValue({
    title: project.title,
    description: project.description,
    createdAt: new Date(project.createdAt).toISOString().split('T')[0]
  });
  
  this.imagePreviewUrls = project.images.map(img => img.image);
  this.isProjectModalOpen = true;
}
openEditProjectModal(project: freelancerportofolioproject) {
  this.editingProject = project;
  this.isProjectModalOpen = true;
  
  // Populate form with project data
  this.projectForm.patchValue({
    title: project.title,
    description: project.description,
    createdAt: new Date(project.createdAt).toISOString().split('T')[0]
  });
  
  // Set image previews
  this.imagePreviewUrls = project.images.map(img => img.image);
}

removeImage(index: number) {
  this.imagePreviewUrls.splice(index, 1);
  if (this.selectedProjectImages.length > index) {
    this.selectedProjectImages.splice(index, 1);
  }
}

submitProject() {
  if (this.projectForm.valid) {
    const formData = new FormData();
    
    formData.append('title', this.projectForm.get('title')?.value);
    formData.append('description', this.projectForm.get('description')?.value);
    formData.append('createdAt', this.projectForm.get('createdAt')?.value);
    if (this.selectedFiles) {
      for (let i = 0; i < this.selectedFiles.length; i++) {
        formData.append('images', this.selectedFiles[i]);
      }
    }
    else{
      formData.append('images', JSON.stringify([]));
    }

    if (this.editingProject) {
      // Update existing project
      const updateData = {
        title: this.projectForm.get('title')?.value,
        description: this.projectForm.get('description')?.value,
        createdAt: this.projectForm.get('createdAt')?.value
      };
      this.portfolioprojectservice.updatePortfolioProject(this.editingProject.id,updateData)
      .subscribe({
        next: () => {
          this.toastr.success('Project updated successfully');
          this.loadPortofolioProjects();
          this.closeProjectModal();
          ////this.calculateProfileCompletion();
        },
        error: (error) => {
          this.toastr.error('Error updating project');
          console.error(error);
        }
      });
    } else {
      // Add new project
      for (const pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }
    
      this.portfolioprojectservice.addPortfolioProject(formData).subscribe({
        next: () => {
          this.toastr.success('Project added successfully');
          this.loadPortofolioProjects();
          this.closeProjectModal();
          ////this.calculateProfileCompletion();
        },
        error: (error) => {
          this.toastr.error('Error adding project');
          console.error(error);
        }
      });
    }
  }
}
//#endregion

  //#region 
userExperiences:Experience[]=[]
isExperienceModalOpen: boolean = false;
experienceForm!: FormGroup;
isLoadingExperience: boolean = false;
editingExperienceId: number | null = null;
isSubmitting: boolean = false;
  loadExperience(){
    if (!this.profile?.userName) {
      this.toastr.error('Unable to load experience: User profile not available');
      return;
    }
    console.log(this.profile.userName)
  this.experienceservice.getExperienceByUserName(this.profile.userName).subscribe(
    {
      next:(data:Experience[]) =>{
        
        this.userExperiences = data
        this.calculateProfileCompletion();
          this.toastr.success('Experiences loaded successfully');
        
      } ,
      error:(err)=>{this.error=err
        this.toastr.error('Error loading experiences');
        ////this.calculateProfileCompletion();
      console.log(err)}
    }
  )
}


addImageToProject(event: any, projectId: number) {
  const files = event.target.files;
  if (files && files.length > 0) {
    const uploadObservables = Array.from(files).map(file => 
      this.Portfolioprojectimageservice.UploadImage(projectId, file as File)
    );

    // Wait for all uploads to complete
    forkJoin(uploadObservables).subscribe({
      next: (responses) => {
        this.toastr.success('All images uploaded successfully');
        this.loadPortofolioProjects(); // Reload after all uploads are complete
      },
      error: (error) => {
        this.toastr.error('Failed to upload one or more images');
        console.error('Error uploading images:', error);
      }
    });
  }
}
private initializeExperienceForm() {
  this.experienceForm = this.fb.group({
    jobTitle: ['', Validators.required],
    company: ['', Validators.required],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    location: ['', Validators.required],
    description: ['', [Validators.required, Validators.maxLength(500)]]
  });
}


openAddExperienceModal() {
  this.editingExperienceId = null;
  this.experienceForm.reset();
  this.isExperienceModalOpen = true;
}

openEditExperienceModal(experience: Experience) {
  this.editingExperienceId = experience.id??0;
  this.experienceForm.patchValue({
    jobTitle: experience.jobTitle,
    company: experience.company,
    startDate: new Date(experience.startDate).toISOString().split('T')[0],
    endDate: new Date(experience.endDate).toISOString().split('T')[0],
    location: experience.location,
    description: experience.description
  });
  this.isExperienceModalOpen = true;
}

closeExperienceModal() {
  this.isExperienceModalOpen = false;
  this.experienceForm.reset();
  this.editingExperienceId = null;
}

submitExperience() {
  if (this.experienceForm.valid && !this.isSubmitting) {
    this.isSubmitting = true;
    const experienceData = {
      ...this.experienceForm.value,
      userName: this.profile.userName
    };

    const request$ = this.editingExperienceId
      ? this.experienceservice.updateExperience(this.editingExperienceId, experienceData)
      : this.experienceservice.addExperience(experienceData);

    request$.subscribe({
      next: () => {
        this.toastr.success(`Experience ${this.editingExperienceId ? 'updated' : 'added'} successfully`);
        this.loadExperience();
        this.closeExperienceModal();
        ////this.calculateProfileCompletion();
      },
      error: (error) => {
        this.toastr.error(`Failed to ${this.editingExperienceId ? 'update' : 'add'} experience`);
        console.error('Experience operation error:', error);
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }
}

deleteExperience(experience: Experience) {
  if (confirm('Are you sure you want to delete this experience?')) {
    this.experienceservice.deleteExperience(experience.id??0).subscribe({
      next: () => {
        this.toastr.success('Experience deleted successfully');
        ////this.calculateProfileCompletion();
        this.loadExperience();
      },
      error: (error) => {
        this.toastr.error('Failed to delete experience');
        console.error('Error deleting experience:', error);
      }
    });
  }
}

validateDates() {
  const startDate = new Date(this.experienceForm.get('startDate')?.value);
  const endDate = new Date(this.experienceForm.get('endDate')?.value);
  
  if (startDate > endDate) {
    this.experienceForm.get('endDate')?.setErrors({ invalidDate: true });
  } else {
    this.experienceForm.get('endDate')?.setErrors(null);
  }
}
  //#endregion

  //#region Education
userEducation:Education|null=null;

loadEducation(){
  if (!this.profile?.userName) {
    this.toastr.error('Unable to load education: User profile not available');
    return;
  }

  console.log("loading educationnnnnnnnnnnnnnnnnnn");
  console.log(this.profile.userName)
this.educationservice.getEducationByUserName(this.profile.userName).subscribe(
  {
    next:(data:Education[]) =>{
      if (data && data.length > 0) {
        this.userEducation = data[0];
        this.calculateProfileCompletion();
        this.toastr.success('Education loaded successfully');
      
    }
      console.log(data);
    }
    ,
    error:(err)=>{this.error=err
    console.log(err)}
  }
)
}

isEducationModalOpen = false;
editMode = false;
educationForm!: FormGroup;
private initializeEducationForm() {
  this.educationForm = this.fb.group({
      degree: ['', Validators.required],
      fieldOfStudy: ['', Validators.required],
      institution: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      grade: [''],
      description: ['']
  });
}


openAddEducationModal() {
  this.editMode = false;
  this.initializeEducationForm();
  this.isEducationModalOpen = true;
}

openEditEducationModal() {
  this.editMode = true;
  this.initializeEducationForm();

  this.educationForm.patchValue(this.userEducation || {});
  const startDate = this.userEducation?.startDate ? new Date(this.userEducation?.startDate) : new Date();
  const endDate = this.userEducation?.endDate ? new Date(this.userEducation?.endDate) : new Date();

  this.educationForm.patchValue({
    ...this.userEducation,
    startDate: this.formatDate(startDate),
    endDate: this.formatDate(endDate)
  });
  
  this.isEducationModalOpen = true;
}

private formatDate(date: Date): string {
  return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
}
DeleteEducation(){
  this.educationservice.deleteEducation(this.userEducation?.id??0).subscribe({
    next: () => {
        this.userEducation = null;
        this.calculateProfileCompletion();
        this.toastr.success('Education deleted successfully');
    },
    error: (error) => {
        this.toastr.error('Failed to delete education');
        console.error('Error deleting education:', error);
    }
})

}
closeEducationModal() {
  this.isEducationModalOpen = false;
  this.educationForm.reset();
}

submitEducation() {
    if (this.educationForm.invalid) {
        this.toastr.error('Please fill all required fields');
        return;
    }

    const educationData = this.educationForm.value;
    
    if (this.editMode) {
        this.educationservice.updateEducation(this.userEducation?.id??0,educationData).subscribe({
            next: (response) => {
                this.loadEducation();
                this.closeEducationModal();
                this.toastr.success('Education updated successfully');
            },
            error: (error) => {
                this.toastr.error('Error updating education');
                console.error(error);
            }
        });
    } else {
        this.educationservice.CreateEducation(educationData).subscribe({
            next: (response) => {
                this.userEducation = response;
                this.closeEducationModal();
                this.toastr.success('Education added successfully');
                this.calculateProfileCompletion();

            },
            error: (error) => {
                this.toastr.error('Error adding education');
                console.log(error);
            }
        });
    }
}
  //#endregion

  //#region My Custom Region
  picturesurl:string ="";
  // activeTab: string = 'wt-skills';
  activeTab: string = 'profile';
  

  profile!:AppUser
  error:string=""
  countries: Country[] = [];
  cities: City[] = [];
  filteredCities: City[] = [];
  freelancerskills:FreelancerSkill[]=[];
  previewUrl: string | null = null;
  selectedFile: File | null = null;
  profileForm!: FormGroup;
  searchText: string = '';
  filteredSkills: Skill[] = [];

  userskills:FreelancerSkill[]=[]
  nonrecommendedskills:nonrecommendedSkill[]=[]
  allskills:Skill[]=[]
  private initializeNonrecommendedskills(){
    this.SkillService.getnonRecommendedUserSkills().subscribe(
      {

        next:(data)=>this.nonrecommendedskills=data,
        error:(error)=>this.error=error
      }
    )
  }
  private initializeskills()
  {
   this.SkillService.getSkills().subscribe(
      {
        next:(data)=>{this.allskills=data;
        //   this.allskills = this.allskills.filter(s => 
        //     !this.freelancerskills.some(fs => fs.skillName === s.name)
        // );
        //   console.log(data);
        },
        error:(error)=>{
          this.error=error;
        }

      }
    )
  }
  filterSkills() {
    if (!this.searchText.trim()) {
        this.filteredSkills = [];
        return;
    }
    
    this.filteredSkills = this.allskills.filter(skill => 
        skill.name.toLowerCase().includes(this.searchText.toLowerCase()) &&
        !this.freelancerskills.some(fs => fs.skillName === skill.name) &&
        !this.nonrecommendedskills.some(ns => ns.name === skill.name)
    );
}

addSkill(skillId: number): void {
  const skill: UserSkill = {
    id: skillId,
  };
  console.log("hiasdhoasdhioas")
  this.SkillService.createUserSkill(skill).subscribe({
    next: (response: UserSkill) => {
      console.log(response);
      const freelancerSkill: FreelancerSkill = {
        id: response.id,
        skillId:response.skillId!,
        skillName: response.skillName!,
        freelancerId: response.FreelancerId! // or whatever the appropriate value should be
      };
      this.toastr.success('Skill added successfully', 'Success');
      this.freelancerskills.push(freelancerSkill);
      this.filterSkills();
      this.searchText = '';
    },
    error: (error) => {
      console.log("hiasdhoasdhioas")
      console.error('Error adding skill:', error);
      this.toastr.error('Error adding skill', 'Error');

      this.error = error;
    }
  });
}
  private initializeForm() {
    this.profileForm = this.fb.group({
      firstname: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      country: ['', [Validators.required]],
      city: ['', [Validators.required]],
      UserName: ['', [Validators.required]],
      Description: ['', [Validators.maxLength(500)]],
      DateOfBirth: ['', [Validators.required]],
      title:[''],
      PhoneNumber: ['', [
        Validators.required,
        Validators.minLength(11),
        Validators.maxLength(11),
        Validators.pattern(/^[0-9]*$/)
      ]],
      Password: ['', [Validators.required]],
      ConfirmPassword: ['']
    }, {
      validators: this.passwordMatchValidator
    });
  }

  private passwordMatchValidator(g: FormGroup) {
    const password = g.get('Password')?.value;
    const confirmPassword = g.get('ConfirmPassword')?.value;
    return password === confirmPassword ? null : { 'mismatch': true };
  }
  activateTab(tabId: string) {
    this.activeTab = tabId;
    this.router.navigate([], { fragment: tabId });
  }


  loadCountries() {
    this.Countryservice.getCountries().subscribe(
      (data: Country[]) => {
        this.countries = data;
      }
    );
  }

  loadCities() {
    this.CityService.getCitiess().subscribe(
      (data: City[]) => {
        this.cities = data;
        // Filter cities based on user's country
        if (this.profile.country) {
          const selectedCountry = this.countries.find(c => c.name === this.profile.country);
          console.log(selectedCountry);
          if (selectedCountry) {
            this.filteredCities = this.cities.filter(
              city => city.countryname === selectedCountry.name
            );
          }
        }
      }
    );
  }
  loadProfile() {
    this.account.myPorfile().subscribe({
      next: (data) => {
        this.profile = data;
        this.profileForm.patchValue({
          firstname: data.firstname,
          lastname: data.lastname,
          country: data.country,
          city: data.city,
          UserName: data.userName,
          Description: data.description,
          DateOfBirth: data.dateOfBirth,
          PhoneNumber: data.phoneNumber,
          title: data.title
        });
  
 
          this.loadCities();
          this.loadEducation();
          this.loadBiddingProjects();
          if(this.profile.role==='Freelancer') {
          this.loadExperience();
          this.loadPortofolioProjects();
          this.loadCertificates();
          this.loadLanguages();
        
          this.calculateProfileCompletion();
          }

      },
      error: (error) => {
        console.error('Error fetching profile:', error);
        this.error=error;
      }
    }
    );



        this.SkillService.getUserSkills().subscribe(
          {
            next: (data) => {
        console.log(data);
        this.freelancerskills=data;
      },
      error: (error) => {
        console.error('Error fetching user skills:', error);
        // Handle error - maybe show a notification to user
      },
      complete: () => {
        // Optional: Handle completion
      }
    }
        )
      
  }
  onCountryChange() {
    this.filterCities();
   

    

    console.log(this.profileForm.get('city')?.value,"formcity")
    console.log(this.profile.city,"city")
    const selectedCity = this.cities.find(c => c.name === this.profileForm.get('city')?.value);
    console.log(selectedCity,"selectedcity")
  }


  onCityChange(value: string) {
    console.log(value, 'selected city');
    this.profileForm.patchValue({
        city: value
    }, { emitEvent: true });

    console.log(this.profileForm.get('city')?.value,"formcity")
}
  filterCities() {
    if (!this.profile.country) {
      this.filteredCities = [];
      return;
    }

    const selectedCountry = this.countries.find(c => c.name === this.profileForm.get('country')?.value);   


    if (selectedCountry) {
      this.filteredCities = this.cities.filter(
        city => city.countryname === selectedCountry.name
      );
      if (this.filteredCities.length > 0) {
        this.profile.city = this.filteredCities[0].name;
        
      }
      this.profileForm.patchValue({
        city: this.profile.city
    }, { emitEvent: true });
    }

  }
  
  onProfilePictureChange(event: any) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        this.selectedFile = file;
        // Create preview
        const reader = new FileReader();
        reader.onload = (e: any) => {
            this.previewUrl = e.target.result;
            // Force change detection if needed
            this.cdr.detectChanges();
        };
        reader.readAsDataURL(file);
    } else if (file) {
        this.toastr.error('Please select a valid image file', 'Invalid File');
    }
}
//skills
newSkill: number = 0;

deleteSkill(userskillId: number): void {
  console.log(userskillId);
  this.SkillService.deleteUserSkill(userskillId).subscribe({
    next: () => {
      this.freelancerskills = this.freelancerskills.filter(skill => skill.id !== userskillId);
      this.toastr.success('Skill removed successfully', 'Success');
    },
    error: (error) => {
      this.toastr.error('Error removing skill', 'Error');
      console.error('Error deleting skill:', error);
    }
  });
}

addNewSkill(): void {
  // if (this.newSkill) {
  //   this.SkillService.addUserSkill(this.newSkill).subscribe({
  //     next: (response: any) => {
  //       this.freelancerskills.push(response);
  //       this.newSkill = 0;
  //     },
  //     error: (error) => {
  //       console.error('Error adding skill:', error);
  //     }
  //   });
  // }
}


addNonRecommendedSkill(skillName: string): void {
  
  this.SkillService.CreatenonRecommendedUserSkills(skillName).subscribe({
    next: (response: nonrecommendedSkill) => {
      
      this.nonrecommendedskills.push(response);
      this.searchText = '';
      this.filterSkills();
      this.toastr.success('Custom skill added successfully', 'Success');
    },
    error: (error) => {
      console.error('Error adding non-recommended skill:', error);
      this.toastr.error('Error adding custom skill', 'Error');
      this.error = error;
    }
  });
}


password: string = '';
onSubmit() {
  if (this.profileForm.invalid) {
    this.markFormGroupTouched(this.profileForm);
    this.toastr.error('Please check all required fields', 'Form Error');
    return;
  }

  console.log(this.profileForm.get('city')?.value,"formcity")
  console.log(this.profile.city,"city")
  const selectedCity = this.cities.find(c => c.name === this.profileForm.get('city')?.value);
  console.log(selectedCity,"selectedcity")

  const profileDto: EditProfileDTO = {
    firstname: this.profileForm.get('firstname')?.value,
    lastname: this.profileForm.get('lastname')?.value,
    title:this.profileForm.get('title')?.value,
    CityId: selectedCity?.id || 0,
    UserName: this.profileForm.get('UserName')?.value,
    Description: this.profileForm.get('Description')?.value,
    DateOfBirth: new Date(this.profileForm.get('DateOfBirth')?.value),
    PhoneNumber: this.profileForm.get('PhoneNumber')?.value,
    Password: this.profileForm.get('Password')?.value,
    ConfirmPassword: this.profileForm.get('Password')?.value,
    ProfilePicture: this.selectedFile
  };

  // Age validation
  const age = this.calculateAge(profileDto.DateOfBirth);
  if (age < 18 || age > 100) {
    this.error = "Age must be between 18 and 100";
    return;
  }

  this.account.EditProfile(profileDto).subscribe({
    next: (response) => {
      console.log('Profile updated successfully');
      this.toastr.success('Profile updated successfully', 'Success');
      this.loadProfile();
      this.profileForm.get('Password')?.reset();
      this.profileForm.get('ConfirmPassword')?.reset();
    },
    error: (error) => {
      console.error('Error updating profile:', error);
      this.toastr.error(error, 'Error updating profile');
      this.error = error;
    }
  });
}

private markFormGroupTouched(formGroup: FormGroup) {
  Object.values(formGroup.controls).forEach(control => {
    control.markAsTouched();
    if (control instanceof FormGroup) {
      this.markFormGroupTouched(control);
    }
  });
}

deletenonrecommendedSkill(id:number){

this.SkillService.DeletenonRecommendedUserSkills(id).subscribe({
  next: (response: string) => {
    
    this.nonrecommendedskills = this.nonrecommendedskills.filter(skill => skill.id !== id);
    this.searchText = '';
    this.filterSkills();
    this.toastr.success('Custom skill removed successfully', 'Success');
  },
  error: (error) => {
    console.error('Error removing non-recommended skill:', error);
    this.toastr.error('Error removing custom skill', 'Error');
    this.error = error;
  }
});
}
isVerificationModalOpen = false;
verificationData: IdentityVerificationRequest = {
  fullName: '',
  nationalId: '',
  idPicture: new File([], '') 
};

openVerificationModal(): void {
  this.isVerificationModalOpen = true;
}

closeVerificationModal(): void {
  this.isVerificationModalOpen = false;
  this.verificationData = {
    fullName: '',
    nationalId: '',
    idPicture: new File([], '') 
  };
}

onIdPictureSelected(event: any): void {
  if (event.target.files && event.target.files[0]) {
    this.verificationData.idPicture = event.target.files[0];
  }
}

submitVerification(): void {
  this.account.RequestIdentityVerification(this.verificationData).subscribe({
    next: (response) => {
      // Handle success
      this.profile.nationalId="dummystring";
      this.closeVerificationModal();
      // Show success message
      this.toastr.success('Verification request submitted successfully', 'Success');
    },
    error: (error) => {
      // Handle error
      console.error('Error submitting verification:', error);
      this.toastr.error('Error submitting verification request', 'Error');
    }
  });
}

// isVerificationEmailSending: boolean = false;


ToggleAvailability()
{
  this.account.ToggleAvailability().subscribe(
    {
      next:(data)=>{console.log(data),
        this.toastr.success(
          this.profile.isAvailable ? 'You are now available for work' : 'You are now unavailable for work',
          'Status Updated'
      );
      },
      error:(err)=> {
        this.toastr.error('Error updating availability status', 'Error');
        this.error = err;
    }
    }
  )
}

// // Add this method to your class
// sendVerificationEmail(): void {
//   this.isVerificationEmailSending = true;
//   this.account.sendVerificationEmail().subscribe({
//     next: () => {
//       this.isVerificationEmailSending = false;
//       // Optional: Show success message
//     },
//     error: (error) => {
//       this.isVerificationEmailSending = false;
//       this.error = error;
//     }
//   });
// }
  private calculateAge(birthDate: Date): number {
      const today = new Date();
      const birth = new Date(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
          age--;
      }
      
      return age;
  }

  

    setActiveTab(tab: string) {
        this.activeTab = tab;
    }
    //#endregion
//#endregion

}