import Link from "next/link";
import { Shield, Upload } from "lucide-react";
import { Card } from "@/components/ui/card";

const settingsItems = [
  {
    href: "/import",
    icon: Upload,
    title: "Import Transactions",
    description: "Import transactions from a CSV file",
  },
  {
    href: "/settings/audit",
    icon: Shield,
    title: "Audit",
    description: "Check if your books are balanced",
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <h1 className="text-lg font-semibold">Settings</h1>

      <Card className="divide-y">
        {settingsItems.map((item) => (
          <div key={item.href}>
            <Link href={item.href} className="flex items-center gap-3 p-3 hover:bg-muted transition-colors">
              <item.icon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </Link>
          </div>
        ))}
      </Card>
    </div>
  );
}
