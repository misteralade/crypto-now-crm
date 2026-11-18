import { useEffect, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  History,
  LogOut,
  Wallet,
  Landmark,
  ShieldCheck,
  LayoutDashboard,
  ArrowRightLeft,
  Coins,
  Banknote,
  MessageSquareQuote,
  AlertCircle,
  Bell,
  Users,
  UserCog,
  X,
} from "lucide-react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import logo from "../assets/img/logo.svg";
import { LOCAL_STORAGE_KEYS, ROUTES } from "../util/constants.util.ts";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { NAV_ITEM_PERMISSIONS } from "../util/permissions.util";

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
}

const navItems = [
  {
    path: ROUTES.DASHBOARD,
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    path: ROUTES.TRANSACTIONS,
    label: "Transactions",
    icon: ArrowRightLeft,
  },
  {
    path: ROUTES.COIN_MANAGEMENT,
    label: "Coin Management",
    icon: Coins,
  },
  {
    path: ROUTES.ADMIN_WALLETS,
    label: "Admin Wallets",
    icon: Landmark,
  },
  {
    path: ROUTES.MANAGE_FIAT,
    label: "Manage Fiat",
    icon: Banknote,
  },
  {
    path: ROUTES.TREASURY,
    label: "Treasury",
    icon: Wallet,
  },
  {
    path: ROUTES.REVIEWS,
    label: "Reviews",
    icon: MessageSquareQuote,
  },
  {
    path: ROUTES.TESTIMONIALS,
    label: "Testimonials",
    icon: MessageSquareQuote,
  },
  {
    path: ROUTES.DISPUTES,
    label: "Disputes",
    icon: AlertCircle,
  },
  {
    path: ROUTES.NOTIFICATIONS,
    label: "Notifications",
    icon: Bell,
  },
  {
    path: ROUTES.AUDIT_TRAILS,
    label: "Audit trails",
    icon: History,
  },
  {
    path: ROUTES.USERS,
    label: "Users",
    icon: Users,
  },
  {
    path: ROUTES.MANAGE_ADMINS,
    label: "Manage Admins",
    icon: UserCog,
  },
  {
    path: ROUTES.SECURITY,
    label: "Security",
    icon: ShieldCheck,
  },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const routerState = useRouterState();
  const navigate = useNavigate();
  const currentPath = routerState.location.pathname;
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const { hasAnyPermission, loading: loadingAdminAuth } = useAdminAuth();

  const handleLogout = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
    navigate({ to: ROUTES.LOGIN });
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-[260px] z-50 bg-[#122456] transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl lg:shadow-none
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:sticky lg:top-0 lg:translate-x-0 lg:z-0 lg:h-screen`}
        role={isDesktop ? undefined : "dialog"}
        aria-modal={!isDesktop && isOpen}
        aria-hidden={!isDesktop && !isOpen}
      >
        <div className="flex flex-col h-full w-full overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4.5 border-b border-white/10">
            <Link
              to={ROUTES.DASHBOARD}
              aria-label="Go to dashboard"
              className="inline-flex items-center gap-2.5 focus:outline-none rounded-lg"
              onClick={() => {
                if (!isDesktop) setIsOpen(false);
              }}
            >
              <img
                src={logo}
                alt="CryptoNow"
                className="h-7 w-auto object-contain brightness-[5]"
              />
              <span className="text-white font-bold text-base tracking-tight">CryptoNow</span>
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white lg:hidden cursor-pointer"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-3.5 space-y-1 overflow-y-auto">
            {navItems
              .filter((item) => {
                const requiredPermissions = NAV_ITEM_PERMISSIONS[item.path];
                if (!requiredPermissions) return true;
                if (loadingAdminAuth) return false;
                return hasAnyPermission(requiredPermissions);
              })
              .map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.path === ROUTES.DASHBOARD
                    ? currentPath === item.path
                    : (item.path === ROUTES.MANAGE_FIAT && currentPath === ROUTES.SUPPORTED_CURRENCIES) || currentPath === item.path ||
                      currentPath.startsWith(item.path + "/");

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => {
                      if (!isDesktop) setIsOpen(false);
                    }}
                    className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 touch-manipulation min-h-[40px] ${
                      isActive
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-blue-100/75 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon
                      className={`w-4.5 h-4.5 flex-shrink-0 ${isActive ? "text-white" : "text-blue-200/80"}`}
                    />
                    <span className="text-sm font-medium tracking-tight">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
          </nav>

          {/* Logout */}
          <div className="px-3 py-3 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-300 hover:bg-rose-500/15 hover:text-rose-200 transition-colors w-full cursor-pointer touch-manipulation min-h-[40px]"
            >
              <LogOut size={16} className="flex-shrink-0" />
              <span className="text-sm">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
