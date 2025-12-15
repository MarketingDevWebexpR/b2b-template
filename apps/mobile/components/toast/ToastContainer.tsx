/**
 * ToastContainer Component
 *
 * Root-level container for rendering all toast notifications.
 * Should be placed at the top level of the app, after all providers.
 *
 * @module components/toast/ToastContainer
 */

import React from 'react';
import { useToast } from '@/context/ToastContext';
import { LuxuryWelcomeToast } from './LuxuryWelcomeToast';

export function ToastContainer() {
  const { welcomeToast, hideWelcomeToast } = useToast();

  return (
    <>
      {/* Welcome Toast */}
      <LuxuryWelcomeToast
        visible={welcomeToast.visible}
        userName={welcomeToast.data?.userName ?? ''}
        tagline={welcomeToast.data?.tagline}
        autoDismissMs={welcomeToast.data?.autoDismissMs}
        onDismiss={hideWelcomeToast}
      />

      {/* Add other toast types here as needed */}
    </>
  );
}

export default ToastContainer;
