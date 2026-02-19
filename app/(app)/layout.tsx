export const dynamic = "force-dynamic";

import { SupabaseProvider } from "@/providers/supabase-provider";
import { AppSidebar } from "@/components/sidebar";
import { BottomNav } from "@/components/bottom-nav";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <main className="flex-1 px-4 py-3 md:px-6 pb-20 lg:pb-3 max-w-6xl">
            {children}
          </main>
          <BottomNav />
        </SidebarInset>
      </SidebarProvider>
    </SupabaseProvider>
  );
}
