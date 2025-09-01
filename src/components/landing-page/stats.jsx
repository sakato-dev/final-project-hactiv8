export default function Stats() {
  // Data statistik yang relevan untuk aplikasi membercard
  const stats = [
    { value: "1.5M+", label: "Active Members" },
    { value: "250+", label: "Partner Merchants" },
    { value: "3M+", label: "Rewards Redeemed" },
    { value: "4.8/5", label: "User Rating" },
  ];

  return (
    <section>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold">
            <span className="text-white">Join a Thriving </span>
            <span className="text-blue-500">Loyalty Ecosystem</span>
          </h2>
        </div>

        {/* Ini bagian yang diubah untuk efek transparan */}
        <div className="mx-auto max-w-5xl p-8 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-10 text-center">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-center gap-2"
              >
                <dd className="text-white text-5xl font-bold">{stat.value}</dd>
                <dt className="text-gray-300 text-lg font-normal">
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
