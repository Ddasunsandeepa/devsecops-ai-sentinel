
export interface Vulnerability {
  id: string;
  type: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  location: string;
  remediation: string;
}

export interface SecurityScanResult {
  scanId: string;
  timestamp: string;
  repository: string;
  commitHash: string;
  author: string;
  riskScore: number; // 0-100
  vulnerabilities: Vulnerability[];
  summary: string;
}

export interface MockCommit {
  id: string;
  repo: string;
  message: string;
  author: string;
  timestamp: string;
  codeSnippet: string;
  riskScore?: number;
}

export interface Repository {
  id: string;
  name: string;
  language: string;
  status: 'ACTIVE' | 'INACTIVE';
  lastScan: string;
  riskScore: number;
  commitCount: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: JobRole;
}

export enum AppView {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  REPOSITORIES = 'REPOSITORIES',
  COMMITS = 'COMMITS',
  SCAN_DETAILS = 'SCAN_DETAILS',
  SCANNER = 'SCANNER', // Live manual scanner
  ARCHITECTURE = 'ARCHITECTURE',
  SETTINGS = 'SETTINGS'
}

export enum JobRole {
  BACKEND = 'Backend Developer',
  DEVOPS = 'DevOps Engineer',
  SECURITY = 'Security Engineer',
  FULLSTACK = 'Full Stack Developer'
}
