import { OrganizationSwitcher } from '@clerk/nextjs';
import { FileText, Shield } from 'lucide-react';
import TermsPage from '@/app/(home)/legal/terms/page';
import PrivacyPage from '@/app/(home)/legal/privacy/page';

interface ClerkOrganizationProps {
  isLoaded?: boolean;
  className?: string;
}

export default function ClerkOrganization({
  isLoaded = true,
  className = '',
}: ClerkOrganizationProps) {
  if (!isLoaded) {
    return <div className="w-40 min-h-[40px] rounded-full bg-gray-200 animate-pulse" />;
  }

  return (
    <div className={`flex items-center shrink-0 ${className}`}>
      <div className="flex items-center gap-x-4">
        <OrganizationSwitcher
          appearance={{
            elements: {
              organizationSwitcherTrigger:
                "relative z-10 px-4 py-3 h-10 !rounded-full text-sm font-medium bg-white text-purple-900 border border-gray-200 hover:bg-gray-50 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition flex items-center justify-between box-border w-40",
              organizationSwitcherTriggerIcon: "text-purple-900 shrink-0",
            },
          }}
        >
          <OrganizationSwitcher.OrganizationProfilePage
            labelIcon={<FileText className="h-4 w-4" />}
            label="服务"
            url="/legal/terms"
          >
            <TermsPage />
          </OrganizationSwitcher.OrganizationProfilePage>

          <OrganizationSwitcher.OrganizationProfilePage
            labelIcon={<Shield className="h-4 w-4" />}
            label="隐私"
            url="/legal/privacy"
          >
            <PrivacyPage />
          </OrganizationSwitcher.OrganizationProfilePage>
        </OrganizationSwitcher>
      </div>
    </div>
  );
} 