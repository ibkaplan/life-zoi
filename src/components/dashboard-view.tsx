"use client";

import { lifestyleLines } from "@/lib/assessment";
import { buildRecommendations } from "@/lib/recommendations";
import { summarizeMonth, supportiveNote } from "@/lib/progress";
import { draftHasProgress, latestAssessment, type UserData } from "@/lib/user-data";
import { SampleExample } from "@/components/sample-example";
import { Alert, ButtonLink, Card, EmptyState, PageHeader } from "@/components/ui";
import { DataGate } from "@/components/user-data-provider";
import { useEffect, useState } from "react";

export function DashboardView() {
  return (
    <DataGate>
      {(ready) => <DashboardContent data={ready.data} />}
    </DataGate>
  );
}

function DashboardContent({ data }: { data: UserData }) {
  const [month, setMonth] = useState<{ year: number; monthIndex: number } | null>(null);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const now = new Date();
      setMonth({ year: now.getFullYear(), monthIndex: now.getMonth() });
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const assessment = latestAssessment(data);
  const name = data.profile.displayName;
  const lines = assessment ? lifestyleLines(assessment.answers) : [];
  const recommendations = assessment ? buildRecommendations(assessment.answers) : [];
  const summary = month ? summarizeMonth(data.checkIns, month.year, month.monthIndex) : null;

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="lifeZoi"
        title={name ? `Hello, ${name}` : "Hello"}
        lede="lifeZoi helps you reflect on sleep, movement, food, and connection, explore a WHAT IF? change, and keep a simple record of what you try."
      />
      <Alert title="What this can and cannot do">
        Your overview uses only what you enter. lifeZoi will not invent measurements, a health score, or a lifespan.
      </Alert>
      {assessment ? (
        <Card>
          <h2 className="font-display text-3xl">From your latest assessment</h2>
          <p className="mt-1 text-sm text-muted">Completed {formatStamp(assessment.completedAt)}. Only answers you gave are listed.</p>
          <ul className="mt-4 space-y-2">
            {lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <div className="mt-4">
            <ButtonLink href="/assessment" variant="secondary">
              Update assessment
            </ButtonLink>
          </div>
        </Card>
      ) : (
        <EmptyState
          title={draftHasProgress(data) ? "Your assessment is still open" : "Start with the lifestyle assessment"}
          action={<ButtonLink href="/assessment">{draftHasProgress(data) ? "Continue assessment" : "Begin assessment"}</ButtonLink>}
        >
          <p>The questions ask about habits you choose to share. Sensitive questions can be skipped. This is not a medical visit.</p>
        </EmptyState>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <Card tone="forest">
          <p className="text-sm font-semibold tracking-[0.14em] text-[#d7ebdd] uppercase">Feature</p>
          <h2 className="mt-2 font-display text-4xl">WHAT IF?</h2>
          <p className="mt-3 text-[#e7f3ea]">
            Compare a current routine with a change you might try. The results are educational illustrations, with sources, not predictions.
          </p>
          <div className="mt-5">
            <ButtonLink href="/what-if" variant="inverse">
              Explore WHAT IF?
            </ButtonLink>
          </div>
        </Card>
        <Card>
          <h2 className="font-display text-3xl">This month</h2>
          {summary ? (
            <>
              <p className="mt-2 text-muted">{summary.label}</p>
              {summary.hasRecords ? (
                <p className="mt-3 text-lg">
                  {summary.done} done, {summary.partial} partial, {summary.skipped} skipped
                </p>
              ) : (
                <p className="mt-3 text-muted">No check-ins yet this month.</p>
              )}
              <p className="mt-3 text-muted">{supportiveNote(summary)}</p>
            </>
          ) : (
            <p className="mt-3 text-muted">Loading this month…</p>
          )}
          <div className="mt-4">
            <ButtonLink href="/progress" variant="secondary">
              Open progress
            </ButtonLink>
          </div>
        </Card>
      </div>
      <Card>
        <h2 className="font-display text-3xl">Guidance</h2>
        {recommendations.length > 0 ? (
          <ul className="mt-4 grid gap-3">
            {recommendations.slice(0, 2).map((item) => (
              <li key={item.id} className="rounded-2xl bg-sage px-4 py-3">
                <p className="font-semibold">{item.title}</p>
                <p className="mt-1 text-muted">{item.why}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-muted">Guidance appears after you complete the assessment. It will be rule-based, not an AI conversation.</p>
        )}
        <div className="mt-4">
          <ButtonLink href="/recommendations" variant="secondary">
            {recommendations.length > 0 ? "See guidance" : "How guidance works"}
          </ButtonLink>
        </div>
      </Card>
      {!assessment && data.checkIns.length === 0 ? <SampleExample /> : null}
    </div>
  );
}

function formatStamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "on an unknown date";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}
