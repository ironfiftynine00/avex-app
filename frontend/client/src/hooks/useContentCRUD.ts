import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CacheManager, ContentType } from "@/lib/queryKeys";
import { queryClient } from "@/lib/queryClient";

interface ContentCRUDConfig {
  contentType: ContentType;
  basePath: string;
  additionalInvalidationKeys?: string[][];
  messages?: {
    createSuccess?: string;
    updateSuccess?: string;
    deleteSuccess?: string;
  };
}

/**
 * Generic hook for content CRUD operations
 * Follows the patterns established by review materials but configurable for any content type
 */
export function useContentCRUD(config: ContentCRUDConfig) {
  const { toast } = useToast();
  const cacheManager = new CacheManager(queryClient);

  const defaultMessages = {
    createSuccess: "Content created successfully",
    updateSuccess: "Content updated successfully", 
    deleteSuccess: "Content deleted successfully",
  };

  const messages = { ...defaultMessages, ...config.messages };

  // Create mutation with file upload support (following review materials pattern)
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      // Check if data contains a File object (image upload)
      const hasFile = Object.values(data).some(value => value instanceof File);
      
      if (hasFile) {
        // Create FormData for file upload
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            formData.append(key, value as string | File);
          }
        });
        
        const res = await fetch(config.basePath, {
          method: "POST",
          body: formData,
          credentials: "include"
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: `HTTP error ${res.status}` }));
          throw new Error(errorData.message || 'Failed to create content');
        }
        
        return res.json();
      } else {
        const res = await apiRequest("POST", config.basePath, data);
        return res.json();
      }
    },
    onSuccess: () => {
      cacheManager.invalidateContentQueries(config.contentType, config.additionalInvalidationKeys);
      toast({ title: "Success", description: messages.createSuccess });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Update mutation with file upload support
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      // Check if data contains a File object (image upload)
      const hasFile = Object.values(data).some(value => value instanceof File);
      
      if (hasFile) {
        // Create FormData for file upload
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            formData.append(key, value as string | File);
          }
        });
        
        const res = await fetch(`${config.basePath}/${id}`, {
          method: "PUT",
          body: formData,
          credentials: "include"
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: `HTTP error ${res.status}` }));
          throw new Error(errorData.message || 'Failed to update content');
        }
        
        return res.json();
      } else {
        const res = await apiRequest("PUT", `${config.basePath}/${id}`, data);
        return res.json();
      }
    },
    onSuccess: () => {
      cacheManager.invalidateContentQueries(config.contentType, config.additionalInvalidationKeys);
      toast({ title: "Success", description: messages.updateSuccess });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `${config.basePath}/${id}`);
    },
    onSuccess: () => {
      cacheManager.invalidateContentQueries(config.contentType, config.additionalInvalidationKeys);
      toast({ title: "Success", description: messages.deleteSuccess });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Bulk import mutation
  const bulkImportMutation = useMutation({
    mutationFn: async ({ targetId, contents, bulkImportPath }: { 
      targetId: number; 
      contents: any[]; 
      bulkImportPath: string;
    }) => {
      const res = await apiRequest("POST", bulkImportPath, { 
        [config.contentType === "reviewMaterial" ? "subtopicId" : "stationId"]: targetId,
        [config.contentType === "reviewMaterial" ? "reviewMaterials" : "contents"]: contents
      });
      return res.json();
    },
    onSuccess: (result) => {
      cacheManager.invalidateContentQueries(config.contentType, config.additionalInvalidationKeys);
      const count = result?.length || 0;
      toast({ 
        title: "Success", 
        description: `Successfully imported ${count} content items` 
      });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    bulkImportMutation,
  };
}