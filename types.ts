
export enum RiskLevel {
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low'
}

export enum FaultCategory {
  HYGIENE = 'Hygiene',
  EQUIPMENT = 'Equipment',
  INFRASTRUCTURE = 'Infrastructure',
  CROSS_CONTAMINATION = 'Cross-Contamination',
  STORAGE = 'Storage'
}

export interface InspectionRecord {
  id: string;
  timestamp: string;
  inspectionDate: string;
  auditorName: string;
  propertyName: string;
  location: string;
  photoUrl: string;
  riskLevel: RiskLevel;
  category: FaultCategory;
  faultDescription: string;
  remediationSteps: string[];
  status: 'Open' | 'Resolved' | 'Escalated';
}

export interface TrainingModule {
  id: string;
  title: string;
  category: FaultCategory;
  content: string;
  lastUpdated: string;
  relatedIncidentsCount: number;
  priority: 'Urgent' | 'Routine';
}

export interface AuditStats {
  totalInspections: number;
  passRate: number;
  highRiskCount: number;
  resolvedCount: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
