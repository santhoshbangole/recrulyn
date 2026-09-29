import { supabase } from "../../../services/supabase/client";
import {
  addDemoLeaveRequest,
  getDemoEmployees,
  getDemoLeaveRequests,
  isDemoMode,
} from "../../demo/seed";

function withEmployee(row: any) {
  const emp = getDemoEmployees().find((e: any) => e.id === row.employee_id);
  return {
    ...row,
    employees: emp
      ? {
          full_name: emp.full_name,
          department: emp.department,
          designation: emp.designation,
        }
      : row.employees,
  };
}

export const leaveService = {
  async getAll() {
    if (isDemoMode()) return getDemoLeaveRequests().map(withEmployee);

    try {
      const { data, error } = await supabase
        .from("leave_requests")
        .select(`
          *,
          employees (
            full_name,
            department,
            designation
          )
        `)
        .order("applied_at", { ascending: false });

      if (error) throw error;
      return data?.length ? data : getDemoLeaveRequests().map(withEmployee);
    } catch {
      return getDemoLeaveRequests().map(withEmployee);
    }
  },

  async getByEmployeeId(employeeId: string) {
    if (isDemoMode() || !employeeId) {
      return getDemoLeaveRequests(employeeId).map(withEmployee);
    }

    try {
      const { data, error } = await supabase
        .from("leave_requests")
        .select(`
          *,
          employees (
            full_name,
            department,
            designation
          )
        `)
        .eq("employee_id", employeeId)
        .order("applied_at", { ascending: false });

      if (error) throw error;
      return data?.length ? data : getDemoLeaveRequests(employeeId).map(withEmployee);
    } catch {
      return getDemoLeaveRequests(employeeId).map(withEmployee);
    }
  },

  async create(payload: {
    employee_id: string;
    leave_type: string;
    start_date: string;
    end_date: string;
    reason: string;
  }) {
    if (isDemoMode() || String(payload.employee_id || "").startsWith("demo-")) {
      return withEmployee(addDemoLeaveRequest(payload));
    }

    const { data, error } = await supabase.from("leave_requests").insert(payload).select().single();
    if (error) throw error;
    return data;
  },

  async updateStatus(id: string, status: string) {
    if (isDemoMode() || String(id).startsWith("demo-")) return;

    const { error } = await supabase
      .from("leave_requests")
      .update({
        status,
        approved_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;
  },

  async acknowledgeLeave(id: string) {
    if (isDemoMode() || String(id).startsWith("demo-")) return;

    const { error } = await supabase
      .from("leave_requests")
      .update({
        acknowledged: true,
        acknowledged_at: new Date().toISOString(),
        status: "Acknowledged",
      })
      .eq("id", id);

    if (error) throw error;
  },
};
