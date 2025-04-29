
import { Currency ,ExperienceLevel } from '../Enums/FixedPriceProjectEnum';

export interface FixedProjectFilters {
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
  }