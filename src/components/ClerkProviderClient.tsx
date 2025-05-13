'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { useTheme } from 'next-themes';
import React from 'react';

// Use React.ComponentProps to get the props type for ClerkProvider
type ActualClerkProviderProps = React.ComponentProps<typeof ClerkProvider>;

// Get the non-undefined type of the 'appearance' prop
type DefinedClerkAppearance = NonNullable<ActualClerkProviderProps['appearance']>;

interface ClerkProviderClientProps {
  children: React.ReactNode;
  localization: ActualClerkProviderProps['localization'];
  waitlistUrl?: ActualClerkProviderProps['waitlistUrl'];
  // Use Exclude to get the non-undefined type for variables and elements from DefinedClerkAppearance
  variables: Exclude<DefinedClerkAppearance['variables'], undefined>;
  elements: Exclude<DefinedClerkAppearance['elements'], undefined>;
}

export function ClerkProviderClient({
  children,
  localization,
  waitlistUrl,
  variables,
  elements,
}: ClerkProviderClientProps) {
  const { resolvedTheme } = useTheme();

  // The 'appearance' object passed to ClerkProvider can have optional 'variables' and 'elements',
  // but here 'variables' and 'elements' are the props passed to ClerkProviderClient, which are defined.
  const appearance: ActualClerkProviderProps['appearance'] = {
    baseTheme: resolvedTheme === 'dark' ? dark : undefined,
    variables, // This 'variables' is from props, typed as Exclude<..., undefined>
    elements,  // This 'elements' is from props, typed as Exclude<..., undefined>
  };

  return (
    <ClerkProvider
      localization={localization}
      waitlistUrl={waitlistUrl}
      appearance={appearance}
    >
      {children}
    </ClerkProvider>
  );
} 