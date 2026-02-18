import { SupabaseProvider } from "@/providers/supabase-provider";
import { Sidebar } from "@/components/sidebar";
import { BottomNav } from "@/components/bottom-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 min-h-screen pb-20 md:pb-0">
          <div className="max-w-5xl mx-auto px-4 py-6 md:px-8">
            {children}
          </div>
        </main>
        <BottomNav />
      </div>
    </SupabaseProvider>
  );
}
