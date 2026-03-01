"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type Profile = {
  name: string;
  username: string;
  email: string;
  avatarUrl: string;
  bio: string;
  website: string;
  location: string;
  marketingOptIn: boolean;
};

const emptyProfile: Profile = {
  name: "",
  username: "",
  email: "",
  avatarUrl: "",
  bio: "",
  website: "",
  location: "",
  marketingOptIn: false,
};

function isValidUsername(v: string) {
  return /^[a-zA-Z0-9_]{3,20}$/.test(v);
}

function isValidUrlOrEmpty(v: string) {
  if (!v) return true;
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export default function EditProfileForm() {
  const router = useRouter();
  const [profile, setProfile] = React.useState<Profile>(emptyProfile);
  const [initial, setInitial] = React.useState<Profile>(emptyProfile);

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const dirty = React.useMemo(() => JSON.stringify(profile) !== JSON.stringify(initial), [profile, initial]);

  const validation = React.useMemo(() => {
    const issues: string[] = [];

    if (!profile.name.trim()) issues.push("Name is required.");
    if (!profile.username.trim()) issues.push("Username is required.");
    if (profile.username && !isValidUsername(profile.username)) {
      issues.push("Username must be 3–20 chars, letters/numbers/underscore only.");
    }
    if (!isValidUrlOrEmpty(profile.website)) issues.push("Website must be a valid URL (or blank).");

    if (profile.bio.length > 280) issues.push("Bio must be 280 characters or less.");

    return issues;
  }, [profile]);

  const canSave = dirty && validation.length === 0 && !saving;

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setSuccess(null);

      try {
        const res = await fetch("/api/me", { method: "GET" });
        if (!res.ok) {
          const msg = await res.text().catch(() => "");
          throw new Error(msg || `Failed to load profile (${res.status}).`);
        }

        const data = (await res.json()) as Profile;
        if (cancelled) return;

        setProfile(data);
        setInitial(data);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load profile.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (validation.length) {
      setError(validation[0]);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || `Failed to save (${res.status}).`);
      }

      const saved = (await res.json()) as Profile;
      setProfile(saved);
      setInitial(saved);
      setSuccess("Profile updated.");
      router.refresh();
    } catch (e: any) {
      setError(e?.message ?? "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  function update<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile((p) => ({ ...p, [key]: value }));
  }

  function reset() {
    setProfile(initial);
    setError(null);
    setSuccess(null);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {(error || success) && (
        <Alert variant={error ? "destructive" : "default"}>
          <AlertTitle>{error ? "Something went wrong" : "Success"}</AlertTitle>
          <AlertDescription>{error ?? success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Public profile</CardTitle>
          <CardDescription>Shown on your profile page and throughout the app.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Your name"
                value={profile.name}
                onChange={(e) => update("name", e.target.value)}
                disabled={loading || saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="your_handle"
                value={profile.username}
                onChange={(e) => update("username", e.target.value)}
                disabled={loading || saving}
              />
              <p className="text-xs text-muted-foreground">
                3–20 chars, letters/numbers/underscore.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={profile.email} disabled />
              <p className="text-xs text-muted-foreground">
                Email comes from Auth0. Change it in your identity provider.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatarUrl">Avatar URL</Label>
              <Input
                id="avatarUrl"
                placeholder="https://..."
                value={profile.avatarUrl}
                onChange={(e) => update("avatarUrl", e.target.value)}
                disabled={loading || saving}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="A short bio (max 280 chars)"
                value={profile.bio}
                onChange={(e: { target: { value: string; }; }) => update("bio", e.target.value)}
                disabled={loading || saving}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Keep it short and useful.</span>
                <span>{profile.bio.length}/280</span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                placeholder="https://example.com"
                value={profile.website}
                onChange={(e) => update("website", e.target.value)}
                disabled={loading || saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="City, State"
                value={profile.location}
                onChange={(e) => update("location", e.target.value)}
                disabled={loading || saving}
              />
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">Marketing emails</p>
              <p className="text-sm text-muted-foreground">
                Receive product updates and occasional newsletters.
              </p>
            </div>
            <Switch
              checked={profile.marketingOptIn}
              onCheckedChange={(v: boolean) => update("marketingOptIn", v)}
              disabled={loading || saving}
            />
          </div>

          {validation.length > 0 && (
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium">Fix these before saving:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {validation.map((v) => (
                  <li key={v}>{v}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={reset} disabled={!dirty || loading || saving}>
              Reset
            </Button>
            <Button type="submit" disabled={!canSave}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}