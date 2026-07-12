import PageContainer from "./PageContainer";

const steps = [
  {
    title: "Create Your Routine",
    description:
      "Choose from templates OR build your own custom training block.",
  },
  {
    title: "Begin Your Training",
    description: "Get target reps and weights based on previous performance.",
  },
  {
    title: "Evolve and Improve",
    description:
      "Fully customizable workouts let you change things on the fly when needed in the gym.",
  },
];

function LandingPage() {
  const baseUrl = import.meta.env.VITE_API_URL;

  return (
    <div className="flex min-w-0 flex-col">
      <section
        data-testid="landing-hero"
        className="relative isolate aspect-[2/3] w-full overflow-hidden bg-gradient-to-r from-darkestGray via-darkBackgroundRed to-darkestGray md:aspect-auto md:min-h-[calc(110svh-3rem)] lg:min-h-[min(150vw,2600px)]"
      >
        <img
          data-testid="landing-hero-image"
          src="/images/edgar-chaparro-sHfo3WOgGTU-unsplash.jpg"
          alt="Athlete training with battle ropes"
          className="absolute inset-0 h-full w-full object-contain object-top md:object-center"
        />
        <div
          data-testid="landing-hero-content"
          className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-45 px-4 text-center lg:justify-start lg:pt-[32svh]"
        >
          <h1 className="text-4xl text-white md:text-6xl">
            Simplifying Muscle Growth
          </h1>
          <p className="mt-4 text-lg text-gray-300 md:text-xl">
            Eliminate the Guesswork. Achieve Results.
          </p>
          <a
            href={`${baseUrl}/auth0/register`}
            className="mt-6 rounded-full bg-red-600 px-8 py-3 text-lg font-semibold text-white transition duration-300 hover:bg-red-700"
          >
            Register here
          </a>
        </div>
      </section>

      <div data-testid="landing-features" className="bg-darkestGray">
        <PageContainer size="standard" className="px-4 py-12 md:px-6 md:py-16">
          <div
            data-testid="landing-feature-content"
            className="space-y-16 lg:space-y-24"
          >
            <section className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
              <img
                data-testid="target-recommendation-image"
                src="/images/targetweightandreps.png"
                alt="Target reps and weight recommendations"
                width="375"
                height="782"
                className="mx-auto h-auto w-full max-w-[26rem] shadow-lg"
              />
              <div className="text-center lg:text-left">
                <h2 className="text-3xl font-bold text-white">
                  Know Your Next Target
                </h2>
                <p className="mt-4 text-lg text-gray-300 md:text-xl">
                  Get your target reps and weight based on last week&apos;s
                  performance.
                </p>
              </div>
            </section>

            <section className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
              <img
                data-testid="landing-dumbbells-image"
                src="/images/dumbbells.jpg"
                alt="Dumbbells on a gym rack"
                width="1280"
                height="1919"
                className="mx-auto h-auto w-full max-w-[32rem] shadow-lg grayscale lg:order-2"
              />
              <div className="text-center lg:order-1 lg:text-left">
                <h2 className="text-3xl font-bold text-white md:text-4xl">
                  Progress Even When The Weights Are Taken
                </h2>
                <p className="mt-4 text-lg text-gray-300">
                  Keep the progression moving with targets that adapt to the
                  equipment available today.
                </p>
              </div>
            </section>

            <section className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
              <img
                src="/images/lastweeksreps.png"
                alt="Previous workout performance"
                width="358"
                height="403"
                className="mx-auto h-auto w-full max-w-[34rem] shadow-lg"
              />
              <div className="text-center lg:text-left">
                <h2 className="text-3xl font-bold text-white">
                  Build On Every Session
                </h2>
                <p className="mt-4 text-lg text-gray-300">
                  No need to wait. Continue your progress with available
                  weights.
                </p>
              </div>
            </section>

            <section className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
              <img
                src="/images/targetreps.png"
                alt="Adjusted target for different weights"
                width="358"
                height="403"
                className="mx-auto h-auto w-full max-w-[34rem] shadow-lg lg:order-2"
              />
              <div className="text-center lg:order-1 lg:text-left">
                <h2 className="text-3xl font-bold text-white">
                  Adapt Without Guesswork
                </h2>
                <p className="mt-4 text-lg text-gray-300">
                  The app calculates ideal weight and reps for you. If the 16 kg
                  dumbbells are occupied, your target can adapt to the available
                  14 kg pair.
                </p>
              </div>
            </section>

            <section className="text-center">
              <h2 className="mb-8 text-3xl font-bold text-white">
                How it works
              </h2>
              <div className="grid gap-6 lg:grid-cols-3">
                {steps.map((step, index) => (
                  <article
                    key={step.title}
                    className="flex min-w-0 flex-col items-center bg-darkGray p-6 text-center md:border md:border-gray-700"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-600 text-xl font-bold text-white">
                      {index + 1}
                    </div>
                    <h3 className="mt-4 text-xl font-bold text-white">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-gray-300">{step.description}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="relative min-h-[60svh] overflow-hidden shadow-xl">
              <img
                src="/images/pexels-scottwebb-28076(1).jpg"
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-55 px-4 text-center">
                <h2 className="text-4xl text-white md:text-6xl">
                  Simplifying Muscle Growth
                </h2>
                <p className="mt-4 text-lg text-gray-300 md:text-xl">
                  Eliminate the Guesswork. Achieve Results.
                </p>
                <a
                  href={`${baseUrl}/auth0/register`}
                  className="mt-6 rounded-full bg-red-600 px-8 py-3 text-lg font-semibold text-white transition duration-300 hover:bg-red-700"
                >
                  Register now
                </a>
              </div>
            </section>
          </div>
        </PageContainer>
      </div>
    </div>
  );
}

export default LandingPage;
