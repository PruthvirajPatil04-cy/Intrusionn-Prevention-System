export type Priority = 'P1' | 'P2' | 'P3';
export type CoverageLevel = 'Full' | 'High' | 'Partial';

export interface FrameworkRef {
  framework: 'NIST SP 800-94' | 'NIST CSF 2.0' | 'CIS Controls v8' | 'MITRE ATT&CK';
  controlId: string;
  title: string;
}

export interface Control {
  id: string;
  title: string;
  description: string;
  section: string;
  sectionId: string;
  priority: Priority;
  frameworkRefs: FrameworkRef[];
  implementationNotes: string;
  verificationMethod: string;
}

export interface Principle {
  id: string;
  title: string;
  description: string;
  category: 'Strategic' | 'Operational' | 'Architectural';
}

export interface ArchitectureNode {
  id: string;
  name: string;
  layer: 'perimeter' | 'datacenter' | 'cloud' | 'segmentation' | 'endpoint';
  direction: 'North-South' | 'East-West' | 'Hybrid' | 'Boundary' | 'Host';
  description: string;
  chokepoints: string[];
  inspectionFocus: string[];
  enforcementMode: string;
  telemetryOutput: string[];
  tuningGuidance: string;
  kpis: { label: string; value: string }[];
}

export interface LifecycleStage {
  id: string;
  step: number;
  name: 'Scope' | 'Discover' | 'Protect' | 'Optimize' | 'Maintain';
  tagline: string;
  objectives: string[];
  actions: string[];
  tuningNotes: string[];
  alertFirstGuidance: string;
  exitCriteria: string[];
}

export interface SocUseCase {
  id: string;
  name: string;
  severity: 'Critical' | 'High' | 'Medium';
  trigger: string;
  correlationLogic: string;
  soarAction: string;
  containmentProtocol: string;
  evidenceRetained: string[];
}

export interface ZeroTrustPillar {
  id: string;
  title: string;
  description: string;
  technicalMechanism: string;
  ipsIntegration: string;
  metric: string;
}

export interface FrameworkMapping {
  id: string;
  framework: 'NIST SP 800-94' | 'NIST CSF 2.0' | 'CIS Controls v8' | 'MITRE ATT&CK';
  controlRef: string;
  frameworkTitle: string;
  ippCoverage: string;
  coverageLevel: CoverageLevel;
  primaryIppControls: string[];
}

export interface MetricItem {
  id: string;
  category: 'Coverage' | 'Efficacy' | 'Operational Health' | 'SOC Integration';
  name: string;
  value: string | number;
  target: string | number;
  unit: string;
  status: 'optimal' | 'warning' | 'alert';
  description: string;
}

export interface ChecklistItem {
  id: string;
  controlId: string;
  section: string;
  sectionId: string;
  title: string;
  description: string;
  priority: Priority;
  frameworks: string[];
  implementationNotes: string;
}

export interface EmergingTopic {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  impact: string;
  architecturalPattern: string;
  operationalRisks: string[];
  recommendedControls: string[];
}

export interface SummaryRow {
  area: string;
  route: string;
  keyComponents: string;
  standards: string;
  criticalSuccessFactor: string;
}

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  route: string;
  badge?: string;
}
