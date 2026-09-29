import { supabase } from "../../../services/supabase/client";
import { uploadVaultFile } from "../../documents/services/vault.service";
import {
  isOfflineFetchError,
  localUploadStore,
  toLocalFileUrl,
} from "../../../lib/offline-store";

export const recrulynUploadService = {
  async uploadFile(file: File) {
    const fileName = `${Date.now()}-${file.name}`;

    try {
      const publicUrl = await uploadVaultFile({
        file,
        filename: fileName,
        category: "recrulyn",
        contentType: file.type || "application/octet-stream",
      });

      try {
        await supabase.from("recrulyn_uploads").insert([
          {
            file_name: file.name,
            file_url: publicUrl,
            file_type: file.type,
            status: "UPLOADED",
          },
        ]);
      } catch (metaError) {
        console.warn("Upload metadata insert failed", metaError);
      }

      return publicUrl;
    } catch (error) {
      console.error(
        "RESUME UPLOD FAILED",
        error
      );
      const localUrl = toLocalFileUrl(file);
      localUploadStore.add(file, localUrl);
      return localUrl;
    }
  },

  async createUploadFromUrl(payload: {
    fileName: string;
    fileUrl: string;
  }) {
    try {
      const { error } = await supabase.from("recrulyn_uploads").insert([
        {
          file_name: payload.fileName,
          file_url: payload.fileUrl,
          file_type: "application/pdf",
          status: "UPLOADED",
        },
      ]);
      if (error) throw error;
    } catch (error) {
      if (!isOfflineFetchError(error)) throw error;
      localUploadStore.add(
        new File([""], payload.fileName, { type: "application/pdf" }),
        payload.fileUrl
      );
    }
  },

  async getUploads() {
    try {
      const { data, error } = await supabase
        .from("recrulyn_uploads")
        .select("*")
        .order("uploaded_at", {
          ascending: false,
        });

      if (error) throw error;
      return data || [];
    } catch (error) {
      if (!isOfflineFetchError(error)) throw error;
      return localUploadStore.list();
    }
  },

  async markProcessed(uploadId: string) {
    try {
      const { error } = await supabase
        .from("recrulyn_uploads")
        .update({
          processed: true,
          processed_at: new Date().toISOString(),
        })
        .eq("id", uploadId);

      if (error) throw error;
    } catch (error) {
      if (!isOfflineFetchError(error)) throw error;
    }
  },

  async getUploadById(id: string) {
    try {
      const { data, error } = await supabase
        .from("recrulyn_uploads")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      if (!isOfflineFetchError(error)) throw error;
      return localUploadStore.list().find((u) => u.id === id) || null;
    }
  },
};
