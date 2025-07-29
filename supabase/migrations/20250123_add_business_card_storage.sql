-- Enable Storage module if not already enabled
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('templates', 'templates', true),
    ('fonts', 'fonts', true), 
    ('business-cards', 'business-cards', true)
ON CONFLICT (id) DO NOTHING;

-- Storage 정책 설정
-- templates 버킷: 관리자만 업로드 가능, 모든 사용자가 읽기 가능
CREATE POLICY "Admin can upload templates" ON storage.objects
    FOR INSERT 
    TO authenticated
    WITH CHECK (
        bucket_id = 'templates' AND 
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
            AND users.is_active = true
        )
    );

CREATE POLICY "Anyone can read templates" ON storage.objects
    FOR SELECT
    TO authenticated
    USING (bucket_id = 'templates');

-- fonts 버킷: 관리자만 업로드 가능, 모든 사용자가 읽기 가능
CREATE POLICY "Admin can upload fonts" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'fonts' AND 
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
            AND users.is_active = true
        )
    );

CREATE POLICY "Anyone can read fonts" ON storage.objects
    FOR SELECT
    TO authenticated
    USING (bucket_id = 'fonts');

-- business-cards 버킷: 모든 활성 사용자가 업로드 가능, 자신의 파일만 읽기 가능
CREATE POLICY "Users can upload business cards" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'business-cards' AND 
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.is_active = true
        )
    );

CREATE POLICY "Users can read own business cards" ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'business-cards' AND 
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- 관리자는 모든 명함 읽기 가능
CREATE POLICY "Admin can read all business cards" ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'business-cards' AND 
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
            AND users.is_active = true
        )
    );

-- 사용자는 자신의 명함 삭제 가능
CREATE POLICY "Users can delete own business cards" ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'business-cards' AND 
        (storage.foldername(name))[1] = auth.uid()::text
    );