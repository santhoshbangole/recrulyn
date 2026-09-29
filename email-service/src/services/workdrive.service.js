const CATEGORY_PATHS = {
  resume: ["RECRULYN Vault", "Resumes"],
  loa: ["RECRULYN Vault", "Generated", "LOA"],
  certificate: ["RECRULYN Vault", "Generated", "Certificates"],
  lor: ["RECRULYN Vault", "Generated", "LOR"],
  loc: ["RECRULYN Vault", "Generated", "LOC"],
  nda: ["RECRULYN Vault", "Generated", "NDA"],
  attachment: ["RECRULYN Vault", "Email Attachments"],
  signature: ["RECRULYN Vault", "Signatures"],
  recrulyn: ["RECRULYN Vault", "Resume Intelligence"],
  jd: ["RECRULYN Vault", "Job Descriptions"],
  other: ["RECRULYN Vault", "Other"],
};

const REQUEST_TIMEOUT_MS = Number(process.env.WORKDRIVE_TIMEOUT_MS || 15000);
const FAILURE_COOLDOWN_MS = 5 * 60 * 1000;

const folderCache = new Map();
let tokenCache = { token: null, expiresAt: 0 };
let rootFolderPromise = null;
let disabledUntil = 0;

function accountsUrl() {
  return process.env.ZOHO_ACCOUNTS_URL || "https://accounts.zoho.in";
}

function apiUrl() {
  return (
    process.env.ZOHO_WORKDRIVE_API_URL ||
    "https://www.zohoapis.in/workdrive/api/v1"
  );
}

function uploadUrl() {
  return (
    process.env.ZOHO_WORKDRIVE_UPLOAD_URL ||
    "https://workdrive.zoho.in/api/v1/upload"
  );
}

function publicBase() {
  return (
    process.env.EMAIL_PUBLIC_URL ||
    `http://localhost:${process.env.PORT || 4000}`
  ).replace(/\/$/, "");
}

export function isWorkDriveConfigured() {
  return Boolean(
    process.env.ZOHO_CLIENT_ID &&
      process.env.ZOHO_CLIENT_SECRET &&
      process.env.ZOHO_REFRESH_TOKEN
  );
}

export function isWorkDriveAvailable() {
  return isWorkDriveConfigured() && Date.now() >= disabledUntil;
}

export function markWorkDriveFailure(error) {
  disabledUntil = Date.now() + FAILURE_COOLDOWN_MS;
  folderCache.clear();
  rootFolderPromise = null;
  console.warn(
    "WorkDrive disabled for 5 minutes:",
    error?.message || error
  );
}

async function fetchJson(url, options = {}, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => ({}));
    return { response, payload };
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(`WorkDrive request timed out after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

async function getAccessToken() {
  if (tokenCache.token && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }

  if (!isWorkDriveConfigured()) {
    throw new Error(
      "WorkDrive is not configured. Set ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, and ZOHO_REFRESH_TOKEN."
    );
  }

  const body = new URLSearchParams({
    refresh_token: process.env.ZOHO_REFRESH_TOKEN,
    client_id: process.env.ZOHO_CLIENT_ID,
    client_secret: process.env.ZOHO_CLIENT_SECRET,
    grant_type: "refresh_token",
  });

  const { response, payload } = await fetchJson(
    `${accountsUrl()}/oauth/v2/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    }
  );

  if (!payload.access_token) {
    throw new Error(
      payload.error_description ||
        payload.error ||
        `Failed to refresh Zoho WorkDrive token (${response.status})`
    );
  }

  tokenCache = {
    token: payload.access_token,
    expiresAt: Date.now() + Math.max((payload.expires_in || 3600) - 60, 60) * 1000,
  };

  return tokenCache.token;
}

function errorMessage(payload, status, fallback) {
  return (
    payload?.errors?.[0]?.title ||
    payload?.errors?.[0]?.detail ||
    payload?.message ||
    payload?.error_description ||
    payload?.error ||
    `${fallback} (${status})`
  );
}

