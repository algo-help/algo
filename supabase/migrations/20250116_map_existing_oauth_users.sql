-- 기존 OAuth 사용자 매핑을 위한 임시 테이블
CREATE TABLE IF NOT EXISTS oauth_user_mapping (
    auth_id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 수동으로 기존 사용자 매핑 (관리자가 실행해야 함)
-- INSERT INTO oauth_user_mapping (auth_id, user_id, email) VALUES
-- ('5bc18f01-b341-4d0f-b0c9-fbf9b8e57bcb', '41c3c124-ba4b-4600-ab27-490a4d2278f4', 'developer@algocarelab.com'),
-- ('4c6b01f7-58c8-4222-ba3d-19da09474245', 'actual-jeff-user-id', 'jeff@algocarelab.com');

-- 또는 기존 사용자 삭제 후 재생성 유도
-- DELETE FROM users WHERE email IN ('developer@algocarelab.com', 'jeff@algocarelab.com') AND password_hash = 'oauth_user';