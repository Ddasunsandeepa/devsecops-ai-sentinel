-- Enable UUID extension for secure ID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
-- Stores authenticated users via GitHub OAuth
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    github_id VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    avatar_url TEXT,
    access_token TEXT NOT NULL, -- Encrypted at application level (AES-256)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- 2. REPOSITORIES TABLE
-- Git repositories linked to the user for monitoring
CREATE TABLE repositories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    github_repo_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL, -- e.g., "octocat/hello-world"
    html_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE, -- If false, webhooks are ignored
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, github_repo_id)
);

-- 3. COMMITS TABLE
-- Individual commits ingested via Webhook
CREATE TABLE commits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    repository_id UUID REFERENCES repositories(id) ON DELETE CASCADE,
    hash VARCHAR(40) NOT NULL,
    message TEXT,
    author_name VARCHAR(255),
    author_email VARCHAR(255),
    timestamp TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(repository_id, hash)
);

-- 4. SCANS TABLE
-- Represents a security analysis job performed on a commit
CREATE TABLE scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    commit_id UUID REFERENCES commits(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'QUEUED', -- QUEUED, PROCESSING, COMPLETED, FAILED
    risk_score INTEGER, -- 0 to 100
    summary TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    finished_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT
);

-- 5. VULNERABILITIES TABLE
-- Specific security flaws found during a scan
CREATE TABLE vulnerabilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scan_id UUID REFERENCES scans(id) ON DELETE CASCADE,
    type VARCHAR(255) NOT NULL, -- e.g., "SQL Injection"
    severity VARCHAR(50) NOT NULL CHECK (severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    description TEXT,
    location VARCHAR(255), -- e.g., "auth.js:42"
    remediation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX idx_repos_user_id ON repositories(user_id);
CREATE INDEX idx_commits_repo_id ON commits(repository_id);
CREATE INDEX idx_commits_hash ON commits(hash);
CREATE INDEX idx_scans_commit_id ON scans(commit_id);
CREATE INDEX idx_scans_status ON scans(status); -- For worker polling/metrics
CREATE INDEX idx_vulns_scan_id ON vulnerabilities(scan_id);

-- EXAMPLE QUERY: Get Dashboard Metrics
-- SELECT 
--   COUNT(s.id) as total_scans,
--   AVG(s.risk_score) as avg_risk,
--   COUNT(v.id) FILTER (WHERE v.severity = 'CRITICAL') as critical_vulns
-- FROM scans s
-- LEFT JOIN vulnerabilities v ON s.id = v.scan_id
-- WHERE s.finished_at > NOW() - INTERVAL '30 days';
