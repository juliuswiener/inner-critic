import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Settings, Home, User, MessageCircle, BookHeart } from 'lucide-react';
import { useCriticStore } from '../store/criticStore';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const critic = useCriticStore((s) => s.critic);

  const isJournalPage = location.pathname.startsWith('/journal');

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    ...(critic
      ? [
          { path: '/create', icon: User, label: 'Edit Critic' },
          { path: '/chat', icon: MessageCircle, label: 'Chat' },
        ]
      : []),
    { path: '/journal', icon: BookHeart, label: 'Journal' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  // Soft header styles for journal pages
  if (isJournalPage) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="bg-white/80 backdrop-blur-sm border-b border-soft-lavender-dark/20 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-soft-lavender to-soft-lavender-dark flex items-center justify-center shadow-sm">
                <span className="text-soft-text font-bold text-lg">IC</span>
              </div>
              <span className="text-soft-text font-bold text-xl tracking-tight">
                Inner Critic
              </span>
            </Link>

            <nav className="flex items-center gap-2">
              {navItems.map(({ path, icon: Icon, label }) => {
                const isActive =
                  path === '/journal'
                    ? location.pathname.startsWith('/journal')
                    : location.pathname === path;

                return (
                  <Link
                    key={path}
                    to={path}
                    className={`p-2.5 rounded-xl transition-all ${
                      isActive
                        ? 'bg-soft-lavender shadow-sm'
                        : 'hover:bg-soft-fog'
                    }`}
                    title={label}
                  >
                    <Icon className="w-5 h-5 text-soft-text" strokeWidth={2} />
                  </Link>
                );
              })}
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="bg-white/60 border-t border-soft-lavender-dark/10 py-4">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <p className="font-medium text-sm text-soft-text">
              Your journey of self-discovery and growth.
            </p>
            <p className="text-sm mt-1 text-soft-text-light">
              Be gentle with yourself.
            </p>
          </div>
        </footer>
      </div>
    );
  }

  // Neo-brutalism header for inner critic pages
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-brutal-white border-b-4 border-brutal-black sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 brutal-border brutal-shadow-sm bg-brutal-pink flex items-center justify-center brutal-hover">
              <span className="text-brutal-black font-black text-lg">IC</span>
            </div>
            <span className="text-brutal-black font-black text-xl uppercase tracking-tight">
              Inner Critic
            </span>
          </Link>

          <nav className="flex items-center gap-2">
            {navItems.map(({ path, icon: Icon, label }) => {
              const isActive =
                path === '/journal'
                  ? location.pathname.startsWith('/journal')
                  : location.pathname === path;

              return (
                <Link
                  key={path}
                  to={path}
                  className={`p-2 brutal-border border-2 brutal-hover ${
                    isActive
                      ? 'bg-brutal-yellow'
                      : 'bg-brutal-white hover:bg-brutal-gray'
                  }`}
                  title={label}
                >
                  <Icon className="w-5 h-5" strokeWidth={2.5} />
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-brutal-white border-t-4 border-brutal-black py-4">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="font-bold uppercase text-sm">
            A therapeutic tool for externalizing your inner critic.
          </p>
          <p className="text-sm mt-1 text-brutal-black/60">
            This is not a substitute for professional mental health care.
          </p>
        </div>
      </footer>
    </div>
  );
}
