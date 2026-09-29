const CANDIDATES_KEY = "recrulyn_local_candidates";
const PROFILES_KEY = "recrulyn_local_profiles";
const UPLOADS_KEY = "recrulyn_local_uploads";
const REQUIREMENTS_KEY = "recrulyn_local_requirements";
const ASSIGNMENTS_KEY = "recrulyn_local_intern_assignments";
const GENERATED_DOCS_KEY = "recrulyn_local_generated_documents";
const MATCH_HISTORY_KEY = "recrulyn_local_match_history";

export const CANDIDATE_ASSIGNMENT_KEYS = [
  "project_title",
  "job_title",
  "department",
  "supervisor",
  "manager",
  "joining_date",
] as const;

export function pickAssignmentFields(source: any) {
  const out: Record<string, string> = {};
  for (const key of CANDIDATE_ASSIGNMENT_KEYS) {
    const value = source?.[key];
    if (value != null && String(value).trim()) out[key] = String(value).trim();
  }
  return out;
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function isUuid(id: unknown) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(id || "")
  );
}

export function isInvalidUuidError(error: unknown) {
  const anyErr = error as any;
  const message = String(
    anyErr?.message || anyErr?.error_description || anyErr || ""
  ).toLowerCase();
  const code = String(anyErr?.code || anyErr?.details || "");
  return (
    code === "22P02" ||
    message.includes("invalid input syntax for type uuid") ||
    message.includes("22p02")
  );
}

export function isIgnorableDbError(error: unknown) {
  return (
    isOfflineFetchError(error) ||
    isMissingColumnError(error) ||
    isInvalidUuidError(error)
  );
}

export function isMissingColumnError(error: unknown) {
  const anyErr = error as any;
  const message = String(
    anyErr?.message || anyErr?.error_description || anyErr || ""
  ).toLowerCase();
  return (
    message.includes("schema cache") ||
    message.includes("could not find the") ||
    anyErr?.code === "PGRST204"
  );
}

export function isOfflineFetchError(error: unknown) {
  const anyErr = error as any;
  const message = String(
    anyErr?.message || anyErr?.error_description || anyErr || ""
  ).toLowerCase();
  const name = String(anyErr?.name || "").toLowerCase();

  return (
    message.includes("failed to fetch") ||
    message.includes("network") ||
    message.includes("fetch failed") ||
    message.includes("enotfound") ||
    message.includes("err_name_not_resolved") ||
    message.includes("load failed") ||
    message.includes("networkerror") ||
    message.includes("authretryablefetcherror") ||
    name.includes("authretryablefetcherror") ||
    name === "typeerror" ||
    anyErr?.status === 0
  );
}

export function toLocalFileUrl(file: File) {
  return URL.createObjectURL(file);
}

export const localCandidateStore = {
  list() {
    return read<any[]>(CANDIDATES_KEY, []);
  },

  save(list: any[]) {
    write(CANDIDATES_KEY, list);
  },

  create(payload: any) {
    const list = this.list();
    const email = String(payload.email || "").toLowerCase();
    if (email && list.some((c) => String(c.email || "").toLowerCase() === email)) {
      throw new Error("Candidate already exists");
    }

    const row = {
      id: `local-cand-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      full_name: payload.full_name,
      email: payload.email,
      phone: payload.phone || null,
      job_id: payload.job_id || null,
      source: payload.source || "Manual",
      linkedin: payload.linkedin || null,
      github: payload.github || null,
      portfolio: payload.portfolio || null,
      status: payload.status || "NEW",
      ai_score: payload.ai_score ?? 0,
      resume_url: payload.resume_url || null,
      ...pickAssignmentFields(payload),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      _local: true,
    };

    list.unshift(row);
    this.save(list);
    return row;
  },

  update(id: string, patch: Record<string, unknown>) {
    const list = this.list();
    const idx = list.findIndex((c) => c.id === id);
    if (idx < 0) {
      const row = {
        id,
        ...patch,
        updated_at: new Date().toISOString(),
        _overlay: true,
      };
      list.unshift(row);
      this.save(list);
      return row;
    }
    list[idx] = {
      ...list[idx],
      ...patch,
      updated_at: new Date().toISOString(),
    };
    this.save(list);
    return list[idx];
  },

  getById(id: string) {
    return this.list().find((c) => c.id === id) || null;
  },

  removeMany(ids: string[]) {
    const drop = new Set(ids);
    this.save(this.list().filter((c) => !drop.has(c.id)));
  },
};

export const localRequirementStore = {
  list() {
    return read<any[]>(REQUIREMENTS_KEY, []);
  },

  save(list: any[]) {
    write(REQUIREMENTS_KEY, list);
  },

  create(payload: any) {
    const row = {
      id: `local-req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      status: "OPEN",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      _local: true,
      ...payload,
    };
    const list = this.list();
    list.unshift(row);
    this.save(list);
    return row;
  },
};

