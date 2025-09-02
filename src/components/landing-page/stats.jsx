export default function Stats() {
  // Data statistik yang relevan untuk aplikasi membercard
  const stats = [
    { value: "1.5M+", label: "Active Digital Membercard Users" },
    { value: "250+", label: "Partner Merchants" },
    { value: "3M+", label: "Rewards Redeemed" },
    { value: "4.8/5", label: "User Rating" },
  ];

  return (
    <section className="py-16 md:py-24 lg:py-28 bg-transparent">
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
        <div className="text-center mb-14 animate-fade-in-up">
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-2 drop-shadow-lg">
            <span className="text-white">Join a Thriving </span>
            <span className="text-indigo-400">
              Digital Membercard Ecosystem
            </span>
          </h2>
          <p className="text-indigo-100 text-base sm:text-lg max-w-2xl mx-auto">
            Experience the benefits of a digital membercard: instant rewards,
            seamless transactions, and exclusive access to top merchants. See
            why millions trust our platform!
          </p>
        </div>
        <div className="mx-auto max-w-5xl p-8 bg-white/5 rounded-3xl shadow-xl border border-indigo-400/20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-10 text-center">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-center gap-2"
              >
                <dd className="text-white text-5xl font-extrabold drop-shadow-lg">
                  {stat.value}
                </dd>
                <dt className="text-indigo-100 text-lg font-medium">
                  {stat.label}
                </dt>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
