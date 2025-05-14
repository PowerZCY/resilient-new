import { OrganizationSwitcher } from '@clerk/nextjs';
import TermsPage from '@/app/(home)/legal/terms/page';
import PrivacyPage from '@/app/(home)/legal/privacy/page';
import { globalLucideIcons as icons } from '@/components/global-icon';

interface ClerkOrganizationProps {
  className?: string;
}

export default function ClerkOrganization({
  className = '',
}: ClerkOrganizationProps) {
  return (
    <div className={` ms-3 me-2 flex items-center h-10 rounded-full border shadow-lg ${className}`}>
      <div className="flex items-center gap-x-4 w-full min-w-40">
        <OrganizationSwitcher
          appearance={{
            elements: {
              organizationSwitcherTrigger:
                "w-40 h-10 border !rounded-full bg-transparent flex items-center justify-between box-border",
              organizationSwitcherTriggerIcon: "",
              userButtonAvatarBox: "w-8 h-8 border rounded-full",
            },
          }}
        >
          <OrganizationSwitcher.OrganizationProfilePage
            labelIcon={<icons.ReceiptText className="size-4 fill-none stroke-[var(--clerk-icon-stroke-color)]" />}
            label="服务"
            url="/legal/terms"
          >
            <TermsPage />
          </OrganizationSwitcher.OrganizationProfilePage>

          <OrganizationSwitcher.OrganizationProfilePage
            labelIcon={<icons.ShieldUser className="size-4 fill-none stroke-[var(--clerk-icon-stroke-color)]" />}
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