export const localInternAssignmentStore = {
  list() {
    return read<any[]>(ASSIGNMENTS_KEY, []);
  },

  save(list: any[]) {
    write(ASSIGNMENTS_KEY, list);
  },

  getByCandidate(candidateId: string) {
    return this.list().find((a) => a.candidate_id === candidateId) || null;
  },

  upsert(payload: any) {
    const list = this.list();
    const idx = list.findIndex((a) => a.candidate_id === payload.candidate_id);
    const row = {
      id: payload.id || `local-assign-${Date.now()}`,
      ...payload,
      updated_at: new Date().toISOString(),
      _local: true,
    };
    if (idx >= 0) list[idx] = { ...list[idx], ...row };
    else list.unshift(row);
    this.save(list);
    return row;
  },
};

export const localProfileStore = {
  list() {
    return read<any[]>(PROFILES_KEY, []);
  },

  save(list: any[]) {
    write(PROFILES_KEY, list);
  },

  upsert(payload: any) {
    const list = this.list();
    const idx = list.findIndex(
      (p) => p.candidate_id === payload.candidate_id
    );
    const row = {
      id: payload.id || `local-profile-${Date.now()}`,
      ...payload,
      updated_at: new Date().toISOString(),
      _local: true,
    };
    if (idx >= 0) list[idx] = { ...list[idx], ...row };
    else list.unshift(row);
    this.save(list);
    return row;
  },
};

export const localUploadStore = {
  list() {
    return read<any[]>(UPLOADS_KEY, []);
  },

  save(list: any[]) {
    write(UPLOADS_KEY, list);
  },

  add(file: File, fileUrl: string) {
    const list = this.list();
    const row = {
      id: `local-upload-${Date.now()}`,
      file_name: file.name,
      file_url: fileUrl,
      file_type: file.type,
      status: "UPLOADED",
      uploaded_at: new Date().toISOString(),
      processed: false,
      _local: true,
    };
    list.unshift(row);
    this.save(list);
    return row;
  },
};

export const localGeneratedDocumentStore = {
  list() {
    return read<any[]>(GENERATED_DOCS_KEY, []);
  },

  save(list: any[]) {
    write(GENERATED_DOCS_KEY, list);
  },

  upsert(doc: Record<string, unknown>) {
    const list = this.list();
    const id = String(
      doc.id ||
        `local-doc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    );
    const row = {
      status: "GENERATED",
      approval_status: "PENDING_APPROVAL",
      created_at: new Date().toISOString(),
      ...doc,
      id,
      _local: true,
    };
    const idx = list.findIndex((item) => item.id === id);
    if (idx >= 0) list[idx] = { ...list[idx], ...row };
    else list.unshift(row);
    this.save(list);
    return row;
  },

  listForCandidate(candidateId: string) {
    return this.list().filter((doc) => doc.candidate_id === candidateId);
  },

  remove(id: string) {
    const list = this.list().filter((doc) => doc.id !== id);
    this.save(list);
  },
};

export const localMatchHistoryStore = {
  list() {
    return read<any[]>(MATCH_HISTORY_KEY, []);
  },

  save(list: any[]) {
    write(MATCH_HISTORY_KEY, list);
  },

  add(payload: Record<string, unknown>) {
    const row = {
      id: `local-match-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      created_at: new Date().toISOString(),
      ...payload,
      _local: true,
    };
    const list = this.list();
    list.unshift(row);
    this.save(list);
    return row;
  },

  delete(id: string) {
    this.save(this.list().filter((item) => item.id !== id));
  },
};