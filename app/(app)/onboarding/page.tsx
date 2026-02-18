import { OnboardingWizard } from "@/components/onboarding-wizard";
import { getCategories } from "@/lib/actions";

export default async function OnboardingPage() {
  const categories = await getCategories();

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-3rem)] py-8">
      <OnboardingWizard categories={categories} />
    </div>
  );
}
