import Image from "next/image";
import Link from "next/link";

const footerLinks = [
  {
    title: "About us",
    links: ["Jorem", "Sorem", "Qorem", "Korem"],
  },
  {
    title: "Products",
    links: ["Forem ipsum", "Rorem ipsum", "Jorem ipsum", "Torem"],
  },
  {
    title: "Useful Links",
    links: ["Rorem ipsum", "Gorem", "Vorem ipsum"],
  },
  {
    title: "Social",
    links: ["Porem", "Korem", "Worem", "Forem"],
  },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900/50 backdrop-blur-sm mt-20">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {/* Top section with links */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/logo.png"
                alt="PointJuaro Logo"
                width={88}
                height={88}
              />
              {/* <span className="text-xl font-bold">PointJuaro</span> */}
            </div>
            <p className="text-sm text-gray-400 max-w-xs">
              Vorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
          </div>

          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="text-base font-semibold text-white">
                {section.title}
              </h3>
              <ul role="list" className="mt-4 space-y-2">
                {section.links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-sm text-gray-400 hover:text-white"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom section with copyright */}
        <div className="mt-12 border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} PointJuaro. All Rights Reserved.
          </p>
          <p className="mt-4 sm:mt-0">Norem ipsum dolor sit amet consectetur</p>
        </div>
      </div>
    </footer>
  );
}
