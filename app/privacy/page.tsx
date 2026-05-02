import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background px-5 py-10 text-foreground">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link href="/" className="text-sm font-semibold text-primary-600">
          Back to Tambola
        </Link>
        <div className="space-y-3">
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
          <p className="text-sm text-slate-500">Last updated: May 2, 2026</p>
        </div>

        <section className="space-y-3 text-slate-700 dark:text-slate-300">
          <p>
            Tambola Housie is built to host and play live Tambola sessions. The app stores game sessions,
            generated tickets, player names entered by hosts, and called numbers so participants can stay
            synchronized in real time.
          </p>
          <p>
            Realtime game data is processed with Firebase services. The app may also save session data on
            your device so a running session can continue after refresh or app restart.
          </p>
          <p>
            Do not enter sensitive personal information into player names or game labels. Hosts are
            responsible for the names and ticket data they upload or generate.
          </p>
          <p>
            To request deletion of session data or ask privacy questions, contact the app owner at
            support@example.com. Replace this address with your production support email before store
            submission.
          </p>
        </section>
      </div>
    </main>
  );
}
