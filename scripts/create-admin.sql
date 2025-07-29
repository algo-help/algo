-- 관리자 테스트 계정 생성
INSERT INTO users (email, password_hash, role, is_active)
VALUES (
    'test@algocarelab.com',
    '$2b$10$G5P8u8AufOGydu.h4YFXVefyIJ9XnswsOdjQSOtvicwFy6dBycxf2',
    'admin',
    true
)
ON CONFLICT (email) 
DO UPDATE SET 
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active;