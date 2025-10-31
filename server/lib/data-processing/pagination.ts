
export interface PaginationOptions {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalRecords: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class PaginationEngine {
  static paginate<T>(
    data: T[],
    options: PaginationOptions
  ): PaginatedResult<T> {
    const { page, pageSize, sortBy, sortOrder = 'asc' } = options;
    
    // Sort data if specified
    let sortedData = [...data];
    if (sortBy) {
      sortedData.sort((a: any, b: any) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        
        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    // Calculate pagination
    const totalRecords = sortedData.length;
    const totalPages = Math.ceil(totalRecords / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    // Get page data
    const pageData = sortedData.slice(startIndex, endIndex);
    
    return {
      data: pageData,
      pagination: {
        page,
        pageSize,
        totalPages,
        totalRecords,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }
}
