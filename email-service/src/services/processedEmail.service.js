import "../loadEnv.js";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function asUid(value) {
  return Number(value);
}

// IMAP UIDs are only guaranteed unique within a folder for as long as its
// UIDVALIDITY value stays the same. If a folder is recreated or certain
// server-side operations happen, UIDVALIDITY changes and old UID numbers
// can get reassigned to different messages — or the same message can
// reappear under what looks like a "new" UID. Scoping every lookup by
// (mailbox, uidvalidity, uid) instead of just (mailbox, uid) avoids
// silently re-importing old mail as if it were new.
export async function filterUnprocessed(mailbox, uids, uidValidity) {
  if (!uids.length) return [];

  const processed = new Set();
  for (let i = 0; i < uids.length; i += 200) {
    const chunk = uids.slice(i, i + 200).map(asUid);
    let query = supabase
      .from("processed_emails")
      .select("uid")
      .eq("mailbox", mailbox)
      .in("uid", chunk);

    if (uidValidity != null) {
      query = query.eq("uidvalidity", String(uidValidity));
    }

    const { data, error } = await query;

    if (error) {
      console.error("LOOKUP PROCESSED ERROR");
      console.dir(error, { depth: null });
      throw error;
    }

    for (const row of data || []) {
      processed.add(asUid(row.uid));
    }
  }

  return uids.filter((uid) => !processed.has(asUid(uid)));
}

export async function markProcessed({
  mailbox,
  uid,
  messageId,
  subject,
  senderEmail,
  uidValidity,
}) {
  const { error } = await supabase.from("processed_emails").insert({
    mailbox: mailbox || "INBOX",
    uid: asUid(uid),
    uidvalidity: uidValidity != null ? String(uidValidity) : null,
    message_id: messageId,
    subject,
    sender_email: senderEmail,
  });

  if (error && error.code !== "23505") {
    console.error("MARK PROCESSED ERROR");
    console.dir(error, { depth: null });
    throw error;
  }
}