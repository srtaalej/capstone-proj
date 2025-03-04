"use client";

import React from "react";
import Navbar from "../landing_page/user_navbar_card";
import FaqCard from "./faq_card";
import Footer from "../landing_page/footer_card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar/>
        <FaqCard/>
      <Footer/>
    </div>
  );
}
