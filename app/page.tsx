import { redirect } from "next/navigation";

// Root page redirects to the app dashboard
// The actual dashboard is at app/(app)/page.tsx
// This redirect is handled by middleware for authenticated users
export default function RootPage() {
  redirect("/login");
}
