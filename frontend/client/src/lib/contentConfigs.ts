import { ContentConfig } from "./queryKeys";

/**
 * Parse review materials format (existing pattern)
 */
export function parseReviewMaterialsFormat(input: string) {
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
        const contentLines = lines.slice(i + 1);
        content = contentLines.join('\n').trim();
        break;
      } else if (!title && !description && !imageUrl) {
        title = line;
      }
    }
    
    if (title) {
      reviewMaterials.push({
        title,
        description,
        content: content || description,
        imageUrl: imageUrl || '',
        contentType: 'text'
      });
    }
  }
  
  return reviewMaterials;
}

/**
 * Parse practical content format (following same pattern as review materials)
 */
export function parsePracticalContentFormat(input: string) {
  const sections = input.split(/\n\s*---\s*\n|\n\s*===\s*\n/).filter(section => section.trim());
  const practicalContents = [];
  
  for (const section of sections) {
    const lines = section.split('\n').map(line => line.trim()).filter(line => line);
    if (lines.length === 0) continue;
    
    let title = '';
    let description = '';
    let content = '';
    let imageUrl = '';
    let videoUrl = '';
    let contentType = 'text';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.startsWith('TITLE:')) {
        title = line.substring(6).trim();
      } else if (line.startsWith('DESCRIPTION:')) {
        description = line.substring(12).trim();
      } else if (line.startsWith('IMAGE:')) {
        imageUrl = line.substring(6).trim();
        contentType = 'image';
      } else if (line.startsWith('VIDEO:')) {
        videoUrl = line.substring(6).trim();
        contentType = 'video';
      } else if (line.startsWith('CONTENT:')) {
        const contentLines = lines.slice(i + 1);
        content = contentLines.join('\n').trim();
        break;
      } else if (!title && !description && !imageUrl && !videoUrl) {
        title = line;
      }
    }
    
    if (title) {
      practicalContents.push({
        title,
        description,
        content: {
          text: content || description,
          imageUrl: imageUrl || '',
          videoUrl: videoUrl || ''
        },
        contentType,
        isVisible: true,
        orderIndex: 0
      });
    }
  }
  
  return practicalContents;
}

/**
 * Content configuration for review materials
 */
export const reviewMaterialConfig: Partial<ContentConfig> = {
  basePath: "/api/admin/infographics",
  bulkImportPath: "/api/admin/review-materials/bulk",
  parseFormat: parseReviewMaterialsFormat,
  fields: {
    selector: {
      label: "Select Subtopic",
      placeholder: "Choose a subtopic for review materials",
      options: [] // Will be populated by the component
    },
    textarea: {
      label: "Review Materials (free-form format)",
      placeholder: `Enter review materials in free-form format:

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

TITLE: Next Topic
DESCRIPTION: Another topic description
CONTENT: More content here...`
    }
  },
  messages: {
    createSuccess: "Review material created successfully",
    updateSuccess: "Review material updated successfully",
    deleteSuccess: "Review material deleted successfully",
    bulkImportSuccess: "Review materials imported successfully"
  }
};

/**
 * Content configuration for practical guides
 */
export const practicalContentConfig: Partial<ContentConfig> = {
  basePath: "/api/admin/practical-content",
  bulkImportPath: "/api/admin/practical-stations/{stationId}/bulk-content",
  parseFormat: parsePracticalContentFormat,
  fields: {
    selector: {
      label: "Select Practical Station",
      placeholder: "Choose a practical station for content",
      options: [] // Will be populated by the component
    },
    textarea: {
      label: "Practical Content (free-form format)",
      placeholder: `Enter practical content in free-form format:

TITLE: Circuit Analysis Procedure
DESCRIPTION: Step-by-step electrical circuit analysis
IMAGE: https://example.com/circuit-diagram.jpg
CONTENT: Follow these steps to analyze aircraft electrical circuits:
1. Identify the power source
2. Trace the circuit path
3. Check for continuity
4. Measure voltage drops

---

TITLE: Battery Testing
DESCRIPTION: Aircraft battery testing procedures
VIDEO: https://example.com/battery-test.mp4
CONTENT: Proper battery testing ensures reliable aircraft operation...`
    }
  },
  messages: {
    createSuccess: "Practical content created successfully",
    updateSuccess: "Practical content updated successfully", 
    deleteSuccess: "Practical content deleted successfully",
    bulkImportSuccess: "Practical content imported successfully"
  }
};