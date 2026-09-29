import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Briefcase, Users, MapPin, XCircle, Trash2 } from "lucide-react";

import { PageHeader } from "../../components/ui/PageHeader";
import { GlassCard } from "../../components/ui/GlassCard";
import { EmptyState } from "../../components/ui/EmptyState";

import { requirementService } from "../../modules/requirements/services/requirement.service";

export default function RequirementsPage() {
  const navigate = useNavigate();

  const [requirements, setRequirements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRequirements() {
      try {
        const data = await requirementService.getRequirements();

        setRequirements(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadRequirements();
  }, []);

  async function handleAssign(requirement: any) {
    navigate(`/resume-intelligence?requirementId=${requirement.id}`);
  }

  async function handleClose(requirement: any) {
    try {
      await requirementService.closeRequirement(requirement.id);

      setRequirements((prev) => prev.filter((r) => r.id !== requirement.id));
    } catch (error) {
      console.error("Failed to close requirement:", error);
      alert("Failed to close requirement.");
    }
  }

  async function handleDelete(requirement: any) {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${requirement.title}"?`,
    );

    if (!confirmed) return;

    try {
      await requirementService.deleteRequirement(requirement.id);

      setRequirements((prev) => prev.filter((r) => r.id !== requirement.id));
    } catch (error) {
      console.error("Failed to delete requirement:", error);
      alert("Failed to delete requirement.");
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Hiring Requirements"
        title="Requirements"
        description="Manage internship and hiring requirements across departments."
        actions={
          <button
            onClick={() => navigate("/app/requirements/create")}
            className="
              flex
              items-center
              gap-2
              rounded-xl
              bg-signal-violet
              px-5
              py-3
              font-medium
              text-white
            "
          >
            <Plus size={16} />
            Create Requirement
          </button>
        }
      />

      {loading ? (
        <GlassCard className="p-8">
          <p>Loading requirements...</p>
        </GlassCard>
      ) : requirements.length === 0 ? (
        <EmptyState
          title="No Requirements"
          description="Create your first hiring requirement."
        />
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-4">
            <GlassCard className="p-6 text-center">
              <h3 className="text-4xl font-bold">{requirements.length}</h3>

              <p className="mt-2 text-text-secondary">Total Requirements</p>
            </GlassCard>

            <GlassCard className="p-6 text-center">
              <h3 className="text-4xl font-bold text-emerald-500">
                {requirements.filter((r) => r.status === "OPEN").length}
              </h3>

              <p className="mt-2 text-text-secondary">Open</p>
            </GlassCard>

            <GlassCard className="p-6 text-center">
              <h3 className="text-4xl font-bold text-indigo-500">
                {requirements.reduce(
                  (sum, r) => sum + Number(r.vacancies || 0),
                  0,
                )}
              </h3>

              <p className="mt-2 text-text-secondary">Vacancies</p>
            </GlassCard>

            <GlassCard className="p-6 text-center">
              <h3 className="text-4xl font-bold text-amber-500">
                {new Set(requirements.map((r) => r.department)).size}
              </h3>

              <p className="mt-2 text-text-secondary">Departments</p>
            </GlassCard>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {requirements.map((requirement) => (
              <GlassCard key={requirement.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-text-primary">
                      {requirement.title}
                    </h2>

                    <p className="mt-1 text-text-secondary">
                      {requirement.department}
                    </p>

                    <p className="mt-2 text-sm text-text-secondary">
                      Created By:
                      {requirement.created_by_name}
                    </p>

                    <p className="text-xs text-text-secondary">
                      {requirement.created_by_role}
                    </p>
                  </div>

                  <div className="rounded-lg bg-signal-violet/10 px-3 py-1 text-sm font-medium text-signal-violet">
                    {requirement.status}
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <Briefcase size={16} />
                    <span>{requirement.duration}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin size={16} />
                    <span>{requirement.work_mode}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Users size={16} />
                    <span>{requirement.vacancies} Positions</span>
                  </div>
                </div>

                <p className="mt-6 text-sm text-text-secondary">
                  {requirement.description}
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  {/* VIEW */}
                  <button
                    onClick={() => {
                      alert(
                        "Requirement: " +
                          requirement.title +
                          "\n\n" +
                          "Department: " +
                          (requirement.department || "N/A") +
                          "\n" +
                          "Location: " +
                          (requirement.location || "N/A") +
                          "\n" +
                          "Work Mode: " +
                          (requirement.work_mode || "N/A") +
                          "\n" +
                          "Vacancies: " +
                          (requirement.vacancies || "N/A") +
                          "\n\n" +
                          "Description:\n" +
                          (requirement.description ||
                            "No description available."),
                      );
                    }}
                    className="rounded-lg bg-base-200 px-4 py-2"
                  >
                    View
                  </button>

                  {/* ASSIGN CANDIDATES */}
                  <button
                    onClick={() => handleAssign(requirement)}
                    className="rounded-lg bg-signal-violet px-4 py-2 text-white"
                  >
                    Assign Candidates
                  </button>

                  {/* CLOSE */}
                  <button
                    onClick={() => handleClose(requirement)}
                    className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-white"
                  >
                    <XCircle size={16} />
                    Close
                  </button>

                  {/* DELETE PERMANENTLY */}
                  <button
                    onClick={() => handleDelete(requirement)}
                    className="flex items-center gap-2 rounded-lg bg-gray-700 px-4 py-2 text-white"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
