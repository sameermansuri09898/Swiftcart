import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { MapPin } from "lucide-react";

const footerLinks = {
  usefulLinks: [
    { label: "Blog", href: "#" },
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "FAQs", href: "#" },
    { label: "Security", href: "#" },
    { label: "Contact", href: "#" },
    { label: "Sitemap", href: "#" },
  ],
  categories: [
    { label: "Fruits & Vegetables", href: "#" },
    { label: "Dairy, Bread & Eggs", href: "#" },
    { label: "Atta, Rice & Dals", href: "#" },
    { label: "Masala & Dry Fruits", href: "#" },
    { label: "Breakfast & Sauces", href: "#" },
    { label: "Packaged Food", href: "#" },
    { label: "Tea, Coffee & More", href: "#" },
  ],
  customerService: [
    { label: "Careers", href: "#" },
    { label: "News", href: "#" },
    { label: "Investors", href: "#" },
    { label: "Refer & Earn", href: "#" },
    { label: "Delivery Partner", href: "#" },
    { label: "Franchise", href: "#" },
  ],
  cities: [
    "Delhi",
    "Mumbai",
    "Bengaluru",
    "Hyderabad",
    "Chennai",
    "Kolkata",
    "Pune",
    "Ahmedabad",
    "Jaipur",
    "Lucknow",
    "Chandigarh",
    "Indore",
  ],
};

const socialLinks = [
  { icon: FaFacebookF, href: "#", label: "Facebook" },
  { icon: FaInstagram, href: "#", label: "Instagram" },
  { icon: FaXTwitter, href: "#", label: "Twitter" },
  { icon: FaLinkedinIn, href: "#", label: "LinkedIn" },
];

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-gray-100 mt-10" style={{marginTop:"15px"}}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Top: link columns */}
        <div
          className="
            grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5
            gap-x-6 gap-y-10
            py-10 md:py-14
          "
        >
          {/* Brand column */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1 flex flex-col gap-4">
            <span className="text-2xl font-extrabold text-violet-600 tracking-tight">
              Swiftcart
            </span>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              Groceries and more, delivered to your door in minutes.
            </p>

            Social icons
            <div className="flex items-center gap-3 mt-1">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="
                    w-8 h-8 flex items-center justify-center
                    rounded-full bg-gray-50 border border-gray-100
                    text-gray-500
                    hover:bg-violet-50 hover:text-violet-600 hover:border-violet-200
                    transition-all duration-200
                  "
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Useful links */}
          <FooterColumn title="Useful links" links={footerLinks.usefulLinks} />

          {/* Categories */}
          <FooterColumn title="Categories" links={footerLinks.categories} />

          {/* Customer service */}
          <FooterColumn
            title="Customer service"
            links={footerLinks.customerService}
          />

          {/* App download */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold text-gray-900">
              Download the app
            </h4>

            <a
              href="#"
              className="
                flex items-center gap-2
                border border-gray-200 rounded-xl
                px-3 py-2
                hover:border-violet-300 hover:bg-violet-50
                transition-all duration-200
              "
            >
              <div className="w-7 h-7 rounded-md bg-gray-900 flex items-center justify-center text-white text-[10px] font-bold">
                
              </div>
              <div className="leading-tight">
                <p className="text-[9px] text-gray-500">Download on the</p>
                <p className="text-xs font-semibold text-gray-900">
                  App Store
                </p>
              </div>
            </a>

            <a
              href="#"
              className="
                flex items-center gap-2
                border border-gray-200 rounded-xl
                px-3 py-2
                hover:border-violet-300 hover:bg-violet-50
                transition-all duration-200
              "
            >
              <div className="w-7 h-7 rounded-md bg-gray-900 flex items-center justify-center text-white text-[10px] font-bold">
                ▶
              </div>
              <div className="leading-tight">
                <p className="text-[9px] text-gray-500">Get it on</p>
                <p className="text-xs font-semibold text-gray-900">
                  Google Play
                </p>
              </div>
            </a>
          </div>
        </div>

        {/* City links */}
        <div className="border-t border-gray-100 py-6">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={14} className="text-gray-400" />
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Swiftcartin your city
            </h4>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {footerLinks.cities.map((city) => (
              <a
                key={city}
                href="#"
                className="
                  text-xs text-gray-500
                  hover:text-violet-600
                  transition-colors duration-200
                "
              >
                Swiftcart {city}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="
            border-t border-gray-100
            py-5
            flex flex-col sm:flex-row
            items-center justify-between
            gap-3
          "
        >
          <p className="text-xs text-gray-400 text-center sm:text-left">
            © {new Date().getFullYear()} Swiftcart Marketplace Pvt Ltd. All
            rights reserved.
          </p>

          <div className="flex items-center gap-4">
            <a
              href="#"
              className="text-xs text-gray-400 hover:text-violet-600 transition-colors duration-200"
            >
              Privacy policy
            </a>
            <a
              href="#"
              className="text-xs text-gray-400 hover:text-violet-600 transition-colors duration-200"
            >
              Terms of use
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div className="flex flex-col gap-3">
      <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
      <ul className="flex flex-col gap-2.5">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className="
                text-xs text-gray-500
                hover:text-violet-600
                transition-colors duration-200
              "
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}