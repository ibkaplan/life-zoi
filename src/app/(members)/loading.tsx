import { T } from "@/components/localized-text";

export default function Loading() {
  return (
    <p className="card" role="status">
      <T text="Loading…" />
    </p>
  );
}
