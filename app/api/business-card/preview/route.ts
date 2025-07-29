import { NextRequest, NextResponse } from 'next/server'
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

// OpenType.js 명령을 SVG 패스로 변환
function pathCommandsToSVGPath(commands: any[]): string {
  let path = ''
  
  for (const cmd of commands) {
    switch (cmd.type) {
      case 'M':
        path += `M${cmd.x},${cmd.y} `
        break
      case 'L':
        path += `L${cmd.x},${cmd.y} `
        break
      case 'C':
        path += `C${cmd.x1},${cmd.y1} ${cmd.x2},${cmd.y2} ${cmd.x},${cmd.y} `
        break
      case 'Q':
        path += `Q${cmd.x1},${cmd.y1} ${cmd.x},${cmd.y} `
        break
      case 'Z':
        path += 'Z '
        break
    }
  }
  
  return path.trim()
}

export async function POST(request: NextRequest) {
  try {
    const contactInfo: ContactInfo = await request.json()
    
    // mm를 포인트로 변환하는 함수
    const mmToPt = (mm: number) => mm * 2.834645669291339

    // 템플릿 크기 (이전에 확인한 값)
    const width = 321.119
    const height = 224.741
    
    // 재단선 14mm
    const bleedMark = 39.685
    const cardWidth = width - (bleedMark * 2)
    const cardHeight = height - (bleedMark * 2)
    
    // SVG 스케일
    const svgScale = 1.33
    const scaledWidth = width * svgScale
    const scaledHeight = height * svgScale
    const scaledBleedMark = bleedMark * svgScale
    const scaledCardWidth = cardWidth * svgScale
    const scaledCardHeight = cardHeight * svgScale
    
    // 레이아웃 설정
    const layout = {
      startX: mmToPt(20.5),
      startY: mmToPt(20.0),
    }
    
    // Y 위치 계산
    const additionalOffset = mmToPt(2.5)
    const yPositions = {
      name: mmToPt(20.0) + additionalOffset,
      title: mmToPt(24.0) + additionalOffset,
      mLabel: mmToPt(33.5) + additionalOffset,
      eLabel: mmToPt(38.5) + additionalOffset,
      company: mmToPt(49.0) + additionalOffset,
      website: mmToPt(53.0) + additionalOffset,
      address: mmToPt(57.0) + additionalOffset
    }
    
    // PDF 좌표를 SVG 좌표로 변환
    const svgNameY = height - (height - yPositions.name)
    const svgTitleY = height - (height - yPositions.title)
    const svgMLabelY = height - (height - yPositions.mLabel)
    const svgELabelY = height - (height - yPositions.eLabel)
    const svgCompanyY = height - (height - yPositions.company)
    const svgWebsiteY = height - (height - yPositions.website)
    const svgAddressY = height - (height - yPositions.address)
    
    const x = layout.startX
    
    // 폰트 경로 설정
    const fontsDir = path.join(process.cwd(), 'public', 'fonts')
    const fonts = {
      pretendardRegular: path.join(fontsDir, 'Pretendard-Regular.otf'),
      pretendardSemiBold: path.join(fontsDir, 'Pretendard-SemiBold.otf'),
      pretendardMedium: path.join(fontsDir, 'Pretendard-Medium.otf'),
      codecProRegular: path.join(fontsDir, 'Codec-Pro-Regular.otf'),
      codecProBold: path.join(fontsDir, 'Codec-Pro-Bold.otf')
    }
    
    // SVG 패스 생성
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
      const svgScale = 1.33
      
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
    let templateContent = ''
    try {
      const templateSvgContent = await readFile(templateSvgPath, 'utf-8')
      const svgMatch = templateSvgContent.match(/<svg[^>]*>([\s\S]*)<\/svg>/i)
      if (svgMatch) {
        templateContent = svgMatch[1]
      }
    } catch (error) {
      console.error('SVG 템플릿 파일을 찾을 수 없습니다:', error)
    }
    
    // 각 텍스트를 SVG 패스로 변환
    const nameText = contactInfo.name.replace(' 프로', '')
    svgPaths += await createSVGPath(nameText, x, svgNameY, 10, fonts.pretendardSemiBold, 0.75)
    
    if (contactInfo.name.includes('프로')) {
      const fontBuffer = await readFile(fonts.pretendardSemiBold)
      const nameFont = opentype.parse(fontBuffer.buffer.slice(
        fontBuffer.byteOffset,
        fontBuffer.byteOffset + fontBuffer.byteLength
      ))
      
      let nameWidth = 0
      for (let i = 0; i < nameText.length; i++) {
        nameWidth += nameFont.getAdvanceWidth(nameText[i], 10)
        if (i < nameText.length - 1) {
          nameWidth += 0.75
        }
      }
      
      svgPaths += await createSVGPath('프로', x + nameWidth + 3.8, svgNameY + 0.7, 7.5, fonts.pretendardMedium)
    }
    
    svgPaths += await createSVGPath(contactInfo.title, x, svgTitleY, 7.5, fonts.pretendardRegular)
    svgPaths += await createSVGPath('M', x, svgMLabelY, 10, fonts.codecProBold)
    svgPaths += await createSVGPath(contactInfo.phone, mmToPt(27), svgMLabelY, 10, fonts.codecProRegular, 0.25)
    svgPaths += await createSVGPath('E', x, svgELabelY, 10, fonts.codecProBold)
    svgPaths += await createSVGPath(contactInfo.email, mmToPt(27), svgELabelY, 10, fonts.codecProRegular, 0.25)
    svgPaths += await createSVGPath(contactInfo.company, x, svgCompanyY, 7.5, fonts.pretendardSemiBold, 0.1875)
    svgPaths += await createSVGPath(contactInfo.website, x, svgWebsiteY, 8.25, fonts.codecProRegular)
    svgPaths += await createSVGPath(contactInfo.address, x, svgAddressY, 7.5, fonts.pretendardRegular)
    
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
      </svg>`
    
    // 인쇄 가이드 없는 버전 (실제 명함 크기만)
    const svgWithoutGuides = `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${scaledCardWidth} ${scaledCardHeight}" preserveAspectRatio="xMidYMid meet">
        <!-- 템플릿 배경 (재단 영역만큼 이동) -->
        ${templateContent ? `<g transform="translate(-${scaledBleedMark}, -${scaledBleedMark}) scale(${svgScale}, ${svgScale})">${templateContent}</g>` : `<rect x="0" y="0" width="${scaledCardWidth}" height="${scaledCardHeight}" fill="#ffffff"/>`}
        
        <!-- 텍스트 (재단선 만큼 이동) -->
        <g transform="translate(-${scaledBleedMark}, -${scaledBleedMark})">
          ${svgPaths}
        </g>
      </svg>`
    
    // HTML로 감싸기
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
    
    // Base64로 인코딩
    const previewWithGuidesUrl = `data:text/html;base64,${Buffer.from(htmlWithGuides).toString('base64')}`
    const previewUrl = `data:text/html;base64,${Buffer.from(htmlWithoutGuides).toString('base64')}`
    
    return NextResponse.json({
      previewUrl,
      previewWithGuidesUrl,
      svgWithGuides,
      svgWithoutGuides
    })
    
  } catch (error) {
    console.error('미리보기 생성 오류:', error)
    return NextResponse.json(
      { error: '미리보기 생성 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}