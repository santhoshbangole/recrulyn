import { useEffect, useState } from "react";
import { leaveService } from "../../modules/leave/services/leave.service";

export default function ManagementLeaveAnalyticsPage() {
  const [leaves, setLeaves] =
    useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const data =
      await leaveService.getAll();

    setLeaves(data || []);
  }

  return (
    <div>
      <h1>
        Leave Analytics
      </h1>

      <div>
        Total Leaves:
        {leaves.length}
      </div>

      <div>
        Acknowledged:
        {
          leaves.filter(
            (leave) =>
              leave.acknowledged
          ).length
        }
      </div>

      <div>
        Pending:
        {
          leaves.filter(
            (leave) =>
              !leave.acknowledged
          ).length
        }
      </div>
    </div>
  );
}