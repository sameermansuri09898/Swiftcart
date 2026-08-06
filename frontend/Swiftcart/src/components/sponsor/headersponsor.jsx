import React from "react"
import SponserBoat from "../../assets/sponsorHeader/baotear.png"
import panmasala from "../../assets/sponsorHeader/paanmasal.png"
export default function HeaderSponsr(){
  return (
    <>
    <section className="header-sponser hidden md:flex justify-between gap-4" style={{marginTop:"15px"}}>
      <div className="sp1 h-[350px] w-[50%] overflow-hidden">
        <a href="">
          <img src={SponserBoat} alt="" className="h-full w-full"/>
        </a>
      </div>
      <div className="sp2 h-[350px] w-[50%] overflow-hidden">
        <a href="">
          <img src={panmasala} alt="" className="h-full w-full"/>
        </a>
      </div>
    </section>
    </>
  )
}