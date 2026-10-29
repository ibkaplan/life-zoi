"use client";

import { buildRecommendations } from "@/lib/recommendations";
import { latestAssessment, type UserData } from "@/lib/user-data";
import { Alert, ButtonLink, Card, EmptyState, PageHeader, SourceList } from "@/components/ui";
import { DataGate } from "@/components/user-data-provider";

export function RecommendationsView() {
  return (
    <DataGate>
      {(ready) => <RecommendationsBody data={ready.data} />}
    </DataGate>
  );
}

function RecommendationsBody({ data }: { data: UserData }) {
  const assessment = latestAssessment(data);
  const recommendations = assessment ? buildRecommendations(assessment.answers) : [];
  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Guidance"
        title="A few practical starting points"
        lede="These ideas come from a fixed set of rules and your answers. No AI service is connected. They are general wellness education, not personal medical advice."
      />
      <Alert title="Before you act on this">
        Talk with a qualified clinician about personal medical decisions, medicines, and symptoms. lifeZoi will not tell you to start or stop a treatment.
      </Alert>
      {!assessment ? (
        <EmptyState title="Guidance waits for your assessment" action={<ButtonLink href="/assessment">Start assessment</ButtonLink>}>
          <p>There is no placeholder plan pretending to know your habits. Complete the assessment and this page will use only those answers.</p>
        </EmptyState>
      ) : (
        <ul className="grid gap-4">
          {recommendations.map((item) => (
            <li key={item.id}>
              <Card>
                <p className="text-sm font-semibold tracking-wide text-forest uppercase">{item.evidence}</p>
                <h2 className="mt-2 font-display text-3xl">{item.title}</h2>
                <p className="mt-3">{item.why}</p>
                <ul className="mt-3 list-disc space-y-2 pl-5">
                  {item.actions.map((action) => (
                    <li key={action}>{action}</li>
                  ))}
                </ul>
                <p className="mt-3 text-muted">{item.uncertainty}</p>
                <h3 className="mt-4 font-semibold">Sources</h3>
                <SourceList ids={item.sourceIds} />
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
