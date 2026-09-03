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
import { CourseEnrollmentModal } from './components/CourseEnrollmentModal';
import { FloatingWhatsAppWidget } from './components/FloatingWhatsAppWidget';

// Standalone Pages
import { AboutPage } from './pages/AboutPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { AcademyPage } from './pages/AcademyPage';
import { CourseLandingPage } from './pages/CourseLandingPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { ACADEMY_COURSES, AcademyCourse } from './data/vixoraContent';
import { BRAND_CONFIG } from './data/brandConfig';

export type PageType = 'home' | 'about' | 'portfolio' | 'academy' | 'academy-course' | 'resources';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [selectedCourse, setSelectedCourse] = useState<AcademyCourse | null>(null);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [driveWorkspaceOpen, setDriveWorkspaceOpen] = useState(false);
  const [enrollmentModalOpen, setEnrollmentModalOpen] = useState(false);
  const [courseForEnrollment, setCourseForEnrollment] = useState<AcademyCourse | null>(null);

  // Parse initial query parameter or subdomain / hash if provided
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const courseSlug = urlParams.get('course');
      const subdomain = urlParams.get('subdomain');
      const pageParam = urlParams.get('page');

      // Check if hostname is an academy subdomain
      const isAcademyHost =
        window.location.hostname.startsWith('academy.') ||
        window.location.hostname.includes('academy');

      if (courseSlug) {
        const found = ACADEMY_COURSES.find(c => c.slug === courseSlug || c.id === courseSlug);
        if (found) {
          setSelectedCourse(found);
          setCurrentPage('academy-course');
          return;
        }
      }

      if (subdomain === 'academy' || isAcademyHost || pageParam === 'academy') {
        setCurrentPage('academy');
      } else if (pageParam && ['about', 'portfolio', 'resources', 'academy'].includes(pageParam)) {
        setCurrentPage(pageParam as PageType);
      }
    } catch {
      // safe fallback
    }
  }, []);

  // Universal Navigation Handler
  const handleNavigate = (page: string, sectionId?: string, courseSlug?: string) => {
    const isAlreadyAcademyHost = typeof window !== 'undefined' && (
      window.location.hostname.startsWith('academy.') ||
      window.location.hostname.includes('academy')
    );

    if (page === 'academy') {
      if (!isAlreadyAcademyHost) {
        window.location.href = BRAND_CONFIG.academyDomain;
        return;
      }
      setCurrentPage('academy');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (page === 'academy-course' && courseSlug) {
      if (!isAlreadyAcademyHost) {
        window.location.href = `${BRAND_CONFIG.academyDomain}/?page=academy-course&course=${encodeURIComponent(courseSlug)}`;
        return;
      }
      const found = ACADEMY_COURSES.find(c => c.slug === courseSlug || c.id === courseSlug);
      if (found) {
        setSelectedCourse(found);
        setCurrentPage('academy-course');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

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

  const handleSelectCourse = (course: AcademyCourse) => {
    const isAlreadyAcademyHost = typeof window !== 'undefined' && (
      window.location.hostname.startsWith('academy.') ||
      window.location.hostname.includes('academy')
    );
    if (!isAlreadyAcademyHost) {
      window.location.href = `${BRAND_CONFIG.academyDomain}/?page=academy-course&course=${encodeURIComponent(course.slug)}`;
      return;
    }
    setSelectedCourse(course);
    setCurrentPage('academy-course');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEnrollInCourse = (course: AcademyCourse) => {
    setCourseForEnrollment(course);
    setEnrollmentModalOpen(true);
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
            onSelectCourse={handleSelectCourse}
            onEnrollCourse={handleEnrollInCourse}
            onNavigateHome={() => handleNavigate('home')}
          />
        )}

        {currentPage === 'academy-course' && selectedCourse && (
          <CourseLandingPage
            course={selectedCourse}
            onBackToAcademy={() => handleNavigate('academy')}
            onEnroll={handleEnrollInCourse}
            onSelectCourse={handleSelectCourse}
            onNavigateHome={() => handleNavigate('home')}
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

      {/* Course Enrollment & Admissions Modal */}
      <CourseEnrollmentModal
        isOpen={enrollmentModalOpen}
        course={courseForEnrollment}
        onClose={() => setEnrollmentModalOpen(false)}
      />

      {/* Persistent Floating WhatsApp Inbound Live Connect Widget */}
      <FloatingWhatsAppWidget />
    </div>
  );
}
