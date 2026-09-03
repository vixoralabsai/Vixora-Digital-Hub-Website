export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  iconLink?: string;
  modifiedTime?: string;
  size?: string;
  snippet?: string;
  extractedContent?: string;
  isSelected?: boolean;
  sourceType?: 'google_doc' | 'google_sheet' | 'text' | 'pdf' | 'markdown' | 'other' | 'sample';
}

export interface FunctionalRequirement {
  id: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low' | 'Critical';
  module: string;
  acceptanceCriteria: string[];
  isCompleted?: boolean;
}

export interface TechStackSpec {
  category: string;
  technology: string;
  versionOrDetail?: string;
  rationale?: string;
}

export interface ProjectMilestone {
  phase: string;
  title: string;
  targetTimeline?: string;
  keyDeliverables: string[];
}

export interface ProjectRequirementsDoc {
  projectName: string;
  summary: string;
  primaryObjective: string;
  targetAudience: string[];
  keyFeatures: string[];
  functionalRequirements: FunctionalRequirement[];
  techStack: TechStackSpec[];
  designAndUXGuidelines: string[];
  milestones: ProjectMilestone[];
  securityAndNonFunctional: string[];
  openQuestionsAndRisks: string[];
  rawMarkdownReport: string;
  analyzedAt: string;
  sourceFilesCount: number;
  sourceFilesSummary: { name: string; relevance: string }[];
}

export interface SearchState {
  isScanning: boolean;
  scanProgress: number;
  statusMessage: string;
  query: string;
  scannedCount: number;
  error: string | null;
}
