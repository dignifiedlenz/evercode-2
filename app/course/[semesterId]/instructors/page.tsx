"use client";

import { useState, useEffect } from "react";
import courseData from "@/app/_components/(semester1)/courseData";
import dynamic from "next/dynamic";

// Dynamically import ReactPlayer with no SSR to prevent hydration issues
const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

export default function InstructorsPage() {
  // Get the semester ID directly from the pathname
  const [semesterId, setSemesterId] = useState<string>("");
  const [selectedInstructor, setSelectedInstructor] = useState<number | null>(null);
  const [playerReady, setPlayerReady] = useState(false);
  
  useEffect(() => {
    // Extract semesterId from the URL path when component mounts
    const pathSegments = window.location.pathname.split('/');
    setSemesterId(pathSegments[2] || "");
  }, []);
  
  // Find semester data
  const currentSemester = parseInt(semesterId.replace('semester-', ''), 10) || 1;
  const semester = courseData.find(sem => sem.id === `semester-${currentSemester}`);
  const instructors = semester?.instructors || [];
  
  return (
    <div className="p-8 backdrop-blur-sm bg-black/30 rounded-lg max-w-5xl mx-auto mt-16">
      <h1 className="text-4xl font-morion text-white mb-8">Meet Your Instructors</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {instructors.map((instructor, index) => (
          <div 
            key={instructor.id} 
            className="bg-white/5 p-6 rounded-lg border border-white/10 hover:border-secondary/50 transition-colors cursor-pointer"
            onClick={() => setSelectedInstructor(index)}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-secondary/30">
                <img 
                  src={instructor.profileImage} 
                  alt={instructor.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-xl text-white font-semibold">{instructor.name}</h2>
                <p className="text-secondary">{instructor.role}</p>
              </div>
            </div>
            <p className="text-white/70">{instructor.description}</p>
            <div className="mt-4 text-sm text-secondary flex items-center gap-1">
              <span>Watch Introduction</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        ))}
      </div>
      
      {/* Instructor Video Modal */}
      {selectedInstructor !== null && instructors[selectedInstructor] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative bg-zinc-900 rounded-lg overflow-hidden w-full max-w-3xl">
            <button 
              onClick={() => setSelectedInstructor(null)}
              className="absolute top-3 right-3 z-10 text-white/60 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="aspect-video bg-black">
              <ReactPlayer
                url={instructors[selectedInstructor].introductionVideo}
                controls
                width="100%"
                height="100%"
                playing={false}
                onReady={() => setPlayerReady(true)}
                onError={(error) => console.error("Video player error:", error)}
                config={{
                  file: {
                    attributes: {
                      controlsList: 'nodownload',
                      onContextMenu: (e: React.MouseEvent) => e.preventDefault()
                    }
                  }
                }}
              />
            </div>
            
            <div className="p-6">
              <h2 className="text-xl text-white font-semibold mb-2">
                {instructors[selectedInstructor].name}
              </h2>
              <p className="text-secondary mb-4">{instructors[selectedInstructor].role}</p>
              <p className="text-white/70">{instructors[selectedInstructor].description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 