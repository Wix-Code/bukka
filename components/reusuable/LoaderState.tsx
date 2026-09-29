"use client";

import Image from "next/image";

export const LogoLoader = () => {
  return (
    <div className="fixed flex items-center justify-center bg-green-100">
      <div className="relative h-[100px] w-[100px] lg:w-[120px] lg:h-[120px] flex items-center justify-center">
        {/* Spinner Ring */}
        <div className="absolute inset-0 rounded-full border-4 border-gray-200 border-t-green-700 animate-spin" />

        {/* Logo in center */}
        <div className="w-[50px] h-[50px] lg:w-[70px] lg:h-[70px] relative">
          <Image
            src={"/images/logo.png"} // <-- put your logo in public folder
            alt="Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
    </div>
  );
};
