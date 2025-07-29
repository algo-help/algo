'use client';

import Image from "next/image";

export default function LandingPage() {

  return (
    <div className="h-[calc(100vh-64px-2rem)] flex items-center justify-center -m-4">
      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Image
                src="https://portal.algocare.me/logo.svg"
                alt="Algocare"
                width={160}
                height={48}
                className="h-auto"
              />
            </div>
            
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              통합 관리 시스템
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
}