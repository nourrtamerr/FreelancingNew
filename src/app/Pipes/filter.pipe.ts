import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
  standalone: true
})
export class FilterPipe implements PipeTransform {

  // transform(items: any[], searchText: string, prop: string = 'name'): any[] {
  //   if (!items) return [];
  //   if (!searchText) return items;
  //   searchText = searchText.toLowerCase();
  //   return items.filter(item => {
  //     if (typeof item === 'string') {
  //       return item.toLowerCase().includes(searchText);
  //     }
  //     return item[prop]?.toString().toLowerCase().includes(searchText);
  //   });
  // }

  // transform(
  //   items: any[],
  //   searchText: string,
  //   prop: string = 'name',
  //   subListFn?: (item: any) => any[]
  // ): any[] {
  //   if (!items) return [];
  //   if (!searchText) return items;
  //   searchText = searchText.toLowerCase();

  //   return items.filter(item => {
  //     // Check main property
  //     const mainMatch = item[prop]?.toString().toLowerCase().includes(searchText);

  //     // If a subListFn is provided, check sub-items as well
  //     if (subListFn) {
  //       const subList = subListFn(item) || [];
  //       const subMatch = subList.some(
  //         (sub: any) => sub.name?.toString().toLowerCase().includes(searchText)
  //       );
  //       return mainMatch || subMatch;
  //     }

  //     return mainMatch;
  //   });
  // }

  // transform(items: any[], searchText: string, prop: string = 'name', nestedProp?: string): any[] {
  //   if (!items) return [];
  //   if (!searchText) return items;
    
  //   searchText = searchText.toLowerCase();
  //   return items.filter(item => {
  //     // Check main property
  //     const mainMatch = item[prop]?.toString().toLowerCase().includes(searchText);
      
  //     // Check nested property if provided
  //     const nestedMatch = nestedProp && 
  //                        item[nestedProp]?.some((nestedItem: any) => 
  //                          nestedItem.name?.toLowerCase().includes(searchText));
      
  //     return mainMatch || nestedMatch;
  //   });
  // }

  // transform(items: any[], searchText: string, enumRef?: any, prop?: string): any[] {
  //   if (!items) return [];
  //   if (!searchText) return items;
    
  //   searchText = searchText.toLowerCase();
  //   return items.filter(item => {
  //     // Handle enum values
  //     if (enumRef) {
  //       const enumText = enumRef[item]?.toString().toLowerCase();
  //       return enumText?.includes(searchText);
  //     }
  //     // Handle regular object properties
  //     if (prop && typeof item === 'object') {
  //       return item[prop]?.toString().toLowerCase().includes(searchText);
  //     }
  //     // Handle simple values
  //     return item?.toString().toLowerCase().includes(searchText);
  //   });
  // }

  // transform(items: any[], searchText: string,enumRef?: any, prop: string = 'name'): any[] {
  //   if (!items) return [];
  //   if (!searchText) return items;
    
  //   searchText = searchText.toLowerCase();
  //   return items.filter(item => {

  //     if (enumRef) {
  //             const enumText = enumRef[item]?.toString().toLowerCase();
  //             return enumText?.includes(searchText);
  //           }

  //     // Handle array of objects with specified property
  //     if (item && typeof item === 'object') {
  //       return item[prop]?.toString().toLowerCase().includes(searchText);
  //     }
  //     // Handle simple values
  //     return item?.toString().toLowerCase().includes(searchText);
  //   });
  // }


  transform(
    items: any[],
    searchText: string,
    enumOrProp?: any,
    propName?: string
  ): any[] {
    if (!items) return [];
    if (!searchText) return items;

    searchText = searchText.toLowerCase();

    return items.filter(item => {
      // Case 1: Enum filtering (when enumOrProp is an enum reference)
      if (enumOrProp && typeof enumOrProp === 'object' && !propName) {
        const enumValue = enumOrProp[item]?.toString().toLowerCase();
        return enumValue?.includes(searchText);
      }

      // Determine which property to use for filtering
      const property = propName || 
                      (typeof enumOrProp === 'string' ? enumOrProp : 'name');

      // Case 2: Object with specified/named property
      if (item && typeof item === 'object') {
        return item[property]?.toString().toLowerCase().includes(searchText);
      }

      // Case 3: Primitive value
      return item?.toString().toLowerCase().includes(searchText);
    });
  }

}
