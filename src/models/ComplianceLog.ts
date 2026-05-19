export interface ComplianceLog {
  id: string;
  targetId: string; // ID of the asset, post, or page being checked
  targetType: 'Asset' | 'SocialPost' | 'LandingPage';
  ruleChecked: string;
  passed: boolean;
  reviewer?: string;
  comments?: string;
  timestamp: Date;
}
