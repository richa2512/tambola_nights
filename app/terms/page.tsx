import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background px-5 py-10 text-foreground">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link href="/" className="text-sm font-semibold text-primary-600">
          Back to Tambola
        </Link>
        <div className="space-y-3">
          <h1 className="text-3xl font-bold">Terms of Use</h1>
          <p className="text-sm text-slate-500">Last updated: May 2, 2026</p>
        </div>

        <section className="space-y-3 text-slate-700 dark:text-slate-300">
          <p>
            Tambola Housie helps hosts generate tickets, call numbers, and validate common Tambola claims.
            Hosts are responsible for running games lawfully in their location and for confirming prize rules
            with participants before play begins.
          </p>
          <p>
            The app does not provide gambling, payment processing, or prize fulfillment. Do not use it for
            prohibited or regulated activity unless you have the required approvals.
          </p>
          <p>
            Game sessions depend on network connectivity and third-party realtime infrastructure. Always keep
            a backup process for important events.
          </p>
          <p>
            Replace this page with your final legal terms before publishing to the App Store or Google Play.
          </p>
        </section>
      </div>
    </main>
  );
}
