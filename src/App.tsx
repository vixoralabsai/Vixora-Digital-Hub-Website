/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
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
import { ScrollProgressBar } from './components/ScrollProgressBar';

// Standalone Pages
import { AboutPage } from './pages/AboutPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { AcademyPage } from './pages/AcademyPage';
import { CourseLandingPage } from './pages/CourseLandingPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { ClientDashboardPage } from './pages/ClientDashboardPage';
import { PagesDirectoryPage } from './pages/PagesDirectoryPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { StudentPortalPage } from './pages/StudentPortalPage';

import { ACADEMY_COURSES, AcademyCourse } from './data/vixoraContent';
import { BRAND_CONFIG } from './data/brandConfig';
import { ThemeProvider } from './context/ThemeContext';
import { getPostBySlug } from './data/categoriesData';

export type PageType =
  | 'home'
  | 'about'
  | 'portfolio'
  | 'academy'
  | 'academy-course'
  | 'resources'
  | 'dashboard'
  | 'pages-directory'
  | 'categories'
  | 'student-portal'
  | 'certificate-portal';

interface RouteState {
  page: PageType;
  path: string;
  categorySlug?: string;
  subcategorySlug?: string;
  postSlug?: string;
  courseSlug?: string;
  certId?: string;
}

function parseLocationPath(pathname: string, search: string): RouteState {
  const cleanPath = pathname.replace(/\/+$/, '') || '/';
  const urlParams = new URLSearchParams(search);
  const pageParam = urlParams.get('page');
  const courseParam = urlParams.get('course');
  const certParam = urlParams.get('cert') || urlParams.get('id') || undefined;

  // 1. Query parameter overrides (legacy compatibility)
  if (courseParam) {
    return {
      page: 'academy-course',
      path: `/academy/${courseParam}`,
      courseSlug: courseParam
    };
  }

  if (pageParam && ['about', 'portfolio', 'resources', 'academy', 'dashboard', 'student-portal', 'certificate-portal'].includes(pageParam)) {
    return {
      page: pageParam as PageType,
      path: `/pages/${pageParam}`,
      certId: certParam
    };
  }

  // 2. Canonical /pages permalinks
  if (cleanPath === '/pages') {
    return { page: 'pages-directory', path: '/pages' };
  }
  if (cleanPath === '/pages/student-portal' || cleanPath === '/student-portal' || cleanPath === '/portal') {
    return { page: 'student-portal', path: '/pages/student-portal', certId: certParam };
  }
  if (
    cleanPath === '/pages/certificate-portal' ||
    cleanPath === '/certificate-portal' ||
    cleanPath === '/verify' ||
    cleanPath === '/verify-certificate'
  ) {
    return { page: 'certificate-portal', path: '/pages/certificate-portal', certId: certParam };
  }
  if (cleanPath === '/pages/about' || cleanPath === '/about') {
    return { page: 'about', path: '/pages/about' };
  }
  if (cleanPath === '/pages/portfolio' || cleanPath === '/portfolio') {
    return { page: 'portfolio', path: '/pages/portfolio' };
  }
  if (cleanPath === '/pages/academy' || cleanPath === '/academy') {
    return { page: 'academy', path: '/pages/academy' };
  }
  if (cleanPath === '/pages/resources' || cleanPath === '/resources') {
    return { page: 'resources', path: '/pages/resources' };
  }
  if (cleanPath === '/pages/dashboard' || cleanPath === '/dashboard') {
    return { page: 'dashboard', path: '/pages/dashboard' };
  }

  // 3. Academy Course paths: /academy/:courseSlug
  if (cleanPath.startsWith('/academy/')) {
    const slug = cleanPath.replace('/academy/', '');
    return {
      page: 'academy-course',
      path: cleanPath,
      courseSlug: slug
    };
  }

  // 4. Categories, Subcategories & Posts:
  // Format:
  // - /categories
  // - /categories/:category
  // - /categories/:category/:subcategory
  // - /categories/:category/:subcategory/:postTitle
  // - /categories/:category/:postTitle
  if (cleanPath === '/categories') {
    return {
      page: 'categories',
      path: '/categories'
    };
  }

  if (cleanPath.startsWith('/categories/')) {
    const parts = cleanPath.replace('/categories/', '').split('/').filter(Boolean);
    if (parts.length === 1) {
      // Could be /categories/:categorySlug
      return {
        page: 'categories',
        path: cleanPath,
        categorySlug: parts[0]
      };
    } else if (parts.length === 2) {
      // Check if parts[1] is a post or a subcategory
      const potentialPost = getPostBySlug(parts[1], parts[0]);
      if (potentialPost) {
        return {
          page: 'categories',
          path: cleanPath,
          categorySlug: parts[0],
          postSlug: parts[1]
        };
      }
      return {
        page: 'categories',
        path: cleanPath,
        categorySlug: parts[0],
        subcategorySlug: parts[1]
      };
    } else if (parts.length >= 3) {
      // /categories/:categorySlug/:subcategorySlug/:postSlug
      return {
        page: 'categories',
        path: cleanPath,
        categorySlug: parts[0],
        subcategorySlug: parts[1],
        postSlug: parts[2]
      };
    }
  }

  // Default Home
  return { page: 'home', path: '/' };
}

