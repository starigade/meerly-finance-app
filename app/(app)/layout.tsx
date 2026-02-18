import { SupabaseProvider } from "@/providers/supabase-provider";
import { Sidebar } from "@/components/sidebar";
import { BottomNav } from "@/components/bottom-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseProvider>
      <div className="drawer lg:drawer-open">
        <input id="app-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col min-h-screen">
          <main className="flex-1 px-4 py-3 md:px-6 pb-20 lg:pb-3 max-w-6xl">
            {children}
          </main>
          <BottomNav />
        </div>
        <div className="drawer-side z-40">
          <label htmlFor="app-drawer" className="drawer-overlay" aria-label="close sidebar"></label>
          <Sidebar />
        </div>
      </div>
    </SupabaseProvider>
  );
}
