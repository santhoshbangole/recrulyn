import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { requirementService } from "../../requirements/services/requirement.service";

export interface RecruiterSearchInput {
  requirementId?: string;
  role?: string;
  skills: string[];
}

interface RecruiterPromptProps {
  onAnalyze: (input: RecruiterSearchInput) => void;
}

export default function RecruiterPrompt({
  onAnalyze,
}: RecruiterPromptProps) {

  const [mode, setMode] =
    useState<"existing" | "custom">("existing");

  const [requirements, setRequirements] =
    useState<any[]>([]);

  const [requirementId, setRequirementId] =
    useState("");

  const [loadingRequirements, setLoadingRequirements] =
    useState(true);

  const [customRole, setCustomRole] =
    useState("");

    const [skillInput, setSkillInput] =
  useState("");
  const [skillTags, setSkillTags] =
  useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadRequirements() {
      try {
        const all = await requirementService.getRequirements();
        // Only roles actually open for hiring make sense to match
        // candidates against here.
        const open = (all || []).filter(
          (r: any) => (r.status || "OPEN") === "OPEN"
        );
        if (!cancelled) setRequirements(open);
      } catch (err) {
        console.error("Failed to load requirements", err);
      } finally {
        if (!cancelled) setLoadingRequirements(false);
      }
    }

    loadRequirements();
    return () => {
      cancelled = true;
    };
  }, []);

  const canAnalyze =
  mode === "existing"
    ? Boolean(requirementId)
    : Boolean(customRole.trim());

  function handleSubmit() {
    if (mode === "existing") {
      onAnalyze({ requirementId, skills: skillTags });
    } else {
      onAnalyze({ role: customRole.trim(), skills: skillTags });
    }
  }

  return (
    <div className="mx-auto mt-10 w-full max-w-3xl">

      {/* Mode toggle */}

      <div className="mb-8 flex justify-center gap-3">
        <button
          type="button"
          onClick={() => setMode("existing")}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
            mode === "existing"
              ? "bg-signal-violet text-white"
              : "border border-border-default text-muted-foreground hover:border-signal-violet"
          }`}
        >
          Select an open role
        </button>
        <button
          type="button"
          onClick={() => setMode("custom")}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
            mode === "custom"
              ? "bg-signal-violet text-white"
              : "border border-border-default text-muted-foreground hover:border-signal-violet"
          }`}
        >
          Type a custom role
        </button>
      </div>

      {/* Role */}

      <div className="mb-8">
        <label className="mb-3 block text-lg font-semibold">
          Who are you looking for?
        </label>

        {mode === "existing" ? (
          <select
            value={requirementId}
            onChange={(e) => setRequirementId(e.target.value)}
            className="w-full rounded-2xl border border-border-default bg-base-150 p-5 text-lg"
          >
            <option value="">
              {loadingRequirements
                ? "Loading open roles…"
                : requirements.length
                  ? "Select an open role…"
                  : "No open roles found — create one first"}
            </option>
            {requirements.map((r: any) => (
              <option key={r.id} value={r.id}>
                {r.title || r.job_title || "Untitled role"}
              </option>
            ))}
          </select>
        ) : (
          <input
            value={customRole}
            onChange={(e) => setCustomRole(e.target.value)}
            placeholder="Example: Backend Developer"
            className="w-full rounded-2xl border border-border-default bg-base-150 p-5 text-lg"
          />
        )}
      </div>

      {/* Skills */}

      <div className="mb-8">

        <label className="mb-3 block text-lg font-semibold">
          {mode === "existing" ? "Additional Skills" : "Required Skills"}
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            {mode === "existing"
              ? "(Optional — narrows the match further)"
              : "(Required — add at least one skill to get a meaningful match)"}
          </span>
        </label>
<input
  value={skillInput}
  onChange={(e) =>
    setSkillInput(e.target.value)
  }
  onKeyDown={(e) => {
    if (
      e.key === "Enter" &&
      skillInput.trim() !== ""
    ) {
      e.preventDefault();

      if (
        !skillTags.includes(
          skillInput.trim()
        )
      ) {
        setSkillTags([
          ...skillTags,
          skillInput.trim(),
        ]);
      }

      setSkillInput("");
    }
  }}
  placeholder="Type a skill and press Enter"
  className="w-full rounded-2xl border border-border-default bg-base-150 p-5"
/>
    <div className="mt-4 flex flex-wrap gap-2">

  {skillTags.map((skill) => (

    <button
      key={skill}
      type="button"
      onClick={() =>
        setSkillTags(
          skillTags.filter(
            (s) => s !== skill
          )
        )
      }
      className="rounded-full bg-signal-violet/10 px-4 py-2 text-sm text-signal-violet transition hover:bg-red-100 hover:text-red-600"
    >
      + {skill} ✕
    </button>

  ))}

</div>

      </div>

      {/* Analyze */}

      <button
  type="button"
  disabled={!canAnalyze}
  onClick={handleSubmit}
  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-signal-violet py-5 text-lg font-semibold text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
>
  <Search size={22} />

  Analyze Candidates
</button>

    </div>
  );
}