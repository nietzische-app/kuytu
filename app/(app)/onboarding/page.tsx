import { Onboarding } from "@/components/Onboarding";

/**
 * Multi-step onboarding wizard. Step 1 is the 30-second mandatory core; steps
 * 2 (photo) and 3 (deep profile) are optional and skippable.
 */
export default function OnboardingPage() {
  return (
    <div className="flex flex-1 flex-col">
      <Onboarding />
    </div>
  );
}
