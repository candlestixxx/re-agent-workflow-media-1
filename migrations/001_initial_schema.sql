-- Initial Schema for Real Estate Marketing Media Pipeline

CREATE TABLE IF NOT EXISTS listing_media_jobs (
    id VARCHAR(255) PRIMARY KEY,
    property_address VARCHAR(500) NOT NULL,
    mls_id VARCHAR(100),
    stage VARCHAR(50) NOT NULL,
    source_folder_path VARCHAR(1000) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    approved_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS generated_assets (
    id VARCHAR(255) PRIMARY KEY,
    job_id VARCHAR(255) REFERENCES listing_media_jobs(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'day' or 'night'
    ratio VARCHAR(20) NOT NULL, -- '16:9' or '4:3'
    source_image_path VARCHAR(1000) NOT NULL,
    output_path VARCHAR(1000) NOT NULL,
    prompt_used TEXT NOT NULL,
    version_number INTEGER DEFAULT 1,
    approval_status VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS video_processing_jobs (
    id VARCHAR(255) PRIMARY KEY,
    listing_id VARCHAR(255) REFERENCES listing_media_jobs(id) ON DELETE CASCADE,
    stage VARCHAR(50) NOT NULL,
    source_type VARCHAR(50) NOT NULL,
    target_ratio VARCHAR(20) NOT NULL,
    include_captions BOOLEAN DEFAULT true,
    status VARCHAR(50) NOT NULL,
    output_path VARCHAR(1000),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS landing_page_jobs (
    id VARCHAR(255) PRIMARY KEY,
    listing_id VARCHAR(255) REFERENCES listing_media_jobs(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    page_url VARCHAR(1000),
    analytics_id VARCHAR(255),
    pixel_id VARCHAR(255),
    popup_delay INTEGER DEFAULT 7,
    publish_status VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS social_post_drafts (
    id VARCHAR(255) PRIMARY KEY,
    job_id VARCHAR(255) REFERENCES listing_media_jobs(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    caption TEXT NOT NULL,
    image_path VARCHAR(1000) NOT NULL,
    approval_status VARCHAR(50) NOT NULL,
    publish_status VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS compliance_logs (
    id VARCHAR(255) PRIMARY KEY,
    reference_id VARCHAR(255) NOT NULL, -- references asset/post/page id
    rule_checked VARCHAR(255) NOT NULL,
    pass BOOLEAN NOT NULL,
    reviewer VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