async function workdriveFetch(path, options = {}) {
  const token = await getAccessToken();
  const { response, payload } = await fetchJson(`${apiUrl()}${path}`, {
    ...options,
    headers: {
      Authorization: `Zoho-oauthtoken ${token}`,
      Accept: "application/vnd.api+json",
      ...(options.body && !(options.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(errorMessage(payload, response.status, "WorkDrive request failed"));
  }

  return payload;
}

function recordsOf(payload) {
  if (Array.isArray(payload?.data)) return payload.data;
  if (payload?.data) return [payload.data];
  return [];
}

function firstId(payload) {
  const record = recordsOf(payload)[0];
  return (
    record?.id ||
    record?.attributes?.resource_id ||
    record?.attributes?.id ||
    null
  );
}

function parentIdOf(record) {
  return record?.attributes?.parent_id || record?.attributes?.PARENT_ID || null;
}

async function firstExisting(paths) {
  let lastError = null;
  for (const path of paths) {
    try {
      return await workdriveFetch(path);
    } catch (error) {
      lastError = error;
    }
  }
  if (lastError) throw lastError;
  return null;
}

async function resolvePrivateSpaceId() {
  const me = await workdriveFetch("/users/me");
  const user = recordsOf(me)[0] || {};
  const attrs = user.attributes || {};
  const userId = user.id || attrs.zuid;

  const fromUser = [
    attrs.private_space_id,
    attrs.privatespace_id,
    attrs.private_space,
  ].find(Boolean);

  if (userId) {
    try {
      const spaces = await workdriveFetch(`/users/${userId}/privatespace`);
      const spaceId = firstId(spaces);
      if (spaceId) return spaceId;
    } catch (error) {
      console.warn("WorkDrive privatespace lookup skipped:", error.message);
    }
  }

  return fromUser || null;
}

async function resolveMyFoldersId(spaceId) {
  if (!spaceId) return null;

  const listings = [
    `/privatespace/${spaceId}/folders?page[limit]=50`,
    `/privatespace/${spaceId}/files?page[limit]=50`,
  ];

  for (const path of listings) {
    try {
      const payload = await workdriveFetch(path);
      const items = recordsOf(payload);
      if (!items.length) continue;

      const parentId = items.map(parentIdOf).find(Boolean);
      if (parentId) return parentId;
    } catch (error) {
      console.warn("WorkDrive My Folders lookup skipped:", error.message);
    }
  }

  return null;
}

async function resolveRootFolderId() {
  if (process.env.WORKDRIVE_FOLDER_ID) {
    return process.env.WORKDRIVE_FOLDER_ID;
  }

  const spaceId = await resolvePrivateSpaceId();
  const myFoldersId = await resolveMyFoldersId(spaceId);
  if (myFoldersId) return myFoldersId;

  throw new Error(
    "Could not resolve WorkDrive My Folders ID. Open WorkDrive > My Folders and set WORKDRIVE_FOLDER_ID to the id after /folders/ in the URL."
  );
}

async function getRootFolderId() {
  if (!rootFolderPromise) {
    rootFolderPromise = resolveRootFolderId().catch((error) => {
      rootFolderPromise = null;
      throw error;
    });
  }
  return rootFolderPromise;
}

async function listChildren(folderId) {
  const payload = await firstExisting([
    `/files/${folderId}/files?page[limit]=200`,
    `/files/${folderId}/folders?page[limit]=200`,
  ]);
  return recordsOf(payload);
}

async function findChildFolder(parentId, name) {
  const children = await listChildren(parentId);
  const match = children.find((item) => {
    const attrs = item.attributes || {};
    const isFolder =
      attrs.type === "folder" ||
      attrs.resource_type === "folder" ||
      attrs.is_folder === true ||
      item.type === "folder";
    return isFolder && String(attrs.name || "").toLowerCase() === name.toLowerCase();
  });

  return match?.id || match?.attributes?.resource_id || null;
}

async function createFolder(parentId, name) {
  const payload = await workdriveFetch("/files", {
    method: "POST",
    body: JSON.stringify({
      data: {
        attributes: {
          name,
          parent_id: parentId,
        },
        type: "files",
      },
    }),
  });

  const id = firstId(payload);
  if (!id) {
    throw new Error(`Could not create WorkDrive folder "${name}"`);
  }
  return id;
}

async function ensureFolder(parentId, name) {
  const cacheKey = `${parentId}:${name}`;
  if (folderCache.has(cacheKey)) {
    return folderCache.get(cacheKey);
  }

  const existing = await findChildFolder(parentId, name);
  const id = existing || (await createFolder(parentId, name));
  folderCache.set(cacheKey, id);
  return id;
}

async function ensureCategoryFolder(category) {
  let parentId = await getRootFolderId();
  if (!parentId) {
    throw new Error("Could not resolve WorkDrive root folder");
  }

  const path = CATEGORY_PATHS[category] || CATEGORY_PATHS.other;
  for (const name of path) {
    parentId = await ensureFolder(parentId, name);
  }

  return parentId;
}

function permalinkFrom(payload, fileId) {
  const record = recordsOf(payload)[0];
  const attrs = record?.attributes || {};
  return (
    attrs.Permalink ||
    attrs.permalink ||
    attrs.web_url ||
    attrs.link ||
    (fileId ? `https://workdrive.zoho.in/file/${fileId}` : null)
  );
}

function appFileUrl(fileId, filename) {
  return `${publicBase()}/vault/files/${fileId}/${encodeURIComponent(filename)}`;
}

async function createDownloadableLink(fileId, filename) {
  try {
    const payload = await workdriveFetch("/links", {
      method: "POST",
      body: JSON.stringify({
        data: {
          attributes: {
            resource_id: fileId,
            link_name: String(filename || "RECRULYN file").slice(0, 80),
            request_user_data: false,
            allow_download: true,
            role_id: "6",
          },
          type: "links",
        },
      }),
    });
    const attrs = recordsOf(payload)[0]?.attributes || {};
    return attrs.link || attrs.download_url || attrs.permalink || null;
  } catch (error) {
    console.warn("WorkDrive share link skipped:", error.message);
    return null;
  }
}

export async function uploadToVault({
  filename,
  category = "other",
  contentType = "application/octet-stream",
  buffer,
}) {
  const folderId = await ensureCategoryFolder(category);
  const token = await getAccessToken();
  const safeName = encodeURIComponent(filename);
  const form = new FormData();
  form.append(
    "content",
    new Blob([buffer], { type: contentType || "application/octet-stream" }),
    filename
  );

  const { response, payload } = await fetchJson(
    `${uploadUrl()}?filename=${safeName}&override-name-exist=true&parent_id=${folderId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
      },
      body: form,
    },
    REQUEST_TIMEOUT_MS
  );

  if (!response.ok) {
    throw new Error(errorMessage(payload, response.status, "WorkDrive upload failed"));
  }

  const fileId = firstId(payload) || recordsOf(payload)[0]?.attributes?.resource_id;
  if (!fileId) {
    throw new Error("WorkDrive upload succeeded but returned no file id");
  }

  const shareUrl = await createDownloadableLink(fileId, filename);
  const url = appFileUrl(fileId, filename);

  return {
    fileId,
    url,
    permalink: shareUrl || permalinkFrom(payload, fileId),
    folderId,
  };
}

export async function downloadFromVault(fileId) {
  const info = await workdriveFetch(`/files/${fileId}`);
  const record = recordsOf(info)[0] || {};
  const attrs = record.attributes || {};
  const token = await getAccessToken();
  const downloadUrl =
    attrs.download_url ||
    `${apiUrl()}/download/${fileId}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(downloadUrl, {
      headers: { Authorization: `Zoho-oauthtoken ${token}` },
      signal: controller.signal,
      redirect: "follow",
    });
    if (!response.ok) {
      throw new Error(`WorkDrive download failed (${response.status})`);
    }
    return {
      buffer: Buffer.from(await response.arrayBuffer()),
      contentType:
        response.headers.get("content-type") ||
        attrs.extn ||
        "application/octet-stream",
      filename: attrs.name || attrs.FileName || fileId,
    };
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("WorkDrive download timed out");
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export async function getWorkDriveStatus() {
  if (!isWorkDriveConfigured()) {
    return {
      configured: false,
      connected: false,
      message:
        "Add ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, and ZOHO_REFRESH_TOKEN with WorkDrive.files.CREATE, WorkDrive.files.READ, and WorkDrive.links.CREATE scopes.",
    };
  }

  if (!isWorkDriveAvailable()) {
    return {
      configured: true,
      connected: false,
      message:
        "WorkDrive was temporarily disabled after a failed request. Inbox sync is using local/cloud fallback until the cooldown ends.",
    };
  }

  try {
    const folderId = await ensureCategoryFolder("resume");
    return {
      configured: true,
      connected: true,
      folderId,
    };
  } catch (error) {
    markWorkDriveFailure(error);
    return {
      configured: true,
      connected: false,
      message: error.message,
    };
  }
}
