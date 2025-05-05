import { Country } from './../../../Shared/Interfaces/Country';
import { AfterViewChecked, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CategoryService } from '../../../Shared/Services/Category/category.service';
import { CitiesService } from '../../../Shared/Services/Cities/cities.service';
import { SubCategoryService } from '../../../Shared/Services/SubCategory/sub-category.service';
import { City } from '../../../Shared/Interfaces/City';
import { CreateCategoryDTO } from '../../../Shared/Interfaces/CreateCategor';
import { UpdateCategory } from '../../../Shared/Interfaces/UpdateCategory';
import { CreateSubCategoryDTO } from '../../../Shared/Interfaces/Subcategory';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { CountriesService } from '../../../Shared/Services/Countries/countries.service';
import { Skill, skillcreatedto } from '../../../Shared/Interfaces/Skill';
import { SkillService } from '../../../Shared/Services/Skill/skill.service';


@Component({
  selector: 'app-admin-data-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './admin-data-management.component.html',
  styleUrls: ['./admin-data-management.component.css']
})
export class AdminDataManagementComponent implements OnInit , AfterViewChecked {

  // Data arrays
  categories: any[] = [];
  cities: City[] = [];
  subCategories: any[] = [];
  countries:Country[] = [];
  skills:Skill[]=[];
  // Form models
  newCategory: CreateCategoryDTO = { name: '', isDeleted: false };
  updateCategoryModel: UpdateCategory = { id: 0, name: '' , isDeleted: false };
  
  newSkill:skillcreatedto ={name:''}
  updateSkillModel:skillcreatedto ={id:0,name:''}


  newSubCategory: CreateSubCategoryDTO = { name: '', categoryId: 0 };
  updateSubCategoryModel: any = { id: 0, name: '', categoryId: 0 };
  
  
  newCountry: any = { name: '' };
  updateCountryModel: any = { id: 0, name: '' };

  newCity: any = { name: '' };
  updateCityModel: any = { id: 0, name: '' };

  // UI state
  activeTab: string = 'categories';
  selectedCategory: any = null;
  selectedCity: any = null;
  selectedCountry: any = null;
  selectedSubCategory: any = null;
  selectedSkill: any=null;
  showAddCategoryModal: boolean = false;
  showUpdateCategoryModal: boolean = false;
  showDeleteCategoryModal: boolean = false;
  showAddCityModal: boolean = false;
  showUpdateCityModal: boolean = false;
  showDeleteCityModal: boolean = false;
  showAddSubCategoryModal: boolean = false;
  showUpdateSubCategoryModal: boolean = false;
  showDeleteSubCategoryModal: boolean = false;
  showAddSkillModal: boolean = false;
  showUpdateSkillModal: boolean = false;
  showDeleteSkillModal: boolean = false;
  showAddCountryModal: boolean = false;
  showUpdateCountryModal: boolean = false;
  showDeleteCountryModal: boolean = false;
  constructor(
    private categoryService: CategoryService,
    private citiesService: CitiesService,
    private subCategoryService: SubCategoryService,
    private httpClient: HttpClient,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService,
    private countriesService: CountriesService ,
    private skillService:SkillService
  ) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  ngAfterViewChecked(): void {
    console.log('Change detection triggered', {
      showAddCategoryModal: this.showAddCategoryModal,
      showUpdateCategoryModal: this.showUpdateCategoryModal,
    });
  }
  loadAllData(): void {
    this.loadCategories();
    this.loadCities();
    this.loadSubCategories();
    this.loadCountries();
    this.loadSkills();
  }

