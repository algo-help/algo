import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, rgb, PDFPage } from 'pdf-lib'
import { readFile } from 'fs/promises'
import path from 'path'
import * as opentype from 'opentype.js'

interface ContactInfo {
  name: string
  title: string
  phone: string
  email: string
  company: string
  website: string
  address: string
}

interface LayoutConfig {
  startX: number
  startY: number
  lineHeight: number
  nameSpacing: number[]
  proSpacing: number
}

// OpenType.js 명령을 PDF 콘텐츠 스트림으로 변환
function pathCommandsToContentStream(commands: any[], x: number, y: number, scale: number = 1): string {
  let content = ''
  const darkGray = '0.137 0.122 0.125'
  
  // 색상 설정
  content += `${darkGray} rg\n`
  
  // 첫 번째 moveTo 명령을 찾아서 현재 위치 저장
  let currentX = 0
  let currentY = 0
  
  for (const cmd of commands) {
    switch (cmd.type) {
      case 'M':
        currentX = cmd.x
        currentY = cmd.y
        // Y 좌표 변환: OpenType.js는 상단이 0이므로 PDF 좌표계로 변환
        content += `${(cmd.x + x) * scale} ${(y - cmd.y) * scale} m\n`
        break
      case 'L':
        currentX = cmd.x
        currentY = cmd.y
        content += `${(cmd.x + x) * scale} ${(y - cmd.y) * scale} l\n`
        break
      case 'C':
        currentX = cmd.x
        currentY = cmd.y
        content += `${(cmd.x1 + x) * scale} ${(y - cmd.y1) * scale} ${(cmd.x2 + x) * scale} ${(y - cmd.y2) * scale} ${(cmd.x + x) * scale} ${(y - cmd.y) * scale} c\n`
        break
      case 'Q':
        // 2차 베지어를 3차로 변환
        currentX = cmd.x
        currentY = cmd.y
        const qx1 = (cmd.x1 + x) * scale
        const qy1 = (y - cmd.y1) * scale
        const qx = (cmd.x + x) * scale
        const qy = (y - cmd.y) * scale
        content += `${qx1} ${qy1} ${qx} ${qy} ${qx} ${qy} c\n`
        break
      case 'Z':
        content += 'h\n'
        break
    }
  }
  
  // 패스 채우기
  content += 'f\n'
  
  return content
}

