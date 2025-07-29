interface ContactInfo {
  name: string
  title: string
  phone: string
  email: string
  company: string
  website: string
  address: string
}

// mm를 포인트로 변환하는 함수
const mmToPt = (mm: number) => mm * 2.834645669291339

// 템플릿 크기 (서버와 동일)
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

// 레이아웃 설정 (서버와 동일)
const layout = {
  startX: mmToPt(20.5),
  startY: mmToPt(20.0),
}

// Y 위치 계산 (서버와 동일)
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

// SVG Y 좌표 계산 (서버와 동일한 로직)
const svgNameY = height - (height - yPositions.name)
const svgTitleY = height - (height - yPositions.title)
const svgMLabelY = height - (height - yPositions.mLabel)
const svgELabelY = height - (height - yPositions.eLabel)
const svgCompanyY = height - (height - yPositions.company)
const svgWebsiteY = height - (height - yPositions.website)
const svgAddressY = height - (height - yPositions.address)

const x = layout.startX

// 클라이언트용 SVG 생성 (서버 로직과 동일하지만 웹폰트 사용)
export function generateBusinessCardPreview(formData: ContactInfo, showPrintGuides: boolean, templateContent?: string) {
  // SVG 패스 생성 (웹폰트를 사용한 text 엘리먼트)
  let svgPaths = ''
  
  const nameText = formData.name.replace(' 프로', '')
  const hasPro = formData.name.includes('프로')
  
  // 이름 (자간 0.75 적용)
  svgPaths += `<text x="${x * svgScale}" y="${svgNameY * svgScale}" 
    font-family="'Pretendard', -apple-system, sans-serif" 
    font-size="${10 * svgScale}" 
    font-weight="600" 
    fill="#231f20" 
    letter-spacing="0.75">${nameText}</text>`
  
  if (hasPro) {
    // "프로" 텍스트 (이름 너비 계산은 대략적으로)
    const nameWidth = nameText.length * 8 // 대략적인 계산
    svgPaths += `<text x="${(x + nameWidth + 3.8) * svgScale}" y="${(svgNameY + 0.7) * svgScale}" 
      font-family="'Pretendard', -apple-system, sans-serif" 
      font-size="${7.5 * svgScale}" 
      font-weight="500" 
      fill="#231f20">프로</text>`
  }
  
  // 직책
  svgPaths += `<text x="${x * svgScale}" y="${svgTitleY * svgScale}" 
    font-family="'Pretendard', -apple-system, sans-serif" 
    font-size="${7.5 * svgScale}" 
    font-weight="400" 
    fill="#231f20">${formData.title}</text>`
  
  // M 라벨
  svgPaths += `<text x="${x * svgScale}" y="${svgMLabelY * svgScale}" 
    font-family="'Codec Pro', monospace" 
    font-size="${10 * svgScale}" 
    font-weight="700" 
    fill="#231f20">M</text>`
  
  // 전화번호 (자간 0.25 적용)
  svgPaths += `<text x="${mmToPt(27) * svgScale}" y="${svgMLabelY * svgScale}" 
    font-family="'Codec Pro', monospace" 
    font-size="${10 * svgScale}" 
    font-weight="400" 
    fill="#231f20" 
    letter-spacing="0.25">${formData.phone}</text>`
  
  // E 라벨
  svgPaths += `<text x="${x * svgScale}" y="${svgELabelY * svgScale}" 
    font-family="'Codec Pro', monospace" 
    font-size="${10 * svgScale}" 
    font-weight="700" 
    fill="#231f20">E</text>`
  
  // 이메일 (자간 0.25 적용)
  svgPaths += `<text x="${mmToPt(27) * svgScale}" y="${svgELabelY * svgScale}" 
    font-family="'Codec Pro', monospace" 
    font-size="${10 * svgScale}" 
    font-weight="400" 
    fill="#231f20" 
    letter-spacing="0.25">${formData.email}</text>`
  
  // 회사명 (자간 0.1875 적용)
  svgPaths += `<text x="${x * svgScale}" y="${svgCompanyY * svgScale}" 
    font-family="'Pretendard', -apple-system, sans-serif" 
    font-size="${7.5 * svgScale}" 
    font-weight="600" 
    fill="#231f20" 
    letter-spacing="0.1875">${formData.company}</text>`
  
  // 웹사이트
  svgPaths += `<text x="${x * svgScale}" y="${svgWebsiteY * svgScale}" 
    font-family="'Codec Pro', monospace" 
    font-size="${8.25 * svgScale}" 
    font-weight="400" 
    fill="#231f20">${formData.website}</text>`
  
  // 주소
  svgPaths += `<text x="${x * svgScale}" y="${svgAddressY * svgScale}" 
    font-family="'Pretendard', -apple-system, sans-serif" 
    font-size="${7.5 * svgScale}" 
    font-weight="400" 
    fill="#231f20">${formData.address}</text>`
  
  // 전체 SVG 생성 (인쇄 가이드 포함)
  if (showPrintGuides) {
    return `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${scaledWidth} ${scaledHeight}" preserveAspectRatio="xMidYMid meet">
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
  } else {
    // 인쇄 가이드 없는 버전 (실제 명함 크기만)
    return `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${scaledCardWidth} ${scaledCardHeight}" preserveAspectRatio="xMidYMid meet">
        <!-- 템플릿 배경 (재단 영역만큼 이동) -->
        ${templateContent ? `<g transform="translate(-${scaledBleedMark}, -${scaledBleedMark}) scale(${svgScale}, ${svgScale})">${templateContent}</g>` : `<rect x="0" y="0" width="${scaledCardWidth}" height="${scaledCardHeight}" fill="#ffffff"/>`}
        
        <!-- 텍스트 (재단선 만큼 이동) -->
        <g transform="translate(-${scaledBleedMark}, -${scaledBleedMark})">
          ${svgPaths}
        </g>
      </svg>`
  }
}