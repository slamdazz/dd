import React from 'react';
import { OnboardingScreen } from '../components/onboarding/OnboardingScreen';
import { Layout } from '../components/layout/Layout';

export const OnboardingPage = () => {
  return (
    <Layout fullScreen>
      <OnboardingScreen />
    </Layout>
  );
};