-- Session Management and Audit Logging Tables
-- Add to bankim_content database

-- =================================================================
-- 1. SESSION TABLE (used by connect-pg-simple)
-- =================================================================
CREATE TABLE IF NOT EXISTS session (
  sid VARCHAR NOT NULL COLLATE "default",
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL
)
WITH (OIDS=FALSE);

ALTER TABLE session ADD CONSTRAINT session_pkey PRIMARY KEY (sid) NOT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX IF NOT EXISTS IDX_session_expire ON session(expire);

-- =================================================================
-- 2. ADMIN USERS TABLE (enhanced)
-- =================================================================
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,  -- bcrypt hash
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('director', 'administration', 'sales-manager', 'content-manager', 'brokers', 'bank-employee')),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user (password: 'admin123' - change in production!)
INSERT INTO admin_users (email, password_hash, name, role) VALUES 
('admin@bankim.co.il', '$2b$10$8K1p/a0dclBR2bw2CcbVSOu/K9e8c7JQwRgZyGOFhQJZHzaZhqK0m', 'System Administrator', 'director')
ON CONFLICT (email) DO NOTHING;

-- =================================================================
-- 3. CONTENT AUDIT LOG TABLE
-- =================================================================
CREATE TABLE IF NOT EXISTS content_audit_log (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- User Information (from session)
    user_id INTEGER REFERENCES admin_users(id),
    user_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    
    -- Content Information
    content_item_id BIGINT REFERENCES content_items(id),
    content_key VARCHAR(255) NOT NULL,
    screen_location VARCHAR(100),
    language_code VARCHAR(10) NOT NULL,
    
    -- Change Details
    action_type VARCHAR(20) CHECK (action_type IN ('CREATE', 'UPDATE', 'DELETE')) NOT NULL,
    field_changed VARCHAR(100) DEFAULT 'content_value',
    old_value TEXT,
    new_value TEXT,
    
    -- Request Metadata
    source_page VARCHAR(100),
    user_agent TEXT,
    ip_address INET,
    referer_url TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON content_audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON content_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_content ON content_audit_log(content_item_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_content_key ON content_audit_log(content_key);
CREATE INDEX IF NOT EXISTS idx_audit_log_session ON content_audit_log(session_id);

-- =================================================================
-- 4. LOGIN AUDIT TABLE (track login attempts)
-- =================================================================
CREATE TABLE IF NOT EXISTS login_audit_log (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    email VARCHAR(255) NOT NULL,
    user_id INTEGER REFERENCES admin_users(id),
    session_id VARCHAR(255),
    success BOOLEAN NOT NULL,
    failure_reason VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_login_audit_timestamp ON login_audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_login_audit_email ON login_audit_log(email);
CREATE INDEX IF NOT EXISTS idx_login_audit_success ON login_audit_log(success); 