import { C } from "@/constants/tokens";
import { useApp } from "@/context/AppContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { DashboardPage }     from "@/components/pages/DashboardPage";
import { AlarmDashboardPage } from "@/components/pages/AlarmDashboardPage";
import { VehiclesPage }      from "@/components/pages/VehiclesPage";
import { AllocationsPage }   from "@/components/pages/AllocationsPage";
import { PeoplePage }        from "@/components/pages/PeoplePage";
import { ReportsPage }       from "@/components/pages/ReportsPage";
import { NotificationsPage } from "@/components/pages/NotificationsPage";
import { SettingsPage }      from "@/components/pages/SettingsPage";

const PAGES = {
  dashboard:     DashboardPage,
  alarms:        AlarmDashboardPage,
  vehicles:      VehiclesPage,
  allocations:   AllocationsPage,
  people:        PeoplePage,
  reports:       ReportsPage,
  notifications: NotificationsPage,
  settings:      SettingsPage,
};

export function AppShell() {
  const { page, mobileOpen, setMobileOpen } = useApp();
  const Page = PAGES[page] || DashboardPage;

  return (
    <div className="min-h-screen flex wp-body" style={{ backgroundColor: C.paper }}>
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
        <div key={page} className="wp-page-in">
          <Page />
        </div>
      </main>
    </div>
  );
}
