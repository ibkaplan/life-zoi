"use client";

import { useState } from "react";
import { dataMode, dataModeSummary } from "@/lib/mode";
import { exportEnvelope } from "@/lib/storage";
import type { UserData } from "@/lib/user-data";
import { Alert, Button, Card, PageHeader } from "@/components/ui";
import { DataGate, downloadText } from "@/components/user-data-provider";

export function SettingsView() {
  return (
    <DataGate>
      {(ready) => <SettingsBody data={ready.data} reset={ready.reset} />}
    </DataGate>
  );
}

function SettingsBody({ data, reset }: { data: UserData; reset: () => string | null }) {
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function exportData() {
    const envelope = exportEnvelope(data, new Date().toISOString());
    downloadText("lifezoi-export.json", JSON.stringify(envelope, null, 2));
    setMessage("Export downloaded. It contains the notes from this browser.");
  }

  function deleteData() {
    if (confirm !== "delete") {
      setError("Type delete to confirm. Nothing was removed.");
      return;
    }
    const failure = reset();
    setError(failure ?? "");
    setMessage(failure ? "" : "Deleted from this browser. No server copy existed to delete.");
    setConfirm("");
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Settings"
        title="Data on this device"
        lede="lifeZoi is in local development mode. You can export or delete what this browser stored. There is no account to close."
      />
      <Alert title={dataMode.reason === "remote-not-activated" ? "Supabase keys were found, and they are not in use" : "No remote database is configured"} tone={dataMode.reason === "remote-not-activated" ? "warning" : "info"}>
        {dataModeSummary(dataMode)} See the README for the variables and the SQL file. Do not assume a key in the environment means your notes are secured online.
      </Alert>
      <Card>
        <h2 className="font-display text-3xl">What is stored here</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>Display name, if you set one</li>
          <li>Assessment draft and completed answers</li>
          <li>Saved WHAT IF? scenarios, habits, and check-ins</li>
        </ul>
        <p className="mt-3 text-muted">Not stored: a password, a precise location, files, or measurements you did not type.</p>
        <div className="mt-4">
          <Button type="button" variant="secondary" onClick={exportData}>
            Export JSON
          </Button>
        </div>
      </Card>
      <Card>
        <h2 className="font-display text-3xl">Delete notes on this device</h2>
        <p className="mt-2 text-muted">This removes the lifeZoi key from this browser. It cannot delete anything from another device.</p>
        <label className="mt-4 block font-semibold" htmlFor="confirm-delete">
          Type delete to confirm
          <input id="confirm-delete" className="mt-2 min-h-11 w-full rounded-2xl border border-line px-3" value={confirm} onChange={(event) => setConfirm(event.target.value)} />
        </label>
        <div className="mt-4">
          <Button type="button" variant="danger" onClick={deleteData}>
            Delete data on this device
          </Button>
        </div>
      </Card>
      {error ? <p role="alert" className="font-semibold text-danger">{error}</p> : null}
      {message ? <p role="status" className="text-muted">{message}</p> : null}
    </div>
  );
}
