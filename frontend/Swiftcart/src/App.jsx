import {React,useState} from 'react'
import Navbar from './components/layout/navbar.jsx'
import CatSliderBottom from './components/swipers/catbottm.jsx'

export default function App() {
  return (
    <div className="App">
      <Navbar />
        <CatSliderBottom />
    </div>
  )
}