export async function POST(request: NextRequest) {
  console.log('=== 명함 생성 API 시작 (벡터 패스 버전) ===')
  
  try {
    const supabase = await createClient()
    
    // 사용자 인증 확인
    console.log('1. 사용자 인증 확인 중...')
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('인증 실패:', authError)
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }
    console.log('인증 성공, 사용자 ID:', user.id)

    // 요청 데이터 파싱
    console.log('2. 요청 데이터 파싱 중...')
    const contactInfo: ContactInfo = await request.json()
    console.log('연락처 정보:', contactInfo)
    
    // mm를 포인트로 변환하는 함수 (1mm = 2.834645669291339 points)
    const mmToPt = (mm: number) => mm * 2.834645669291339

    // 레이아웃 설정 (시작 위치를 mm로 지정)
    const layout: LayoutConfig = {
      startX: mmToPt(20.5),  // 20.5mm를 포인트로 변환
      startY: mmToPt(20.0),  // 20.0mm를 포인트로 변환
      lineHeight: 13.5,
      nameSpacing: [1.3, 1.5],
      proSpacing: 1.0
    }

    // 템플릿 PDF 로드
    console.log('3. 템플릿 PDF 로드 중...')
    const templatePath = path.join(process.cwd(), 'public', 'templates', 'business_card_template.pdf')
    const templateData = await readFile(templatePath)
    
    // PDF 문서 생성
    console.log('4. PDF 문서 생성 중...')
    const pdfDoc = await PDFDocument.load(templateData)
    const pages = pdfDoc.getPages()
    const page = pages[0]
    const { width, height } = page.getSize()
    console.log('페이지 크기:', { width, height })

    // 폰트 경로 설정
    const fontsDir = path.join(process.cwd(), 'public', 'fonts')
    const fonts = {
      pretendardRegular: path.join(fontsDir, 'Pretendard-Regular.otf'),
      pretendardSemiBold: path.join(fontsDir, 'Pretendard-SemiBold.otf'),
      pretendardMedium: path.join(fontsDir, 'Pretendard-Medium.otf'),
      codecProRegular: path.join(fontsDir, 'Codec-Pro-Regular.otf'),
      codecProBold: path.join(fontsDir, 'Codec-Pro-Bold.otf')
    }

    // 첫 번째 텍스트의 폰트 ascender 계산 (10pt Pretendard SemiBold)
    const fontBuffer = await readFile(fonts.pretendardSemiBold)
    const nameFont = opentype.parse(fontBuffer.buffer.slice(
      fontBuffer.byteOffset,
      fontBuffer.byteOffset + fontBuffer.byteLength
    ))
    const fontSize = 10
    const scale = fontSize / nameFont.unitsPerEm
    const ascender = nameFont.ascender * scale
    
    // Y 위치 계산 (PDF 좌표계는 하단이 0)
    // 기본 20mm + additionalOffset으로 조정 (ascender 제외)
    const additionalOffset = mmToPt(2.5) // Y 위치 조정값
    const yPositions = {
      name: mmToPt(20.0) + additionalOffset,    // 시작 Y 위치 20mm + offset
      title: mmToPt(24.0) + additionalOffset,   // 24.0mm
      mLabel: mmToPt(33.5) + additionalOffset,  // 이전 간격 유지
      eLabel: mmToPt(38.5) + additionalOffset,  // 이전 간격 유지
      company: mmToPt(49.0) + additionalOffset, // 49.0mm
      website: mmToPt(53.0) + additionalOffset, // 53.0mm
      address: mmToPt(57.0) + additionalOffset  // 57.0mm
    }
    
    // PDF 좌표계로 변환 (하단이 0)
    const baseY = height - yPositions.name
    const positionY = height - yPositions.title
    const mLabelY = height - yPositions.mLabel
    const eLabelY = height - yPositions.eLabel
    const companyY = height - yPositions.company
    const websiteY = height - yPositions.website
    const addressY = height - yPositions.address
    
    const x = layout.startX
    
    // 디버깅용 로그
    console.log('=== Y 좌표 분석 ===')
    console.log('페이지 높이:', height, 'points =', height / 2.834645669291339, 'mm')
    console.log('폰트 ascender:', ascender, 'points =', ascender / 2.834645669291339, 'mm')
    console.log('추가 오프셋:', additionalOffset, 'points =', additionalOffset / 2.834645669291339, 'mm')
    console.log('시작 Y (20mm + offset):', yPositions.name, 'points')
    console.log('변환된 Y (baseY):', baseY, 'points')
    console.log('실제 상단에서 거리:', height - baseY, 'points =', (height - baseY) / 2.834645669291339, 'mm')
    console.log('')
    console.log('차이 발생 가능 원인:')
    console.log('1. PDF 템플릿의 여백/마진')
    console.log('2. 폰트 메트릭스 차이 (ascender/descender 비율)')
    console.log('3. PDF 좌표계 변환 시 반올림 오차')
    console.log('4. 템플릿 PDF의 MediaBox vs CropBox 차이')
    console.log('===================')

    console.log('5. 텍스트를 벡터 패스로 변환 중...')
    
    // 모든 텍스트의 콘텐츠 스트림을 수집
    let allContentStreams = ''
    
    // 텍스트를 패스로 변환하는 함수
    const addTextAsPath = async (
      text: string,
      x: number,
      y: number,
      fontSize: number,
      fontPath: string,
      letterSpacing: number = 0
    ): Promise<void> => {
      const fontBuffer = await readFile(fontPath)
      const font = opentype.parse(fontBuffer.buffer.slice(
        fontBuffer.byteOffset,
        fontBuffer.byteOffset + fontBuffer.byteLength
      ))
      
      // 자간이 있는 경우 각 글자를 개별적으로 처리
      if (letterSpacing > 0) {
        let currentX = 0
        for (let i = 0; i < text.length; i++) {
          const char = text[i]
          const path = font.getPath(char, currentX, 0, fontSize)
          const contentStream = pathCommandsToContentStream(path.commands, x, y)
          allContentStreams += contentStream
          
          // 다음 글자 위치 계산 (글자 너비 + 자간)
          const charWidth = font.getAdvanceWidth(char, fontSize)
          currentX += charWidth + letterSpacing
        }
      } else {
        // 글리프 패스 가져오기
        const path = font.getPath(text, 0, 0, fontSize)
        const contentStream = pathCommandsToContentStream(path.commands, x, y)
        allContentStreams += contentStream
      }
    }

    // 각 텍스트 추가
    const nameText = contactInfo.name.replace(' 프로', '')
    // 이름에 자간 75 적용 (75/1000 * fontSize = 0.75)
    await addTextAsPath(nameText, x, baseY, 10, fonts.pretendardSemiBold, 0.75)
    
    if (contactInfo.name.includes('프로')) {
      const fontBuffer = await readFile(fonts.pretendardSemiBold)
      const nameFont = opentype.parse(fontBuffer.buffer.slice(
        fontBuffer.byteOffset,
        fontBuffer.byteOffset + fontBuffer.byteLength
      ))
      // 자간이 적용된 이름의 전체 너비 계산
      let nameWidth = 0
      for (let i = 0; i < nameText.length; i++) {
        nameWidth += nameFont.getAdvanceWidth(nameText[i], 10)
        if (i < nameText.length - 1) {
          nameWidth += 0.75 // 자간 추가
        }
      }
      
      await addTextAsPath('프로', x + nameWidth + 3.8, baseY - 0.7, 7.5, fonts.pretendardMedium)
    }
    
    await addTextAsPath(contactInfo.title, x, positionY, 7.5, fonts.pretendardRegular)
    await addTextAsPath('M', x, mLabelY, 10, fonts.codecProBold)
    // 전화번호에 자간 25 적용 (25/1000 * fontSize = 0.25)
    await addTextAsPath(contactInfo.phone, mmToPt(27), mLabelY, 10, fonts.codecProRegular, 0.25)
    await addTextAsPath('E', x, eLabelY, 10, fonts.codecProBold)
    // 이메일에 자간 25 적용
    await addTextAsPath(contactInfo.email, mmToPt(27), eLabelY, 10, fonts.codecProRegular, 0.25)
    // 회사명에 자간 25 적용
    await addTextAsPath(contactInfo.company, x, companyY, 7.5, fonts.pretendardSemiBold, 0.1875) // 7.5pt 폰트에 비례하여 조정
    await addTextAsPath(contactInfo.website, x, websiteY, 8.25, fonts.codecProRegular)
    await addTextAsPath(contactInfo.address, x, addressY, 7.5, fonts.pretendardRegular)

    console.log('6. 콘텐츠 스트림을 페이지에 추가 중...')
    
    // 그래픽 상태 저장/복원으로 감싸기
    const finalContentStream = `q\n${allContentStreams}Q\n`
    
    // 콘텐츠 스트림을 페이지에 직접 추가
    const contentStreamRef = pdfDoc.context.register(
      pdfDoc.context.stream(finalContentStream, {})
    )
    page.node.addContentStream(contentStreamRef)

    // SVG 미리보기 생성
    console.log('7. SVG 미리보기 생성 중...')
    let svgPaths = ''
    
    const createSVGPath = async (
      text: string,
      x: number,
      y: number,
      fontSize: number,
      fontPath: string,
      letterSpacing: number = 0
    ): Promise<string> => {
      const fontBuffer = await readFile(fontPath)
      const font = opentype.parse(fontBuffer.buffer.slice(
        fontBuffer.byteOffset,
        fontBuffer.byteOffset + fontBuffer.byteLength
      ))
      
      let svgPaths = ''
      // SVG에서 보기 좋은 크기로 스케일 조정 (PDF 포인트를 SVG 픽셀로)
      const svgScale = 1.33 // 96dpi / 72dpi 비율
      
      if (letterSpacing > 0) {
        let currentX = 0
        for (let i = 0; i < text.length; i++) {
          const char = text[i]
          const path = font.getPath(char, currentX, 0, fontSize * svgScale)
          const svgPath = path.toPathData(2)
          svgPaths += `<path d="${svgPath}" fill="#231f20" transform="translate(${x * svgScale}, ${y * svgScale})"/>`
          
          const charWidth = font.getAdvanceWidth(char, fontSize * svgScale)
          currentX += charWidth + (letterSpacing * svgScale)
        }
        return svgPaths
      } else {
        const path = font.getPath(text, 0, 0, fontSize * svgScale)
        const svgPath = path.toPathData(2)
        return `<path d="${svgPath}" fill="#231f20" transform="translate(${x * svgScale}, ${y * svgScale})"/>`
      }
    }
    
    // SVG 템플릿 파일 읽기
    const templateSvgPath = path.join(process.cwd(), 'public', 'templates', 'business_card_template.svg')
    let templateSvgContent = ''
    try {
      templateSvgContent = await readFile(templateSvgPath, 'utf-8')
      console.log('SVG 템플릿 로드 성공')
    } catch (error) {
      console.error('SVG 템플릿 파일을 찾을 수 없습니다:', error)
    }
    
    // 각 텍스트를 SVG 패스로 변환 (PDF 좌표를 SVG 좌표로 변환)
    // PDF는 하단이 0이므로 SVG용 Y 좌표 계산
    const svgNameY = height - baseY
    const svgTitleY = height - positionY
    const svgMLabelY = height - mLabelY
    const svgELabelY = height - eLabelY
    const svgCompanyY = height - companyY
    const svgWebsiteY = height - websiteY
    const svgAddressY = height - addressY
    
    svgPaths += await createSVGPath(nameText, x, svgNameY, 10, fonts.pretendardSemiBold, 0.75) // 자간 75 적용
    
    if (contactInfo.name.includes('프로')) {
      const fontBuffer = await readFile(fonts.pretendardSemiBold)
      const nameFont = opentype.parse(fontBuffer.buffer.slice(
        fontBuffer.byteOffset,
        fontBuffer.byteOffset + fontBuffer.byteLength
      ))
      // 자간이 적용된 이름의 전체 너비 계산
      let nameWidth = 0
      for (let i = 0; i < nameText.length; i++) {
        nameWidth += nameFont.getAdvanceWidth(nameText[i], 10)
        if (i < nameText.length - 1) {
          nameWidth += 0.75 // 자간 추가
        }
      }
      
      svgPaths += await createSVGPath('프로', x + nameWidth + 3.8, svgNameY + 0.7, 7.5, fonts.pretendardMedium)
    }
    
    svgPaths += await createSVGPath(contactInfo.title, x, svgTitleY, 7.5, fonts.pretendardRegular)
    svgPaths += await createSVGPath('M', x, svgMLabelY, 10, fonts.codecProBold)
    svgPaths += await createSVGPath(contactInfo.phone, mmToPt(27), svgMLabelY, 10, fonts.codecProRegular, 0.25)  // 자간 25 적용
    svgPaths += await createSVGPath('E', x, svgELabelY, 10, fonts.codecProBold)
    svgPaths += await createSVGPath(contactInfo.email, mmToPt(27), svgELabelY, 10, fonts.codecProRegular, 0.25)  // 자간 25 적용
    svgPaths += await createSVGPath(contactInfo.company, x, svgCompanyY, 7.5, fonts.pretendardSemiBold, 0.1875)  // 자간 25 적용 (비례)
    svgPaths += await createSVGPath(contactInfo.website, x, svgWebsiteY, 8.25, fonts.codecProRegular)
    svgPaths += await createSVGPath(contactInfo.address, x, svgAddressY, 7.5, fonts.pretendardRegular)
    
    // 인쇄 가이드 설정 (14mm 재단선)
    const bleedMark = 39.685  // 14mm를 포인트로 변환 (1mm ≈ 2.835pt)
    
    // 실제 명함 크기 (재단선 내부)
    const cardWidth = width - (bleedMark * 2)
    const cardHeight = height - (bleedMark * 2)
    
    // SVG 스케일 적용
    const svgScale = 1.33
    const scaledWidth = width * svgScale
    const scaledHeight = height * svgScale
    const scaledBleedMark = bleedMark * svgScale
    const scaledCardWidth = cardWidth * svgScale
    const scaledCardHeight = cardHeight * svgScale
    
    // SVG 템플릿 내용을 파싱하여 viewBox와 내용을 추출
    let templateContent = ''
    if (templateSvgContent) {
      // SVG 태그를 제거하고 내용만 추출
      const svgMatch = templateSvgContent.match(/<svg[^>]*>([\s\S]*)<\/svg>/i)
      if (svgMatch) {
        templateContent = svgMatch[1]
      }
    }
    
    // 전체 SVG 생성 (인쇄 가이드 포함)
    const svgWithGuides = `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${scaledWidth} ${scaledHeight}" preserveAspectRatio="xMidYMid meet">
        <!-- 템플릿 배경 -->
        ${templateContent ? `<g transform="scale(${svgScale}, ${svgScale})">${templateContent}</g>` : `<rect x="0" y="0" width="${scaledWidth}" height="${scaledHeight}" fill="#ffffff"/>`}
        
        <!-- 텍스트 -->
        <g>
          ${svgPaths}
        </g>
        
        
        <!-- 재단선 (빨간색 점선) -->
        <rect x="${scaledBleedMark}" y="${scaledBleedMark}" width="${scaledCardWidth}" height="${scaledCardHeight}" 
              fill="none" stroke="#ff0000" stroke-width="0.5" stroke-dasharray="5,5" opacity="0.5"/>
        
        <!-- 재단 표시 (모서리) -->
        <g stroke="#ff0000" stroke-width="0.5" opacity="0.7">
          <!-- 좌상단 -->
          <line x1="0" y1="${scaledBleedMark}" x2="${scaledBleedMark/2}" y2="${scaledBleedMark}"/>
          <line x1="${scaledBleedMark}" y1="0" x2="${scaledBleedMark}" y2="${scaledBleedMark/2}"/>
          <!-- 우상단 -->
          <line x1="${scaledWidth}" y1="${scaledBleedMark}" x2="${scaledWidth - scaledBleedMark/2}" y2="${scaledBleedMark}"/>
          <line x1="${scaledWidth - scaledBleedMark}" y1="0" x2="${scaledWidth - scaledBleedMark}" y2="${scaledBleedMark/2}"/>
          <!-- 좌하단 -->
          <line x1="0" y1="${scaledHeight - scaledBleedMark}" x2="${scaledBleedMark/2}" y2="${scaledHeight - scaledBleedMark}"/>
          <line x1="${scaledBleedMark}" y1="${scaledHeight}" x2="${scaledBleedMark}" y2="${scaledHeight - scaledBleedMark/2}"/>
          <!-- 우하단 -->
          <line x1="${scaledWidth}" y1="${scaledHeight - scaledBleedMark}" x2="${scaledWidth - scaledBleedMark/2}" y2="${scaledHeight - scaledBleedMark}"/>
          <line x1="${scaledWidth - scaledBleedMark}" y1="${scaledHeight}" x2="${scaledWidth - scaledBleedMark}" y2="${scaledHeight - scaledBleedMark/2}"/>
        </g>
      </svg>
    `
    
    // 인쇄 가이드 없는 버전 (실제 명함 크기만)
    const svgWithoutGuides = `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${scaledCardWidth} ${scaledCardHeight}" preserveAspectRatio="xMidYMid meet">
        <!-- 템플릿 배경 (재단 영역만큼 이동) -->
        ${templateContent ? `<g transform="translate(-${scaledBleedMark}, -${scaledBleedMark}) scale(${svgScale}, ${svgScale})">${templateContent}</g>` : `<rect x="0" y="0" width="${scaledCardWidth}" height="${scaledCardHeight}" fill="#ffffff"/>`}
        
        <!-- 텍스트 (재단선 만큼 이동) -->
        <g transform="translate(-${scaledBleedMark}, -${scaledBleedMark})">
          ${svgPaths}
        </g>
      </svg>`
    
    // HTML로 감싸서 스크롤 방지
    const htmlWithGuides = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
body { margin: 0; padding: 0; overflow: hidden; background: #ffffff; }
svg { display: block; width: 100%; height: 100%; }
</style>
</head>
<body>
${svgWithGuides}
</body>
</html>`

    const htmlWithoutGuides = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
body { margin: 0; padding: 0; overflow: hidden; background: #ffffff; }
svg { display: block; width: 100%; height: 100%; }
</style>
</head>
<body>
${svgWithoutGuides}
</body>
</html>`
    
    // HTML을 base64로 인코딩
    const svgWithGuidesBase64 = Buffer.from(htmlWithGuides).toString('base64')
    const svgWithGuidesUrl = `data:text/html;base64,${svgWithGuidesBase64}`
    
    const svgWithoutGuidesBase64 = Buffer.from(htmlWithoutGuides).toString('base64')
    const svgWithoutGuidesUrl = `data:text/html;base64,${svgWithoutGuidesBase64}`

    // PDF 저장
    console.log('8. PDF 저장 중...')
    const pdfBytes = await pdfDoc.save()
    console.log('PDF 크기:', pdfBytes.length, 'bytes')
    
    // Base64로 인코딩
    const base64 = Buffer.from(pdfBytes).toString('base64')
    const dataUrl = `data:application/pdf;base64,${base64}`
    
    console.log('=== 명함 생성 완료 (모든 텍스트가 벡터 패스로 변환됨) ===')
    return NextResponse.json({
      message: '명함이 성공적으로 생성되었습니다',
      url: dataUrl,
      previewUrl: svgWithoutGuidesUrl,
      previewWithGuidesUrl: svgWithGuidesUrl,
      fileName: `business_card_${contactInfo.name.replace(/\s+/g, '_')}.pdf`,
      templateImageUrl: '', // SVG는 미리보기에 직접 포함됨
      svgPaths: svgPaths,
      dimensions: { 
        width: scaledWidth, 
        height: scaledHeight, 
        cardWidth: scaledCardWidth, 
        cardHeight: scaledCardHeight, 
        bleedMark: scaledBleedMark 
      }
    })
    
  } catch (error) {
    console.error('=== 명함 생성 오류 ===')
    console.error('오류:', error)
    
    return NextResponse.json(
      { 
        error: '명함 생성 중 오류가 발생했습니다', 
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    )
  }
}