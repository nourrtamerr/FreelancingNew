import { Component, OnInit } from '@angular/core';
import { FixedPriceProjectService } from '../../../Shared/Services/FixedPriceProject/fixed-price-project.service';
import { FixedPriceProject } from '../../../Shared/Interfaces/FixedPriceProject';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { Currency, ExperienceLevel } from '../../../Shared/Enums/FixedPriceProjectEnum';
import { FixedProjectFilters } from '../../../Shared/Interfaces/FixedPriceProjectFilters';

@Component({
  selector: 'app-fixed-project',
  templateUrl: './fixed-project.component.html',
  styleUrls: ['./fixed-project.component.css'],
  imports: [CommonModule, FormsModule, RouterModule],
  standalone: true,
})
export class FixedProjectComponent implements OnInit {
  projects: FixedPriceProject[] = [];
  currentPage = 1;
  totalPages = 9; 
  itemsPerPage = 4;

  filters: {
    pageNumber?: number;
    pageSize?: number;
    experienceLevels?: ExperienceLevel[];
    minProposals?: number;
    maxProposals?: number;
    categoryIds?: number[];
    subcategoryIds?: number[];
    currency?: Currency[];
    minPrice?: number;
    maxPrice?: number;
    minDuration?: number;
    maxDuration?: number;
    skillIds?: number[];
  } = {pageNumber: 1,
    pageSize: 10};

  ExperienceLevel = ExperienceLevel;
  Currency = Currency;

  // Available currencies for dropdown
  currencies = Object.values(Currency);

  // Available experience levels for checkboxes
  experienceLevels = Object.values(ExperienceLevel);

  constructor(private projectService: FixedPriceProjectService) {}

  ngOnInit(): void {
    this.loadProjects();
  }
  getExperienceLevelLabel(level: ExperienceLevel): string {
    switch (level) {
      case ExperienceLevel.Entry:
        return 'Entry Level';
      case ExperienceLevel.Intermediate:
        return 'Intermediate';
      case ExperienceLevel.Expert:
        return 'Expert';
      default:
        return level;
    }
  }

  onExperienceLevelChange(level: ExperienceLevel, checked: boolean): void {
    if (!this.filters.experienceLevels) {
      this.filters.experienceLevels = [];
    }
  
    if (checked) {
      if (!this.filters.experienceLevels.includes(level)) {
        this.filters.experienceLevels.push(level); // ✅ Prevent duplicates
      }
    } else {
      this.filters.experienceLevels = this.filters.experienceLevels.filter(
        (l) => l !== level
      );
    }
  }

  getCurrencyLabel(currency: Currency): string {
    switch (currency) {
      case Currency.USD:
        return 'US Dollar';
      case Currency.EUR:
        return 'Euro';
      case Currency.GBP:
        return 'British Pound';
      case Currency.JPY:
        return 'Japanese Yen';
      case Currency.AUD:
        return 'Australian Dollar';
      case Currency.CAD:
        return 'Canadian Dollar';
      case Currency.CHF:
        return 'Swiss Franc';
      case Currency.CNY:
        return 'Chinese Yuan';
      case Currency.SEK:
        return 'Swedish Krona';
      case Currency.NZD:
        return 'New Zealand Dollar';
      default:
        return currency;
    }
  }
  
  


  onCurrencyChange(currency: Currency, checked: boolean): void {
    if (!this.filters.currency) {
      this.filters.currency = [];
    }
  
    if (checked) {
      if (!this.filters.currency.includes(currency)) {
        this.filters.currency.push(currency); // ✅ Prevent duplicates
      }
    } else {
      this.filters.currency = this.filters.currency.filter(
        (c) => c !== currency
      );
    }
  }
  





  

  applyFilters(): void {
    const cleanedFilters = this.cleanFilters(); // ✅ Fixed function call
    this.loadProjects(cleanedFilters);
  }

  clearFilters(): void {
    this.filters = {};
    this.loadProjects();
  }

  private cleanFilters() {
    const cleanedFilters = { ...this.filters } as FixedProjectFilters;
    
    // Type-safe way to handle object keys
    (Object.keys(cleanedFilters) as Array<keyof FixedProjectFilters>).forEach((key) => {
      const value = cleanedFilters[key];
      if (
        value === null ||
        value === undefined ||
        (Array.isArray(value) && value.length === 0)
      ) {
        delete cleanedFilters[key];
      }
    });

    return cleanedFilters;
  }

  private loadProjects(filters = this.filters): void {
    this.projectService.getProjects(filters).subscribe({
      next: (data: FixedPriceProject[]) => {
        console.log('Projects received:', data);
        this.projects = data;
      },
      error: (error) => {
        console.error('Error fetching projects:', error);
      },
    });
  }

  getPageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
}
onPageChange(page: number): void {
  if (page < 1 || page > this.totalPages) {
      return;
  }
  this.currentPage = page;
  this.filters.pageNumber = page;
  this.filters.pageSize = this.itemsPerPage;
  this.loadProjects(this.filters);
}

  
}
