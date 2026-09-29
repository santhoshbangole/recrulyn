import { recrulynUploadService } from "./recrulyn-upload.service";
import { recrulynExtractorService } from "./recrulyn-extractor.service";
import { recrulynIndexService } from "./recrulyn-index.service";

import { resumeIntelligenceService }
from "./resume-intelligence.service";
import { geminiResumeParserService }
from "./geminiResumeParser.service";
export const recrulynProcessorService = {
  async processUploads() {
    const uploads =
      await recrulynUploadService.getUploads();

    const pendingUploads =
      uploads.filter(
        (u) => !u.processed
      );

    for (const upload of pendingUploads) {
      const existing =
        await recrulynIndexService.getExistingIndex(
          upload.id
        );

      if (existing) continue;
const fileName =
  upload.file_name.toLowerCase();

if (
  fileName.includes("nda") ||
  fileName.includes("loa") ||
  fileName.includes("template")
) {
  continue;
}
      const extracted =
        await recrulynExtractorService.extractText(
          upload.file_url
        );
        
        if (!extracted) {
  continue;
}
const parsed =
  await geminiResumeParserService.parseResume(
    extracted.resumeText
  );
const intelligence =
  resumeIntelligenceService.analyzeResume(
    extracted.resumeText
  );

console.log(
  "Resume Intelligence:",
  intelligence
);

        
        console.log(
  "RESUME TEXT:",
  extracted.resumeText
);


console.log(
  "CANDIDATE:",
  parsed.candidate.candidateName
);

console.log(
  "EMAIL:",
  parsed.candidate.email
);

console.log(
  "SKILLS:",
  parsed.candidate.skills
);

await recrulynIndexService.createIndex({  upload_id:
    upload.id,

 candidate_name:
  parsed.candidate.candidateName,

 email:
  parsed.candidate.email,

phone:
  parsed.candidate.phone,

  skills:
  JSON.stringify(parsed.candidate.skills),

  education:
  JSON.stringify(parsed.candidate.education),

  experience:
  JSON.stringify(parsed.candidate.experience),

 projects:
  JSON.stringify(parsed.candidate.projects),

  college:
    parsed.candidate.college,

  cgpa:
    parsed.candidate.cgpa,

  degree:
    parsed.candidate.degree,

 location:
  parsed.candidate.location,

 linkedin:
  parsed.candidate.linkedin,
 github:
  parsed.candidate.github,

portfolio:
  parsed.candidate.portfolio,

  resume_text:
    extracted.resumeText,

ai_score: parsed.analysis.resumeScore,

recommendation: parsed.analysis.recommendedRoles,

matched_keywords: "",

missing_keywords: JSON.stringify(
  parsed.analysis.missingInformation
),

analysis_summary:
  parsed.analysis.careerSummary,

strengths: JSON.stringify(
  parsed.analysis.strengths
),

weaknesses: JSON.stringify(
  parsed.analysis.weaknesses
),

interview_questions: "",

risk_factors: "",
});
await recrulynUploadService.markProcessed(
  upload.id
);
    }
  },
};