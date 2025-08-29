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
    <section className="py-16 sm:py-20 text-center">
      <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl py-10">
        Our <span className="text-indigo-400">Merchants</span>
      </h2>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* <div className="mx-auto grid max-w-lg grid-cols-2 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-3 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-6"> */}

        <div
          style={{
            height: "200px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <LogoLoop
            logos={imageLogos}
            speed={120}
            direction="left"
            logoHeight={80}
            gap={40}
            pauseOnHover
            scaleOnHover
            fadeOut
            fadeOutColor="#ffffff"
            ariaLabel="Technology partners"
          />
        </div>
      </div>
    </section>
  );
}
