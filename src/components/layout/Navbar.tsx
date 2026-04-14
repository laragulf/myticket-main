import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Ticket, MagnifyingGlass, Bell, Hamburger, X, Globe, IconContext } from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 1);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Events', to: '/events' },
    { label: 'Marketplace', to: '/marketplace' },
    { label: 'Auction', to: '/auction' },
    { label: 'My Tickets', to: '/my-tickets' },
  ];

  return (
    <IconContext.Provider value={{ weight: 'fill' }}>
      <header
        className={cn(
          'sticky z-50 w-full',
          'transition-[top,padding-left,padding-right] duration-[580ms] ease-[cubic-bezier(0.33,1.45,0.48,1)]',
          scrolled ? 'top-[25px] px-3 sm:px-5 md:px-8' : 'top-0 px-0'
        )}
      >
        <nav
          className={cn(
            'relative flex min-h-[60px] w-full flex-col overflow-visible',
            'transition-[border-radius,background-color,backdrop-filter,box-shadow,border-color] duration-[580ms] ease-[cubic-bezier(0.33,1.45,0.48,1)]',
            scrolled
              ? 'rounded-2xl border border-ink-10/90 bg-white/75 shadow-[0_12px_40px_rgba(0,0,0,0.09)] backdrop-blur-xl backdrop-saturate-150 md:rounded-[1.35rem]'
              : 'rounded-none border-b border-transparent bg-transparent shadow-none backdrop-blur-none'
          )}
        >
          <div className="relative z-10 flex h-[60px] w-full items-center px-6 lg:px-8">
            <Link to="/" className="mr-12 flex flex-shrink-0 items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-lemon">
                <Ticket size={18} className="text-ink" />
              </div>
              <span className="text-[17px] font-extrabold tracking-tight text-ink">
                My<span className="text-coral">Ticket</span>
              </span>
            </Link>

            <div className="hidden flex-1 items-center gap-8 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="text-[12px] font-bold text-ink-60 transition-colors hover:text-coral"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/events')}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-ink-40 transition-colors hover:bg-ink-5 hover:text-ink"
                aria-label="Search events"
              >
                <MagnifyingGlass size={18} />
              </button>
              <button
                type="button"
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-ink-40 transition-colors hover:bg-ink-5 hover:text-ink"
                aria-label="Notifications"
              >
                <Bell size={18} />
              </button>
              <button
                type="button"
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-ink-40 transition-colors hover:bg-ink-5 hover:text-ink"
                aria-label="Language"
              >
                <Globe size={18} />
              </button>
              {user ? (
                <div className="ml-1 hidden items-center gap-2 sm:flex">
                  <Link
                    to="/profile"
                    className="max-w-[140px] truncate text-[12px] font-bold text-ink hover:text-coral"
                  >
                    {user.name}
                  </Link>
                  <Button variant="ghost" size="sm" className="!px-3" onClick={() => signOut()}>
                    Out
                  </Button>
                </div>
              ) : (
                <>
                  <Link to="/register" className="ml-1 hidden text-[12px] font-bold text-ink-60 hover:text-coral sm:inline">
                    Register
                  </Link>
                  <Link to="/login" className="ml-1 hidden sm:inline-flex">
                    <span className="inline-flex h-8 items-center rounded-full bg-ink px-4 text-[12px] font-semibold text-white transition-colors hover:bg-ink-80">
                      Sign In
                    </span>
                  </Link>
                </>
              )}
              <button
                type="button"
                onClick={() => setMobileOpen(!mobileOpen)}
                className="ml-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-ink transition-colors hover:bg-ink-5 md:hidden"
              >
                {mobileOpen ? <X size={20} /> : <Hamburger size={20} />}
              </button>
            </div>
          </div>

          {mobileOpen && (
            <div
              className={cn(
                'absolute left-0 right-0 z-20 bg-white shadow-card-md md:hidden',
                'top-[calc(100%+12px)]',
                scrolled
                  ? 'rounded-2xl border border-t-0 border-ink-10 shadow-card-lg'
                  : 'border-b border-ink-10'
              )}
            >
              <div className="flex flex-col gap-4 p-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    className="text-[14px] font-bold text-ink transition-colors hover:text-coral"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      className="text-[14px] font-bold text-ink hover:text-coral"
                      onClick={() => setMobileOpen(false)}
                    >
                      Profile
                    </Link>
                    <Button variant="ghost" size="md" className="w-full" onClick={() => signOut()}>
                      Sign out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="text-[14px] font-bold text-ink hover:text-coral"
                      onClick={() => setMobileOpen(false)}
                    >
                      Register
                    </Link>
                    <Button
                      variant="dark"
                      size="md"
                      className="mt-2 w-full"
                      onClick={() => {
                        setMobileOpen(false);
                        navigate('/login');
                      }}
                    >
                      Sign In
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </nav>
      </header>
    </IconContext.Provider>
  );
}
