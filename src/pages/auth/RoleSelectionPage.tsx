import { useNavigate } from "react-router-dom";
import {
  Users,
  UserCheck,
  Shield,
  Settings,
} from "lucide-react";

export default function RoleSelectionPage() {
  const navigate = useNavigate();

  function chooseRole(role: string) {
    localStorage.setItem(
      "selected_role",
      role
    );

    navigate("/login");
  }

  const roles = [
    {
      name: "HR",
      icon: UserCheck,
      description:
        "Recruitment, onboarding and workforce operations",
    },
    {
      name: "EMPLOYEE",
      icon: Users,
      description:
        "Interview candidates and manage assigned activities",
    },
    {
      name: "OFFICIAL",
      icon: Shield,
      description:
        "Approvals, reports and executive operations",
    },
    {
      name: "ADMIN",
      icon: Settings,
      description:
        "Manage users, permissions and platform settings",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-8">
      <div className="w-full max-w-6xl">

        <div className="text-center mb-12">
          <img
            src="/Logo-Monogram.png"
            alt="RECRULYN"
            className="mx-auto mb-5 h-16 w-16 rounded-2xl object-cover shadow-sm"
          />
          <h1 className="text-5xl font-bold">
            Recrulyn
          </h1>

          <p className="text-slate-500 mt-3">
            Choose your workspace
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {roles.map((role) => {
            const Icon = role.icon;

            return (
              <button
                key={role.name}
                onClick={() =>
                  chooseRole(role.name)
                }
                className="bg-white border rounded-2xl p-8 text-left hover:shadow-xl transition-all"
              >
                <Icon
                  size={40}
                  className="mb-5 text-violet-600"
                />

                <h3 className="text-xl font-semibold">
                  {role.name}
                </h3>

                <p className="text-sm text-slate-500 mt-3">
                  {role.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}