import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import LanguageSelector from "./LanguageSelector";
import UserMenu from "./UserMenu";
import { Button } from "@/components/ui/button";

type NavItem = {
  href: string;
  label: string;
};

const Header = () => {
  const { t } = useTranslation();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const farmerNavItems: NavItem[] = [
    { href: "/farmer/dashboard", label: t('nav.dashboard') },
    { href: "/farmer/produce", label: t('nav.produce') },
    { href: "/farmer/orders", label: t('nav.orders') },
    { href: "/daily-mandi", label: t('nav.dailyMandi') },
  ];

  const vendorNavItems: NavItem[] = [
    { href: "/vendor/dashboard", label: t('nav.dashboard') },
    { href: "/vendor/marketplace", label: t('nav.marketplace') },
    { href: "/vendor/orders", label: t('nav.orders') },
    { href: "/daily-mandi", label: t('nav.dailyMandi') },
  ];

  const authNavItems: NavItem[] = [
    { href: "/auth/login", label: t('nav.login') },
    { href: "/auth/register", label: t('nav.register') },
  ];

  // Determine if user is logged in and what type
  // This would normally come from authentication state
  const isLoggedIn = localStorage.getItem("user") !== null;
  const userType = isLoggedIn ? JSON.parse(localStorage.getItem("user") || "{}").userType : null;
  
  const navItems = isLoggedIn 
    ? (userType === "farmer" ? farmerNavItems : vendorNavItems)
    : authNavItems;

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Desktop Navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <div className="flex items-center cursor-pointer">
                  <svg className="h-10 w-10 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,2L1,9L5,11V22H19V11L23,9L12,2M12,5.5L18,9.5V10H6V9.5L12,5.5M6,12H18V20H6V12M9.5,13A1.5,1.5 0 0,0 8,14.5A1.5,1.5 0 0,0 9.5,16A1.5,1.5 0 0,0 11,14.5A1.5,1.5 0 0,0 9.5,13M14.5,13A1.5,1.5 0 0,0 13,14.5A1.5,1.5 0 0,0 14.5,16A1.5,1.5 0 0,0 16,14.5A1.5,1.5 0 0,0 14.5,13Z" />
                  </svg>
                  <span className="ml-2 text-2xl font-bold text-primary font-heading">
                    {t('general.siteTitle')}
                  </span>
                </div>
              </Link>
            </div>
            <nav className="hidden md:ml-6 md:flex md:space-x-8">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <a
                    className={cn(
                      "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium",
                      location === item.href
                        ? "border-primary text-primary"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    )}
                  >
                    {item.label}
                  </a>
                </Link>
              ))}
            </nav>
          </div>

          {/* User Menu and Language Selector */}
          <div className="flex items-center">
            <LanguageSelector />
            {isLoggedIn ? (
              <UserMenu />
            ) : (
              <div className="hidden md:flex items-center space-x-4 ml-4">
                <Link href="/auth/login">
                  <Button variant="outline" size="sm">
                    {t('auth.login')}
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">
                    {t('auth.register')}
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="-mr-2 flex items-center md:hidden">
              <Button
                variant="ghost"
                size="sm"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                onClick={toggleMobileMenu}
              >
                <span className="sr-only">
                  {mobileMenuOpen ? t('general.closeMenu') : t('general.openMenu')}
                </span>
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <a
                  className={cn(
                    "block pl-3 pr-4 py-2 border-l-4 text-base font-medium",
                    location === item.href
                      ? "bg-primary-light border-primary text-white"
                      : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              </Link>
            ))}
          </div>
          {isLoggedIn && (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <span className="inline-block h-10 w-10 rounded-full overflow-hidden bg-primary">
                    <svg className="h-full w-full text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,3.5C13.93,3.5 15.5,5.07 15.5,7C15.5,8.93 13.93,10.5 12,10.5C10.07,10.5 8.5,8.93 8.5,7C8.5,5.07 10.07,3.5 12,3.5M12,12.5C14.97,12.5 18.43,14.16 19.22,16.5H4.78C5.57,14.16 9.03,12.5 12,12.5Z" />
                    </svg>
                  </span>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">
                    {JSON.parse(localStorage.getItem("user") || "{}").fullName}
                  </div>
                  <div className="text-sm font-medium text-gray-500">
                    {JSON.parse(localStorage.getItem("user") || "{}").email}
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <Link href="/profile">
                  <a className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100" onClick={() => setMobileMenuOpen(false)}>
                    {t('user.profile')}
                  </a>
                </Link>
                <Link href="/settings">
                  <a className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100" onClick={() => setMobileMenuOpen(false)}>
                    {t('user.settings')}
                  </a>
                </Link>
                <button
                  className="w-full text-left block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  onClick={() => {
                    localStorage.removeItem("user");
                    window.location.href = "/";
                  }}
                >
                  {t('user.signOut')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
