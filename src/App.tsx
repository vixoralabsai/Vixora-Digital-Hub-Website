/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { TrustedBy } from './components/TrustedBy';
import { SolutionsSection } from './components/SolutionsSection';
import { IndustriesSection } from './components/IndustriesSection';
import { BusinessMetrics } from './components/BusinessMetrics';
import { TestimonialsSection } from './components/TestimonialsSection';
import { CallToAction } from './components/CallToAction';
import { Footer } from './components/Footer';
import { StartProjectModal } from './components/StartProjectModal';
import { DriveWorkspaceModal } from './components/DriveWorkspaceModal';

// Standalone Pages
import { AboutPage } from './pages/AboutPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { AcademyPage } from './pages/AcademyPage';
import { ResourcesPage } from './pages/ResourcesPage';

export type PageType = 'home' | 'about' | 'portfolio' | 'academy' | 'resources';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [driveWorkspaceOpen, setDriveWorkspaceOpen] = useState(false);

  // Scroll to top on page transition
  const handleNavigate = (page: string, sectionId?: string) => {
    const validPage = (page as PageType) || 'home';
    setCurrentPage(validPage);

    if (sectionId && validPage === 'home') {
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleExploreServices = () => {
    if (currentPage !== 'home') {
      setCurrentPage('home');
      setTimeout(() => {
        const el = document.getElementById('solutions');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else {
      const el = document.getElementById('solutions');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#070314] text-neutral-100 font-sans selection:bg-purple-600 selection:text-white antialiased">
      {/* 1. Global Navigation Bar */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenProjectModal={() => setProjectModalOpen(true)}
        onOpenDriveWorkspace={() => setDriveWorkspaceOpen(true)}
      />

      {/* Main Dynamic View Content */}
      <main>
        {currentPage === 'home' && (
          <div className="animate-in fade-in duration-200">
            {/* 1. Hero Section with 3D V Monolith & Floating Cyber Nodes */}
            <Hero
              onOpenProjectModal={() => setProjectModalOpen(true)}
              onExploreServices={handleExploreServices}
              onOpenDriveWorkspace={() => setDriveWorkspaceOpen(true)}
            />

            {/* 2. Client Logos Ribbon ("Some of our amazing clients") */}
            <TrustedBy />

            {/* 3. Key Metrics Bar (150+ Projects, 200+ Clients, 15+ Industries, 5+ Years) */}
            <BusinessMetrics />

            {/* 4. Complete Digital Solutions Grid */}
            <SolutionsSection
              onOpenProjectModal={() => setProjectModalOpen(true)}
            />

            {/* 5. Industries Served */}
            <IndustriesSection
              onSelectIndustry={() => setProjectModalOpen(true)}
            />

            {/* 6. Testimonials & Client Reviews */}
            <TestimonialsSection />

            {/* 7. High-Conversion Call To Action */}
            <CallToAction
              onOpenProjectModal={() => setProjectModalOpen(true)}
            />
          </div>
        )}

        {currentPage === 'about' && (
          <AboutPage
            onOpenProjectModal={() => setProjectModalOpen(true)}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'portfolio' && (
          <PortfolioPage
            onOpenProjectModal={() => setProjectModalOpen(true)}
          />
        )}

        {currentPage === 'academy' && (
          <AcademyPage
            onOpenProjectModal={() => setProjectModalOpen(true)}
          />
        )}

        {currentPage === 'resources' && (
          <ResourcesPage
            onOpenDriveWorkspace={() => setDriveWorkspaceOpen(true)}
            onOpenProjectModal={() => setProjectModalOpen(true)}
          />
        )}
      </main>

      {/* Global Comprehensive Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenDriveWorkspace={() => setDriveWorkspaceOpen(true)}
        onOpenProjectModal={() => setProjectModalOpen(true)}
      />

      {/* Interactive Consultation / Project Scoping Modal */}
      <StartProjectModal
        isOpen={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
      />

      {/* Google Drive Workspace & PRD Generator Modal */}
      <DriveWorkspaceModal
        isOpen={driveWorkspaceOpen}
        onClose={() => setDriveWorkspaceOpen(false)}
      />
    </div>
  );
}
