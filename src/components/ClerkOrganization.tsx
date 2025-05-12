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
    <div className={`flex items-center h-10 bg-linear-to-r from-pink-400 via-purple-400 to-indigo-400 rounded-full shadow-lg ${className}`}>
      <div className="flex items-center gap-x-4 w-full">
        <OrganizationSwitcher
          appearance={{
            elements: {
              organizationSwitcherTrigger:
                "w-40 h-10 !rounded-full bg-transparent flex items-center justify-between box-border",
              organizationSwitcherTriggerIcon: "",
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