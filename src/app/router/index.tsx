import { createBrowserRouter, Outlet } from "react-router-dom";
import RecruitmentPage from "../../public/pages/RecruitmentPage";
import EmployeesPage from "../../pages/employees/EmployeesPage";
import DashboardLayout from "../layouts/DashboardLayout";
import RoleSelectionPage from "../../pages/auth/RoleSelectionPage";
import DashboardPage from "../../pages/dashboard/DashboardPage";
import CandidatesPage from "../../pages/candidates/CandidatesPage";
import DocumentsPage from "../../pages/documents/DocumentsPage";
import DocumentAutomationPage from "../../pages/documents/DocumentAutomationPage";
import EmailTemplatesPage from "../../pages/email-templates/EmailTemplatesPage";
import RequirementsPage from "../../pages/requirements/RequirementsPage";
import CreateRequirementPage from "../../pages/requirements/CreateRequirementPage";
import LoginPage from "../../pages/auth/LoginPage";
import ProtectedRoute from "./ProtectedRoute";
import HRLeaveOverviewPage from "../../pages/leave/HRLeaveOverviewPage";
import UsersPage from "../../pages/admin/UsersPage";
import ManagementLeaveAnalyticsPage from "../../pages/leave/ManagementLeaveAnalyticsPage";
import RolesPage from "../../pages/admin/RolesPage";
import LeaveRequestsPage from "../../pages/leave/EmployeeLeavePage";
import ReportsPage from "../../pages/reports/ReportsPage";
import EmailAutomationPage from "../../pages/email-automation/EmailAutomationPage";
import CandidateReviewPage from "../../pages/ai-recruiter/CandidateReviewPage";
import ManagementApprovalsPage from "../../pages/documents/ManagementApprovalsPage";
import ApprovalReviewPage from "../../pages/documents/ApprovalReviewPage";
import SettingsPage from "../../pages/settings/SettingsPage";
import AIRecruiterPage from "../../pages/ai-recruiter/AIRecruiterPage";
import ResumeIntelligencePage from "../../pages/ResumeIntelligencePage";
import ResumeDemoPage from "../../public/pages/ResumeDemoPage";
import LandingPage from "../../public/pages/LandingPage";
import SolutionsPage from "../../public/pages/SolutionsPage";
import NotFoundPage from "../../pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Outlet />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },

      {
        path: "solutions",
        element: <SolutionsPage />,
      },

      {
        path: "solutions/recruitment",
        element: <RecruitmentPage />,
      },

      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "resume-demo",
        element: <ResumeDemoPage />,
      },

      {
        path: "app",
        element: (
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },

          {
            path: "users",
            element: (
              <ProtectedRoute roles={["ADMIN"]}>
                <UsersPage />
              </ProtectedRoute>
            ),
          },

          {
            path: "roles",
            element: (
              <ProtectedRoute roles={["ADMIN"]}>
                <RolesPage />
              </ProtectedRoute>
            ),
          },

          {
            path: "requirements",
            element: <RequirementsPage />,
          },

          {
            path: "resume-intelligence",
            element: (
              <ProtectedRoute roles={["HR", "MANAGEMENT"]}>
                <ResumeIntelligencePage />
              </ProtectedRoute>
            ),
          },

          {
            path: "requirements/create",
            element: <CreateRequirementPage />,
          },

          {
            path: "candidates",
            element: <CandidatesPage />,
          },

          {
            path: "employees",
            element: (
              <ProtectedRoute roles={["ADMIN", "HR"]}>
                <EmployeesPage />
              </ProtectedRoute>
            ),
          },

          {
            path: "leave-management",
            element: (
              <ProtectedRoute roles={["HR", "MANAGEMENT"]}>
                <HRLeaveOverviewPage />
              </ProtectedRoute>
            ),
          },

          {
            path: "employee-leave",
            element: (
              <ProtectedRoute roles={["EMPLOYEE"]}>
                <LeaveRequestsPage />
              </ProtectedRoute>
            ),
          },

          {
            path: "leave-analytics",
            element: (
              <ProtectedRoute roles={["MANAGEMENT"]}>
                <ManagementLeaveAnalyticsPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "documents",
            element: (
              <ProtectedRoute roles={["HR", "MANAGEMENT"]}>
                <DocumentsPage />
              </ProtectedRoute>
            ),
          },

          {
            path: "document-automation",
            element: (
              <ProtectedRoute roles={["HR", "MANAGEMENT"]}>
                <DocumentAutomationPage />
              </ProtectedRoute>
            ),
          },

          {
            path: "reports",
            element: (
              <ProtectedRoute roles={["HR", "MANAGEMENT"]}>
                <ReportsPage />
              </ProtectedRoute>
            ),
          },

          {
            path: "settings",
            element: <SettingsPage />,
          },

          {
            path: "approvals",
            element: (
              <ProtectedRoute roles={["HR", "MANAGEMENT"]}>
                <ManagementApprovalsPage />
              </ProtectedRoute>
            ),
          },

          {
            path: "approval-review/:id",
            element: (
              <ProtectedRoute roles={["HR", "MANAGEMENT"]}>
                <ApprovalReviewPage />
              </ProtectedRoute>
            ),
          },

          {
            path: "ai-recruiter",
            element: (
              <ProtectedRoute roles={["HR", "MANAGEMENT", "EMPLOYEE"]}>
                <AIRecruiterPage />
              </ProtectedRoute>
            ),
          },

          {
            path: "candidate-review/:id",
            element: <CandidateReviewPage />,
          },

          {
            path: "email-templates",
            element: <EmailTemplatesPage />,
          },

          {
            path: "email-automation",
            element: (
              <ProtectedRoute roles={["HR"]}>
                <EmailAutomationPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "role-selection",
            element: <RoleSelectionPage />,
          },
        ],
      },

      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
