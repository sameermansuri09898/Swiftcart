import React from "react";
import SponserBoat from "../../assets/sponsorHeader/baotear.png";
import panmasala from "../../assets/sponsorHeader/paanmasal.png";

export default function HeaderSponsr() {
  return (
    <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-4 hidden md:flex gap-4 lg:gap-6">
      {/* Sponsor Box 1 */}
      <div className="flex-1 h-[220px] lg:h-[300px] xl:h-[350px] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100">
        <a href="#" className="block w-full h-full group">
          <img
            src={SponserBoat}
            alt="Boat Sponsor"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </a>
      </div>

      {/* Sponsor Box 2 */}
      <div className="flex-1 h-[220px] lg:h-[300px] xl:h-[350px] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100">
        <a href="#" className="block w-full h-full group">
          <img
            src={panmasala}
            alt="Pan Masala Sponsor"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </a>
      </div>
    </section>
  );
}