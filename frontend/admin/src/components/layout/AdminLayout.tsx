import { ReactNode, useState, createContext, useContext } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const SidebarContext = createContext<{ collapsed: boolean }>({ collapsed: false });

export function useAdminSidebar() {
  return useContext(SidebarContext);
}

export function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  const [collapsed] = useState(false);

  return (
    <SidebarContext.Provider value={{ collapsed }}>
      <div className="min-h-screen bg-background">
        <AdminSidebar />
        <div
          className={cn(
            "transition-all duration-300 ease-in-out",
            "ml-64" // Default sidebar width, will adjust via CSS
          )}
          style={{ marginLeft: collapsed ? "4rem" : "16rem" }}
        >
          <AdminHeader title={title} subtitle={subtitle} />
          <main className="p-6 page-transition">{children}</main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
