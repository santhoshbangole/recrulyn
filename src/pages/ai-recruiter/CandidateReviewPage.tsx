import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { recrulynUploadService } from "../../modules/recrulyn/services/recrulyn-upload.service";
import { recrulynCandidateService } from "../../modules/recrulyn/services/recrulyn-candidate.service";
export default function CandidateReviewPage() {
  const { id } = useParams();
const [candidate, setCandidate] =
  useState<any>(null);
  const [resumeUrl, setResumeUrl] =
  useState("");
  const [
  
] = useState<string[]>([]);
  useEffect(() => {
  if (!id) return;

  async function loadCandidate() {
    try {
      const data = await recrulynCandidateService.getCandidateById(id || "");
      setCandidate(data);

      let url = data?.resume_url || "";
      if (data?.upload_id) {
        try {
          const upload = await recrulynUploadService.getUploadById(data.upload_id);
          url = upload?.file_url || url;
        } catch {
          // demo / missing upload
        }
      }
      setResumeUrl(url);
    } catch (error) {
      console.error(error);
    }
  }

  loadCandidate();
}, [id]);
  return (
    <div className="p-8">

      <h1 className="text-3xl font-bold">
        Candidate Review
      </h1>

      <p className="mt-2 text-muted-foreground">
        Candidate ID:
      </p>

      <div className="mt-4 rounded-xl bg-base-200 p-4 font-mono">
       {candidate && (

<div className="mt-8 rounded-3xl border border-border-default bg-base-100 p-8">

  <h2 className="text-3xl font-bold">
    {candidate.candidate_name}
  </h2>

  <p className="mt-2 text-muted-foreground">
    {candidate.email}
  </p>
  
<div className="col-span-7">
<div className="mt-6 h-[700px] overflow-hidden rounded-2xl border border-border-default">

  {resumeUrl ? (
  <iframe
    src={resumeUrl}
    title="Resume Preview"
    className="h-full w-full"
  />
) : (
  <div className="flex h-full items-center justify-center">
    Loading Resume...
  </div>
)}
</div>
</div>




  <div className="mt-8 grid grid-cols-12 gap-8">
<div className="col-span-5">
    <div>

      <div className="text-sm text-muted-foreground">
        AI Score
      </div>

      <div className="text-3xl font-bold text-signal-violet">
        {candidate.ai_score}%
      </div>

    </div>

    <div>

      <div className="text-sm text-muted-foreground">
        Recommendation
      </div>

      <div className="text-xl font-semibold">
        {candidate.recommendation}
      </div>

    </div>
    <div className="mt-8 flex gap-4">

  <button
    className="rounded-xl bg-signal-violet px-6 py-3 text-white"
  >
    ⭐ Shortlist
  </button>

  <button
    className="rounded-xl border border-border-default px-6 py-3"
  >
    📅 Schedule Interview
  </button>

  <button
    className="rounded-xl border border-red-300 px-6 py-3 text-red-500"
  >
    ❌ Reject
  </button>

</div>
<div className="mt-8">

  <h3 className="mb-4 text-xl font-semibold">
    Skills
  </h3>

  <div className="flex flex-wrap gap-2">

    {(candidate.skills || "")
      .split(",")
      .filter(Boolean)
      .map((skill: string) => (

        <span
          key={skill}
          className="rounded-full bg-signal-violet/10 px-4 py-2 text-sm text-signal-violet"
        >
          {skill.trim()}
        </span>

      ))}

  </div>
  <div className="mt-8 grid gap-6 lg:grid-cols-2">

  {/* Strengths */}

  <div className="rounded-2xl border border-green-200 bg-green-50 p-6">

    <h3 className="mb-4 text-lg font-semibold text-green-700">
      💪 Strengths
    </h3>

    <p className="whitespace-pre-line text-sm">
      {candidate.strengths || "No strengths available."}
    </p>

  </div>

  {/* Weaknesses */}

  <div className="rounded-2xl border border-red-200 bg-red-50 p-6">

    <h3 className="mb-4 text-lg font-semibold text-red-700">
      ⚠ Weaknesses
    </h3>

    <p className="whitespace-pre-line text-sm">
      {candidate.weaknesses || "No weaknesses available."}
    </p>

  </div>
</div>
</div>

</div>
  </div>

</div>

)}
      </div>

    </div>
  );
}