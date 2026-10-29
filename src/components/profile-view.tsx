"use client";

import { useState } from "react";
import { lifestyleLines } from "@/lib/assessment";
import { latestAssessment, updateProfile, type UserData } from "@/lib/user-data";
import { Button, ButtonLink, Card, EmptyState, PageHeader, TextField } from "@/components/ui";
import { DataGate } from "@/components/user-data-provider";

export function ProfileView() {
  return (
    <DataGate>
      {(ready) => <ProfileBody data={ready.data} commit={ready.commit} />}
    </DataGate>
  );
}

function ProfileBody({ data, commit }: { data: UserData; commit: (next: UserData) => string | null }) {
  const [name, setName] = useState(data.profile.displayName);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const assessment = latestAssessment(data);
  const lines = assessment ? lifestyleLines(assessment.answers) : [];

  function saveName() {
    const result = updateProfile(data, name);
    if (!result.ok) {
      setError(result.errors[0]?.message ?? "The name was not saved.");
      return;
    }
    const failure = commit(result.data);
    setError("");
    setMessage(failure ?? "Name saved in this browser.");
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="My Profile"
        title="Only what you have shared"
        lede="lifeZoi shows your display name and assessment answers. It does not add measurements, scores, or a health history you did not enter."
      />
      <Card>
        <TextField id="display-name" label="What should lifeZoi call you?" hint="Optional. 40 characters or fewer." value={name} maxLength={40} onChange={(event) => setName(event.target.value)} error={error} />
        <div className="mt-4">
          <Button type="button" onClick={saveName}>
            Save name
          </Button>
        </div>
        {message ? <p role="status" className="mt-3 text-muted">{message}</p> : null}
      </Card>
      {assessment ? (
        <Card>
          <h2 className="font-display text-3xl">Lifestyle overview</h2>
          <ul className="mt-4 space-y-2">
            {lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <div className="mt-4">
            <ButtonLink href="/assessment" variant="secondary">
              Update answers
            </ButtonLink>
          </div>
        </Card>
      ) : (
        <EmptyState title="No lifestyle overview yet" action={<ButtonLink href="/assessment">Start assessment</ButtonLink>}>
          <p>Complete the assessment if you want this page to summarize your habits. Until then, it stays empty on purpose.</p>
        </EmptyState>
      )}
    </div>
  );
}
