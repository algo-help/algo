import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger, SidebarProvider } from "@/components/ui/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 로그인 제거 - 기본 사용자 정보 사용
  const userEmail = 'jeff@algocarelab.com'
  const userRole = 'admin'
  const isDemoAccount = false
  const avatarUrl = null
  const userId = 'default-user-id'

  return (
    <SidebarProvider>
      <AppSidebar 
        userEmail={userEmail} 
        userRole={userRole} 
        avatarUrl={avatarUrl}
        isDemoAccount={isDemoAccount} 
      />
      <SidebarInset>
        <DashboardHeader />
        <main className="container mx-auto p-4 max-w-7xl">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}