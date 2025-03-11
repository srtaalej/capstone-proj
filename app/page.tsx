"use client";

import React from "react";
import Navbar from "./components/landing_page/user_navbar_card";
import HeroSection from "./components/landing_page/hero_card";
import Footer from "./components/landing_page/footer_card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar/>
      <HeroSection/>
      <Footer/>
    </div>
  );
}
