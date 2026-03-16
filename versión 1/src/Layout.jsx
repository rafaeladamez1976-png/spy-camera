import React from 'react';
import BottomNav from './components/shared/BottomNav';
import PageTransition from './components/shared/PageTransition';

const hiddenNavPages = ['Onboarding'];

export default function Layout({ children, currentPageName }) {
  const showNav = !hiddenNavPages.includes(currentPageName);

  return (
    <div className="min-h-screen bg-[#0F1419] text-[#E8ECF0]" style={{
      paddingTop: 'env(safe-area-inset-top)',
      paddingBottom: showNav ? 'calc(env(safe-area-inset-bottom) + 5rem)' : 'env(safe-area-inset-bottom)'
    }}>
      <div className="max-w-lg mx-auto">
        <PageTransition>
          {children}
        </PageTransition>
      </div>
      {showNav && <BottomNav />}
    </div>
  );
}