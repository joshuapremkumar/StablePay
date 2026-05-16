import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  CreditCard,
  Wallet,
  Users,
  Ship,
  Sparkles,
  ShieldCheck,
  Search,
  Bell,
  ChevronDown,
  Command,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const nav = [
  { to: "/dashboard", label: "Executive", icon: LayoutDashboard },
  { to: "/payments", label: "Payments", icon: CreditCard },
  { to: "/treasury", label: "Treasury", icon: Wallet },
  { to: "/suppliers", label: "Suppliers & AP", icon: Users },
  { to: "/trade-finance", label: "Trade Finance", icon: Ship },
  { to: "/copilot", label: "AI CFO Copilot", icon: Sparkles },
  { to: "/compliance", label: "Compliance", icon: ShieldCheck },
] as const;

const roles = [
  "Founder",
  "CFO",
  "Finance Manager",
  "Merchant Operator",
  "Supplier",
  "Auditor",
  "Compliance Officer",
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [role, setRole] = useState("CFO");

  return (
    <div className="dark min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
        <div className="h-16 flex items-center gap-2 px-5 border-b border-sidebar-border">
          <div className="h-8 w-8 rounded-md bg-gradient-to-br from-primary to-electric grid place-items-center">
            <span className="font-display font-bold text-primary-foreground">F</span>
          </div>
          <div className="leading-tight">
            <div className="font-display text-sm font-semibold tracking-tight">Finara OS</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Financial OS
            </div>
          </div>
        </div>

        <div className="px-3 py-4 text-[11px] uppercase tracking-widest text-muted-foreground">
          Workspace
        </div>
        <nav className="flex-1 px-2 space-y-0.5">
          {nav.map((item) => {
            const active = pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-2 border-primary"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <div className="rounded-lg border border-sidebar-border bg-sidebar-accent/40 p-3">
            <div className="flex items-center gap-2 text-xs">
              <ShieldCheck className="h-3.5 w-3.5 text-success" />
              <span>SOC 2 · ISO 27001</span>
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">All systems operational</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 border-b border-border bg-surface/70 backdrop-blur flex items-center px-4 md:px-6 gap-3 sticky top-0 z-30">
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <LayoutDashboard className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-sidebar text-sidebar-foreground p-0 w-64">
                <SheetHeader className="h-16 px-5 border-b border-sidebar-border flex-row items-center">
                  <SheetTitle className="font-display">Finara OS</SheetTitle>
                </SheetHeader>
                <nav className="p-2 space-y-0.5">
                  {nav.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-sidebar-accent"
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Finara Holdings FZ-LLC</span>
            <ChevronDown className="h-3 w-3" />
            <Badge
              variant="outline"
              className="border-success/40 text-success bg-success/10 text-[10px]"
            >
              LIVE
            </Badge>
          </div>

          <div className="flex-1 max-w-md mx-auto hidden md:flex items-center gap-2 px-3 h-9 rounded-md border border-border bg-surface-elevated text-sm text-muted-foreground">
            <Search className="h-4 w-4" />
            <span>Search invoices, vendors, payments…</span>
            <span className="ml-auto inline-flex items-center gap-1 text-[10px] border border-border rounded px-1.5 py-0.5">
              <Command className="h-3 w-3" /> K
            </span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Button size="sm" className="hidden md:inline-flex">
              <Plus className="h-4 w-4 mr-1" /> New payment
            </Button>
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 pl-2 pr-3 h-9 rounded-md border border-border hover:bg-surface-elevated text-sm">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-electric to-primary grid place-items-center text-[10px] font-semibold text-primary-foreground">
                    LH
                  </div>
                  <div className="leading-tight text-left hidden sm:block">
                    <div className="text-xs font-medium">Layla Haddad</div>
                    <div className="text-[10px] text-muted-foreground">{role}</div>
                  </div>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Switch role</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {roles.map((r) => (
                  <DropdownMenuItem key={r} onClick={() => setRole(r)}>
                    {r}
                    {r === role && <span className="ml-auto text-[10px] text-primary">active</span>}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
