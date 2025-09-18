/**
 * Centralized query key management for consistent cache invalidation
 * 
 * This module provides standardized query keys for different content types
 * to ensure cache invalidation works correctly across the application.
 */

export const queryKeys = {
  // Review Material (Infographics) queries
  reviewMaterials: {
    all: () => ["/api/infographics"] as const,
    bySubtopic: () => ["/api/infographics/subtopic"] as const,
    byCategory: () => ["/api/infographics/category"] as const,
    // Additional keys for comprehensive invalidation
    review: () => ["/api/review"] as const,
  },

  // Practical Station Content queries
  practicalStations: {
    all: () => ["/api/practical-stations"] as const,
    byId: (stationId: number) => ["/api/practical-stations", stationId] as const,
    content: (stationId: number) => ["/api/practical-stations", stationId, "content"] as const,
  },

  // Categories and Subtopics
  categories: {
    all: () => ["/api/categories"] as const,
  },

  subtopics: {
    all: () => ["/api/subtopics/all"] as const,
    byCategory: (categoryId: number) => ["/api/subtopics", categoryId] as const,
  },

  // Questions
  questions: {
    all: () => ["/api/questions/all"] as const,
  },
} as const;

/**
 * Content type configurations for different content management systems
 */
export type ContentType = "reviewMaterial" | "practicalContent";

export interface ContentConfig {
  // API endpoints
  basePath: string;
  bulkImportPath: string;
  
  // Query keys for cache invalidation
  queryKeys: string[][];
  
  // Content parsing
  parseFormat: (input: string) => any[];
  
  // Form field configurations
  fields: {
    selector: {
      label: string;
      placeholder: string;
      options: { value: string; label: string }[];
    };
    textarea: {
      label: string;
      placeholder: string;
    };
  };
  
  // Success messages
  messages: {
    createSuccess: string;
    updateSuccess: string;
    deleteSuccess: string;
    bulkImportSuccess: string;
  };
}

/**
 * Cache invalidation helper for content operations
 */
export class CacheManager {
  constructor(private queryClient: any) {}

  /**
   * Invalidate all queries for a specific content type
   */
  invalidateContentQueries(contentType: ContentType, additionalKeys?: string[][]) {
    const baseKeys = this.getBaseQueryKeys(contentType);
    
    // Invalidate base keys
    baseKeys.forEach(key => {
      this.queryClient.invalidateQueries({ queryKey: key, refetchType: 'all' });
    });

    // Invalidate additional keys if provided
    additionalKeys?.forEach(key => {
      this.queryClient.invalidateQueries({ queryKey: key, refetchType: 'all' });
    });
  }

  /**
   * Get base query keys for a content type
   */
  private getBaseQueryKeys(contentType: ContentType): string[][] {
    switch (contentType) {
      case "reviewMaterial":
        return [
          [...queryKeys.reviewMaterials.all()],
          [...queryKeys.reviewMaterials.bySubtopic()],
          [...queryKeys.reviewMaterials.byCategory()],
          [...queryKeys.reviewMaterials.review()],
        ];
      
      case "practicalContent":
        return [
          [...queryKeys.practicalStations.all()],
          // Invalidate all station content queries by using partial key match
          ["/api/practical-stations"], // This will match all station-related queries
        ];
      
      default:
        return [];
    }
  }

  /**
   * Invalidate specific practical station content
   */
  invalidatePracticalStationContent(stationId: number) {
    this.queryClient.invalidateQueries({ 
      queryKey: queryKeys.practicalStations.content(stationId), 
      refetchType: 'all' 
    });
  }
}