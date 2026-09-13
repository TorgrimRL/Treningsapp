export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 text-white">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <p className="mt-2 text-sm text-gray-400">Last updated: September 2026</p>

      <section className="mt-8 space-y-4">
        <p>
          SetOptimizer is a hobby project, not a registered company. The
          developer behind SetOptimizer is responsible for your personal
          data. Questions about privacy can be sent to{" "}
          <a href="mailto:support@setoptimizer.com" className="text-red-400 underline">
            support@setoptimizer.com
          </a>
          .
        </p>
      </section>

      <section className="mt-8 space-y-2">
        <h2 className="text-xl font-semibold">What information do we collect?</h2>
        <p>We only collect what&apos;s needed to make the app work:</p>
        <ul className="list-disc space-y-1 pl-6">
          <li>
            <span className="font-semibold">Account information:</span> your
            email address, a unique user ID from our login provider Auth0,
            and optionally a profile picture you&apos;ve set with Auth0.
          </li>
          <li>
            <span className="font-semibold">Training data:</span> the
            training blocks (mesocycles) you create, exercises you add, sets,
            reps, weight lifted, and notes you write.
          </li>
        </ul>
        <p>
          We do <span className="font-semibold">not</span> collect date of
          birth, age, gender, or body weight. &quot;Weight&quot; in the app
          only ever means the weight you lifted during a workout.
        </p>
      </section>

      <section className="mt-8 space-y-2">
        <h2 className="text-xl font-semibold">Tracking and advertising</h2>
        <p>
          SetOptimizer uses no analytics tools, tracking technology, or
          advertising SDKs. We never sell your data.
        </p>
      </section>

      <section className="mt-8 space-y-2">
        <h2 className="text-xl font-semibold">Who do we share data with?</h2>
        <ul className="list-disc space-y-1 pl-6">
          <li>
            <span className="font-semibold">Auth0</span> — handles sign-in
            and identity.
          </li>
          <li>
            <span className="font-semibold">SQLite Cloud</span> — stores
            your account and training data.
          </li>
          <li>
            <span className="font-semibold">Vercel</span> — hosts the app
            and its API.
          </li>
        </ul>
        <p>
          The Vipps link in the app takes you to Vipps&apos; own payment page
          for voluntary donations. SetOptimizer does not share any
          information with Vipps.
        </p>
      </section>

      <section className="mt-8 space-y-2">
        <h2 className="text-xl font-semibold">Storage and deletion</h2>
        <p>
          You can delete your account from the app at any time. This
          immediately and permanently deletes all training blocks, exercises,
          and other data tied to your account.
        </p>
      </section>

      <section className="mt-8 space-y-2">
        <h2 className="text-xl font-semibold">Your rights</h2>
        <p>
          You have the right to access, correct, and delete your personal
          data, as well as the right to data portability. Contact{" "}
          <a href="mailto:support@setoptimizer.com" className="text-red-400 underline">
            support@setoptimizer.com
          </a>{" "}
          to exercise these rights.
        </p>
      </section>
    </div>
  );
}
