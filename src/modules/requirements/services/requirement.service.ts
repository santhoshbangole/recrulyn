// import { supabase } from "../../../services/supabase/client";
// import {
//   isOfflineFetchError,
//   localRequirementStore,
// } from "../../../lib/offline-store";
// import { isDemoMode } from "../../demo/seed";



// export const requirementService = {
//   async getRequirements() {
//   const { data, error } = await supabase
//     .from("requirements")
//     .select("*")
//     .eq("status", "OPEN")
//     .order("created_at", { ascending: false });

//   if (error) {
//     if (isOfflineFetchError(error)) {
//       return localRequirementStore
//         .list()
//         .filter(
//           (r) =>
//             String(r.status || "").trim().toUpperCase() === "OPEN"
//         );
//     }

//     throw error;
//   }

//   return (data || []).filter(
//     (r) =>
//       String(r.status || "").trim().toUpperCase() === "OPEN"
//   );
// },

//   async getRequirementById(id: string) {
//     const local = localRequirementStore
//       .list()
//       .find((r) => r.id === id);

//     if (local) return local;

//     const { data, error } = await supabase
//       .from("requirements")
//       .select("*")
//       .eq("id", id)
//       .maybeSingle();

//     if (error) throw error;

//     return data;
//   },

//   async createRequirement(payload: any) {
//     const row = {
//       title: String(payload.title || "").trim(),

//       description: String(
//         payload.description ||
//           payload.job_description ||
//           ""
//       ).trim(),

//       status: "OPEN",

//       department: String(
//         payload.department || ""
//       ).trim(),

//       role_name: String(
//         payload.role_name ||
//           payload.roleName ||
//           ""
//       ).trim(),

//       location: String(
//         payload.location || ""
//       ).trim(),
//     };

//     if (isDemoMode()) {
//       return localRequirementStore.create(row);
//     }

//     const { data, error } = await supabase
//       .from("requirements")
//       .insert(row)
//       .select()
//       .single();

//     if (error) {
//       console.error(
//         "createRequirement Supabase error:",
//         error
//       );

//       throw error;
//     }

//     return data;
//   },

//   async updateRequirement(
//     id: string,
//     payload: any
//   ) {
//     const local = localRequirementStore
//       .list()
//       .find((r) => r.id === id);

//     if (local) {
//       const updated = {
//         ...local,
//         ...payload,
//         updated_at:
//           new Date().toISOString(),
//       };

//       const list =
//         localRequirementStore.list();

//       const index = list.findIndex(
//         (r) => r.id === id
//       );

//       if (index !== -1) {
//         list[index] = updated;
//         localRequirementStore.save(list);
//       }

//       return updated;
//     }

//     const { data, error } = await supabase
//       .from("requirements")
//       .update({
//         ...payload,
//         updated_at:
//           new Date().toISOString(),
//       })
//       .eq("id", id)
//       .select()
//       .maybeSingle();

//     if (error) throw error;

//     return data;
//   },

//   async closeRequirement(id: string) {
//     console.log("CLOSING REQUIREMENT ID:", id);
//     const now = new Date().toISOString();

//     /*
//      * Update local copy if one exists.
//      */
//     const local = localRequirementStore
//       .list()
//       .find((r) => r.id === id);

//     let localUpdated = null;

//     if (local) {
//       localUpdated = {
//         ...local,
//         status: "CLOSED",
//         updated_at: now,
//       };

//       const list =
//         localRequirementStore.list();

//       const index = list.findIndex(
//         (r) => r.id === id
//       );

//       if (index !== -1) {
//         list[index] = localUpdated;
//         localRequirementStore.save(list);
//       }
//     }

//     /*
//      * IMPORTANT:
//      * Always persist CLOSED status to Supabase.
//      */
//     const { data, error } = await supabase
//       .from("requirements")
//       .update({
//         status: "CLOSED",
//         updated_at: now,
//       })
//       .eq("id", id)
//       .select()
//       .maybeSingle();

//     if (error) {
//       console.error(
//         "closeRequirement Supabase error:",
//         error
//       );

//       throw error;
//     }

//     return data || localUpdated;
//   },

