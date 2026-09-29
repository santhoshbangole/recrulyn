import { useState } from "react";

interface NDAModalProps {
candidate: any;
open: boolean;
onClose: () => void;
onGenerate: (data: any) => void;
}

export default function NDAModal({
candidate,
open,
onClose,
onGenerate,
}: NDAModalProps) {
const [formData, setFormData] =
useState({
guardian_name: "",
area: "",
district: "",
state: "",
pincode: "",
});

if (!open) return null;

return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="w-full max-w-xl rounded-xl bg-white p-6">

      <h2 className="mb-4 text-xl font-bold">
        Generate NDA
      </h2>

      <p className="mb-4 text-sm text-gray-600">
        Candidate: {candidate?.full_name}
      </p>

      <div className="space-y-3">

        <input
          className="w-full rounded-lg border p-3"
          placeholder="Father / Guardian Name"
          value={formData.guardian_name}
          onChange={(e) =>
            setFormData({
              ...formData,
              guardian_name: e.target.value,
            })
          }
        />

        <input
          className="w-full rounded-lg border p-3"
          placeholder="Area / Locality"
          value={formData.area}
          onChange={(e) =>
            setFormData({
              ...formData,
              area: e.target.value,
            })
          }
        />

        <input
          className="w-full rounded-lg border p-3"
          placeholder="District / City"
          value={formData.district}
          onChange={(e) =>
            setFormData({
              ...formData,
              district: e.target.value,
            })
          }
        />

        <input
          className="w-full rounded-lg border p-3"
          placeholder="State"
          value={formData.state}
          onChange={(e) =>
            setFormData({
              ...formData,
              state: e.target.value,
            })
          }
        />

        <input
          className="w-full rounded-lg border p-3"
          placeholder="Pincode"
          value={formData.pincode}
          onChange={(e) =>
            setFormData({
              ...formData,
              pincode: e.target.value,
            })
          }
        />

      </div>

      <div className="mt-6 flex justify-end gap-3">

        <button
          onClick={onClose}
          className="rounded-lg border px-4 py-2"
        >
          Cancel
        </button>

        <button
          onClick={() => onGenerate(formData)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white"
        >
          Generate NDA
        </button>

      </div>

    </div>
  </div>
);
}
