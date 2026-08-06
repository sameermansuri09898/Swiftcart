import {React,useState} from 'react'
import Navbar from './components/layout/navbar.jsx'
import CatSliderBottom from './components/swipers/catbottm.jsx'
import ImageCategory from './components/swipers/catgeroyswiper.jsx'
import HeaderSponsr from './components/sponsor/headersponsor.jsx'
export default function App() {
  return (
    <div className="App">
      <Navbar />
         <CatSliderBottom />
         <ImageCategory />
         <HeaderSponsr/>
    </div>
  )
}