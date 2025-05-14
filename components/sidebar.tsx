"use client";

import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  Sidebar as SidebarPrimitive,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Bell,
  Building,
  CreditCard,
  FileCheck,
  Globe,
  Home,
  ImageIcon,
  LayoutDashboard,
  LogOut,
  Mail,
  Package,
  Palette,
  PenTool,
  Percent,
  PieChart,
  Printer,
  Receipt,
  Settings,
  ShoppingCart,
  TrendingUp,
  Truck,
  UserCircle,
  Users,
  Warehouse,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Angebot", href: "/angebot", icon: FileCheck },
  { name: "Lieferscheine", href: "/lieferscheine", icon: Truck },
  { name: "Rechnungen", href: "/rechnungen", icon: Receipt },
  { name: "Produkte", href: "/produkte", icon: Package },
  { name: "Kunden", href: "/kunden", icon: Users },
  { name: "Kassa", href: "/kasse", icon: ShoppingCart },
  { name: "Lager", href: "/lager", icon: Warehouse },
  { name: "Mitarbeiter", href: "/mitarbeiter", icon: UserCircle },
];

const dashboardItems = [
  { name: "Übersicht", href: "/dashboard", icon: BarChart3 },
  { name: "Angebote", href: "/dashboard/angebote", icon: PieChart },
  { name: "Rechnungen", href: "/dashboard/rechnungen", icon: CreditCard },
  {
    name: "Cash Flow",
    href: "/dashboard/cash-flow",
    icon: TrendingUp,
  },
];

const settingsItems = [
  { name: "Einstellungen", href: "/einstellungen", icon: Settings },
  { name: "Vorlagen", href: "/einstellungen/vorlagen", icon: Palette },
  {
    name: "Unterschriften",
    href: "/einstellungen/unterschriften",
    icon: PenTool,
  },
  { name: "Firmenlogo", href: "/einstellungen/firmenlogo", icon: ImageIcon },
  { name: "E-Mail", href: "/einstellungen/email", icon: Mail },
  { name: "Firma", href: "/einstellungen/firma", icon: Building },
  { name: "Rechtliches", href: "/einstellungen/rechtliches", icon: Receipt },
  { name: "Steuern", href: "/einstellungen/steuern", icon: Percent },
  { name: "Regional", href: "/einstellungen/regional", icon: Globe },
  { name: "Druck", href: "/einstellungen/druck", icon: Printer },
  {
    name: "Benachrichtigungen",
    href: "/einstellungen/benachrichtigungen",
    icon: Bell,
  },
  { name: "Benutzer", href: "/einstellungen/benutzer", icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const { user, logout } = useAuth();

  // Wenn wir auf der Anmeldeseite sind, zeigen wir keine Sidebar an
  if (pathname === "/anmeldung") {
    return null;
  }

  return (
    <SidebarPrimitive
      collapsible="icon"
      className="bg-primary text-primary-foreground transition-all duration-300"
    >
      <SidebarHeader className="flex justify-between">
        <span
          className={cn(
            "font-bold transition-all duration-300 ease-in-out",
            collapsed ? "text-xs" : "text-xl block"
          )}
        >
          KMW
        </span>
      </SidebarHeader>
      <SidebarContent>
        <nav>
          <SidebarMenu className="p-2 space-y-1">
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                      pathname === item.href
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "hover:bg-primary-foreground/10 text-primary-foreground/80"
                    )}
                  >
                    <item.icon size={20} />
                    <span>{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}

            <SidebarMenuItem className="mt-4">
              <SidebarMenuButton
                onClick={() => {
                  setSettingsExpanded(!settingsExpanded);
                  router.push("/einstellungen");
                }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-colors w-full text-left",
                  pathname.startsWith("/einstellungen")
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "hover:bg-primary-foreground/10 text-primary-foreground/80"
                )}
              >
                <Settings size={20} />
                <span>Einstellungen</span>
              </SidebarMenuButton>

              {settingsExpanded && !collapsed && (
                <SidebarMenuSub className="mt-1 space-y-1 border-none -ml-0.5">
                  {settingsItems.slice(1).map((item) => (
                    <SidebarMenuSubItem key={item.href}>
                      <SidebarMenuSubButton asChild>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                            pathname === item.href
                              ? "bg-primary-foreground/20 text-primary-foreground"
                              : "hover:bg-primary-foreground/10 text-primary-foreground/80"
                          )}
                        >
                          <item.icon className="!w-4 !h-4" size={16} />
                          <span>{item.name}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              )}
            </SidebarMenuItem>
          </SidebarMenu>
        </nav>
      </SidebarContent>

      <SidebarFooter
        className={cn(
          "mt-auto border-t border-primary-foreground/20",
          !collapsed && "p-4"
        )}
      >
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  asChild
                  size="lg"
                  className="w-full justify-start cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                      {user?.name?.charAt(0) || "U"}
                    </div>

                    {!collapsed && (
                      <>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-sm font-medium truncate">
                            {user?.name || "Benutzer"}
                          </p>
                          <p className="text-xs text-primary-foreground/70 truncate">
                            {user?.position || "Mitarbeiter"}
                          </p>
                        </div>
                        <button
                          onClick={logout}
                          className="p-1 rounded-md hover:bg-primary-foreground/20"
                          title="Abmelden"
                        >
                          <LogOut size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              {collapsed && (
                <DropdownMenuContent
                  side="right"
                  align="start"
                  className="w-48 bg-primary"
                >
                  <div className="px-2 py-1 text-sm text-white">
                    {user?.name || "Benutzer"}
                    <br />
                    <span className="text-xs text-primary-foreground/70 truncate">
                      {user?.position || "Mitarbeiter"}
                    </span>
                  </div>
                  <DropdownMenuItem
                    onClick={logout}
                    className="cursor-pointer text-white"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Abmelden
                  </DropdownMenuItem>
                </DropdownMenuContent>
              )}
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </SidebarPrimitive>
  );
}