  toggleModal(modalName: string, state: boolean): void {
    // Close all modals first if opening a modal
    if (state) {
      this.closeAllModals();
    }

    // Set the specific modal state
    switch (modalName) {
      case 'addCategory':
        this.showAddCategoryModal = state;
        break;
      case 'updateCategory':
        this.showUpdateCategoryModal = state;
        break;
      case 'deleteCategory':
        this.showDeleteCategoryModal = state;
        break;
        case 'addSkill':
        this.showAddSkillModal = state;
        break;
      case 'updateSkill':
        this.showUpdateSkillModal = state;
        break;
      case 'deleteSkill':
        this.showDeleteSkillModal = state;
        break;
      case 'addCity':
        this.showAddCityModal = state;
        break;
      case 'updateCity':
        this.showUpdateCityModal = state;
        break;
      case 'deleteCity':
        this.showDeleteCityModal = state;
        break;
      case 'addSubCategory':
        this.showAddSubCategoryModal = state;
        break;
      case 'updateSubCategory':
        this.showUpdateSubCategoryModal = state;
        break;
      case 'deleteSubCategory':
        this.showDeleteSubCategoryModal = state;
        break;
      case 'addCountry':
        this.showAddCountryModal = state;
        break;
      case 'updateCountry':
        this.showUpdateCountryModal = state;
        break;
      case 'deleteCountry':
        this.showDeleteCountryModal = state;
        break;
    }

  
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  
  // Category CRUD operations
  loadCategories(): void {
    this.categoryService.GetAllCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      }
    });
  }
  loadSkills(): void {
    this.skillService.getSkills().subscribe({
      next: (data) => {
        this.skills = data;
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      }
    });
  }

  addSkill(): void {
    if (!this.newSkill.name.trim()) {
      this.toastr.error('Skill name is required');
      return;
    }
  
    this.skillService.addSkill(this.newSkill).subscribe({
      next: () => {

        this.loadSkills();
        this.toggleModal('addSkill', false);
        this.newSkill = { name: '' };
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error adding Skill:', err);
        alert('Failed to add Skill: ' + (err.message || 'Unknown error'));
      },
      complete: () => {
        this.toastr.success('Add Skill operation completed');
      },
    });
  }
  selectSkillForUpdate(skill: any): void {
    this.selectedSkill = skill;
    this.updateSkillModel = { id: skill.id, name: skill.name};
    this.toggleModal('updateSkill', true);
  }


  updateSkill(): void {
    console.log(this.updateSkillModel);
    this.skillService.updateSkill(this.updateSkillModel.id!,this.updateSkillModel).subscribe({
      next: () => {
        this.loadSkills();
        this.toggleModal('updateSkill', false);
        this.selectedSkill = null;
        this.toastr.success('Skill updated successfully');
      },
      error: (err) => {
        console.error('Error updating Skill:', err);
        alert('Failed to update Skill: ' + (err.message || 'Unknown error'));
      }
    });
  }

  selectSkillForDelete(skill: any): void {
    this.selectedSkill = skill;
    this.toggleModal('deleteSkill', true);
  }


  deleteSkill(): void {
    console.log('Deleting skill with ID:', this.selectedSkill.id);
    this.skillService.deleteSkill(this.selectedSkill.id).subscribe({
      next: (response) => {

        this.toggleModal('deleteskillselectedSkill', false);
        this.selectedSkill = null;
        this.showDeleteSkillModal=false;
        this.loadSkills();
        this.cdr.detectChanges(); // Force change detection
        this.closeAllModals();
      },
      error: (err) => {
        console.error('Error deleting skillselectedSkill:', err);
      },
      complete: () => { 
        this.toastr.success('skillselectedSkill deleted successfully');
      },
    });
  }

  selectCategoryForUpdate(category: any): void {
    this.selectedCategory = category;
    this.updateCategoryModel = { id: category.id, name: category.name, isDeleted: category.isDeleted ?? false};
    this.toggleModal('updateCategory', true);
  }




  addCategory(): void {
    if (!this.newCategory.name.trim()) {
      this.toastr.error('Category name is required');
      return;
    }
  
    this.categoryService.CreateCategory(this.newCategory).subscribe({
      next: () => {

        this.loadCategories();
        this.toggleModal('addCategory', false);
        this.newCategory = { name: '', isDeleted: false };
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error adding category:', err);
        alert('Failed to add category: ' + (err.message || 'Unknown error'));
      },
      complete: () => {
        this.toastr.success('Add category operation completed');
      },
    });
  }

  updateCategory(): void {
    this.categoryService.updateCategory(this.updateCategoryModel).subscribe({
      next: () => {
        this.loadCategories();
        this.toggleModal('updateCategory', false);
        this.selectedCategory = null;
        this.toastr.success('Category updated successfully');
      },
      error: (err) => {
        console.error('Error updating category:', err);
        alert('Failed to update category: ' + (err.message || 'Unknown error'));
      }
    });
  }

  selectCategoryForDelete(category: any): void {
    this.selectedCategory = category;
    this.toggleModal('deleteCategory', true);
  }


  deleteCategory(): void {
    console.log('Deleting category with ID:', this.selectedCategory.id);
    this.categoryService.deleteCategory(this.selectedCategory.id).subscribe({
      next: (response) => {

        this.toggleModal('deleteCategory', false);
        this.selectedCategory = null;
        this.loadCategories();
        this.cdr.detectChanges(); // Force change detection
      },
      error: (err) => {
        console.error('Error deleting category:', err);
      },
      complete: () => { 
        this.toastr.success('Category deleted successfully');
      },
    });
  }

  // Cities CRUD operations
  loadCities(): void {
    this.citiesService.getCitiess().subscribe({
      next: (data) => {
        this.cities = data;
        console.log(data,'mycitiesss');
      },
      error: (err) => {
        console.error('Error loading cities:', err);
      }
    });
  }

  loadCountries(): void {
    this.countriesService.getCountries().subscribe({
      next: (data) => {
        this.countries = data;
        // console.log(this.countries,'countrieeeeeeeeeeeeeeeeeeeeeeeeeeeees')
        this.loadCities();
      },
      error: (err) => {
        console.error('Error loading countries:', err);
      }
    });
  }
  // SubCategory CRUD operations
  loadSubCategories(): void {
    this.subCategoryService.getAllSubcategories().subscribe({
      next: (data) => {
        this.subCategories = data;
      },
      error: (err) => {
        console.error('Error loading subcategories:', err);
      }
    });
  }

  addSubCategory(): void {
    this.subCategoryService.createSubcategory(this.newSubCategory).subscribe({
      next: () => {
        this.loadSubCategories();
        this.toggleModal('addSubCategory', false);
        this.newSubCategory = { name: '', categoryId: 0 };
        this.toastr.success('Subcategory added successfully');
      },
      error: (err) => {
        alert('Failed to add subcategory: ' + (err.message || 'Unknown error'));
      }
    });
  }

  selectSubCategoryForUpdate(subCategory: any): void {
    this.selectedSubCategory = subCategory;
    this.updateSubCategoryModel = { 
      id: subCategory.id, 
      name: subCategory.name,
      categoryId: subCategory.categoryId
    };
    this.toggleModal('updateSubCategory', true);
  }

  updateSubCategory(): void {
    this.subCategoryService.updateSubCategory(
      this.updateSubCategoryModel.id, 
      this.updateSubCategoryModel
    ).subscribe({
      next: () => {
        this.loadSubCategories();
        this.toggleModal('updateSubCategory', false);
        this.selectedSubCategory = null;
        this.toastr.success('Subcategory updated successfully');
      },
      error: (err) => {
        console.error('Error updating subcategory:', err);
        alert('Failed to update subcategory: ' + (err.message || 'Unknown error'));
      }
    });
  }

  deleteSubCategory(): void {
    // Using the subcategory service's API URL
    const apiUrl = this.subCategoryService['apiUrl'];
    
    this.httpClient.delete(`${apiUrl}/${this.selectedSubCategory.id}`).subscribe({
      next: () => {
        this.loadSubCategories();
        this.toggleModal('deleteSubCategory', false);
        this.toastr.success('Subcategory deleted successfully');
        this.selectedSubCategory = null;
      },
      error: (err) => {
        console.error('Error deleting subcategory:', err);
        alert('Failed to delete subcategory: ' + (err.message || 'Unknown error'));
      }
    });
  }
  selectSubCategoryForDelete(subCategory: any): void {
    this.selectedSubCategory = subCategory;
    this.toggleModal('deleteSubCategory', true);
  }

  // Modal management
  openAddSkillModal(): void {
    this.newSkill = { name: '' };
    this.toggleModal('addSkill', true);
  }
  openAddCategoryModal(): void {
    this.newCategory = { name: '', isDeleted: false };
    this.toggleModal('addCategory', true);
  }

  openAddCityModal(): void {
    this.newCity = { name: '' };
    this.toggleModal('addCity', true);
  }

  openAddSubCategoryModal(): void {
    this.newSubCategory = { name: '', categoryId: 0 };
    this.toggleModal('addSubCategory', true);
  }

  openAddCountryModal(){
    this.newCountry = { name: '' };
    this.toggleModal('addCountry', true);
  }
  openUpdateCountryModal(country: any): void {
    this.selectedCountry = country;
    this.updateCountryModel = { id: country.id, name: country.name };
    this.toggleModal('updateCountry', true);
  }
  openUpdateCityModal(city: any): void {
    this.selectedCity = city;
    this.updateCityModel = { id: city.id, name: city.name };
    this.toggleModal('updateCity', true);
  }

  openUpdateSkillModal(skill: any): void {
    this.selectedSkill = skill;
    this.updateSkillModel = { id: skill.id, name: skill.name };
    this.toggleModal('updateSkill', true);
  }

  closeAllModals(): void {
    this.showAddCategoryModal = false;
    this.showUpdateCategoryModal = false;
    this.showDeleteCategoryModal = false;
    this.showAddCityModal = false;
    this.showUpdateCityModal = false;
    this.showDeleteCityModal = false;
    this.showAddSubCategoryModal = false;
    this.showUpdateSubCategoryModal = false;
    this.showDeleteSubCategoryModal = false;
    this.showAddSkillModal = false;
    this.showUpdateSkillModal = false;
    this.showDeleteSkillModal = false;
    this.showAddCountryModal = false;
    this.showUpdateCountryModal = false;
    this.showDeleteCountryModal = false;
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    console.log(this.countries,'countrieeeeeeeeeeeeeeeeeeees')
    return category ? category.name : 'Unknown';
  }

  getCountryName(countryId: number): string {
    
    const country = this.countries.find(c => c.id === countryId);
    return country ? country.name : 'Unknown';
  }
  
  selectCityForUpdate(city: any): void {
    this.selectedCity = city;
    this.updateCityModel = { id: city.id, name: city.name };
    this.toggleModal('updateCity', true);
  }
  
  
  selectCountryForUpdate(Country: any): void {
    
    this.selectedCountry = Country;
    this.updateCountryModel = { id: Country.id, name: Country.name };
    this.toggleModal('updateCountry', true);
  }
    
    addCity(): void {

  
      if (!this.newCity.name.trim()) {
        this.toastr.error('City name is required');
        return;
      }
    
      this.citiesService.addCity(this.newCity).subscribe({
        next: () => {
          this.loadCities();
          this.toggleModal('addCity', false);
          this.newCity = { name: '' };
          this.toastr.success('City added successfully');
        },
        error: (err) => {
          console.error('Error adding city:', err);
          alert('Failed to add city: ' + (err.message || 'Unknown error'));
        }
      });
    }


