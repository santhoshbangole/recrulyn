import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function usePageTitle() {
  const location = useLocation();

  useEffect(() => {
    const titles: Record<string, string> = {
      "/": "Dashboard | RECRULYN",
      "/candidates": "Candidates | RECRULYN",
      "/employees": "Employees | RECRULYN",
      "/ai-recruiter": "AI Recruiter | RECRULYN",
      "/documents": "Documents | RECRULYN",
      "/reports": "Reports | RECRULYN",
      "/approvals": "Approvals | RECRULYN",
      "/leave-management": "Leave Management | RECRULYN",
      "/employee-leave": "My Leave | RECRULYN",
      "/email-automation": "Email Automation | RECRULYN",
      "/requirements": "Requirements | RECRULYN",
      "/settings": "Settings | RECRULYN",
    };

    document.title =
      titles[location.pathname] || "RECRULYN";
  }, [location.pathname]);
}