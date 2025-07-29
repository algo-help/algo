'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Download, Loader2, CreditCard, Eye, EyeOff } from 'lucide-react'
import { generateBusinessCardPreview } from '@/utils/business-card-preview'

interface ContactInfo {
  name: string
  title: string
  phone: string
  email: string
  company: string
  website: string
  address: string
}

interface PreviewData {
  templateImageUrl: string
  svgPaths: string
  dimensions: {
    width: number
    height: number
    cardWidth: number
    cardHeight: number
    bleedMark: number
  }
}

export default function BusinessCardPage() {
  const [loading, setLoading] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewWithGuidesUrl, setPreviewWithGuidesUrl] = useState<string | null>(null)
  const [svgWithGuides, setSvgWithGuides] = useState<string | null>(null)
  const [svgWithoutGuides, setSvgWithoutGuides] = useState<string | null>(null)
  const [showPrintGuides, setShowPrintGuides] = useState(false)
  const [previewData, setPreviewData] = useState<PreviewData | null>(null)
  const [templateContent, setTemplateContent] = useState<string>('')
  const [formData, setFormData] = useState<ContactInfo>({
    name: '홍길동 프로',
    title: 'OO 파트 | OO Manager',
    phone: '010.0000.0000',
    email: 'ooo@algocare.me',
    company: '알고케어(주)',
    website: 'www.algocare.me',
    address: '04549 서울특별시 중구 마른내로 47, 6층'
  })

  // 실시간 미리보기 생성 (클라이언트 사이드)
  const svgPreview = useMemo(() => {
    return generateBusinessCardPreview(formData, showPrintGuides, templateContent)
  }, [formData, showPrintGuides, templateContent])
  
  // 초기 로드 시 템플릿 SVG 로드
  useEffect(() => {
    const loadTemplate = async () => {
      try {
        const response = await fetch('/templates/business_card_template.svg')
        if (response.ok) {
          const svgText = await response.text()
          // SVG 태그 내용만 추출
          const svgMatch = svgText.match(/<svg[^>]*>([\s\S]*)<\/svg>/i)
          if (svgMatch) {
            setTemplateContent(svgMatch[1])
          }
        }
      } catch (error) {
        console.error('템플릿 로드 오류:', error)
      }
    }

    loadTemplate()
  }, [])

  const handleInputChange = (field: keyof ContactInfo, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleGenerateCard = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/business-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      console.log('API 응답:', data)
      
      if (!response.ok) {
        throw new Error(data.error || '명함 생성에 실패했습니다')
      }

      setPdfUrl(data.url)
      
      // PDF 자동 다운로드
      const link = document.createElement('a')
      link.href = data.url
      link.download = `business_card_${formData.name.replace(/\s+/g, '_')}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success('명함 PDF가 다운로드되었습니다!')
      
    } catch (error) {
      console.error('명함 생성 오류:', error)
      toast.error(error instanceof Error ? error.message : '명함 생성 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    console.log('다운로드 시작, pdfUrl:', pdfUrl)
    if (pdfUrl) {
      const link = document.createElement('a')
      link.href = pdfUrl
      link.download = `business_card_${formData.name.replace(/\s+/g, '_')}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      console.log('다운로드 링크 클릭 완료')
    } else {
      console.error('pdfUrl이 없습니다')
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            명함 생성기
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            비즈니스 명함을 PDF로 생성합니다
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        {/* 입력 폼 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">명함 정보 입력</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              명함에 표시될 정보를 입력해주세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="홍길동 프로"
              />
              <p className="text-xs text-muted-foreground">
                "프로"를 포함하면 특별한 스타일이 적용됩니다
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">직책</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="OO 파트 | OO Manager"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">전화번호</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="010.0000.0000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="ooo@algocare.me"
              />
            </div>


            <Button
              onClick={handleGenerateCard}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  PDF 생성 중...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  명함 생성하기
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 미리보기 및 다운로드 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">명함 미리보기</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              입력한 정보가 실시간으로 반영됩니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            {svgPreview ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-xs sm:text-sm font-medium">미리보기</Label>
                  <Button
                    onClick={() => setShowPrintGuides(!showPrintGuides)}
                    variant="ghost"
                    size="sm"
                    className="h-7 sm:h-8 text-xs sm:text-sm"
                  >
                    {showPrintGuides ? (
                      <>
                        <EyeOff className="mr-2 h-3 w-3" />
                        인쇄 가이드 숨기기
                      </>
                    ) : (
                      <>
                        <Eye className="mr-2 h-3 w-3" />
                        인쇄 가이드 보기
                      </>
                    )}
                  </Button>
                </div>
                <div className="border rounded-lg p-3 sm:p-4">
                  {/* SVG 미리보기를 직접 렌더링 */}
                  <div className="relative w-full overflow-hidden rounded shadow-lg bg-white" style={{ 
                    aspectRatio: showPrintGuides ? '427.088 / 298.906' : '321.526 / 193.343'
                  }}>
                    <div 
                      className="absolute inset-0 w-full h-full"
                      dangerouslySetInnerHTML={{ 
                        __html: svgPreview
                      }}
                    />
                  </div>
                  {showPrintGuides && (
                    <div className="mt-3 text-xs text-muted-foreground space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 border border-red-500 rounded-sm"></div>
                        <span>재단선 (Cut line) - 14mm</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                {previewLoading ? (
                  <>
                    <Loader2 className="h-16 w-16 mx-auto mb-4 animate-spin opacity-50" />
                    <p>미리보기 로딩 중...</p>
                  </>
                ) : (
                  <>
                    <CreditCard className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>정보를 입력하면 미리보기가 표시됩니다</p>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}