import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

class LeaveReportService {

  downloadExcel(leaves: any[]) {

    const report = leaves.map((leave) => ({

      Employee:
        leave.employees?.full_name || "-",

      LeaveType:
        leave.leave_type,

      StartDate:
        leave.start_date,

      EndDate:
        leave.end_date,

      Days:
        Math.ceil(
          (new Date(leave.end_date).getTime() -
            new Date(leave.start_date).getTime()) /
            (1000 * 60 * 60 * 24)
        ) + 1,

      Reason:
        leave.reason,

      Status:
        leave.acknowledged
          ? "Acknowledged"
          : "Pending",

      AcknowledgedDate:
        leave.acknowledged_at || "-",

    }));

    const worksheet =
      XLSX.utils.json_to_sheet(report);

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Leave Report"
    );

    const buffer =
      XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

    saveAs(

      new Blob([buffer]),

      `Leave_Report_${
        new Date().toISOString().split("T")[0]
      }.xlsx`

    );

  }

}

export const leaveReportService =
  new LeaveReportService();