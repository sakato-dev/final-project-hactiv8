import Image from "next/image";
import Link from "next/link";

const footerLinks = [
  {
    title: "About us",
    links: [
      { label: "Our Story", href: "/about" },
      { label: "Team", href: "/about#team" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Products",
    links: [
      { label: "Digital Membercard", href: "/products/membercard" },
      { label: "POS Integration", href: "/products/pos" },
      { label: "Mobile App", href: "/products/mobile-app" },
      { label: "Rewards", href: "/products/rewards" },
    ],
  },
  {
    title: "Useful Links",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "Promotions", href: "/promotions" },
      { label: "Partners", href: "/partners" },
    ],
  },
  {
    title: "Social",
    links: [
      { label: "Instagram", href: "https://instagram.com/pointjuaro" },
      { label: "Facebook", href: "https://facebook.com/pointjuaro" },
      { label: "Twitter", href: "https://twitter.com/pointjuaro" },
      { label: "LinkedIn", href: "https://linkedin.com/company/pointjuaro" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-indigo-950/80 via-indigo-900/80 to-indigo-800/80 mt-20 border-t border-indigo-400/20">
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12 py-12">
        {/* Top section with links */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 pb-10 border-b border-indigo-400/10">
          <div className="col-span-2 md:col-span-1 flex flex-col items-start">
            <div className="flex items-center gap-3 mb-4">
              {/* <Image
                src="/logo.png"
                alt="PointJuaro Logo"
                width={100}
                height={64}
                className="rounded-xl shadow-md"
              /> */}
              <span className="text-2xl font-extrabold text-white tracking-tight">
                PointJuaro
              </span>
            </div>
            <p className="text-sm text-indigo-100 max-w-xs">
              The next generation digital membercard and loyalty platform for
              modern businesses and customers.
            </p>
          </div>
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="text-base font-semibold text-indigo-300 uppercase tracking-wider">
                {section.title}
              </h3>
              <ul role="list" className="mt-4 space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      target={section.title === "Social" ? "_blank" : undefined}
                      rel={
                        section.title === "Social"
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className="text-sm text-indigo-100 hover:text-indigo-400 transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {/* Bottom section with copyright */}
        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-indigo-200 gap-2">
          <p>
            &copy; {new Date().getFullYear()} PointJuaro. All Rights Reserved.
          </p>
          <p className="sm:mt-0">Empowering your loyalty journey.</p>
        </div>
      </div>
    </footer>
  );
}
