import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="page stack">
      <h1>That page is not here</h1>
      <p>The link may be old, or the scenario was never in this tab.</p>
      <Link className="btn btn-primary" href="/dashboard">
        Back to lifeZoi
      </Link>
    </main>
  );
}
