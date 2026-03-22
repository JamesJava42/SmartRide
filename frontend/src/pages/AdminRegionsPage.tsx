import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { api } from "../services/api";
import type { AdminRegion, AdminRegionPayload } from "../types/api";

const EMPTY_FORM: AdminRegionPayload = {
  code: "",
  name: "",
  city: "",
  state: "",
  country: "",
  is_active: true,
};

function RegionFormModal({
  title,
  value,
  onChange,
  onClose,
  onSubmit,
  isSaving,
}: {
  title: string;
  value: AdminRegionPayload;
  onChange: (next: AdminRegionPayload) => void;
  onClose: () => void;
  onSubmit: () => void;
  isSaving: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/35 p-4">
      <div className="w-full max-w-xl rounded-[28px] border border-line bg-white p-6 shadow-[0_20px_60px_rgba(15,23,18,0.16)]">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-ink">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-full border border-line px-3 py-1 text-sm font-semibold text-muted">
            Close
          </button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="font-semibold text-ink">Code</span>
            <input
              value={value.code}
              onChange={(event) => onChange({ ...value, code: event.target.value })}
              className="w-full rounded-2xl border border-line bg-[#fbfaf7] px-4 py-3 outline-none"
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-semibold text-ink">Name</span>
            <input
              value={value.name}
              onChange={(event) => onChange({ ...value, name: event.target.value })}
              className="w-full rounded-2xl border border-line bg-[#fbfaf7] px-4 py-3 outline-none"
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-semibold text-ink">City</span>
            <input
              value={value.city}
              onChange={(event) => onChange({ ...value, city: event.target.value })}
              className="w-full rounded-2xl border border-line bg-[#fbfaf7] px-4 py-3 outline-none"
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-semibold text-ink">State</span>
            <input
              value={value.state}
              onChange={(event) => onChange({ ...value, state: event.target.value })}
              className="w-full rounded-2xl border border-line bg-[#fbfaf7] px-4 py-3 outline-none"
            />
          </label>
          <label className="space-y-2 text-sm md:col-span-2">
            <span className="font-semibold text-ink">Country</span>
            <input
              value={value.country}
              onChange={(event) => onChange({ ...value, country: event.target.value })}
              className="w-full rounded-2xl border border-line bg-[#fbfaf7] px-4 py-3 outline-none"
            />
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-line bg-[#fbfaf7] px-4 py-3 text-sm font-semibold text-ink md:col-span-2">
            <input
              type="checkbox"
              checked={value.is_active}
              onChange={(event) => onChange({ ...value, is_active: event.target.checked })}
              className="h-4 w-4 rounded border-line"
            />
            Region is active
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-2xl border border-line px-4 py-3 text-sm font-semibold text-ink">
            Cancel
          </button>
          <button type="button" onClick={onSubmit} disabled={isSaving} className="rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white">
            {isSaving ? "Saving..." : "Save Region"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminRegionsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-regions"], queryFn: () => api.getAdminRegions() });
  const [editingRegion, setEditingRegion] = useState<AdminRegion | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState<AdminRegionPayload>(EMPTY_FORM);

  const createRegion = useMutation({
    mutationFn: () => api.createAdminRegion(form),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-regions"] });
      setIsCreateOpen(false);
      setForm(EMPTY_FORM);
    },
  });

  const updateRegion = useMutation({
    mutationFn: () => api.updateAdminRegion(editingRegion!.id, form),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-regions"] });
      setEditingRegion(null);
      setForm(EMPTY_FORM);
    },
  });

  const deleteRegion = useMutation({
    mutationFn: (regionId: string) => api.deleteAdminRegion(regionId),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["admin-regions"] }),
  });

  const sortedRegions = useMemo(() => [...(data ?? [])].sort((a, b) => a.name.localeCompare(b.name)), [data]);

  function openCreate() {
    setForm(EMPTY_FORM);
    setEditingRegion(null);
    setIsCreateOpen(true);
  }

  function openEdit(region: AdminRegion) {
    setEditingRegion(region);
    setIsCreateOpen(false);
    setForm({
      code: region.code,
      name: region.name,
      city: region.city ?? "",
      state: region.state ?? "",
      country: region.country ?? "",
      is_active: Boolean(region.is_active),
    });
  }

  if (isLoading || !data) {
    return <div className="rounded-[28px] border border-line bg-white p-6 text-sm text-muted">Loading regions...</div>;
  }

  return (
    <>
      <div className="rounded-[28px] border border-line bg-white p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Regions Control</h1>
            <p className="mt-1 text-sm text-muted">Create, update, activate, or delete operational regions.</p>
          </div>
          <button type="button" onClick={openCreate} className="rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white">
            Add Region
          </button>
        </div>

        <div className="mt-5 overflow-hidden rounded-[24px] border border-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#faf8f4] text-muted">
              <tr>
                <th className="px-4 py-3">Region</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">State</th>
                <th className="px-4 py-3">Country</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedRegions.map((region) => (
                <tr key={region.id} className="border-t border-line">
                  <td className="px-4 py-3 font-semibold text-accent">
                    <Link to={`/admin/regions/${region.id}`}>{region.name}</Link>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs uppercase">{region.code}</td>
                  <td className="px-4 py-3">{region.city}</td>
                  <td className="px-4 py-3">{region.state}</td>
                  <td className="px-4 py-3">{region.country}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        region.is_active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {region.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => openEdit(region)} className="rounded-xl border border-line px-3 py-2 text-xs font-semibold">
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteRegion.mutate(region.id)}
                        disabled={deleteRegion.isPending}
                        className="rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isCreateOpen ? (
        <RegionFormModal
          title="Create Region"
          value={form}
          onChange={setForm}
          onClose={() => {
            setIsCreateOpen(false);
            setForm(EMPTY_FORM);
          }}
          onSubmit={() => createRegion.mutate()}
          isSaving={createRegion.isPending}
        />
      ) : null}

      {editingRegion ? (
        <RegionFormModal
          title={`Edit ${editingRegion.name}`}
          value={form}
          onChange={setForm}
          onClose={() => {
            setEditingRegion(null);
            setForm(EMPTY_FORM);
          }}
          onSubmit={() => updateRegion.mutate()}
          isSaving={updateRegion.isPending}
        />
      ) : null}
    </>
  );
}
