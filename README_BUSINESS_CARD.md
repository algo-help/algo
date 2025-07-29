# 명함 생성기 설정 가이드

## 개요
이 문서는 명함 생성기 기능을 위한 템플릿과 폰트 설정 방법을 안내합니다.

## Supabase Storage 설정

### 1. Storage 버킷 생성
다음 마이그레이션이 이미 작성되어 있습니다:
```bash
supabase db push
```

이 명령어로 다음 버킷들이 생성됩니다:
- `templates` - PDF 템플릿 저장용
- `fonts` - 폰트 파일 저장용
- `business-cards` - 생성된 명함 저장용

### 2. 템플릿 업로드 (선택사항)
기존 S3에서 사용하던 `frame.pdf` 파일이 있다면:
1. Supabase 대시보드 > Storage > templates 버킷으로 이동
2. `frame.pdf` 파일 업로드

### 3. 폰트 업로드 (선택사항)
한글 폰트를 사용하려면:
1. Supabase 대시보드 > Storage > fonts 버킷으로 이동
2. 다음 폰트 파일들을 업로드:
   - `Pretendard-Regular.ttf`
   - `Pretendard-SemiBold.ttf`
   - `Pretendard-Medium.ttf`
   - `Codec-Pro-Regular.otf`
   - `Codec-Pro-Bold.otf`

## 템플릿과 폰트가 없어도 작동합니다
- 템플릿이 없으면 기본 명함 크기(90mm x 50mm)의 빈 PDF가 생성됩니다
- 폰트가 없으면 PDF 기본 폰트(Helvetica)가 사용됩니다

## 사용 방법
1. 사이드바 메뉴에서 "명함 생성기" 클릭
2. 명함 정보 입력
3. "명함 생성하기" 버튼 클릭
4. 생성된 PDF 미리보기 확인 및 다운로드

## 기존 Python 코드와의 차이점
- AWS S3 → Supabase Storage
- Python PyMuPDF → TypeScript pdf-lib
- Lambda 함수 → Next.js API Route
- 한글 폰트는 선택사항 (없어도 기본 폰트로 동작)

## 문제 해결
- "인증이 필요합니다" 오류: 로그인 상태 확인
- "Storage 오류": Supabase 대시보드에서 Storage 버킷 생성 확인
- 한글 깨짐: fonts 버킷에 한글 폰트 업로드