function AppContent() {
  const [route, setRoute] = useState<RouteState>(() =>
    parseLocationPath(
      typeof window !== 'undefined' ? window.location.pathname : '/',
      typeof window !== 'undefined' ? window.location.search : ''
    )
  );

  const [selectedCourse, setSelectedCourse] = useState<AcademyCourse | null>(() => {
    if (route.courseSlug) {
      return ACADEMY_COURSES.find(c => c.slug === route.courseSlug || c.id === route.courseSlug) || null;
    }
    return null;
  });

  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [driveWorkspaceOpen, setDriveWorkspaceOpen] = useState(false);
  const [enrollmentModalOpen, setEnrollmentModalOpen] = useState(false);
  const [courseForEnrollment, setCourseForEnrollment] = useState<AcademyCourse | null>(null);

  // Sync course when route changes
  useEffect(() => {
    if (route.courseSlug) {
      const found = ACADEMY_COURSES.find(c => c.slug === route.courseSlug || c.id === route.courseSlug);
      if (found) setSelectedCourse(found);
    }
  }, [route.courseSlug]);

  // Handle browser back and forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const parsed = parseLocationPath(window.location.pathname, window.location.search);
      setRoute(parsed);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Universal Navigation Handler supporting permalinks
  const handleNavigate = useCallback(
    (page: string, sectionId?: string, courseSlug?: string, customPath?: string) => {
      const isAlreadyAcademyHost = typeof window !== 'undefined' && (
        window.location.hostname.startsWith('academy.') ||
        window.location.hostname.includes('academy')
      );

      // Determine canonical target URL
      let targetPath = customPath;
      if (!targetPath) {
        if (page === 'home') {
          targetPath = sectionId ? `/#${sectionId}` : '/';
        } else if (page === 'pages-directory') {
          targetPath = '/pages';
        } else if (page === 'about') {
          targetPath = '/pages/about';
        } else if (page === 'portfolio') {
          targetPath = '/pages/portfolio';
        } else if (page === 'academy') {
          targetPath = '/pages/academy';
        } else if (page === 'resources') {
          targetPath = '/pages/resources';
        } else if (page === 'dashboard') {
          targetPath = '/pages/dashboard';
        } else if (page === 'categories') {
          targetPath = '/categories';
        } else if (page === 'academy-course' && courseSlug) {
          targetPath = `/academy/${courseSlug}`;
        } else {
          targetPath = `/${page}`;
        }
      }

      // External academy host handling if needed
      if (page === 'academy' && !isAlreadyAcademyHost && window.location.hostname.includes('vixora.com')) {
        window.location.href = BRAND_CONFIG.academyDomain;
        return;
      }

      if (page === 'academy-course' && courseSlug && !isAlreadyAcademyHost && window.location.hostname.includes('vixora.com')) {
        window.location.href = `${BRAND_CONFIG.academyDomain}/?page=academy-course&course=${encodeURIComponent(courseSlug)}`;
        return;
      }

      // Update browser history with clean permalink
      if (typeof window !== 'undefined') {
        window.history.pushState({}, '', targetPath);
      }

      // Parse and set internal state
      const parsed = parseLocationPath(
        targetPath.split('#')[0] || '/',
        targetPath.includes('?') ? targetPath.split('?')[1] : ''
      );
      setRoute(parsed);

      if (sectionId && (page === 'home' || targetPath.startsWith('/#'))) {
        setTimeout(() => {
          const el = document.getElementById(sectionId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 50);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    []
  );

  const handleSelectCourse = (course: AcademyCourse) => {
    setSelectedCourse(course);
    handleNavigate('academy-course', undefined, course.slug, `/academy/${course.slug}`);
  };

  const handleEnrollInCourse = (course: AcademyCourse) => {
    setCourseForEnrollment(course);
    setEnrollmentModalOpen(true);
  };

  const handleExploreServices = () => {
    if (route.page !== 'home') {
      handleNavigate('home', 'solutions', undefined, '/#solutions');
    } else {
      const el = document.getElementById('solutions');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#070314] text-neutral-100 font-sans selection:bg-purple-600 selection:text-white antialiased transition-colors duration-200">
      {/* Viewport Top Scroll Progress Indicator for Long-Form Pages */}
      <ScrollProgressBar currentPage={route.page} />

      {/* 1. Streamlined Navigation Bar with Subcategories & Permalinks */}
      <Navbar
        currentPage={route.page}
        currentPath={route.path}
        onNavigate={handleNavigate}
        onOpenProjectModal={() => setProjectModalOpen(true)}
        onOpenDriveWorkspace={() => setDriveWorkspaceOpen(true)}
      />

      {/* Main Dynamic View Content */}
      <main>
        {route.page === 'home' && (
          <div className="animate-in fade-in duration-200">
            {/* 1. Hero Section with 3D V Monolith & Floating Cyber Nodes */}
            <Hero
              onOpenProjectModal={() => setProjectModalOpen(true)}
              onExploreServices={handleExploreServices}
              onOpenDriveWorkspace={() => setDriveWorkspaceOpen(true)}
            />

            {/* 2. Client Logos Ribbon */}
            <TrustedBy />

            {/* 3. Key Metrics Bar */}
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

        {route.page === 'about' && (
          <AboutPage
            onOpenProjectModal={() => setProjectModalOpen(true)}
            onNavigate={handleNavigate}
          />
        )}

        {route.page === 'portfolio' && (
          <PortfolioPage
            onOpenProjectModal={() => setProjectModalOpen(true)}
          />
        )}

        {route.page === 'academy' && (
          <AcademyPage
            onOpenProjectModal={() => setProjectModalOpen(true)}
            onSelectCourse={handleSelectCourse}
            onEnrollCourse={handleEnrollInCourse}
            onNavigateHome={() => handleNavigate('home', undefined, undefined, '/')}
            onNavigateToStudentPortal={() => handleNavigate('student-portal', undefined, undefined, '/student-portal')}
          />
        )}

        {route.page === 'academy-course' && selectedCourse && (
          <CourseLandingPage
            course={selectedCourse}
            onBackToAcademy={() => handleNavigate('academy', undefined, undefined, '/pages/academy')}
            onEnroll={handleEnrollInCourse}
            onSelectCourse={handleSelectCourse}
            onNavigateHome={() => handleNavigate('home', undefined, undefined, '/')}
          />
        )}

        {route.page === 'resources' && (
          <ResourcesPage
            onOpenDriveWorkspace={() => setDriveWorkspaceOpen(true)}
            onOpenProjectModal={() => setProjectModalOpen(true)}
          />
        )}

        {route.page === 'dashboard' && (
          <ClientDashboardPage
            onOpenProjectModal={() => setProjectModalOpen(true)}
            onOpenDriveWorkspace={() => setDriveWorkspaceOpen(true)}
            onNavigateHome={() => handleNavigate('home', undefined, undefined, '/')}
          />
        )}

        {route.page === 'pages-directory' && (
          <PagesDirectoryPage
            onNavigate={handleNavigate}
            onOpenProjectModal={() => setProjectModalOpen(true)}
            onOpenDriveWorkspace={() => setDriveWorkspaceOpen(true)}
          />
        )}

        {route.page === 'categories' && (
          <CategoriesPage
            categorySlug={route.categorySlug}
            subcategorySlug={route.subcategorySlug}
            postSlug={route.postSlug}
            onNavigate={handleNavigate}
            onOpenProjectModal={() => setProjectModalOpen(true)}
          />
        )}

        {(route.page === 'student-portal' || route.page === 'certificate-portal') && (
          <StudentPortalPage
            initialTab={route.page === 'certificate-portal' ? (route.certId ? 'certificates' : 'verify') : 'dashboard'}
            initialCertId={route.certId}
            onNavigateToCourse={(slug) => handleNavigate('academy-course', undefined, slug, `/academy/${slug}`)}
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
        onNavigateToDashboard={() => handleNavigate('dashboard', undefined, undefined, '/pages/dashboard')}
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

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}