//   async reopenRequirement(id: string) {
//     const { data, error } = await supabase
//       .from("requirements")
//       .update({
//         status: "OPEN",
//         updated_at:
//           new Date().toISOString(),
//       })
//       .eq("id", id)
//       .select()
//       .maybeSingle();

//     if (error) throw error;

//     return data;
//   },

//   async deleteRequirement(id: string) {
//     const { error } = await supabase
//       .from("requirements")
//       .delete()
//       .eq("id", id);

//     if (error) throw error;
//   },
// };


import { supabase } from "../../../services/supabase/client";
import {
  isOfflineFetchError,
  localRequirementStore,
} from "../../../lib/offline-store";
import { isDemoMode } from "../../demo/seed";

export const requirementService = {
  async getRequirements() {
    const localOpen = () =>
      localRequirementStore
        .list()
        .filter(
          (r) =>
            String(r.status || "").trim().toUpperCase() === "OPEN"
        );

    // Demo/offline workspaces keep their roles in the local store.
    // Do not let an empty Supabase table hide those roles.
    if (isDemoMode()) {
      return localOpen();
    }

    const { data, error } = await supabase
      .from("requirements")
      .select("*")
      .eq("status", "OPEN")
      .order("created_at", { ascending: false });

    if (error) {
      if (isOfflineFetchError(error)) {
        return localOpen();
      }

      throw error;
    }

    const remoteOpen = (data || []).filter(
      (r) =>
        String(r.status || "").trim().toUpperCase() === "OPEN"
    );

    return remoteOpen.length ? remoteOpen : localOpen();
  },

  async getRequirementById(id: string) {
    const local = localRequirementStore
      .list()
      .find((r) => r.id === id);

    if (local) return local;

    const { data, error } = await supabase
      .from("requirements")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;

    return data;
  },

  async createRequirement(payload: any) {
    const row = {
      title: String(payload.title || "").trim(),

      description: String(
        payload.description ||
          payload.job_description ||
          ""
      ).trim(),

      status: "OPEN",

      department: String(
        payload.department || ""
      ).trim(),

      role_name: String(
        payload.role_name ||
          payload.roleName ||
          ""
      ).trim(),

      location: String(
        payload.location || ""
      ).trim(),
    };

    if (isDemoMode()) {
      return localRequirementStore.create(row);
    }

    const { data, error } = await supabase
      .from("requirements")
      .insert(row)
      .select()
      .single();

    if (error) {
      console.error(
        "createRequirement Supabase error:",
        error
      );

      throw error;
    }

    return data;
  },

  async updateRequirement(
    id: string,
    payload: any
  ) {
    const local = localRequirementStore
      .list()
      .find((r) => r.id === id);

    if (local) {
      const updated = {
        ...local,
        ...payload,
        updated_at:
          new Date().toISOString(),
      };

      const list =
        localRequirementStore.list();

      const index = list.findIndex(
        (r) => r.id === id
      );

      if (index !== -1) {
        list[index] = updated;
        localRequirementStore.save(list);
      }

      return updated;
    }

    const { data, error } = await supabase
      .from("requirements")
      .update({
        ...payload,
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) throw error;

    return data;
  },

  async closeRequirement(id: string) {
    console.log("CLOSING REQUIREMENT ID:", id);

    const now = new Date().toISOString();

    const local = localRequirementStore
      .list()
      .find((r) => r.id === id);

    let localUpdated = null;

    if (local) {
      localUpdated = {
        ...local,
        status: "CLOSED",
        updated_at: now,
      };

      const list =
        localRequirementStore.list();

      const index = list.findIndex(
        (r) => r.id === id
      );

      if (index !== -1) {
        list[index] = localUpdated;
        localRequirementStore.save(list);
      }
    }

    const { data, error } = await supabase
      .from("requirements")
      .update({
        status: "CLOSED",
        updated_at: now,
      })
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) {
      console.error(
        "closeRequirement Supabase error:",
        error
      );

      throw error;
    }

    return data || localUpdated;
  },

  async reopenRequirement(id: string) {
    const { data, error } = await supabase
      .from("requirements")
      .update({
        status: "OPEN",
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) throw error;

    return data;
  },

  async deleteRequirement(id: string) {
    const { error } = await supabase
      .from("requirements")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};