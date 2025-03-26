"use client";

import courseData from "@/app/_components/(semester1)/courseData";
import Link from "next/link";
import { useParams } from "next/navigation";
import Image from "next/image";

export default function ChapterPage() {
  const { semesterId, chapterId } = useParams();
  
  const semester = courseData.find(sem => sem.id === semesterId);
  const chapter = semester?.chapters.find(ch => ch.id === chapterId);

  if (!chapter) {
    return <div className="text-white">Chapter not found</div>;
  }

  return (
    <div className="relative min-h-screen">
      {/* Background Image */}
      <div className="fixed inset-0 z-10">
        <Image
          src={chapter.backgroundImage}
          alt={chapter.title}
          fill
          className="object-cover"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/65" />
        {/* Vignette overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-white font-morion p-8 max-w-4xl mx-auto pt-32">
        <h1 className="text-4xl font-light mb-4">{chapter.title}</h1>
        <p className="text-gray-300 mb-12 font-light">{chapter.description}</p>

        <h2 className="text-2xl font-semibold mb-6 text-secondary">Units:</h2>
        <div className="grid grid-cols-1 gap-4">
          {chapter.units.map(unit => (
            <Link 
              key={unit.id} 
              href={`/course/${semesterId}/${chapterId}/${unit.id}`}
              className="block bg-black/40 backdrop-blur-sm border border-white/10 
                       rounded-sm p-6 hover:bg-black/50 transition-all
                       hover:border-white/20"
            >
              <h3 className="text-xl font-light">{unit.title}</h3>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 