"use client";

import courseData from "@/app/_components/(semester1)/courseData";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { saveVideoProgress } from "@/lib/progress-service";
import axios from 'axios';

export default function VideoPage() {
  const { semesterId, chapterId, unitId } = useParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastSaveTimeRef = useRef<number>(Date.now());
  const saveIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isPlayingRef = useRef<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const semester = courseData.find(sem => sem.id === semesterId);
  const chapter = semester?.chapters.find(ch => ch.id === chapterId);
  const unit = chapter?.units.find(u => u.id === unitId);

  if (!unit?.video) {
    return <div className="text-white">Video not found</div>;
  }

  // Load saved progress when component mounts
  useEffect(() => {
    const loadSavedProgress = async () => {
      try {
        const response = await axios.get('/api/progress/video', {
          params: {
            unitId,
            chapterId
          }
        });
        
        if (response.data && videoRef.current) {
          videoRef.current.currentTime = response.data.currentTime;
        }
      } catch (error) {
        console.error('Error loading video progress:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedProgress();
  }, [unitId, chapterId]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const currentTime = video.currentTime;
      const duration = video.duration;
      const now = Date.now();
      
      // Only save if 10 seconds have passed since last save and video is playing
      if (isPlayingRef.current && now - lastSaveTimeRef.current >= 10000) {
        saveVideoProgress(
          unitId as string,
          chapterId as string,
          unit.video.id,
          currentTime,
          duration
        );
        lastSaveTimeRef.current = now;
      }
      
      // Mark as complete when video reaches 90%
      if (currentTime >= duration * 0.9) {
        saveVideoProgress(
          unitId as string,
          chapterId as string,
          unit.video.id,
          currentTime,
          duration
        );
      }
    };

    const handlePlay = () => {
      isPlayingRef.current = true;
      // Save initial progress when video starts playing
      saveVideoProgress(
        unitId as string,
        chapterId as string,
        unit.video.id,
        video.currentTime,
        video.duration
      );
    };

    const handlePause = () => {
      isPlayingRef.current = false;
      // Save final progress when video is paused
      saveVideoProgress(
        unitId as string,
        chapterId as string,
        unit.video.id,
        video.currentTime,
        video.duration
      );
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
    };
  }, [unitId, chapterId, unit.video.id]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-custom1 text-white text-center mb-8">
          {unit.video.title}
        </h1>
        <div className="aspect-video bg-black rounded-xl overflow-hidden relative shadow-2xl">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          )}
          <video 
            ref={videoRef}
            controls 
            src={unit.video.videoUrl}
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  );
} 