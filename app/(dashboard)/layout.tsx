import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger, SidebarProvider } from "@/components/ui/sidebar"
import { createClient } from '@/utils/supabase/server'
import { DashboardHeader } from "@/components/dashboard-header"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 세션 확인
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('auth-session')
  
  if (!sessionCookie) {
    redirect('/login')
  }
  
  let userEmail = null
  let userRole = 'v'
  let isDemoAccount = false
  let avatarUrl = null
  let userId = null
  
  try {
    const session = JSON.parse(sessionCookie.value)
    userEmail = session.email
    userRole = session.role || 'v'
    userId = session.id
    isDemoAccount = session.email === 'testviewtest@algocarelab.com'
    
    // Supabase에서 avatar_url 가져오기
    if (userId) {
      // console.log('[Layout] userId:', userId)
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('users')
        .select('avatar_url')
        .eq('id', userId)
        .single()
      
      // console.log('[Layout] avatar query result:', { data, error })
      
      if (data?.avatar_url) {
        avatarUrl = data.avatar_url
        // console.log('[Layout] avatarUrl set to:', avatarUrl)
      } else {
        // console.log('[Layout] No avatar_url found')
      }
    }
  } catch (error) {
    // console.error('Session parse error:', error)
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar 
        userEmail={userEmail}
        userRole={userRole}
        isDemoAccount={isDemoAccount}
        avatarUrl={avatarUrl}
      />
      <SidebarInset className="flex flex-col h-screen">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-background to-muted relative stable-layout">
          {/* 모바일 스크롤 바운스를 위한 배경 확장 - fixed positioning으로 스크롤 영역에 영향 없음 */}
          <div 
            className="fixed inset-x-0 top-0 h-[200px] bg-gradient-to-b from-background to-transparent pointer-events-none -z-10" 
            aria-hidden="true"
          />
          <div 
            className="fixed inset-x-0 bottom-0 h-[200px] bg-gradient-to-t from-muted to-transparent pointer-events-none -z-10" 
            aria-hidden="true"
          />
          <div className="p-4 min-h-full">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}