updateCity(): void {
    if (!this.updateCityModel.name.trim()) {
      this.toastr.error('City name is required');
      return;
    }

    if (!this.updateCityModel.countryId || this.updateCityModel.countryId <= 0) {
      this.toastr.error('A valid parent country is required');
      return;
    }

    console.log('Updating city:', this.updateCityModel);
    this.citiesService.updateCity(this.updateCityModel.id, this.updateCityModel).subscribe({
      next: (response) => {
        console.log('City updated successfully:', response);
        this.loadCities();
        this.toggleModal('updateCity', false);
        this.selectedCity = null;
        this.updateCityModel = { id: 0, name: '', countryId: 0 };
        this.toastr.success('City updated successfully');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error updating city:', err);
        const errorMessage = err.error?.Message || err.message || 'Unknown error';
        this.toastr.error(`Failed to update city: ${errorMessage}`);
      },
      complete: () => {
        console.log('Update city operation completed');
      },
    });
  }

  selectCityForDelete(city: any): void {
    this.selectedCity = city;
    this.toggleModal('deleteCity', true);
  }



  selectCountryForDelete(country: any): void {
    this.selectedCountry = country;
    this.toggleModal('deleteCountry', true);
  }
  deleteCity(): void {
    this.citiesService.deleteCity(this.selectedCity.id).subscribe({
      next: () => {
        this.loadCities();
        this.toggleModal('deleteCity', false);
        this.selectedCity = null;
        this.toastr.success('City deleted successfully');
      },
      error: (err) => {
        console.error('Error deleting city:', err);
      }
    });
  
  }

 
  addCountry(){  
    if (!this.newCountry.name.trim()) {
      this.toastr.error('Country name is required');
      return;
    }
  
    this.countriesService.AddCountry(this.newCountry).subscribe({
      next: () => {
        this.loadCountries();
        this.toggleModal('addCountry', false);
        this.newCountry = { name: '' };
        this.toastr.success('Country added successfully');
      },
      error: (err) => {
        console.error('Error adding country:', err);
        alert('Failed to add country: ' + (err.message || 'Unknown error'));
      }
    });

  }
  updateCountry(){
    this.countriesService.updateCountry(this.updateCountryModel).subscribe({
      next: () => {
        this.loadCountries();
        this.toggleModal('updateCountry', false);
        this.selectedCountry = null;
        this.toastr.success('Country updated successfully');
      },
      error: (err) => {
        console.error('Error updating country:', err);
        alert('Failed to update country: ' + (err.message || 'Unknown error'));
      }
    });
  }

  deleteCountry(): void {
    this.countriesService.deleteCountry(this.selectedCountry.id).subscribe({
      next: () => {
        this.loadCountries();
        this.toggleModal('deleteCountry', false);
        this.selectedCountry = null;
        this.toastr.success('Country deleted successfully');
      },
      error: (err) => {
        console.error('Error deleting country:', err);
      }
    });
  }

} 