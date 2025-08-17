import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import TopNav from "@/components/navigation/top-nav";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ErrorBoundary } from "@/components/error-boundary";
import { 
  Folder, 
  Plus, 
  Edit, 
  Trash2, 
  HelpCircle,
  Upload,
  Link as LinkIcon,
  Image,
  Shield,
  Save,
  X,
  ArrowLeft,
  Download,
  FileSpreadsheet
} from "lucide-react";

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  question_count: number;
}

interface Subtopic {
  id: number;
  name: string;
  description: string;
  slug: string;
  createdAt: string;
}

interface Question {
  id: number;
  categoryId: number;
  subtopicId?: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string;
  imageUrl?: string;
}

export default function ContentManager() {
  const { user, isLoading: userLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("categories");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [imageUploadType, setImageUploadType] = useState<"file" | "url">("url");
  
  // Bulk import state
  const [selectedCategoryForSubtopics, setSelectedCategoryForSubtopics] = useState<string>("");
  const [selectedCategoryForQuestions, setSelectedCategoryForQuestions] = useState<string>("");
  const [selectedSubtopicForQuestions, setSelectedSubtopicForQuestions] = useState<string>("");
  const [subtopicsInput, setSubtopicsInput] = useState<string>("");
  const [questionsInput, setQuestionsInput] = useState<string>("");
  const [inputFormat, setInputFormat] = useState<'simple' | 'json'>('simple');
  
  // Review materials bulk import state
  const [selectedCategoryForReviewMaterials, setSelectedCategoryForReviewMaterials] = useState<string>("");
  const [selectedSubtopicForReviewMaterials, setSelectedSubtopicForReviewMaterials] = useState<string>("");
  const [reviewMaterialsInput, setReviewMaterialsInput] = useState<string>("");
  
  // Multi-select state for category-subtopic relationships
  const [selectedSubtopicsForCategory, setSelectedSubtopicsForCategory] = useState<number[]>([]);
  const [selectedCategoriesForSubtopic, setSelectedCategoriesForSubtopic] = useState<number[]>([]);
  
  // Form state for questions (to handle Select components properly)
  const [formValues, setFormValues] = useState<any>({
    subtopicId: '',
    correctAnswer: '',
  });

  // Sync form values when editing item changes
  useEffect(() => {
    if (editingItem && activeTab === "questions") {
      setFormValues({
        subtopicId: editingItem.subtopicId?.toString() || '',
        correctAnswer: editingItem.correctAnswer || '',
      });
    } else if (!editingItem) {
      setFormValues({
        subtopicId: '',
        correctAnswer: '',
      });
    }
  }, [editingItem, activeTab]);
  
  // Subtopic management states
  const [subtopicManageDialogOpen, setSubtopicManageDialogOpen] = useState(false);
  const [categoryForSubtopicManagement, setCategoryForSubtopicManagement] = useState<Category | null>(null);
  const [linkedSubtopicsForCategory, setLinkedSubtopicsForCategory] = useState<number[]>([]);
  
  // Subtopic questions management
  const [selectedSubtopicForQuestionView, setSelectedSubtopicForQuestionView] = useState<Subtopic | null>(null);
  const [showSubtopicQuestions, setShowSubtopicQuestions] = useState(false);

  // Query for categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/categories"],
  });

  // Query for subtopics
  const { data: subtopics = [], isLoading: subtopicsLoading } = useQuery({
    queryKey: ["/api/subtopics/all"],
  });

  // Query for questions
  const { data: questions = [], isLoading: questionsLoading } = useQuery({
    queryKey: ["/api/questions/all"],
  });

  // Query for infographics
  const { data: infographics = [], isLoading: infographicsLoading } = useQuery({
    queryKey: ["/api/infographics"],
  });

  // Query for linked subtopics when managing a category
  const { data: categorySubtopics = [] } = useQuery({
    queryKey: [`/api/categories/${categoryForSubtopicManagement?.id}/subtopics`],
    enabled: !!categoryForSubtopicManagement,
  });

  // Query for questions by subtopic
  const { data: subtopicQuestions = [], isLoading: subtopicQuestionsLoading } = useQuery({
    queryKey: [`/api/questions/subtopic/${selectedSubtopicForQuestionView?.id}`],
    enabled: !!selectedSubtopicForQuestionView,
  });

  // Query for all category-subtopic relationships
  const { data: allCategorySubtopics = [] } = useQuery({
    queryKey: ["/api/category-subtopics/all"],
  });

  // Category mutations
  const createCategoryMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/admin/categories", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setIsDialogOpen(false);
      setEditingItem(null);
      toast({ title: "Success", description: "Category created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PUT", `/api/admin/categories/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setIsDialogOpen(false);
      setEditingItem(null);
      toast({ title: "Success", description: "Category updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "Success", description: "Category deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Subtopic mutations
  const createSubtopicMutation = useMutation({
    mutationFn: async (data: any) => {
      // Generate slug from name if not provided
      const subtopicData = {
        ...data,
        slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      };
      const res = await apiRequest("POST", "/api/admin/subtopics", subtopicData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subtopics/all"] });
      setIsDialogOpen(false);
      setEditingItem(null);
      toast({ title: "Success", description: "Subtopic created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateSubtopicMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PUT", `/api/admin/subtopics/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subtopics/all"] });
      setIsDialogOpen(false);
      setEditingItem(null);
      toast({ title: "Success", description: "Subtopic updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteSubtopicMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/subtopics/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subtopics/all"] });
      toast({ title: "Success", description: "Subtopic deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Infographic mutations
  const createInfographicMutation = useMutation({
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
        
        const res = await fetch("/api/admin/infographics", {
          method: "POST",
          body: formData,
          credentials: "include"
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: `HTTP error ${res.status}` }));
          throw new Error(errorData.message || 'Failed to create review material');
        }
        
        return res.json();
      } else {
        const res = await apiRequest("POST", "/api/admin/infographics", data);
        return res.json();
      }
    },
    onSuccess: () => {
      // Invalidate all infographic-related queries to ensure new materials appear in study mode
      queryClient.invalidateQueries({ queryKey: ["/api/infographics"] });
      queryClient.invalidateQueries({ queryKey: ['/api/infographics/subtopic'] });
      queryClient.invalidateQueries({ queryKey: ['/api/infographics/category'] });
      setIsDialogOpen(false);
      setEditingItem(null);
      toast({ title: "Success", description: "Review material created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateInfographicMutation = useMutation({
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
        
        const res = await fetch(`/api/admin/infographics/${id}`, {
          method: "PUT",
          body: formData,
          credentials: "include"
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: `HTTP error ${res.status}` }));
          throw new Error(errorData.message || 'Failed to update review material');
        }
        
        return res.json();
      } else {
        const res = await apiRequest("PUT", `/api/admin/infographics/${id}`, data);
        return res.json();
      }
    },
    onSuccess: () => {
      // Invalidate all infographic-related queries to ensure updated materials sync with study mode
      queryClient.invalidateQueries({ queryKey: ["/api/infographics"] });
      queryClient.invalidateQueries({ queryKey: ['/api/infographics/subtopic'] });
      queryClient.invalidateQueries({ queryKey: ['/api/infographics/category'] });
      setIsDialogOpen(false);
      setEditingItem(null);
      toast({ title: "Success", description: "Review material updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteInfographicMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/infographics/${id}`);
    },
    onSuccess: () => {
      // Invalidate all infographic-related queries to ensure deleted materials don't appear in study mode
      queryClient.invalidateQueries({ queryKey: ["/api/infographics"] });
      // Invalidate subtopic-specific and category-specific infographic queries used by study mode
      queryClient.invalidateQueries({ queryKey: ['/api/infographics/subtopic'] });
      queryClient.invalidateQueries({ queryKey: ['/api/infographics/category'] });
      // Invalidate any cached queries that might display review materials
      queryClient.invalidateQueries({ queryKey: ['/api/review'] });
      toast({ title: "Success", description: "Review material deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Question mutations
  const createQuestionMutation = useMutation({
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
        
        const res = await fetch("/api/admin/questions", {
          method: "POST",
          body: formData,
          credentials: "include"
        });
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        return res;
      } else {
        // Regular JSON request
        const res = await apiRequest("POST", "/api/admin/questions", data);
        return res;
      }
    },
    onSuccess: () => {
      // Invalidate all question-related queries
      queryClient.invalidateQueries({ queryKey: ["/api/questions/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      
      // Invalidate subtopic-specific questions if we're viewing a subtopic
      if (selectedSubtopicForQuestionView) {
        queryClient.invalidateQueries({ queryKey: [`/api/questions/subtopic/${selectedSubtopicForQuestionView.id}`] });
      }
      
      // Invalidate all subtopic and category queries to be thorough
      queryClient.invalidateQueries({ queryKey: ["/api/questions/subtopic"] });
      queryClient.invalidateQueries({ queryKey: ["/api/questions/category"] });
      
      setIsDialogOpen(false);
      setEditingItem(null);
      toast({ title: "Success", description: "Question created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateQuestionMutation = useMutation({
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
        
        const res = await fetch(`/api/admin/questions/${id}`, {
          method: "PUT",
          body: formData,
          credentials: "include"
        });
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        return res;
      } else {
        // Regular JSON request
        const res = await apiRequest("PUT", `/api/admin/questions/${id}`, data);
        return res;
      }
    },
    onSuccess: () => {
      // Invalidate all question-related queries
      queryClient.invalidateQueries({ queryKey: ["/api/questions/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      
      // Invalidate subtopic-specific questions if we're viewing a subtopic
      if (selectedSubtopicForQuestionView) {
        queryClient.invalidateQueries({ queryKey: [`/api/questions/subtopic/${selectedSubtopicForQuestionView.id}`] });
      }
      
      // Invalidate all subtopic queries to be thorough
      queryClient.invalidateQueries({ queryKey: ["/api/questions/subtopic"] });
      
      // Invalidate category-specific questions as well
      queryClient.invalidateQueries({ queryKey: ["/api/questions/category"] });
      
      setIsDialogOpen(false);
      setEditingItem(null);
      toast({ title: "Success", description: "Question updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/questions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questions/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      // Invalidate subtopic-specific questions if we're viewing a subtopic
      if (selectedSubtopicForQuestionView) {
        queryClient.invalidateQueries({ queryKey: [`/api/questions/subtopic/${selectedSubtopicForQuestionView.id}`] });
      }
      toast({ title: "Success", description: "Question deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Category-Subtopic relationship mutations
  const bulkLinkSubtopicsMutation = useMutation({
    mutationFn: async (data: { categoryId: number; subtopicIds: number[] }) => {
      const res = await apiRequest("POST", `/api/admin/categories/${data.categoryId}/subtopics/bulk-link`, {
        subtopicIds: data.subtopicIds
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subtopics/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "Success", description: "Subtopics linked to category successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Individual subtopic link/unlink mutations for category management
  const linkSubtopicMutation = useMutation({
    mutationFn: async (data: { categoryId: number; subtopicId: number }) => {
      const res = await apiRequest("POST", `/api/admin/categories/${data.categoryId}/subtopics/${data.subtopicId}/link`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/categories/${categoryForSubtopicManagement?.id}/subtopics`] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "Success", description: "Subtopic linked successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const unlinkSubtopicMutation = useMutation({
    mutationFn: async (data: { categoryId: number; subtopicId: number }) => {
      const res = await apiRequest("DELETE", `/api/admin/categories/${data.categoryId}/subtopics/${data.subtopicId}/unlink`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/categories/${categoryForSubtopicManagement?.id}/subtopics`] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "Success", description: "Subtopic unlinked successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Bulk import mutations
  const bulkImportSubtopicsMutation = useMutation({
    mutationFn: async (data: { categoryId: number; subtopics: string[] }) => {
      const res = await apiRequest("POST", "/api/admin/subtopics/bulk", data);
      return res.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["/api/subtopics/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setSubtopicsInput("");
      setSelectedCategoryForSubtopics("");
      toast({ 
        title: "Success", 
        description: `Successfully imported ${result.created} subtopics${result.skipped > 0 ? `, skipped ${result.skipped} duplicates` : ''}` 
      });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const bulkImportQuestionsMutation = useMutation({
    mutationFn: async (data: { subtopicId: number; questions: any[] }) => {
      const res = await apiRequest("POST", "/api/admin/questions/bulk", data);
      return res.json();
    },
    onSuccess: (result) => {
      // Invalidate all question-related queries
      queryClient.invalidateQueries({ queryKey: ["/api/questions/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      
      // Invalidate subtopic-specific questions if we're viewing a subtopic
      if (selectedSubtopicForQuestionView) {
        queryClient.invalidateQueries({ queryKey: [`/api/questions/subtopic/${selectedSubtopicForQuestionView.id}`] });
      }
      
      // Invalidate all subtopic and category queries to be thorough
      queryClient.invalidateQueries({ queryKey: ["/api/questions/subtopic"] });
      queryClient.invalidateQueries({ queryKey: ["/api/questions/category"] });
      
      setQuestionsInput("");
      setSelectedSubtopicForQuestions("");
      toast({ 
        title: "Success", 
        description: `Successfully imported ${result.created} questions${result.failed > 0 ? `, failed ${result.failed}` : ''}` 
      });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const bulkImportReviewMaterialsMutation = useMutation({
    mutationFn: async (data: { subtopicId: number; reviewMaterials: any[] }) => {
      const res = await apiRequest("POST", "/api/admin/review-materials/bulk", data);
      return res.json();
    },
    onSuccess: (result) => {
      // Invalidate all infographic-related queries to ensure new bulk imported materials appear in study mode
      queryClient.invalidateQueries({ queryKey: ["/api/infographics"] });
      queryClient.invalidateQueries({ queryKey: ['/api/infographics/subtopic'] });
      queryClient.invalidateQueries({ queryKey: ['/api/infographics/category'] });
      setReviewMaterialsInput("");
      setSelectedSubtopicForReviewMaterials("");
      toast({ 
        title: "Success", 
        description: `Successfully imported ${result.materials?.length || 0} review materials across ${result.categoriesCount || 0} categories` 
      });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleBulkImportSubtopics = () => {
    if (!selectedCategoryForSubtopics || !subtopicsInput.trim()) {
      toast({
        title: "Validation Error",
        description: "Please select a category and enter subtopics",
        variant: "destructive"
      });
      return;
    }

    const subtopicLines = subtopicsInput.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (subtopicLines.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please enter at least one subtopic",
        variant: "destructive"
      });
      return;
    }

    bulkImportSubtopicsMutation.mutate({
      categoryId: parseInt(selectedCategoryForSubtopics),
      subtopics: subtopicLines
    });
  };

  const handleBulkImportReviewMaterials = () => {
    if (!selectedSubtopicForReviewMaterials || !reviewMaterialsInput.trim()) {
      toast({
        title: "Validation Error",
        description: "Please select a subtopic and enter review materials",
        variant: "destructive"
      });
      return;
    }

    const reviewMaterials = parseReviewMaterialsFormat(reviewMaterialsInput);
    
    if (reviewMaterials.length === 0) {
      toast({
        title: "Validation Error",
        description: "No valid review materials found in the input",
        variant: "destructive"
      });
      return;
    }

    bulkImportReviewMaterialsMutation.mutate({
      subtopicId: parseInt(selectedSubtopicForReviewMaterials),
      reviewMaterials: reviewMaterials
    });
  };

  const parseReviewMaterialsFormat = (input: string) => {
    const sections = input.split(/\n\s*---\s*\n|\n\s*===\s*\n/).filter(section => section.trim());
    const reviewMaterials = [];
    
    for (const section of sections) {
      const lines = section.split('\n').map(line => line.trim()).filter(line => line);
      if (lines.length === 0) continue;
      
      let title = '';
      let description = '';
      let content = '';
      let imageUrl = '';
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        if (line.startsWith('TITLE:')) {
          title = line.substring(6).trim();
        } else if (line.startsWith('DESCRIPTION:')) {
          description = line.substring(12).trim();
        } else if (line.startsWith('IMAGE:')) {
          imageUrl = line.substring(6).trim();
        } else if (line.startsWith('CONTENT:')) {
          // Collect all remaining lines as content
          const contentLines = [line.substring(8).trim()];
          for (let j = i + 1; j < lines.length; j++) {
            const nextLine = lines[j];
            if (nextLine.startsWith('TITLE:') || nextLine.startsWith('DESCRIPTION:') || 
                nextLine.startsWith('IMAGE:') || nextLine.startsWith('CONTENT:')) {
              break;
            }
            contentLines.push(nextLine);
          }
          content = contentLines.join('\n').trim();
        } else if (!title && !line.startsWith('DESCRIPTION:') && !line.startsWith('IMAGE:') && !line.startsWith('CONTENT:')) {
          // If no explicit title found, use first line as title
          title = line;
        }
      }
      
      if (title) {
        reviewMaterials.push({
          title: title,
          description: description || '',
          content: content || description || title,
          imageUrl: imageUrl || null
        });
      }
    }
    
    return reviewMaterials;
  };

  const parseSimpleFormat = (input: string) => {
    const sections = input.split(/\n\s*---\s*\n|\n\s*\n/).filter(section => section.trim());
    const questions = [];
    
    for (const section of sections) {
      const lines = section.split('\n').map(line => line.trim()).filter(line => line);
      if (lines.length === 0) continue;
      
      let question = '';
      const options: string[] = [];
      let correctAnswer = '';
      let explanation = '';
      
      for (const line of lines) {
        if (line.startsWith('Q:')) {
          question = line.substring(2).trim();
        } else if (/^[A-D]\)/.test(line)) {
          options.push(line.substring(2).trim());
        } else if (line.startsWith('ANSWER:')) {
          correctAnswer = line.substring(7).trim().toUpperCase();
        } else if (line.startsWith('EXPLANATION:')) {
          explanation = line.substring(12).trim();
        }
      }
      
      if (question && options.length >= 2 && correctAnswer) {
        questions.push({
          question: question,
          optionA: options[0] || '',
          optionB: options[1] || '',
          optionC: options[2] || '',
          optionD: options[3] || '',
          correctAnswer: correctAnswer,
          explanation: explanation
        });
      }
    }
    
    return questions;
  };

  const handleBulkImportQuestions = () => {
    if (!selectedSubtopicForQuestions || !questionsInput.trim()) {
      toast({
        title: "Validation Error",
        description: "Please select a subtopic and enter questions",
        variant: "destructive"
      });
      return;
    }

    try {
      let questions;
      
      if (inputFormat === 'simple') {
        questions = parseSimpleFormat(questionsInput);
        if (questions.length === 0) {
          throw new Error("No valid questions found. Make sure to follow the format: Q: question, A) option, B) option, etc., ANSWER: A, EXPLANATION: text");
        }
      } else {
        questions = JSON.parse(questionsInput);
        if (!Array.isArray(questions)) {
          throw new Error("Questions must be an array");
        }
        
        // Validate JSON format structure
        for (const q of questions) {
          if (!q.question || !q.optionA || !q.optionB || !q.correctAnswer) {
            throw new Error("Each question must have: question, optionA, optionB, optionC, optionD, correctAnswer");
          }
        }
      }

      bulkImportQuestionsMutation.mutate({
        subtopicId: parseInt(selectedSubtopicForQuestions),
        questions
      });
    } catch (error: any) {
      toast({
        title: inputFormat === 'simple' ? "Format Error" : "JSON Parse Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    // For now, we'll use a simple base64 approach
    // In production, you'd want to upload to a proper image service
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: any = {};
    
    for (const [key, value] of Array.from(formData.entries())) {
      if (key === 'imageFile' && value instanceof File && value.size > 0) {
        // Include the file directly in the data for FormData submission
        data[key] = value;
      } else {
        data[key] = value;
      }
    }

    // For questions, ensure we have all the necessary fields including controlled values
    if (activeTab === "questions") {
      console.log('Form data collected:', data);
      
      // Add controlled values from form state
      data.subtopicId = formValues.subtopicId;
      data.correctAnswer = formValues.correctAnswer;
      
      console.log('Final data being sent:', data);
    }

    if (activeTab === "categories") {
      if (editingItem) {
        updateCategoryMutation.mutate({ id: editingItem.id, data });
      } else {
        createCategoryMutation.mutate(data);
      }
    } else if (activeTab === "subtopics") {
      if (editingItem) {
        updateSubtopicMutation.mutate({ id: editingItem.id, data });
      } else {
        createSubtopicMutation.mutate(data);
      }
    } else if (activeTab === "questions") {
      if (editingItem) {
        updateQuestionMutation.mutate({ id: editingItem.id, data });
      } else {
        createQuestionMutation.mutate(data);
      }
    } else if (activeTab === "review-materials") {
      // Find the category for the selected subtopic
      if (data.subtopicId) {
        const categoryRelation = allCategorySubtopics?.find((cs: any) => cs.subtopicId === parseInt(data.subtopicId));
        if (categoryRelation) {
          data.categoryId = categoryRelation.categoryId;
        }
      }
      
      if (editingItem) {
        updateInfographicMutation.mutate({ id: editingItem.id, data });
      } else {
        createInfographicMutation.mutate(data);
      }
    }
  };

  // Loading state
  if (userLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || (user as any)?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">You don't have permission to access the content manager.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="default" onClick={() => setLocation("/auth")}>
              Sign In
            </Button>
            <Button variant="outline" onClick={() => setLocation("/")}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Content Manager</h1>
          <p className="text-muted-foreground">
            Manage categories, subtopics, and questions for the AVEX platform
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="categories" className="flex items-center space-x-2">
              <Folder className="w-4 h-4" />
              <span>Categories</span>
            </TabsTrigger>
            <TabsTrigger value="subtopics" className="flex items-center space-x-2">
              <Folder className="w-4 h-4" />
              <span>Subtopics</span>
            </TabsTrigger>
            <TabsTrigger value="questions" className="flex items-center space-x-2">
              <HelpCircle className="w-4 h-4" />
              <span>Questions</span>
            </TabsTrigger>
            <TabsTrigger value="review-materials" className="flex items-center space-x-2">
              <Image className="w-4 h-4" />
              <span>Review Materials</span>
            </TabsTrigger>
            <TabsTrigger value="bulk-import" className="flex items-center space-x-2">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Bulk Import</span>
            </TabsTrigger>
          </TabsList>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Manage Categories</h2>
              <Dialog open={isDialogOpen && activeTab === "categories"} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingItem(null)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingItem ? "Edit Category" : "Create New Category"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4" data-form-type="category">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Category Name</Label>
                        <Input
                          id="name"
                          name="name"
                          defaultValue={editingItem?.name || ""}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="slug">Slug</Label>
                        <Input
                          id="slug"
                          name="slug"
                          defaultValue={editingItem?.slug || ""}
                          placeholder="category-slug"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        defaultValue={editingItem?.description || ""}
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="icon">Icon (emoji or icon name)</Label>
                      <Input
                        id="icon"
                        name="icon"
                        defaultValue={editingItem?.icon || ""}
                        placeholder="✈️ or plane"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Category Image</Label>
                      <Tabs value={imageUploadType} onValueChange={(value: any) => setImageUploadType(value)}>
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="url">Image URL</TabsTrigger>
                          <TabsTrigger value="file">Upload File</TabsTrigger>
                        </TabsList>
                        <TabsContent value="url">
                          <Input
                            name="imageUrl"
                            placeholder="https://example.com/image.jpg"
                            defaultValue={editingItem?.imageUrl || ""}
                          />
                        </TabsContent>
                        <TabsContent value="file">
                          <Input
                            type="file"
                            name="imageFile"
                            accept="image/*"
                          />
                        </TabsContent>
                      </Tabs>
                    </div>

                    {editingItem && (
                      <div className="space-y-2">
                        <Label>Linked Subtopics</Label>
                        <MultiSelect
                          options={subtopics?.map((subtopic: Subtopic) => ({
                            value: subtopic.id,
                            label: subtopic.name
                          })) || []}
                          selected={selectedSubtopicsForCategory}
                          onChange={setSelectedSubtopicsForCategory}
                          placeholder="Select subtopics to link..."
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            if (editingItem && selectedSubtopicsForCategory.length > 0) {
                              bulkLinkSubtopicsMutation.mutate({
                                categoryId: editingItem.id,
                                subtopicIds: selectedSubtopicsForCategory
                              });
                            }
                          }}
                          disabled={bulkLinkSubtopicsMutation.isPending || selectedSubtopicsForCategory.length === 0}
                        >
                          <LinkIcon className="w-4 h-4 mr-2" />
                          Link Selected Subtopics
                        </Button>
                      </div>
                    )}

                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        <Save className="w-4 h-4 mr-2" />
                        {editingItem ? "Update" : "Create"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoriesLoading ? (
                <div className="col-span-full text-center py-8">Loading categories...</div>
              ) : (
                categories?.map((category: Category) => (
                  <Card key={category.id} className="avex-card">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{category.icon}</span>
                          <CardTitle className="text-lg">{category.name}</CardTitle>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingItem(category);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteCategoryMutation.mutate(category.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        {category.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">
                          {category.question_count} questions
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setCategoryForSubtopicManagement(category);
                            setSubtopicManageDialogOpen(true);
                          }}
                          className="text-xs"
                        >
                          <LinkIcon className="w-3 h-3 mr-1" />
                          Manage Subtopics
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Subtopics Tab */}
          <TabsContent value="subtopics" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Manage Subtopics</h2>
              <Dialog open={isDialogOpen && activeTab === "subtopics"} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingItem(null)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Subtopic
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingItem ? "Edit Subtopic" : "Create New Subtopic"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Subtopic Name</Label>
                      <Input
                        id="name"
                        name="name"
                        defaultValue={editingItem?.name || ""}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="categoryId">Category</Label>
                      <Select name="categoryId" defaultValue={editingItem?.categoryId?.toString() || ""} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories?.map((category: Category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.icon} {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        defaultValue={editingItem?.description || ""}
                        rows={3}
                      />
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        <Save className="w-4 h-4 mr-2" />
                        {editingItem ? "Update" : "Create"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subtopicsLoading ? (
                <div className="col-span-full text-center py-8">Loading subtopics...</div>
              ) : (
                subtopics?.map((subtopic: any) => (
                  <Card key={`subtopic-${subtopic.id}`} className="avex-card">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{subtopic.name}</CardTitle>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingItem(subtopic);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteSubtopicMutation.mutate(subtopic.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-2 mb-2">
                        <span>{subtopic.categoryIcon || "📚"}</span>
                        <Badge variant="outline">{subtopic.categoryName || "No Category"}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {subtopic.description}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Manage Questions</h2>
              <Dialog open={isDialogOpen && activeTab === "questions"} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingItem(null)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingItem ? "Edit Question" : "Create New Question"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="subtopicId">Subtopic</Label>
                      <Select 
                        name="subtopicId" 
                        value={formValues.subtopicId} 
                        onValueChange={(value) => setFormValues(prev => ({ ...prev, subtopicId: value }))}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a subtopic" />
                        </SelectTrigger>
                        <SelectContent>
                          {subtopics?.map((subtopic: Subtopic) => (
                            <SelectItem key={subtopic.id} value={subtopic.id.toString()}>
                              {subtopic.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground mt-1">
                        Question will appear in all categories that include this subtopic
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="questionText">Question Text</Label>
                      <Textarea
                        id="questionText"
                        name="questionText"
                        defaultValue={editingItem?.questionText || ""}
                        rows={3}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="optionA">Option A</Label>
                        <Input
                          id="optionA"
                          name="optionA"
                          defaultValue={editingItem?.optionA || ""}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="optionB">Option B</Label>
                        <Input
                          id="optionB"
                          name="optionB"
                          defaultValue={editingItem?.optionB || ""}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="optionC">Option C</Label>
                        <Input
                          id="optionC"
                          name="optionC"
                          defaultValue={editingItem?.optionC || ""}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="optionD">Option D</Label>
                        <Input
                          id="optionD"
                          name="optionD"
                          defaultValue={editingItem?.optionD || ""}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="correctAnswer">Correct Answer</Label>
                      <Select 
                        name="correctAnswer" 
                        value={formValues.correctAnswer} 
                        onValueChange={(value) => setFormValues(prev => ({ ...prev, correctAnswer: value }))}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select correct answer" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">A</SelectItem>
                          <SelectItem value="B">B</SelectItem>
                          <SelectItem value="C">C</SelectItem>
                          <SelectItem value="D">D</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="explanation">Explanation</Label>
                      <Textarea
                        id="explanation"
                        name="explanation"
                        defaultValue={editingItem?.explanation || ""}
                        rows={3}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Question Image (Optional)</Label>
                      <Tabs value={imageUploadType} onValueChange={(value: any) => setImageUploadType(value)}>
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="url">Image URL</TabsTrigger>
                          <TabsTrigger value="file">Upload File</TabsTrigger>
                        </TabsList>
                        <TabsContent value="url">
                          <Input
                            name="imageUrl"
                            placeholder="https://example.com/image.jpg"
                            defaultValue={editingItem?.imageUrl || ""}
                          />
                        </TabsContent>
                        <TabsContent value="file">
                          <Input
                            type="file"
                            name="imageFile"
                            accept="image/*"
                          />
                        </TabsContent>
                      </Tabs>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        <Save className="w-4 h-4 mr-2" />
                        {editingItem ? "Update" : "Create"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {!showSubtopicQuestions ? (
              // Subtopics Table View
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Subtopics Overview</h3>
                  <p className="text-sm text-muted-foreground">Click a subtopic to view its questions</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subtopicsLoading ? (
                    <div className="col-span-full text-center py-8">Loading subtopics...</div>
                  ) : (
                    subtopics?.map((subtopic: Subtopic) => {
                      const questionCount = questions?.filter((q: Question) => q.subtopicId === subtopic.id).length || 0;
                      const linkedCategories = categories?.filter((c: Category) => 
                        allCategorySubtopics?.some?.((cs: any) => cs.subtopicId === subtopic.id && cs.categoryId === c.id)
                      ) || [];
                      
                      return (
                        <Card 
                          key={subtopic.id} 
                          className="avex-card cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => {
                            setSelectedSubtopicForQuestionView(subtopic);
                            setShowSubtopicQuestions(true);
                          }}
                        >
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">{subtopic.name}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Questions:</span>
                                <Badge variant="secondary">{questionCount}</Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Categories:</span>
                                <Badge variant="outline">{linkedCategories.length}</Badge>
                              </div>
                              {linkedCategories.length > 0 && (
                                <div className="text-xs text-muted-foreground">
                                  Used in: {linkedCategories.map(c => c.name).join(', ')}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              // Questions for Selected Subtopic View
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSubtopicQuestions(false)}
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Back to Subtopics
                    </Button>
                    <h3 className="text-lg font-semibold">
                      Questions in "{selectedSubtopicForQuestionView?.name}"
                    </h3>
                  </div>
                  <Badge variant="secondary">
                    {subtopicQuestions?.length || 0} questions
                  </Badge>
                </div>
                
                <div className="space-y-4">
                  {subtopicQuestionsLoading ? (
                    <div className="text-center py-8">Loading questions...</div>
                  ) : subtopicQuestions?.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No questions found in this subtopic
                    </div>
                  ) : (
                    subtopicQuestions?.map((question: Question) => (
                      <Card key={question.id} className="avex-card">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                              Question ID: {question.id}
                            </div>
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingItem(question);
                                  setIsDialogOpen(true);
                                }}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="outline">
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Question</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this question? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => deleteQuestionMutation.mutate(question.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="font-medium mb-3">{question.questionText}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-3">
                            <div className="p-2 border rounded bg-gray-50 dark:bg-gray-800">
                              <strong>A)</strong> {question.optionA}
                            </div>
                            <div className="p-2 border rounded bg-gray-50 dark:bg-gray-800">
                              <strong>B)</strong> {question.optionB}
                            </div>
                            <div className="p-2 border rounded bg-gray-50 dark:bg-gray-800">
                              <strong>C)</strong> {question.optionC}
                            </div>
                            <div className="p-2 border rounded bg-gray-50 dark:bg-gray-800">
                              <strong>D)</strong> {question.optionD}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <Badge variant="default" className="bg-green-500">
                              Correct Answer: {question.correctAnswer}
                            </Badge>
                            <div className="flex items-center space-x-2">
                              {question.explanation && (
                                <Badge variant="outline">Has Explanation</Badge>
                              )}
                              {question.imageUrl && (
                                <Badge variant="outline">Has Image</Badge>
                              )}
                            </div>
                          </div>
                          {question.explanation && (
                            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                              <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                                Explanation:
                              </p>
                              <p className="text-sm text-blue-700 dark:text-blue-300">
                                {question.explanation}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Review Materials Tab */}
          <TabsContent value="review-materials">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Review Materials</h3>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Material
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {infographics?.map((infographic: any) => (
                  <Card key={infographic.id} className="avex-card">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{infographic.title}</CardTitle>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingItem(infographic);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteInfographicMutation.mutate(infographic.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {infographic.imageUrl && (
                        <div className="mb-3">
                          <img 
                            src={infographic.imageUrl} 
                            alt={infographic.title}
                            className="w-full h-32 object-cover rounded-md"
                          />
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground mb-2">
                        {infographic.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline">
                          {categories?.find((c: any) => c.id === infographic.categoryId)?.name}
                        </Badge>
                        {infographic.subtopicId && (
                          <Badge variant="secondary">
                            {subtopics?.find((s: any) => s.id === infographic.subtopicId)?.name}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )) || (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    No review materials found
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Bulk Import Tab */}
          <TabsContent value="bulk-import" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bulk Subtopics Import */}
              <Card className="avex-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Folder className="w-5 h-5 text-avex-blue" />
                    <span>Bulk Import Subtopics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="subtopic-category">Target Category</Label>
                    <Select value={selectedCategoryForSubtopics} onValueChange={setSelectedCategoryForSubtopics}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {(categories as any[])?.map((category: any) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="subtopics-input">Subtopics (one per line)</Label>
                    <Textarea
                      id="subtopics-input"
                      value={subtopicsInput}
                      onChange={(e) => setSubtopicsInput(e.target.value)}
                      placeholder="Enter subtopics, one per line&#10;Example:&#10;Materials & Processes&#10;Ground Operation & Servicing&#10;Fluid Lines and Fittings"
                      rows={8}
                      className="font-mono text-sm"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button 
                      className="w-full" 
                      onClick={handleBulkImportSubtopics}
                      disabled={bulkImportSubtopicsMutation.isPending}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {bulkImportSubtopicsMutation.isPending ? "Importing..." : "Import Subtopics"}
                    </Button>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <p>• Each line will create a new subtopic</p>
                    <p>• Empty lines will be skipped</p>
                    <p>• Duplicate names will be ignored</p>
                  </div>
                </CardContent>
              </Card>

              {/* Bulk Questions Import */}
              <Card className="avex-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <HelpCircle className="w-5 h-5 text-avex-blue" />
                    <span>Bulk Import Questions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="question-subtopic">Target Subtopic</Label>
                    <Select value={selectedSubtopicForQuestions} onValueChange={setSelectedSubtopicForQuestions}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subtopic" />
                      </SelectTrigger>
                      <SelectContent>
                        {(subtopics as any[])?.map((subtopic: any) => (
                          <SelectItem key={subtopic.id} value={subtopic.id.toString()}>
                            {subtopic.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground mt-1">
                      Questions will appear in all categories that include this subtopic
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Label>Input Format:</Label>
                      <div className="flex space-x-2">
                        <Button
                          type="button"
                          variant={inputFormat === 'simple' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setInputFormat('simple')}
                        >
                          Simple Format
                        </Button>
                        <Button
                          type="button"
                          variant={inputFormat === 'json' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setInputFormat('json')}
                        >
                          JSON Format
                        </Button>
                      </div>
                    </div>

                    {inputFormat === 'simple' ? (
                      <div>
                        <Label htmlFor="questions-input">Questions (Simple Format)</Label>
                        <Textarea
                          id="questions-input"
                          value={questionsInput}
                          onChange={(e) => setQuestionsInput(e.target.value)}
                          placeholder={`Q: What is the primary purpose of aircraft maintenance?
A) To ensure flight safety
B) To reduce operating costs
C) To extend aircraft life
D) To comply with regulations
ANSWER: A
EXPLANATION: Aircraft maintenance primarily ensures flight safety by keeping aircraft in airworthy condition.

Q: Which document contains the maintenance requirements for an aircraft?
A) Flight manual
B) Maintenance manual
C) Operations manual
D) Emergency procedures
ANSWER: B
EXPLANATION: The maintenance manual contains all required maintenance procedures and schedules.

---

Format Instructions:
- Start each question with "Q: "
- List options as A), B), C), D)
- Specify correct answer with "ANSWER: A" (or B, C, D)
- Add explanation with "EXPLANATION: "
- Separate questions with a blank line or "---"`}
                          rows={15}
                          className="font-mono text-sm"
                        />
                      </div>
                    ) : (
                      <div>
                        <Label htmlFor="questions-input">Questions (JSON Format)</Label>
                        <Textarea
                          id="questions-input"
                          value={questionsInput}
                          onChange={(e) => setQuestionsInput(e.target.value)}
                          placeholder={`[
  {
    "question": "What is the primary purpose of aircraft maintenance?",
    "optionA": "To ensure flight safety",
    "optionB": "To reduce operating costs", 
    "optionC": "To extend aircraft life",
    "optionD": "To comply with regulations",
    "correctAnswer": "A",
    "explanation": "Aircraft maintenance primarily ensures flight safety by keeping aircraft in airworthy condition."
  },
  {
    "question": "Which document contains the maintenance requirements?",
    "optionA": "Flight manual",
    "optionB": "Maintenance manual",
    "optionC": "Operations manual", 
    "optionD": "Emergency procedures",
    "correctAnswer": "B",
    "explanation": "The maintenance manual contains all required maintenance procedures."
  }
]`}
                          rows={15}
                          className="font-mono text-sm"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button 
                      className="w-full" 
                      onClick={handleBulkImportQuestions}
                      disabled={bulkImportQuestionsMutation.isPending}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {bulkImportQuestionsMutation.isPending ? "Importing..." : "Import Questions"}
                    </Button>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {inputFormat === 'simple' ? (
                      <>
                        <p>• Start each question with "Q: "</p>
                        <p>• List options as A), B), C), D)</p>
                        <p>• Use "ANSWER: A" to specify correct answer</p>
                        <p>• Add "EXPLANATION: " for detailed explanations</p>
                        <p>• Separate questions with blank lines or "---"</p>
                      </>
                    ) : (
                      <>
                        <p>• Use valid JSON format with array of objects</p>
                        <p>• Required: question, optionA-D, correctAnswer</p>
                        <p>• Optional: explanation</p>
                        <p>• correctAnswer should be "A", "B", "C", or "D"</p>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Bulk Review Materials Import */}
              <Card className="avex-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Image className="w-5 h-5 text-avex-blue" />
                    <span>Bulk Import Review Materials</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="review-subtopic">Target Subtopic</Label>
                    <Select value={selectedSubtopicForReviewMaterials} onValueChange={setSelectedSubtopicForReviewMaterials}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subtopic" />
                      </SelectTrigger>
                      <SelectContent>
                        {(subtopics as any[])?.map((subtopic: any) => {
                          // Find the category for this subtopic
                          const categoryRelation = allCategorySubtopics?.find((cs: any) => cs.subtopicId === subtopic.id);
                          const category = categories?.find((c: any) => c.id === categoryRelation?.categoryId);
                          
                          return (
                            <SelectItem key={subtopic.id} value={subtopic.id.toString()}>
                              {subtopic.name} {category ? `(${category.name})` : ''}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="review-materials-input">Review Materials (free-form format)</Label>
                    <Textarea
                      id="review-materials-input"
                      value={reviewMaterialsInput}
                      onChange={(e) => setReviewMaterialsInput(e.target.value)}
                      placeholder={`Enter review materials in free-form format:

TITLE: Understanding Aircraft Systems
DESCRIPTION: Comprehensive overview of aircraft electrical systems
IMAGE: https://example.com/aircraft-diagram.jpg
CONTENT: Aircraft electrical systems provide power for all aircraft operations.
The system includes generators, batteries, and distribution networks.
Key components include:
- Generators (engine-driven and APU)
- Batteries for emergency power
- Bus systems for power distribution

---

TITLE: Hydraulic System Components
DESCRIPTION: Key components of aircraft hydraulic systems
CONTENT: Hydraulic systems use pressurized fluid to operate flight controls, landing gear, and other systems.
Main components include reservoirs, pumps, filters, and actuators.

---

Free-form content without specific tags
This will use the first line as title and content as description`}
                      rows={12}
                      className="font-mono text-sm"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button 
                      className="w-full" 
                      onClick={handleBulkImportReviewMaterials}
                      disabled={bulkImportReviewMaterialsMutation.isPending}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {bulkImportReviewMaterialsMutation.isPending ? "Importing..." : "Import Review Materials"}
                    </Button>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <p><strong>Format Instructions:</strong></p>
                    <p>• Use "TITLE:", "DESCRIPTION:", "IMAGE:", "CONTENT:" tags</p>
                    <p>• Separate materials with "---" or "==="</p>
                    <p>• First line becomes title if no explicit TITLE: tag</p>
                    <p>• CONTENT: can span multiple lines</p>
                    <p>• IMAGE: should be a valid URL</p>
                    <p>• Free-form text is automatically parsed</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Template Download Section */}
            <Card className="avex-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Download className="w-5 h-5 text-avex-blue" />
                  <span>Import Templates</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Download template files to help format your import data correctly.
                </p>
                <div className="flex space-x-4">
                  <Button variant="outline" disabled={true}>
                    <Download className="w-4 h-4 mr-2" />
                    Subtopics Template
                  </Button>
                  <Button variant="outline" disabled={true}>
                    <Download className="w-4 h-4 mr-2" />
                    Questions Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Review Materials Dialog */}
        <Dialog open={isDialogOpen && activeTab === "review-materials"} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Edit Review Material" : "Create New Review Material"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={editingItem?.title || ""}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingItem?.description || ""}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="subtopicId">Subtopic</Label>
                <Select name="subtopicId" defaultValue={editingItem?.subtopicId?.toString() || ""} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subtopic" />
                  </SelectTrigger>
                  <SelectContent>
                    {subtopics?.map((subtopic: Subtopic) => {
                      // Find the category for this subtopic
                      const categoryRelation = allCategorySubtopics?.find((cs: any) => cs.subtopicId === subtopic.id);
                      const category = categories?.find((c: any) => c.id === categoryRelation?.categoryId);
                      
                      return (
                        <SelectItem key={subtopic.id} value={subtopic.id.toString()}>
                          {subtopic.name} {category ? `(${category.name})` : ''}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Image Upload</Label>
                <div className="flex gap-2 mb-2">
                  <Button
                    type="button"
                    variant={imageUploadType === "url" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setImageUploadType("url")}
                  >
                    <LinkIcon className="w-4 h-4 mr-1" />
                    URL
                  </Button>
                  <Button
                    type="button"
                    variant={imageUploadType === "file" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setImageUploadType("file")}
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    File Upload
                  </Button>
                </div>

                {imageUploadType === "url" ? (
                  <Input
                    name="imageUrl"
                    placeholder="https://example.com/image.jpg"
                    defaultValue={editingItem?.imageUrl || ""}
                  />
                ) : (
                  <Input
                    name="imageFile"
                    type="file"
                    accept="image/*"
                  />
                )}
              </div>

              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  name="content"
                  defaultValue={editingItem?.content || ""}
                  rows={6}
                  placeholder="Enter the content or study material text..."
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingItem ? "Update Material" : "Create Material"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Subtopic Management Dialog */}
        <Dialog open={subtopicManageDialogOpen} onOpenChange={setSubtopicManageDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Manage Subtopics for "{categoryForSubtopicManagement?.name}"
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Select subtopics to link to this category. Linked subtopics will make their questions available in this category.
              </div>
              
              {/* Currently Linked Subtopics */}
              {categorySubtopics.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Currently Linked Subtopics</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {categorySubtopics.map((subtopic: any) => (
                      <div key={subtopic.id} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{subtopic.name}</span>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            if (categoryForSubtopicManagement) {
                              unlinkSubtopicMutation.mutate({
                                categoryId: categoryForSubtopicManagement.id,
                                subtopicId: subtopic.id
                              });
                            }
                          }}
                          disabled={unlinkSubtopicMutation.isPending}
                        >
                          <X className="w-3 h-3 mr-1" />
                          Unlink
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Available Subtopics to Link */}
              <div>
                <h4 className="font-medium mb-2">Available Subtopics</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                  {subtopics
                    .filter((subtopic: any) => 
                      !categorySubtopics.some((linked: any) => linked.id === subtopic.id)
                    )
                    .map((subtopic: any) => (
                      <div key={subtopic.id} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{subtopic.name}</span>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => {
                            if (categoryForSubtopicManagement) {
                              linkSubtopicMutation.mutate({
                                categoryId: categoryForSubtopicManagement.id,
                                subtopicId: subtopic.id
                              });
                            }
                          }}
                          disabled={linkSubtopicMutation.isPending}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Link
                        </Button>
                      </div>
                    ))}
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setSubtopicManageDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}