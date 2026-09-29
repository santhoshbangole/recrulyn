import { useAuth } from "../../app/providers/AuthProvider";

import HRDashboard from "./HRDashboard";
import ManagementDashboard from "./ManagementDashboard";
import EmployeeDashboard from "./EmployeeDashboard";

export default function DashboardPage() {
  const { role } = useAuth();

  if (role === "ADMIN" || role === "HR") {
    return <HRDashboard />;
  }

  if (role === "MANAGEMENT") {
    return <ManagementDashboard />;
  }

  return <EmployeeDashboard />;
}