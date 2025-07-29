"use client"

import React, { useState, useCallback, useRef } from "react"
import { Upload, FileSpreadsheet, Users, TrendingUp, DollarSign, AlertTriangle, Download, MoreVertical } from "lucide-react"
import * as XLSX from 'xlsx'
import html2canvas from 'html2canvas'
import JSZip from 'jszip'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Combobox } from "@/components/ui/combobox"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ExcelData {
  사용일자: string
  "이용금액(원)": number
  "내부 사용자": string
  카드별칭: string
  용도: string
  가맹점명: string
}

interface ExcessUser {
  "내부 사용자": string
  "초과 금액": number
}

interface UserDetail {
  사용일자: string
  "이용금액(원)": number
  "내부 사용자": string
  카드별칭: string
  용도: string
  가맹점명: string
}

export default function MonthlyUsagePage() {
  const [file, setFile] = useState<File | null>(null)
  const [data, setData] = useState<ExcelData[]>([])
  const [lunchExcess, setLunchExcess] = useState<ExcessUser[]>([])
  const [dinnerExcess, setDinnerExcess] = useState<ExcessUser[]>([])
  const [lunchDetails, setLunchDetails] = useState<UserDetail[]>([])
  const [dinnerDetails, setDinnerDetails] = useState<UserDetail[]>([])
  const [selectedUser, setSelectedUser] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string>("")
  const [lunchUsers, setLunchUsers] = useState<string[]>([])
  const [dinnerUsers, setDinnerUsers] = useState<string[]>([])
  const [selectedLunchUser, setSelectedLunchUser] = useState<string>("")
  const [selectedDinnerUser, setSelectedDinnerUser] = useState<string>("")
  const [showLunchExcessOnly, setShowLunchExcessOnly] = useState<boolean>(false)
  const [showDinnerExcessOnly, setShowDinnerExcessOnly] = useState<boolean>(false)
  
  // 이미지 캡처를 위한 ref
  const lunchTableRef = useRef<HTMLDivElement>(null)
  const dinnerTableRef = useRef<HTMLDivElement>(null)

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    // 파일 형식 검증
    if (!selectedFile.name.match(/\.(xlsx|xls)$/i)) {
      setError('Excel 파일(.xlsx, .xls)만 업로드 가능합니다.')
      return
    }

    setFile(selectedFile)
    setIsProcessing(true)
    setUploadProgress(0)
    setError('')

    try {
      // 파일 읽기
      setUploadProgress(20)
      const arrayBuffer = await selectedFile.arrayBuffer()
      
      setUploadProgress(40)
      
      // Excel 파일 파싱 (header=3과 동일하게 처리)
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      
      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        throw new Error('Excel 파일에 시트가 없습니다.')
      }
      
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      
      if (!worksheet) {
        throw new Error('시트를 읽을 수 없습니다.')
      }
      
      setUploadProgress(60)
      
      // 노트북과 동일하게 header=3으로 읽기 (pandas의 header=3과 동일)
      const allData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1, // 숫자 인덱스 사용
        defval: ""
      }) as any[][]
      
      setUploadProgress(80)
      
      // 데이터 존재 여부 확인
      if (!allData || allData.length < 5) {
        throw new Error('데이터가 충분하지 않습니다. 최소 5개 행이 필요합니다.')
      }
      
      // 3번째 행(0-based index)이 헤더
      const headers = allData[3].filter(h => h !== "" && h != null).map(h => String(h))
      
      // 4번째 행부터 데이터
      const dataRows = allData.slice(4).filter(row => 
        row && row.some(cell => cell !== "" && cell != null)
      )
      
      // 디버깅용: 실제 헤더 출력
      console.log('Excel 헤더 목록:', headers)
      
      // 필수 컬럼 존재 여부 확인 (실제 파일 구조에 맞춘 매칭)
      const requiredColumns = [
        { name: '사용일자', patterns: ['사용일자'] },
        { name: '이용금액(원)', patterns: ['이용금액(원)'] },
        { name: '내부 사용자', patterns: ['내부 사용자'] },
        { name: '용도', patterns: ['용도'] }
      ]
      
      const missingColumns = requiredColumns.filter(reqCol => 
        !reqCol.patterns.some(pattern => 
          headers.some(h => h && h.toString().includes(pattern))
        )
      )
      
      if (missingColumns.length > 0) {
        throw new Error(`필수 컬럼이 없습니다: ${missingColumns.map(c => c.name).join(', ')}\n실제 헤더: ${headers.join(', ')}`)
      }
      
      // 노트북과 동일한 방식으로 데이터 매핑
      const mappedData: ExcelData[] = dataRows
        .map(row => {
          // 필요한 컬럼들을 인덱스로 찾아서 매핑
          const findColumn = (possibleNames: string[]) => {
            for (const name of possibleNames) {
              const headerIndex = headers.findIndex(h => h && h.toString().includes(name))
              if (headerIndex !== -1 && row[headerIndex] !== undefined && row[headerIndex] !== "" && row[headerIndex] !== null) {
                return row[headerIndex]
              }
            }
            return ""
          }
          
          return {
            사용일자: String(findColumn(['사용일자'])),
            "이용금액(원)": Number(findColumn(['이용금액(원)'])) || 0,
            "내부 사용자": String(findColumn(['내부 사용자'])),
            카드별칭: String(findColumn(['소지자', '카드별칭'])), // 소지자 컬럼 우선 사용
            용도: String(findColumn(['용도'])),
            가맹점명: String(findColumn(['가맹점명']))
          }
        })
        .filter(item => 
          item.사용일자 && 
          item["이용금액(원)"] > 0 && 
          item["내부 사용자"] && 
          item.용도
        )
      
      if (mappedData.length === 0) {
        throw new Error('유효한 데이터가 없습니다. 사용일자, 이용금액, 내부 사용자, 용도 컬럼이 모두 필요합니다.')
      }
      
      setUploadProgress(90)
      
      console.log('파싱된 데이터 샘플:', mappedData.slice(0, 3))
      console.log('총 데이터 수:', mappedData.length)
      
      const processedData = processExcelData(mappedData)
      setData(processedData)
      
      const { lunchExcess: lunch, dinnerExcess: dinner, lunchDetails: lunchDet, dinnerDetails: dinnerDet } = calculateExcessUsage(processedData)
      setLunchExcess(lunch)
      setDinnerExcess(dinner)
      setLunchDetails(lunchDet)
      setDinnerDetails(dinnerDet)
      
      // 사용자 목록 추출
      const uniqueLunchUsers = Array.from(new Set(
        lunchDet.map(item => item["내부 사용자"].toLowerCase().replace(/\s/g, ''))
      )).sort()
      
      const uniqueDinnerUsers = Array.from(new Set(
        dinnerDet.map(item => item["내부 사용자"].toLowerCase().replace(/\s/g, ''))
      )).sort()
      
      setLunchUsers(uniqueLunchUsers)
      setDinnerUsers(uniqueDinnerUsers)
      
      // 선택된 사용자 초기화
      setSelectedLunchUser("")
      setSelectedDinnerUser("")
      
      setUploadProgress(100)
      
    } catch (error) {
      console.error('파일 처리 중 오류 발생:', error)
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      setError(`파일 처리 실패: ${errorMessage}`)
      
      // 오류 발생시 데이터 초기화
      setData([])
      setLunchExcess([])
      setDinnerExcess([])
      setLunchDetails([])
      setDinnerDetails([])
      setLunchUsers([])
      setDinnerUsers([])
      setSelectedLunchUser("")
      setSelectedDinnerUser("")
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const processExcelData = (rawData: ExcelData[]): ExcelData[] => {
    const expandedRows: ExcelData[] = []
    
    for (const row of rawData) {
      const users = String(row["내부 사용자"]).split(', ')
      if (users.length > 1) {
        const dividedAmount = row["이용금액(원)"] / users.length
        for (const user of users) {
          expandedRows.push({
            ...row,
            "내부 사용자": user.trim(),
            "이용금액(원)": dividedAmount
          })
        }
      } else {
        expandedRows.push(row)
      }
    }
    
    return expandedRows
  }

  const calculateExcessUsage = (data: ExcelData[]) => {
    // 노트북과 동일한 필터링: 야근식비, 복리후생비, 점심식비
    const filteredData = data.filter(row => 
      ['야근식비', '복리후생비', '점심식비'].includes(row.용도) && row.카드별칭 !== 'algocare'
    )
    
    // 점심/저녁 분류
    const lunchData = filteredData.filter(row => 
      ['복리후생비', '점심식비'].includes(row.용도)
    )
    const dinnerData = filteredData.filter(row => 
      ['야근식비'].includes(row.용도)
    )

    // 노트북과 동일한 필터링 로직: 일일 12,000원 초과 사용자만 필터링
    const filterHighSpenders = (data: ExcelData[]) => {
      const dailySpend = new Map<string, number>()
      
      // 일일 사용금액 합계 계산
      data.forEach(row => {
        const normalizedUser = row["내부 사용자"].toLowerCase().replace(/\s/g, '')
        const key = `${row.사용일자}_${normalizedUser}`
        dailySpend.set(key, (dailySpend.get(key) || 0) + row["이용금액(원)"])
      })
      
      // 12,000원 초과한 날짜의 사용자만 필터링
      const highSpenderKeys = new Set<string>()
      dailySpend.forEach((amount, key) => {
        if (amount > 12000) {
          highSpenderKeys.add(key)
        }
      })
      
      return data.filter(row => {
        const normalizedUser = row["내부 사용자"].toLowerCase().replace(/\s/g, '')
        const key = `${row.사용일자}_${normalizedUser}`
        return highSpenderKeys.has(key)
      })
    }

    const lunchHighSpenders = filterHighSpenders(lunchData)
    const dinnerHighSpenders = filterHighSpenders(dinnerData)

    // 노트북과 동일한 초과 금액 계산 로직
    const calculateExcess = (data: ExcelData[]): ExcessUser[] => {
      // 사용자명 정규화하여 일일 사용금액 계산
      const dailyUsage = new Map<string, number>()
      
      data.forEach(row => {
        const normalizedUser = row["내부 사용자"].toLowerCase().replace(/\s/g, '')
        const dailyKey = `${row.사용일자}_${normalizedUser}`
        dailyUsage.set(dailyKey, (dailyUsage.get(dailyKey) || 0) + row["이용금액(원)"])
      })
      
      // 각 일별로 초과금액 계산 후 사용자별로 합산
      const userExcess = new Map<string, number>()
      
      dailyUsage.forEach((amount, key) => {
        const normalizedUser = key.split('_')[1]
        if (amount > 12000) {
          const excess = amount - 12000
          userExcess.set(normalizedUser, (userExcess.get(normalizedUser) || 0) + excess)
        }
      })
      
      return Array.from(userExcess.entries()).map(([user, excess]) => ({
        "내부 사용자": user,
        "초과 금액": Math.round(excess)
      })).sort((a, b) => b["초과 금액"] - a["초과 금액"])
    }

    return {
      lunchExcess: calculateExcess(lunchHighSpenders),
      dinnerExcess: calculateExcess(dinnerHighSpenders),
      lunchDetails: lunchHighSpenders,
      dinnerDetails: dinnerHighSpenders
    }
  }

  const getUserDetails = (type: 'lunch' | 'dinner'): UserDetail[] => {
    const selectedUser = type === 'lunch' ? selectedLunchUser : selectedDinnerUser
    const showExcessOnly = type === 'lunch' ? showLunchExcessOnly : showDinnerExcessOnly
    
    if (!selectedUser) return []
    
    // 노트북과 동일한 검색 로직: 사용자명 정규화 후 비교
    const normalizedSearchUser = selectedUser.toLowerCase().replace(/\s/g, '')
    
    // Switch OFF일 때: 전체 데이터에서 해당 사용자 검색
    // Switch ON일 때: 초과분 데이터에서 해당 사용자 검색
    const sourceData = showExcessOnly 
      ? (type === 'lunch' ? lunchDetails : dinnerDetails)  // 초과분 데이터
      : data.filter(row => {  // 전체 데이터에서 점심/저녁 필터링
          if (type === 'lunch') {
            return ['복리후생비', '점심식비'].includes(row.용도) && row.카드별칭 !== 'algocare'
          } else {
            return ['야근식비'].includes(row.용도) && row.카드별칭 !== 'algocare'
          }
        })
    
    let filteredDetails = sourceData.filter(row => {
      const normalizedRowUser = row["내부 사용자"].toLowerCase().replace(/\s/g, '')
      return normalizedRowUser === normalizedSearchUser
    })
    
    // Switch ON일 때만 12,000원 초과 필터링 적용
    if (showExcessOnly) {
      // 일별 금액 집계
      const dailyTotals = new Map<string, number>()
      filteredDetails.forEach(row => {
        const key = `${row.사용일자}_${normalizedSearchUser}`
        dailyTotals.set(key, (dailyTotals.get(key) || 0) + row["이용금액(원)"])
      })
      
      // 12,000원 초과한 날짜의 거래만 필터링
      filteredDetails = filteredDetails.filter(row => {
        const key = `${row.사용일자}_${normalizedSearchUser}`
        return (dailyTotals.get(key) || 0) > 12000
      })
    }
    
    return filteredDetails
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount)
  }

  // 개별 사용자 이미지 다운로드 함수 (전체 다운로드와 동일한 방식 사용)
  const downloadAsImage = async (type: 'lunch' | 'dinner') => {
    const selectedUser = type === 'lunch' ? selectedLunchUser : selectedDinnerUser
    const showExcessOnly = type === 'lunch' ? showLunchExcessOnly : showDinnerExcessOnly
    
    if (!selectedUser) {
      alert('먼저 사용자를 선택해주세요.')
      return
    }

    try {
      const imageData = await createUserImage(selectedUser, type, showExcessOnly)
      
      if (!imageData) {
        alert('생성할 수 있는 내역이 없습니다.')
        return
      }

      // 다운로드
      const link = document.createElement('a')
      link.download = imageData.filename
      link.href = URL.createObjectURL(imageData.blob)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // URL 객체 정리
      URL.revokeObjectURL(link.href)
    } catch (error) {
      console.error('이미지 생성 중 오류:', error)
      alert('이미지 생성에 실패했습니다.')
    }
  }

  // 개별 사용자 이미지 생성 함수
  const createUserImage = async (user: string, type: 'lunch' | 'dinner', excessOnly: boolean = false): Promise<{ filename: string, blob: Blob } | null> => {
    const typeText = type === 'lunch' ? '점심' : '저녁'
    const filterText = excessOnly ? '_초과분만' : '_전체'
    
    // 사용자별 데이터 필터링
    const userDetails = data.filter(row => {
      const category = row.용도?.toLowerCase() || ''
      const isCorrectType = type === 'lunch' 
        ? category.includes('점심') || category.includes('중식')
        : category.includes('저녁') || category.includes('석식')
      const isCorrectUser = row["내부 사용자"] === user
      const amount = Number(row["이용금액(원)"]) || 0
      const isExcess = amount > 12000
      
      return isCorrectType && isCorrectUser && (!excessOnly || isExcess)
    })

    if (userDetails.length === 0) return null

    try {
      // 임시 컨테이너 생성 (단일 다운로드와 완전히 동일한 형식)
      const tempContainer = document.createElement('div')
      tempContainer.style.position = 'absolute'
      tempContainer.style.left = '-9999px'
      tempContainer.style.top = '0'
      tempContainer.style.backgroundColor = 'white'
      tempContainer.style.fontFamily = 'Pretendard, sans-serif'
      tempContainer.style.width = '800px'
      tempContainer.style.overflowX = 'auto'
      document.body.appendChild(tempContainer)

      // 테이블 생성 (shadcn/ui Table 컴포넌트와 동일한 스타일)
      const table = document.createElement('table')
      table.style.cssText = `
        width: 100%;
        caption-side: bottom;
        font-size: 0.875rem;
        font-family: Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
        background-color: white;
      `

      // 테이블 헤더 (shadcn/ui TableHeader + TableHead 스타일)
      const thead = document.createElement('thead')
      thead.style.borderBottom = '1px solid hsl(214.3 31.8% 91.4%)'
      
      const headerRow = document.createElement('tr')
      headerRow.style.borderBottom = '1px solid hsl(214.3 31.8% 91.4%)'
      headerRow.style.transition = 'colors'
      
      const headerCells = ['사용일자', '금액', '카드별칭', '가맹점명']
      headerCells.forEach(cellText => {
        const th = document.createElement('th')
        th.style.cssText = `
          display: table-cell;
          height: 48px;
          padding: 0;
          width: 25%;
          border-bottom: 1px solid hsl(214.3 31.8% 91.4%);
        `
        
        // 하단 패딩 16px만 설정
        th.style.cssText += `
          text-align: center;
          font-weight: 600;
          color: #1f2937;
          font-size: 0.875rem;
          line-height: 1.25rem;
          padding-bottom: 16px;
          background-color: #f9fafb;
        `
        th.textContent = cellText
        headerRow.appendChild(th)
      })
      
      thead.appendChild(headerRow)
      table.appendChild(thead)

      // 테이블 바디 (shadcn/ui TableBody + TableRow + TableCell 스타일)
      const tbody = document.createElement('tbody')
      
      userDetails.forEach((detail, index) => {
        const amount = Number(detail["이용금액(원)"]) || 0
        const isExcess = amount > 12000
        const isLastRow = index === userDetails.length - 1
        
        const row = document.createElement('tr')
        row.style.cssText = `
          border-bottom: ${isLastRow ? '0' : '1px solid hsl(214.3 31.8% 91.4%)'};
          transition: colors;
        `
        
        // 데이터 배열
        const cellData = [
          detail.사용일자,
          formatCurrency(amount),
          detail.카드별칭,
          detail.가맹점명
        ]
        
        cellData.forEach((cellText, cellIndex) => {
          const td = document.createElement('td')
          td.style.cssText = `
            display: table-cell;
            padding: 0;
            width: 25%;
            height: 40px;
            ${!isLastRow ? 'border-bottom: 1px solid hsl(214.3 31.8% 91.4%);' : ''}
          `
          
          // 하단 패딩 16px만 설정
          td.style.cssText += `
            text-align: center;
            color: ${(cellIndex === 1 && isExcess) ? '#dc2626' : '#1f2937'};
            font-weight: ${(cellIndex === 1 && isExcess) ? '600' : 'normal'};
            font-size: 0.875rem;
            line-height: 1.25rem;
            padding-bottom: 16px;
          `
          td.textContent = cellText
          row.appendChild(td)
        })
        
        tbody.appendChild(row)
      })
      
      // tbody에 [&_tr:last-child]:border-0 스타일 적용
      tbody.style.cssText = '[&_tr:last-child]:border-bottom: 0;'
      table.appendChild(tbody)

      tempContainer.appendChild(table)

      // 이미지 생성
      const canvas = await html2canvas(tempContainer, {
        logging: false,
        useCORS: true,
        allowTaint: true
      })

      // 파일명 생성
      const today = new Date().toISOString().split('T')[0]
      const filename = `${typeText}_상세내역_${user}${filterText}_${today}.png`

      // Canvas를 Blob으로 변환
      return new Promise<{ filename: string, blob: Blob }>((resolve) => {
        canvas.toBlob((blob) => {
          document.body.removeChild(tempContainer)
          if (blob) {
            resolve({ filename, blob })
          }
        }, 'image/png')
      })
    } catch (error) {
      console.error(`${user} 이미지 생성 중 오류:`, error)
      return null
    }
  }

  // 전체 사용자별 내역을 ZIP으로 다운로드하는 함수
  const downloadAllUsersAsZip = async (type: 'lunch' | 'dinner', excessOnly: boolean = false) => {
    const users = type === 'lunch' ? lunchUsers : dinnerUsers
    const typeText = type === 'lunch' ? '점심' : '저녁'
    const filterText = excessOnly ? '초과' : '전체'
    
    if (users.length === 0) {
      alert(`${typeText} 사용자 데이터가 없습니다.`)
      return
    }

    try {
      const zip = new JSZip()
      let successCount = 0

      // 각 사용자별 이미지 생성
      for (const user of users) {
        const imageData = await createUserImage(user, type, excessOnly)
        if (imageData) {
          zip.file(imageData.filename, imageData.blob)
          successCount++
        }
      }

      if (successCount === 0) {
        alert(`생성할 수 있는 ${typeText} 내역이 없습니다.`)
        return
      }

      // ZIP 파일 생성 및 다운로드
      const today = new Date().toISOString().split('T')[0]
      const zipFilename = `${typeText}_${filterText}_내역_전체사용자_${today}.zip`
      
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      
      const link = document.createElement('a')
      link.download = zipFilename
      link.href = URL.createObjectURL(zipBlob)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // URL 객체 정리
      URL.revokeObjectURL(link.href)
      
      alert(`${successCount}개의 사용자 이미지가 ZIP 파일로 다운로드되었습니다.`)
    } catch (error) {
      console.error('ZIP 파일 생성 중 오류:', error)
      alert('ZIP 파일 생성에 실패했습니다.')
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-lg sm:text-xl font-semibold">월간 사용금액 관리</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            법인카드 사용 내역을 업로드하여 초과 사용자를 효율적으로 분석하고 관리합니다
          </p>
        </div>
      </div>

      {/* 파일 업로드 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            엑셀 파일 업로드
          </CardTitle>
          <CardDescription>
            월별 법인카드 사용 내역 엑셀 파일을 업로드하세요. (header=3 형식)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file-upload">파일 선택</Label>
            <Input
              id="file-upload"
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => {
                setError('') // 파일 선택 시 에러 초기화
                handleFileUpload(e)
              }}
              disabled={isProcessing}
            />
          </div>
          
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>파일 처리 중...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}
          
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>오류</AlertTitle>
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}
          
          {file && !isProcessing && !error && data.length > 0 && (
            <Alert>
              <FileSpreadsheet className="h-4 w-4" />
              <AlertTitle>파일 업로드 완료</AlertTitle>
              <AlertDescription>
                {file.name} 파일이 성공적으로 처리되었습니다. ({data.length}개 데이터)
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* 통계 카드들 */}
      {data.length > 0 && (
        <div className="grid gap-4 md:gap-8 grid-cols-2 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 거래 건수</CardTitle>
              <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.length}건</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">점심 초과자</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lunchExcess.length}명</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">저녁 초과자</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dinnerExcess.length}명</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 초과 금액</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(
                  [...lunchExcess, ...dinnerExcess].reduce((sum, user) => sum + user["초과 금액"], 0)
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 분석 결과 탭 */}
      {data.length > 0 && (
        <Tabs defaultValue="lunch-excess" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="lunch-excess">점심 초과금액</TabsTrigger>
            <TabsTrigger value="dinner-excess">저녁 초과금액</TabsTrigger>
            <TabsTrigger value="lunch-details">점심 상세내역</TabsTrigger>
            <TabsTrigger value="dinner-details">저녁 상세내역</TabsTrigger>
          </TabsList>

          <TabsContent value="lunch-excess">
            <Card>
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="text-lg sm:text-xl">점심 초과 금액</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  일일 12,000원을 초과한 점심 사용자들의 월간 초과 금액입니다.
                  <br />
                  <span className="text-muted-foreground">*5만원 초과 시 강조 표시</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="w-full overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-center px-4 sm:px-6 w-1/2">사용자</TableHead>
                        <TableHead className="text-center px-4 sm:px-6 w-1/2">초과 금액</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lunchExcess.map((user, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium text-center px-4 sm:px-6 w-1/2">{user["내부 사용자"]}</TableCell>
                          <TableCell className="text-center px-4 sm:px-6 w-1/2">
                            <Badge variant={user["초과 금액"] > 50000 ? "destructive" : "secondary"}>
                              {formatCurrency(user["초과 금액"])}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dinner-excess">
            <Card>
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="text-lg sm:text-xl">저녁 초과 금액</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  일일 12,000원을 초과한 저녁 사용자들의 월간 초과 금액입니다.
                  <br />
                  <span className="text-muted-foreground">*5만원 초과 시 강조 표시</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="w-full overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-center px-4 sm:px-6 w-1/2">사용자</TableHead>
                        <TableHead className="text-center px-4 sm:px-6 w-1/2">초과 금액</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dinnerExcess.map((user, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium text-center px-4 sm:px-6 w-1/2">{user["내부 사용자"]}</TableCell>
                          <TableCell className="text-center px-4 sm:px-6 w-1/2">
                            <Badge variant={user["초과 금액"] > 50000 ? "destructive" : "secondary"}>
                              {formatCurrency(user["초과 금액"])}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lunch-details">
            <Card>
              <CardHeader className="px-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg sm:text-xl">점심 사용자별 상세 내역</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadAsImage('lunch')}
                      disabled={!selectedLunchUser}
                      className="p-2"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="p-2">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => downloadAllUsersAsZip('lunch', false)}>
                          <Download className="mr-2 h-4 w-4" />
                          전체 내역 다운로드
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => downloadAllUsersAsZip('lunch', true)}>
                          <Download className="mr-2 h-4 w-4" />
                          전체 초과 내역 다운로드
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="lunch-user-select">사용자 선택:</Label>
                      <Combobox
                        options={lunchUsers.map(user => ({ value: user, label: user }))}
                        placeholder="사용자를 선택하세요"
                        value={selectedLunchUser}
                        onValueChange={setSelectedLunchUser}
                        className="w-48"
                        emptyText="해당 사용자가 없습니다"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="lunch-excess-filter" className="text-xs">초과분만 표시</Label>
                      <Switch
                        id="lunch-excess-filter"
                        checked={showLunchExcessOnly}
                        onCheckedChange={setShowLunchExcessOnly}
                      />
                    </div>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {selectedLunchUser && (
                  <div ref={lunchTableRef} className="w-full overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-center px-4 sm:px-6 w-1/4">사용일자</TableHead>
                          <TableHead className="text-center px-4 sm:px-6 w-1/4">금액</TableHead>
                          <TableHead className="text-center px-4 sm:px-6 w-1/4">카드별칭</TableHead>
                          <TableHead className="text-center px-4 sm:px-6 w-1/4">가맹점명</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getUserDetails('lunch').map((detail, index) => (
                          <TableRow key={index}>
                            <TableCell className="text-center px-4 sm:px-6 w-1/4">{detail.사용일자}</TableCell>
                            <TableCell className="text-center px-4 sm:px-6 w-1/4">{formatCurrency(detail["이용금액(원)"])}</TableCell>
                            <TableCell className="text-center px-4 sm:px-6 w-1/4">{detail.카드별칭}</TableCell>
                            <TableCell className="text-center px-4 sm:px-6 w-1/4">{detail.가맹점명}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dinner-details">
            <Card>
              <CardHeader className="px-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg sm:text-xl">저녁 사용자별 상세 내역</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadAsImage('dinner')}
                      disabled={!selectedDinnerUser}
                      className="p-2"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="p-2">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => downloadAllUsersAsZip('dinner', false)}>
                          <Download className="mr-2 h-4 w-4" />
                          전체 내역 다운로드
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => downloadAllUsersAsZip('dinner', true)}>
                          <Download className="mr-2 h-4 w-4" />
                          전체 초과 내역 다운로드
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="dinner-user-select">사용자 선택:</Label>
                      <Combobox
                        options={dinnerUsers.map(user => ({ value: user, label: user }))}
                        placeholder="사용자를 선택하세요"
                        value={selectedDinnerUser}
                        onValueChange={setSelectedDinnerUser}
                        className="w-48"
                        emptyText="해당 사용자가 없습니다"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="dinner-excess-filter" className="text-xs">초과분만 표시</Label>
                      <Switch
                        id="dinner-excess-filter"
                        checked={showDinnerExcessOnly}
                        onCheckedChange={setShowDinnerExcessOnly}
                      />
                    </div>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {selectedDinnerUser && (
                  <div ref={dinnerTableRef} className="w-full overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-center px-4 sm:px-6 w-1/4">사용일자</TableHead>
                          <TableHead className="text-center px-4 sm:px-6 w-1/4">금액</TableHead>
                          <TableHead className="text-center px-4 sm:px-6 w-1/4">카드별칭</TableHead>
                          <TableHead className="text-center px-4 sm:px-6 w-1/4">가맹점명</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getUserDetails('dinner').map((detail, index) => (
                          <TableRow key={index}>
                            <TableCell className="text-center px-4 sm:px-6 w-1/4">{detail.사용일자}</TableCell>
                            <TableCell className="text-center px-4 sm:px-6 w-1/4">{formatCurrency(detail["이용금액(원)"])}</TableCell>
                            <TableCell className="text-center px-4 sm:px-6 w-1/4">{detail.카드별칭}</TableCell>
                            <TableCell className="text-center px-4 sm:px-6 w-1/4">{detail.가맹점명}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}