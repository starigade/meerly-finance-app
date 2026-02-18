import Link from "next/link";
import { Shield, Upload } from "lucide-react";

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

      <ul className="menu bg-base-100 border border-base-300 rounded-box w-full">
        {settingsItems.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="flex items-center gap-3">
              <item.icon className="h-5 w-5 text-neutral" />
              <div>
                <p className="font-medium text-sm">{item.title}</p>
                <p className="text-xs text-neutral">{item.description}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
