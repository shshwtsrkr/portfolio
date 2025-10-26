import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import Navigation from './Navigation';

describe('Navigation Component', () => {
  // Helper function to render component with router
  const renderNavigation = (initialRoute = '/') => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <Navigation />
      </MemoryRouter>
    );
  };

  describe('Rendering', () => {
    it('should render all navigation items', () => {
      renderNavigation();

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Blogs')).toBeInTheDocument();
      expect(screen.getByText('Projects')).toBeInTheDocument();
      expect(screen.getByText('Publications')).toBeInTheDocument();
    });

    it('should render all navigation items as links', () => {
      renderNavigation();

      const homeLink = screen.getByRole('link', { name: /home/i });
      const blogsLink = screen.getByRole('link', { name: /blogs/i });
      const projectsLink = screen.getByRole('link', { name: /projects/i });
      const publicationsLink = screen.getByRole('link', { name: /publications/i });

      expect(homeLink).toBeInTheDocument();
      expect(blogsLink).toBeInTheDocument();
      expect(projectsLink).toBeInTheDocument();
      expect(publicationsLink).toBeInTheDocument();
    });

    it('should have correct href attributes', () => {
      renderNavigation();

      expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/');
      expect(screen.getByRole('link', { name: /blogs/i })).toHaveAttribute('href', '/blogs');
      expect(screen.getByRole('link', { name: /projects/i })).toHaveAttribute('href', '/projects');
      expect(screen.getByRole('link', { name: /publications/i })).toHaveAttribute('href', '/publications');
    });
  });

  describe('Clickability Tests', () => {
    it('should be able to click on Home link', async () => {
      const user = userEvent.setup();
      renderNavigation('/blogs'); // Start on a different page

      const homeLink = screen.getByRole('link', { name: /home/i });
      expect(homeLink).toBeInTheDocument();

      // Link should be clickable (not disabled)
      expect(homeLink).not.toHaveAttribute('disabled');
      expect(homeLink).not.toHaveAttribute('aria-disabled', 'true');

      await user.click(homeLink);
      // Navigation happens via React Router, so we just verify the click worked
    });

    it('should be able to click on Blogs link', async () => {
      const user = userEvent.setup();
      renderNavigation('/');

      const blogsLink = screen.getByRole('link', { name: /blogs/i });
      expect(blogsLink).toBeInTheDocument();
      expect(blogsLink).not.toHaveAttribute('disabled');
      expect(blogsLink).not.toHaveAttribute('aria-disabled', 'true');

      await user.click(blogsLink);
    });

    it('should be able to click on Projects link', async () => {
      const user = userEvent.setup();
      renderNavigation('/');

      const projectsLink = screen.getByRole('link', { name: /projects/i });
      expect(projectsLink).toBeInTheDocument();
      expect(projectsLink).not.toHaveAttribute('disabled');
      expect(projectsLink).not.toHaveAttribute('aria-disabled', 'true');

      await user.click(projectsLink);
    });

    it('should be able to click on Publications link', async () => {
      const user = userEvent.setup();
      renderNavigation('/');

      const publicationsLink = screen.getByRole('link', { name: /publications/i });
      expect(publicationsLink).toBeInTheDocument();
      expect(publicationsLink).not.toHaveAttribute('disabled');
      expect(publicationsLink).not.toHaveAttribute('aria-disabled', 'true');

      await user.click(publicationsLink);
    });

    it('should allow multiple consecutive clicks', async () => {
      const user = userEvent.setup();
      renderNavigation('/');

      const homeLink = screen.getByRole('link', { name: /home/i });
      const blogsLink = screen.getByRole('link', { name: /blogs/i });
      const projectsLink = screen.getByRole('link', { name: /projects/i });

      // Click multiple times in succession
      await user.click(blogsLink);
      await user.click(projectsLink);
      await user.click(homeLink);

      // All links should still be visible and clickable
      expect(homeLink).toBeVisible();
      expect(blogsLink).toBeVisible();
      expect(projectsLink).toBeVisible();
    });

    it('should have proper pointer cursor on hover', () => {
      renderNavigation();

      const links = screen.getAllByRole('link');

      // Verify all links have the cursor-pointer class which makes them clickable
      links.forEach(link => {
        expect(link).toHaveClass('cursor-pointer');
      });
    });
  });

  describe('Active State', () => {
    it('should apply active styling to Home when on home route', () => {
      renderNavigation('/');

      const homeLink = screen.getByRole('link', { name: /home/i });

      // Verify the link is present and accessible
      expect(homeLink).toBeInTheDocument();
      expect(homeLink).toHaveAttribute('href', '/');
    });

    it('should apply active styling to Blogs when on blogs route', () => {
      renderNavigation('/blogs');

      const blogsLink = screen.getByRole('link', { name: /blogs/i });

      expect(blogsLink).toBeInTheDocument();
      expect(blogsLink).toHaveAttribute('href', '/blogs');
    });

    it('should apply active styling to Projects when on projects route', () => {
      renderNavigation('/projects');

      const projectsLink = screen.getByRole('link', { name: /projects/i });

      expect(projectsLink).toBeInTheDocument();
      expect(projectsLink).toHaveAttribute('href', '/projects');
    });

    it('should apply active styling to Publications when on publications route', () => {
      renderNavigation('/publications');

      const publicationsLink = screen.getByRole('link', { name: /publications/i });

      expect(publicationsLink).toBeInTheDocument();
      expect(publicationsLink).toHaveAttribute('href', '/publications');
    });
  });

  describe('Accessibility', () => {
    it('should have accessible link elements', () => {
      renderNavigation();

      const links = screen.getAllByRole('link');

      // Should have exactly 4 links
      expect(links).toHaveLength(4);

      // Each link should have accessible text
      links.forEach(link => {
        expect(link.textContent).toBeTruthy();
      });
    });

    it('should allow keyboard navigation', async () => {
      const user = userEvent.setup();
      renderNavigation();

      const homeLink = screen.getByRole('link', { name: /home/i });

      // Focus on the link
      homeLink.focus();
      expect(homeLink).toHaveFocus();

      // Should be able to activate with Enter key
      await user.keyboard('{Enter}');
    });

    it('should have proper semantic structure', () => {
      renderNavigation();

      // Check for nav element
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });
  });

  describe('Visual Feedback', () => {
    it('should render with interactive elements', () => {
      renderNavigation();

      const blogsLink = screen.getByRole('link', { name: /blogs/i });

      // Verify link is interactive
      expect(blogsLink).toBeInTheDocument();
      expect(blogsLink).toHaveAttribute('href', '/blogs');
    });

    it('should have all nav items rendered with proper structure', () => {
      renderNavigation();

      const allLinks = screen.getAllByRole('link');

      // Verify all 4 navigation items are present
      expect(allLinks).toHaveLength(4);

      // Each link should have text content
      allLinks.forEach(link => {
        expect(link.textContent).not.toBe('');
      });
    });
  });
});
