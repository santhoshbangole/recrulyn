import { supabase } from "../../../services/supabase/client";

export type PartnerOrgType = "UNIVERSITY" | "INDUSTRY" | "INSTITUTE";

export interface PartnerOrganization {
  id: string;
  name: string;
  org_type: PartnerOrgType;
  location?: string | null;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  notes?: string | null;
  created_at?: string;
}

export const partnerService = {
  async list(): Promise<PartnerOrganization[]> {
    const { data, error } = await supabase
      .from("partner_organizations")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async create(payload: {
    name: string;
    org_type: PartnerOrgType;
    location?: string;
    contact_name?: string;
    contact_email?: string;
    contact_phone?: string;
    notes?: string;
  }) {
    const { data, error } = await supabase
      .from("partner_organizations")
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    return data as PartnerOrganization;
  },

  async update(id: string, payload: Partial<PartnerOrganization>) {
    const { data, error } = await supabase
      .from("partner_organizations")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as PartnerOrganization;
  },

  async remove(id: string) {
    const { error } = await supabase
      .from("partner_organizations")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },
};
