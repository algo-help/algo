"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { Package, Users, Home, Shield, Clock, DollarSign, CreditCard } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useRouter, usePathname } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/utils/supabase"

interface AppSidebarProps {
  userEmail: string | null
  userRole: string
  isDemoAccount: boolean
  avatarUrl?: string | null
}

// Memoized menu item component
const MenuItemComponent = React.memo(({
  item,
  pathname,
  handleNavigation
}: {
  item: any;
  pathname: string;
  handleNavigation: (href: string) => void;
}) => {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={() => handleNavigation(item.href)}
        isActive={pathname === item.href}
        className="focus:ring-0 focus:ring-offset-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 justify-between"
      >
        <div className="flex items-center gap-2">
          <item.icon className="size-4" />
          <span>{item.title}</span>
        </div>
        {item.badge && (
          <Badge variant="destructive" className="ml-2 h-5 w-5 min-w-[20px] text-[11px] rounded-full flex items-center justify-center p-0 pt-[1px]">
            {item.badge}
          </Badge>
        )}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
});

MenuItemComponent.displayName = 'MenuItemComponent';

export function AppSidebar({ userEmail, userRole, isDemoAccount, avatarUrl }: AppSidebarProps) {
  // console.log('[AppSidebar] Props:', { userEmail, userRole, isDemoAccount, avatarUrl })
  
  const [pendingUsersCount, setPendingUsersCount] = useState(0)
  const router = useRouter()
  const pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()
  
  // 신규 가입 요청 사용자 수 가져오기
  useEffect(() => {
    if (userRole === 'admin') {
      fetchPendingUsersCount()
    }
  }, [userRole])
  
  const fetchPendingUsersCount = async () => {
    try {
      const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', false)
      
      if (!error && count !== null) {
        setPendingUsersCount(count)
      }
    } catch (error) {
      // console.error('신규 가입 요청 사용자 수 가져오기 실패:', error)
    }
  }


  const handleNavigation = useCallback((href: string) => {
    router.push(href)
    // 모바일에서는 사이드바 닫기
    if (isMobile) {
      setOpenMobile(false)
    }
  }, [router, isMobile, setOpenMobile])


  // Admin menu items - memoized
  const adminMenuItems = useMemo(() => [
    {
      title: "사용자 관리",
      href: "/admin/users",
      icon: Users,
      show: userRole === 'admin',
      badge: pendingUsersCount > 0 ? pendingUsersCount : null
    },
    {
      title: "인증 및 권한",
      href: "/admin/auth",
      icon: Shield,
      show: userRole === 'admin',
      badge: null
    }
  ], [userRole, pendingUsersCount])

  // Main menu items - memoized
  const mainMenuItems = useMemo(() => [
    {
      title: "영양제 배송",
      href: "/delivery",
      icon: Home,
      show: true
    },
    {
      title: "월간 사용금액 관리",
      href: "/monthly-usage",
      icon: DollarSign,
      show: true
    },
    {
      title: "예정: FormTime",
      href: "/formtime",
      icon: Clock,
      show: true
    },
    {
      title: "명함 생성기",
      href: "/business-card",
      icon: CreditCard,
      show: true
    }
  ].sort((a, b) => a.title.localeCompare(b.title, 'ko-KR')), [])

  // Filter visible items
  const visibleAdminItems = useMemo(() => 
    adminMenuItems.filter(item => item.show), 
    [adminMenuItems]
  )

  const visibleMainItems = useMemo(() => 
    mainMenuItems.filter(item => item.show), 
    [mainMenuItems]
  )

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              size="lg" 
              className="w-full focus:ring-0 focus:ring-offset-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onClick={() => handleNavigation('/')}
            >
              <div className="flex items-center gap-2">
                <img 
                  src="https://portal.algocare.me/favicon.ico" 
                  alt="Algocare" 
                  className="h-8 w-8" 
                />
                <span className="font-semibold">관리 시스템</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent>
        {/* 관리자 메뉴 - 로그인 기능 제거로 숨김 */}
        
        {/* 메인 메뉴 */}
        <SidebarGroup>
          <SidebarGroupLabel>메뉴</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleMainItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    onClick={() => handleNavigation(item.href)}
                    isActive={pathname === item.href}
                    className="focus:ring-0 focus:ring-offset-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}