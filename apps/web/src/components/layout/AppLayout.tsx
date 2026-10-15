import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ToastContainer } from "@/components/ui";
import { useThemeStore } from "@/stores/theme-store";

const navLinks = [
  { path: "/", label: "Home" },
  { path: "/scan", label: "Fit Scan" },
  { path: "/avatar", label: "3D Avatar" },
  { path: "/tryon", label: "Try-On" },
  { path: "/suggestions", label: "Advisor" },
  { path: "/fabrics", label: "Fabrics" },
];

export function AppShell() {
  const { theme, toggleTheme } = useThemeStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="relative flex min-h-dvh flex-col bg-[var(--color-bg-base)] text-[var(--color-text-primary)]">
      {/* Background Ambience */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="absolute -left-48 -top-48 h-[600px] w-[600px] rounded-full bg-[var(--color-brand-primary)]/10 blur-[130px]" />
        <div className="absolute -right-48 top-1/3 h-[500px] w-[500px] rounded-full bg-[var(--color-accent-teal)]/10 blur-[120px]" />
      </div>

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-[var(--color-border-glass)] bg-[var(--color-glass-bg)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 no-underline">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[var(--color-brand-primary)] to-[var(--color-accent-teal)] text-white font-bold text-lg shadow-md shadow-[var(--color-brand-primary)]/20">
              ✦
            </span>
            <span className="font-display text-xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
              StyleMirror
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1.5" aria-label="Main Navigation">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-[var(--color-brand-subtle)] text-[var(--color-brand-primary)]"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface-2)]"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Controls & Theme Switcher */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              className="rounded-xl p-2.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface-2)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden rounded-xl p-2.5 text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface-2)] cursor-pointer"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-surface-1)] px-4 py-3 flex flex-col gap-1 overflow-hidden"
            >
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `rounded-xl px-3 py-2 text-sm font-medium ${
                      isActive
                        ? "bg-[var(--color-brand-subtle)] text-[var(--color-brand-primary)] font-bold"
                        : "text-[var(--color-text-secondary)]"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content with Route Transitions */}
      <main className="flex-1 px-4 sm:px-8 py-6 max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-surface-1)]/50 px-4 py-6 text-center text-xs text-[var(--color-text-muted)]">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[var(--color-text-primary)]">StyleMirror</span>
            <span>· In-memory 3D Virtual Try-On</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-[var(--color-text-primary)] underline">
              Privacy &amp; Data Deletion Policy
            </Link>
            <Link to="/dev/design-system" className="hover:text-[var(--color-brand-primary)]">
              Design System
            </Link>
          </div>
        </div>
      </footer>

      {/* Global Toast Provider */}
      <ToastContainer />
    </div>
  );
}
