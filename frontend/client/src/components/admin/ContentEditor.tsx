import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Upload, Link } from "lucide-react";
import { ObjectUploader } from "@/components/ObjectUploader";
import { useContentCRUD } from "@/hooks/useContentCRUD";
import { ContentType } from "@/lib/queryKeys";

interface ContentEditorProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem: any | null;
  contentType: ContentType;
  basePath: string;
  additionalInvalidationKeys?: string[][];
  messages?: {
    createSuccess?: string;
    updateSuccess?: string;
    deleteSuccess?: string;
  };
  // For bulk import
  targetOptions: { value: string; label: string }[];
  selectedTarget: string;
  onTargetChange: (value: string) => void;
  bulkInput: string;
  onBulkInputChange: (value: string) => void;
  bulkImportPath: string;
  parseFormat: (input: string) => any[];
  placeholderText: string;
  targetLabel: string;
  contentLabel: string;
}

/**
 * Generic content editor component following review materials patterns
 * Can be configured for any content type while maintaining independence
 */
export default function ContentEditor({
  isOpen,
  onClose,
  editingItem,
  contentType,
  basePath,
  additionalInvalidationKeys,
  messages,
  targetOptions,
  selectedTarget,
  onTargetChange,
  bulkInput,
  onBulkInputChange,
  bulkImportPath,
  parseFormat,
  placeholderText,
  targetLabel,
  contentLabel
}: ContentEditorProps) {
  
  // Normalize content data based on type
  const initializeContent = (content: any) => {
    if (!content) return { text: '', imageUrl: '', videoUrl: '' };
    
    // For practical content, content might be a JSON string that needs parsing
    if (contentType === "practicalContent" && typeof content === 'string') {
      try {
        return JSON.parse(content);
      } catch {
        return { text: content, imageUrl: '', videoUrl: '' };
      }
    }
    
    // For review materials or already parsed objects
    if (typeof content === 'object') {
      return content;
    }
    
    // Fallback for other string content
    return { text: content || '', imageUrl: '', videoUrl: '' };
  };

  const [formData, setFormData] = useState({
    title: editingItem?.title || '',
    contentType: editingItem?.contentType || 'text',
    content: initializeContent(editingItem?.content),
    orderIndex: editingItem?.orderIndex || 0,
    isVisible: editingItem?.isVisible ?? true,
  });
  
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkItems, setBulkItems] = useState([
    { type: 'text', title: '', content: '' },
  ]);
  
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('url');

  const { createMutation, updateMutation, deleteMutation, bulkImportMutation } = useContentCRUD({
    contentType,
    basePath,
    additionalInvalidationKeys,
    messages
  });

  const handleGetUploadParameters = async () => {
    const res = await fetch("/api/objects/upload", {
      method: "POST",
      credentials: "include"
    });
    const data = await res.json();
    return {
      method: "PUT" as const,
      url: data.uploadURL,
    };
  };

  const handleFileUploadComplete = (result: any, contentType: 'image' | 'video') => {
    if (result.successful && result.successful.length > 0) {
      const fileUrl = result.successful[0].uploadURL;
      setFormData(prev => ({
        ...prev,
        content: {
          ...prev.content,
          [contentType === 'image' ? 'imageUrl' : 'videoUrl']: fileUrl
        },
        contentType
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (bulkMode) {
      handleBulkImport();
    } else {
      const submitData = {
        ...formData,
        // For practical content, wrap content in JSON structure
        content: contentType === "practicalContent" 
          ? JSON.stringify(formData.content)
          : formData.content,
        // Add target ID for new items
        ...(contentType === "practicalContent" && !editingItem && selectedTarget ? {
          stationId: parseInt(selectedTarget)
        } : {}),
        ...(contentType === "reviewMaterial" && !editingItem && selectedTarget ? {
          subtopicId: parseInt(selectedTarget)
        } : {})
      };

      if (editingItem) {
        updateMutation.mutate({ id: editingItem.id, data: submitData });
      } else {
        createMutation.mutate(submitData);
      }
    }
  };

  const handleBulkImport = () => {
    if (!selectedTarget || !bulkInput.trim()) {
      return;
    }

    const parsedContents = parseFormat(bulkInput);
    
    if (parsedContents.length === 0) {
      return;
    }

    // Replace {stationId} placeholder in bulk import path
    const finalBulkImportPath = bulkImportPath.replace('{stationId}', selectedTarget);

    bulkImportMutation.mutate({
      targetId: parseInt(selectedTarget),
      contents: parsedContents,
      bulkImportPath: finalBulkImportPath
    });
  };

  const handleDelete = () => {
    if (editingItem?.id) {
      deleteMutation.mutate(editingItem.id);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending || bulkImportMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {bulkMode 
              ? `Bulk Import ${contentType === "reviewMaterial" ? "Review Materials" : "Practical Content"}`
              : editingItem 
                ? `Edit ${contentType === "reviewMaterial" ? "Review Material" : "Practical Content"}` 
                : `Create New ${contentType === "reviewMaterial" ? "Review Material" : "Practical Content"}`
            }
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Bulk Mode Toggle */}
          <div className="flex items-center space-x-2">
            <Switch 
              id="bulk-mode" 
              checked={bulkMode} 
              onCheckedChange={setBulkMode}
              disabled={!!editingItem}
            />
            <Label htmlFor="bulk-mode">Bulk Import Mode</Label>
          </div>

          {bulkMode ? (
            // Bulk Import Interface
            <div className="space-y-4">
              <div>
                <Label htmlFor="target-select">{targetLabel}</Label>
                <Select value={selectedTarget} onValueChange={onTargetChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${targetLabel.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {targetOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="bulk-content">{contentLabel}</Label>
                <Textarea
                  id="bulk-content"
                  value={bulkInput}
                  onChange={(e) => onBulkInputChange(e.target.value)}
                  placeholder={placeholderText}
                  className="min-h-[300px] font-mono text-sm"
                  data-testid="textarea-bulk-content"
                />
              </div>

              <Button 
                type="submit" 
                disabled={isLoading || !selectedTarget || !bulkInput.trim()}
                className="w-full"
                data-testid="button-bulk-import"
              >
                {isLoading ? "Importing..." : "Import Content"}
              </Button>
            </div>
          ) : (
            // Single Item Interface
            <div className="space-y-4">
              {/* Target Selection (for new items) */}
              {!editingItem && (
                <div>
                  <Label htmlFor="target-select">{targetLabel}</Label>
                  <Select value={selectedTarget} onValueChange={onTargetChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${targetLabel.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {targetOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                  data-testid="input-title"
                />
              </div>

              <div>
                <Label htmlFor="content-type">Content Type</Label>
                <Select 
                  value={formData.contentType} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, contentType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Content Fields */}
              <div>
                <Label htmlFor="text-content">Text Content</Label>
                <Textarea
                  id="text-content"
                  value={typeof formData.content === 'string' ? formData.content : formData.content.text}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    content: typeof prev.content === 'string' 
                      ? e.target.value 
                      : { ...prev.content, text: e.target.value }
                  }))}
                  className="min-h-[100px]"
                  data-testid="textarea-text-content"
                />
              </div>

              {/* Image Upload */}
              {formData.contentType === 'image' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Image Upload</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={uploadMode === 'file' ? 'default' : 'outline'}
                        onClick={() => setUploadMode('file')}
                        size="sm"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload File
                      </Button>
                      <Button
                        type="button"
                        variant={uploadMode === 'url' ? 'default' : 'outline'}
                        onClick={() => setUploadMode('url')}
                        size="sm"
                      >
                        <Link className="w-4 h-4 mr-2" />
                        URL
                      </Button>
                    </div>

                    {uploadMode === 'file' ? (
                      <ObjectUploader
                        onGetUploadParameters={handleGetUploadParameters}
                        onComplete={(result) => handleFileUploadComplete(result, 'image')}
                        allowedFileTypes={['image/*']}
                        maxFileSize={10 * 1024 * 1024}
                      >
                        Upload Image
                      </ObjectUploader>
                    ) : (
                      <div>
                        <Label htmlFor="image-url">Image URL</Label>
                        <Input
                          id="image-url"
                          value={typeof formData.content === 'string' ? '' : formData.content.imageUrl || ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            content: typeof prev.content === 'string' 
                              ? { text: prev.content, imageUrl: e.target.value, videoUrl: '' }
                              : { ...prev.content, imageUrl: e.target.value }
                          }))}
                          placeholder="https://example.com/image.jpg"
                          data-testid="input-image-url"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Video Upload */}
              {formData.contentType === 'video' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Video Upload</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={uploadMode === 'file' ? 'default' : 'outline'}
                        onClick={() => setUploadMode('file')}
                        size="sm"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload File
                      </Button>
                      <Button
                        type="button"
                        variant={uploadMode === 'url' ? 'default' : 'outline'}
                        onClick={() => setUploadMode('url')}
                        size="sm"
                      >
                        <Link className="w-4 h-4 mr-2" />
                        URL
                      </Button>
                    </div>

                    {uploadMode === 'file' ? (
                      <ObjectUploader
                        onGetUploadParameters={handleGetUploadParameters}
                        onComplete={(result) => handleFileUploadComplete(result, 'video')}
                        allowedFileTypes={['video/*']}
                        maxFileSize={100 * 1024 * 1024}
                      >
                        Upload Video
                      </ObjectUploader>
                    ) : (
                      <div>
                        <Label htmlFor="video-url">Video URL</Label>
                        <Input
                          id="video-url"
                          value={typeof formData.content === 'string' ? '' : formData.content.videoUrl || ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            content: typeof prev.content === 'string' 
                              ? { text: prev.content, imageUrl: '', videoUrl: e.target.value }
                              : { ...prev.content, videoUrl: e.target.value }
                          }))}
                          placeholder="https://example.com/video.mp4"
                          data-testid="input-video-url"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Additional Fields for Practical Content */}
              {contentType === "practicalContent" && (
                <>
                  <div>
                    <Label htmlFor="order-index">Order Index</Label>
                    <Input
                      id="order-index"
                      type="number"
                      value={formData.orderIndex}
                      onChange={(e) => setFormData(prev => ({ ...prev, orderIndex: parseInt(e.target.value) || 0 }))}
                      data-testid="input-order-index"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is-visible"
                      checked={formData.isVisible}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isVisible: checked }))}
                    />
                    <Label htmlFor="is-visible">Visible to Users</Label>
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button 
                  type="submit" 
                  disabled={isLoading || !formData.title || (!editingItem && !selectedTarget)}
                  className="flex-1"
                  data-testid="button-save"
                >
                  {isLoading ? "Saving..." : editingItem ? "Update" : "Create"}
                </Button>
                
                {editingItem && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isLoading}
                    data-testid="button-delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}