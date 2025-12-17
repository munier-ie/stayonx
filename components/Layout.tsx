import React, { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../src/lib/supabase";
import { Skeleton } from "./Skeleton";
import {
  LayoutDashboard,
  Trophy,
  Users,
  Settings,
  LogOut,
  Activity,
  Menu,
  X,
} from "lucide-react";
import { Button } from "./Button";
import { useExtensionSync } from "../src/hooks/useExtensionSync";

interface LayoutProps {
  children: React.ReactNode;
}

const SidebarItem = ({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: any;
  label: string;
}) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `group flex items-center gap-3 px-3 py-2 text-sm font-medium transition-all duration-200 relative ${
          isActive ? "text-gray-900" : "text-gray-400 hover:text-gray-700"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {/* Active indicator pill */}
          {isActive && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-gray-900 rounded-r-full" />
          )}

          <Icon
            className={`w-5 h-5 stroke-[1.5px] transition-colors ${
              isActive
                ? "text-gray-900"
                : "text-gray-400 group-hover:text-gray-600"
            }`}
          />
          <span>{label}</span>
        </>
      )}
    </NavLink>
  );
};

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [userProfile, setUserProfile] = useState<{
    name: string;
    handle: string;
    avatar: string;
  } | null>(null);
  const [isExtensionActive, setExtensionActive] = useState(false);

  // Activate Global Extension Sync
  useExtensionSync();

  useEffect(() => {
    const checkExtension = () => {
      // Check for specific attribute set by bridge.js
      if (document.documentElement.getAttribute("data-stayonx-extension")) {
        if (!isExtensionActive) setExtensionActive(true);
      }
    };

    checkExtension();
    const interval = setInterval(checkExtension, 1000);

    const handler = () => {
      console.log("Extension Loaded Event Received");
      setExtensionActive(true);
    };
    window.addEventListener("STAYONX_EXTENSION_LOADED", handler);

    return () => {
      window.removeEventListener("STAYONX_EXTENSION_LOADED", handler);
      clearInterval(interval);
    };
  }, [isExtensionActive]);

  React.useEffect(() => {
    const handleScroll = () => {
      // Add a small hysteresis or simple threshold
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Define public routes where the sidebar should NOT appear
  const publicRoutes = [
    "/",
    "/login",
    "/signup",
    "/how-it-works",
    "/install-extension",
    "/pricing",
    "/404",
    "/privacy",
  ];
  const isPublic =
    publicRoutes.includes(location.pathname) || location.pathname === "/";

  useEffect(() => {
    if (isPublic) return;

    async function loadUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        const meta = session.user.user_metadata;
        setUserProfile({
          name: meta.full_name || meta.name || data?.twitter_handle || "User",
          handle: data?.twitter_handle
            ? `@${data.twitter_handle}`
            : meta.user_name
            ? `@${meta.user_name}`
            : "Member",
          avatar:
            data?.avatar_url ||
            meta.avatar_url ||
            "https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png",
        });
      }
    }
    loadUser();
  }, [isPublic]);

  const handleLogout = async () => {
    // Clear Extension Session
    window.postMessage({ type: "STAYONX_SESSION_SYNC", session: null }, "*");
    // Sign out from Supabase
    await supabase.auth.signOut();
    navigate("/login");
  };

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const navLinks = [
    { name: "How it Works", path: "/how-it-works" },
    { name: "Pricing", path: "/pricing" },
    {
      name: isAuthenticated ? "Dashboard" : "Login",
      path: isAuthenticated ? "/dashboard" : "/login",
    },
  ];

  if (isPublic) {
    return (
      <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-gray-200 selection:text-gray-900 flex flex-col">
        {/* Public Navigation Header */}
        <header
          className={`fixed z-50 left-1/2 -translate-x-1/2 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            isScrolled
              ? "top-6 w-[85%] md:w-[65%] bg-white/90 backdrop-blur-xl border border-gray-200/80 shadow-lg shadow-black/5 rounded-3xl"
              : "top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100/50 rounded-none"
          }`}
        >
          <div
            className={`w-full max-w-7xl mx-auto px-6 flex items-center justify-between transition-[padding] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              isScrolled ? "py-[20px]" : "py-[22px]"
            }`}
          >
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate("/")}
            >
              <img src="/logo1.png" alt="StayOnX" className="w-8 h-8 object-contain" />
              <span className="font-semibold text-gray-900 tracking-tight text-lg">
                StayOnX
              </span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.path}
                  onClick={(e) => {
                    if (link.path.startsWith("/#")) {
                      // handle anchor
                      const el = document.getElementById(
                        link.path.substring(2)
                      );
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    } else {
                      e.preventDefault();
                      navigate(link.path);
                    }
                  }}
                  className="text-[15px] font-medium text-gray-500 hover:text-gray-900 transition-colors"
                >
                  {link.name}
                </a>
              ))}
              <Button
                size="sm"
                onClick={() => navigate("/install-extension")}
                className="text-[13px] px-3.5 py-2"
              >
                Install Extension
              </Button>
            </nav>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden text-gray-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>

          {/* Mobile Nav Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 w-full bg-white border-t border-gray-100 p-6 flex flex-col gap-4 shadow-lg rounded-b-2xl mt-1">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.path}
                  onClick={() => {
                    navigate(link.path);
                    setMobileMenuOpen(false);
                  }}
                  className="text-base font-medium text-gray-600"
                >
                  {link.name}
                </a>
              ))}
              <Button fullWidth onClick={() => navigate("/install-extension")}>
                Install Extension
              </Button>
            </div>
          )}
        </header>

        {/* Main Content */}
        <main className="flex-1 pt-24">{children}</main>

        {/* Simple Public Footer */}
        {location.pathname !== "/404" && (
          <footer className="py-12 border-t border-gray-100 bg-white">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-sm text-gray-400">
                &copy; 2026 StayOnX. All rights reserved.
              </div>
              <div className="flex gap-6">
                <button
                  onClick={() => navigate("/privacy")}
                  className="text-sm text-gray-400 hover:text-gray-900 transition-colors"
                >
                  Privacy
                </button>
                <button
                  onClick={() => navigate("/privacy")}
                  className="text-sm text-gray-400 hover:text-gray-900 transition-colors"
                >
                  Terms
                </button>
                <a
                  href="https://x.com/munier_ie"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-gray-900 transition-colors"
                >
                  Twitter
                </a>
              </div>
            </div>
          </footer>
        )}
      </div>
    );
  }

  // App Layout (Dashboard, etc.)
  return (
    <div className="flex min-h-screen bg-white text-gray-900 font-sans selection:bg-gray-200 selection:text-gray-900">
      {/* Mobile App Header */}
      <div className="md:hidden fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-gray-200 z-30 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2" onClick={() => navigate("/")}>
          <img src="/logo1.png" alt="StayOnX" className="w-8 h-8 object-contain" />
          <span className="font-semibold text-gray-900 tracking-tight text-lg">
            StayOnX
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-gray-600"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Sidebar - Responsive */}
      {/* Changed to md:sticky to keep it in flow on desktop, fixed on mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 md:w-60 bg-gray-50 border-r border-gray-200 flex flex-col pt-8 pb-6 px-4 transition-transform duration-300 ease-in-out
        ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:sticky md:top-0 md:h-screen`}
      >
        {/* Brand (Desktop only) */}
        <div
          className="hidden md:flex items-center gap-3 px-4 mb-10 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img src="/logo1.png" alt="StayOnX" className="w-10 h-10 object-contain" />
          <span className="font-semibold text-gray-900 tracking-tight text-xl">
            StayOnX
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 mt-12 md:mt-0">
          <SidebarItem
            to="/dashboard"
            icon={LayoutDashboard}
            label="Dashboard"
          />
          <SidebarItem to="/leaderboard" icon={Trophy} label="Leaderboard" />
          <SidebarItem to="/spaces" icon={Users} label="Spaces" />
          <SidebarItem to="/settings" icon={Settings} label="Settings" />
        </nav>

        {/* Bottom Actions */}
        <div className="pt-6 space-y-4">
          {/* Extension Status */}
          <div
            className={`px-3 py-2.5 rounded-lg border shadow-sm flex items-center gap-3 transition-colors ${
              isExtensionActive
                ? "bg-green-50/50 border-green-200/60"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                isExtensionActive
                  ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"
                  : "bg-gray-300"
              }`}
            />
            <span
              className={`text-xs font-medium ${
                isExtensionActive ? "text-green-700" : "text-gray-500"
              }`}
            >
              {isExtensionActive ? "Extension Active" : "Extension Inactive"}
            </span>
          </div>

          {/* User Profile Snippet */}
          <div className="flex items-center gap-3 px-2 py-2">
            {userProfile ? (
              <>
                <img
                  src={userProfile.avatar}
                  alt="Profile"
                  className="w-8 h-8 rounded-full border border-gray-200 object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {userProfile.name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {userProfile.handle}
                  </p>
                </div>
              </>
            ) : (
              <>
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1 min-w-0 space-y-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-12 bg-gray-100" />
                </div>
              </>
            )}
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-gray-900 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      {/* Removed md:ml-60 because sidebar is now sticky (in-flow) on desktop */}
      <main className="flex-1 p-4 md:p-10 pt-20 md:pt-10 max-w-[1440px] w-full animate-fade-in-up overflow-x-hidden">
        {children}
      </main>
    </div>
  );
};
