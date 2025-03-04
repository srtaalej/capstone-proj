"use client";

import React from "react";
import Navbar from "./components/landing_page/user_navbar_card";


export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar/>
      <main className="flex flex-col items-center justify-center flex-1 p-6">
        <h1 className="text-5xl font-semibold text-gray-800 my-8 text-center">
          Block Vote
        </h1>
        <p className="text-xl text-gray-600 mb-6 text-center">
          A decentralized voting system using blockchain technology.
        </p>
      </main>
    </div>
  );
}
