import LogoLoop from "./LogoLoop";

const imageLogos = [
  {
    src: "/kopkenlogo.png",
    alt: "Company 1",
    href: "https://kopikenangan.com/",
  },
  {
    src: "/mcdlogo.png",
    alt: "Company 2",
    href: "https://www.mcdonalds.co.id/",
  },
  {
    src: "/sbuxlogo.png",
    alt: "Company 3",
    href: "https://www.starbucks.co.id/",
  },
];

export default function Partners() {
  return (
    <section className="py-16 md:py-24 lg:py-28 bg-transparent">
      {/* Digital Membercard Info Text */}
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12 mb-10 animate-fade-in-up text-center">
        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Connect with Top Merchants
        </h3>
        <p className="text-indigo-100 text-base sm:text-lg max-w-2xl mx-auto">
          Our digital membercard is accepted by leading merchants and partners,
          giving you access to exclusive rewards, seamless transactions, and a
          world of benefits. Enjoy the convenience and security of a digital
          membercard wherever you shop!
        </p>
      </div>
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
        <div className="bg-white/5 rounded-3xl shadow-xl border border-indigo-400/20 py-10 px-4 flex flex-col items-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-8 text-center">
            Our <span className="text-indigo-400">Merchants</span>
          </h2>
          <div className="w-full flex justify-center">
            <div
              style={{
                height: "140px",
                width: "100%",
                position: "relative",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
              }}
            >
              <LogoLoop
                logos={imageLogos}
                speed={120}
                direction="left"
                logoHeight={100}
                gap={40}
                pauseOnHover
                scaleOnHover
                fadeOut
                fadeOutColor="#ffffff"
                ariaLabel="Technology partners"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
