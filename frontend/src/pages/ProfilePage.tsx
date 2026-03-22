import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { PageContainer } from "../components/PageContainer";
import { ProfileSections } from "../components/ProfileSections";
import { api } from "../services/api";

const savedPlaces = [
  { label: "Home", address: "123 Maple St, Long Beach, CA 90801", icon: "⌂" },
  { label: "Work", address: "456 State St, Los Angeles, CA 90012", icon: "▣" },
];

export function ProfilePage() {
  const queryClient = useQueryClient();
  const userQuery = useQuery({ queryKey: ["me"], queryFn: api.getMe });
  const [language, setLanguage] = useState("English");
  const [formState, setFormState] = useState({
    full_name: "",
    email: "",
    phone_number: "",
  });

  const updateMutation = useMutation({
    mutationFn: api.updateMe,
    onSuccess: (user) => {
      queryClient.setQueryData(["me"], user);
    },
  });

  const user = userQuery.data;
  const form = {
    full_name: formState.full_name || user?.full_name || "",
    email: formState.email || user?.email || "",
    phone_number: formState.phone_number || user?.phone_number || "",
  };

  return (
    <PageContainer>
      <div className="grid lg:grid-cols-[210px_minmax(0,1fr)]">
        <aside className="border-b border-line p-3 lg:border-b-0 lg:border-r">
          <div className="border border-line bg-canvas">
            {["Profile", "Payment", "Notification Preferences"].map((item, index) => (
              <button
                key={item}
                type="button"
                className={`block w-full border-b border-line px-4 py-3 text-left text-sm ${index === 0 ? "bg-surface font-semibold text-ink" : "text-muted"} last:border-b-0`}
              >
                {item}
              </button>
            ))}
          </div>
        </aside>

        <div className="p-4 md:p-5">
          <div className="flex flex-col gap-4 border-b border-line pb-5 md:flex-row md:items-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border border-line bg-canvas text-3xl text-muted">☺</div>
            <div>
              <h1 className="text-[1.8rem] font-semibold text-ink">{user?.full_name ?? "John Doe"}</h1>
              <p className="mt-1 text-sm text-muted">{user?.email ?? "johndoe@email.com"}</p>
              <p className="mt-1 text-sm text-muted">{user?.phone_number ?? "(123) 456-7890"}</p>
              <p className="mt-2 text-sm text-muted">Member since Jan 2024</p>
            </div>
          </div>

          <section className="border-b border-line py-5">
            <h2 className="text-[1.4rem] font-semibold text-ink">Saved Places</h2>
            <div className="mt-3 space-y-3">
              {savedPlaces.map((place) => (
                <div key={place.label} className="flex items-center justify-between border border-line bg-surface px-4 py-3">
                  <div className="flex items-start gap-4">
                    <div className="text-xl text-muted">{place.icon}</div>
                    <div>
                      <p className="text-lg font-semibold text-ink">{place.label}</p>
                      <p className="text-sm text-muted">{place.address}</p>
                    </div>
                  </div>
                  <button type="button" className="rounded-md border border-line px-4 py-2 text-sm text-ink">
                    Edit ›
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="py-5">
            <h2 className="text-[1.4rem] font-semibold text-ink">Personal Information</h2>
            <form
              className="mt-4 border border-line"
              onSubmit={(event) => {
                event.preventDefault();
                void updateMutation.mutateAsync(form);
              }}
            >
              <div className="space-y-4 p-4">
                <label className="block">
                  <span className="mb-2 block text-sm text-muted">Full Name</span>
                  <input
                    value={form.full_name}
                    onChange={(event) => setFormState((current) => ({ ...current, full_name: event.target.value }))}
                    className="w-full border border-line px-4 py-2.5 text-sm outline-none"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm text-muted">Email</span>
                  <input
                    value={form.email}
                    onChange={(event) => setFormState((current) => ({ ...current, email: event.target.value }))}
                    className="w-full border border-line px-4 py-2.5 text-sm outline-none"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm text-muted">Phone Number</span>
                  <input
                    value={form.phone_number}
                    onChange={(event) => setFormState((current) => ({ ...current, phone_number: event.target.value }))}
                    className="w-full border border-line px-4 py-2.5 text-sm outline-none"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm text-muted">Language Preferences</span>
                  <select value={language} onChange={(event) => setLanguage(event.target.value)} className="w-full border border-line px-4 py-2.5 text-sm outline-none">
                    <option>English</option>
                    <option>Spanish</option>
                    <option>Hindi</option>
                  </select>
                </label>
              </div>
              <div className="border-t border-line p-4">
                <button type="submit" className="min-w-[140px] rounded-md bg-[#70716d] px-5 py-2.5 text-sm font-semibold text-white">
                  {updateMutation.isPending ? "Updating..." : "Update"}
                </button>
              </div>
            </form>
          </section>
          <div className="mt-5">
            <ProfileSections user={user} />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
