'use client'

import React, { useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { SidebarTrigger } from "@/components/ui/sidebar"

// 페이지 제목 매핑
const titleMap: Record<string, string> = {
  '/': '관리 시스템',
  '/delivery': '영양제 배송',
  '/admin/users': '사용자 관리',
  '/admin/auth': '인증 및 권한',
  '/formtime': '예정: FormTime',
  '/profile': '내 정보',
  '/business-card': '명함 생성기',
  '/monthly-usage': '월간 사용금액 관리'
}

const DashboardHeader = React.memo(() => {
  const pathname = usePathname()
  
  // Memoize page title
  const pageTitle = useMemo(() => {
    return titleMap[pathname] || '관리 시스템'
  }, [pathname])
  
  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center border-b px-4 bg-background relative">
      <SidebarTrigger className="-ml-1 absolute left-4" />
      <div className="flex-1 flex justify-center">
        <h1 style={{ fontSize: '14px' }} className="font-medium">{pageTitle}</h1>
      </div>
    </header>
  )
})

DashboardHeader.displayName = 'DashboardHeader'

export { DashboardHeader }