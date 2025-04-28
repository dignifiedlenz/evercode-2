"use client";

import courseData from "@/app/_components/(semester1)/courseData";
import { useParams } from "next/navigation";
import { useTransitionRouter } from "next-view-transitions";
import { useEffect, useRef, useState, useCallback } from "react";
// Import Server Actions and useProgress hook
import { getUserProgress, saveVideoProgress, saveUnitProgress } from "@/app/actions/progress";
import { useProgress } from "@/app/_components/ProgressClient"; 
import { toast } from 'sonner';
import CustomLink from "@/app/_components/CustomLink";
import { Play, Pause } from 'lucide-react'; // Import icons
import UnitHeader from "../_components/UnitHeader";
import { ChevronUp, ChevronDown } from 'lucide-react';

// Helper function to format time (e.g., 01:30)
const formatTime = (timeInSeconds: number): string => {
  if (isNaN(timeInSeconds) || timeInSeconds < 0) return '00:00';
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export default function VideoPage() {
  const { semesterId, chapterId, unitId } = useParams();
  const router = useTransitionRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null); // Ref for the main player container
  const lastSaveTimeRef = useRef<number>(0);
  const [isLoading, setIsLoading] = useState(true); 
  const [showCompletionOverlay, setShowCompletionOverlay] = useState(false);
  
  // Video Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoAspectRatio, setVideoAspectRatio] = useState<number>(16/9); // Default to 16:9
  const [isNotesOpen, setIsNotesOpen] = useState(false);

  const { 
    progress: progressData, 
    loading: isLoadingProgress, 
    error: progressError, 
    trackVideoProgress,
    trackUnitProgress 
  } = useProgress();

  const semester = courseData.find(sem => sem.id === semesterId);
  const chapter = semester?.chapters.find(ch => ch.id === chapterId);
  const unit = chapter?.units.find(u => u.id === unitId);
  const currentUnitIndex = chapter?.units.findIndex(u => u.id === unitId) ?? -1;

  const SAVE_INTERVAL = 5000; // Save progress every 5 seconds

  if (!unit?.video) {
    return <div className="text-white">Video not found</div>;
  }

  // Initialize lastSaveTimeRef still useful for local logic if needed
  useEffect(() => {
    lastSaveTimeRef.current = Date.now();
  }, []);

  // Load initial video state from the hook's progressData
  useEffect(() => {
    if (!isLoadingProgress && progressData && videoRef.current) {
        const videoProgress = progressData.videoProgress.find(vp => vp.unitId === unitId);
        const isDBVideoCompleted = progressData.unitProgress?.find(up => up.unitId === unitId)?.videoCompleted === true;
        if (videoProgress && !isDBVideoCompleted) {
          if (Math.abs(videoRef.current.currentTime - videoProgress.currentTime) > 2) {
             console.log(`Setting video time from progress: ${videoProgress.currentTime}`);
             videoRef.current.currentTime = videoProgress.currentTime;
             setCurrentTime(videoProgress.currentTime); // Sync state
          }
        }
       setIsLoading(false); 
    } else if (!isLoadingProgress && !progressData) {
        setIsLoading(false);
    }
  }, [unitId, isLoadingProgress, progressData]);

  // Toggle Play/Pause
  const togglePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused || video.ended) {
      video.play().catch(err => console.error("Error playing video:", err));
    } else {
      video.pause();
    }
  }, []);

  // Handle seek bar changes
  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const newTime = parseFloat(event.target.value);
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Handle video events to update state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => {
      setIsPlaying(true);
      setShowCompletionOverlay(false);
    };
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      setShowCompletionOverlay(true);
    };
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      const aspectRatio = video.videoWidth / video.videoHeight;
      setVideoAspectRatio(aspectRatio);
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('durationchange', handleLoadedMetadata);

    // Initialize state from video element
    setIsPlaying(!video.paused);
    setCurrentTime(video.currentTime);
    if (video.duration) {
      setDuration(video.duration);
    }

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('durationchange', handleLoadedMetadata);
    };
  }, []);

  // Effect for progress tracking - listens to player state
  useEffect(() => {
    if (!videoRef.current) return;

    const handleVideoProgress = () => {
      if (!videoRef.current || !isPlaying || duration <= 0) return;

      const now = Date.now();
      const videoElement = videoRef.current;
      const currentVideoTime = videoElement.currentTime;
      const timeRemaining = duration - currentVideoTime;

      // Show completion overlay and handle completion when 10 seconds remain
      if (timeRemaining <= 10 && !showCompletionOverlay) {
        console.log('Video nearing completion, showing overlay');
        setShowCompletionOverlay(true);
        // Mark video as completed
        trackVideoProgress({ 
          unitId: unitId as string, 
          currentTime: currentVideoTime, 
          duration: duration, 
          completed: true 
        });
        trackUnitProgress({ 
          unitId: unitId as string, 
          videoCompleted: true 
        });
        toast.success('Video completed! Proceeding to questions shortly...', { 
          position: 'bottom-center', 
          duration: 5000 
        });
      } else if (now - lastSaveTimeRef.current > SAVE_INTERVAL) {
        // Regular progress saving
        console.log(`Saving video progress at ${currentVideoTime.toFixed(2)}s`);
        trackVideoProgress({
          unitId: unitId as string,
          currentTime: currentVideoTime,
          duration,
          completed: showCompletionOverlay // Use overlay state to determine completion
        });
        lastSaveTimeRef.current = now;
      }
    };

    // Set up interval for progress tracking
    const progressInterval = setInterval(handleVideoProgress, 1000);

    // Handle video end
    const handleVideoEnd = () => {
      console.log('Video ended, navigating to quiz');
      setShowCompletionOverlay(true);
      // Ensure final progress is saved
      trackVideoProgress({ 
        unitId: unitId as string, 
        currentTime: duration, 
        duration: duration, 
        completed: true 
      });
      trackUnitProgress({ 
        unitId: unitId as string, 
        videoCompleted: true 
      });
      // Navigate to quiz after a short delay
      setTimeout(() => {
        if (unit?.video?.questions?.length > 0) {
          const url = `/course/${semesterId}/${chapterId}/${unitId}/quiz`;
          router.push(url, {
            onTransitionReady: () => {
              // Animate out (old page)
              document.documentElement.animate(
                [
                  { transform: 'translateY(0)', opacity: 1 },
                  { transform: 'translateY(-100%)', opacity: 0 }
                ],
                {
                  duration: 1000,
                  easing: "cubic-bezier(0.4, 0, 0.2, 1)",
                  fill: "forwards",
                  pseudoElement: "::view-transition-old(content)"
                }
              );

              // Animate in (new page)
              document.documentElement.animate(
                [
                  { transform: 'translateY(100%)', opacity: 0 },
                  { transform: 'translateY(0)', opacity: 1 }
                ],
                {
                  duration: 1000,
                  easing: "cubic-bezier(0.4, 0, 0.2, 1)",
                  fill: "forwards",
                  pseudoElement: "::view-transition-new(content)"
                }
              );
            }
          });
        } else {
          // Handle case where there are no questions
          toast.info('No questions available for this video.', {
            position: 'bottom-center',
            duration: 3000
          });
        }
      }, 2000); // 2 second delay before navigation
    };

    videoRef.current.addEventListener('ended', handleVideoEnd);

    return () => {
      clearInterval(progressInterval);
      if (videoRef.current) {
        videoRef.current.removeEventListener('ended', handleVideoEnd);
      }
    };
  }, [isPlaying, duration, showCompletionOverlay, unitId, semesterId, chapterId, unit, router, trackVideoProgress, trackUnitProgress]);

  const showCompletionBanner = progressData?.unitProgress?.find(up => up.unitId === unitId)?.videoCompleted === true;

  return (
    <div className="relative min-h-screen pb-24">
      <UnitHeader />
      <div className="h-[calc(100vh-6rem)] flex items-center justify-center">
        <div className="w-full max-w-4xl mx-auto">
          <div 
            ref={playerContainerRef}
            className="relative group bg-black rounded-lg sm:rounded-xl overflow-hidden shadow-2xl"
            style={{ 
              maxWidth: '75vw'
            }}
          >
            {/* Video Section */}
            <div 
              className={`relative w-full transition-all duration-300 ${
                isNotesOpen ? 'h-1/2' : 'h-full'
              }`}
            >
              {(isLoading || isLoadingProgress) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
                  <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-white"></div>
                </div>
              )}
              <video 
                ref={videoRef}
                src={unit.video.videoUrl}
                className="w-full h-full object-cover"
                playsInline
                preload="metadata"
                onClick={togglePlayPause}
                onContextMenu={(e) => e.preventDefault()}
              />
              
              {/* Completion Overlay */}
              {showCompletionOverlay && (
                <div className="absolute bottom-8 right-8 flex flex-col gap-2 bg-gradient-to-br from-black/80 via-black/60 to-transparent rounded-xl p-4 z-30 pointer-events-none animate-fade-in backdrop-blur-sm">
                  <p className="text-base text-white font-morion-medium">Video completed!</p>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-secondary animate-pulse" />
                    <p className="text-base text-white font-morion-light">
                      {unit?.video?.questions?.length > 0 
                        ? "Proceeding to questions..."
                        : "Moving to next unit..."}
                    </p>
                  </div>
                </div>
              )}

              {/* Custom Controls Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-40">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <button onClick={togglePlayPause} className="text-white p-1 focus:outline-none focus:ring-2 focus:ring-secondary rounded">
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                  </button>
                  <span className="text-white text-xs font-mono select-none w-10 text-center">
                    {formatTime(currentTime)}
                  </span>
                  <input 
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime || 0}
                    onChange={handleSeek}
                    className="flex-grow h-1 sm:h-[5px] rounded-full cursor-pointer appearance-none bg-white/30 accent-secondary"
                    style={{
                      background: `linear-gradient(to right, var(--color-secondary) ${((currentTime / duration) * 100) || 0}%, rgba(255, 255, 255, 0.3) ${((currentTime / duration) * 100) || 0}%)`
                    }}
                  />
                  <span className="text-white text-xs font-mono select-none w-10 text-center">
                    {formatTime(duration)}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div 
              className={`bg-black/50 border-t border-white/10 group transition-all duration-300 ${
                isNotesOpen ? 'h-[20vh] opacity-100' : 'h-0 opacity-0'
              }`}
            >
              <div className="h-full w-full flex flex-col">
                <div 
                  className="flex items-center justify-between p-4 border-b border-white/10 cursor-pointer hover:bg-black/60"
                  onClick={() => setIsNotesOpen(false)}
                >
                  <h3 className="text-secondary font-neima text-lg">Notes (Coming Soon)</h3>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 px-4 py-2 bg-black/50 rounded-full hover:bg-black/70 text-white text-sm">
                    <ChevronDown className="w-4 h-4" />
                    <span>Hide Notes</span>
                  </button>
                </div>
                <div 
                  className="flex-1 p-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <textarea
                    placeholder="Type your notes here..."
                    className="w-full h-full bg-black/30 text-white placeholder-white/40 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notes Toggle Button - Always mounted but controlled by visibility */}
          <button
            onClick={() => setIsNotesOpen(true)}
            className={`mt-4 mx-auto flex items-center gap-2 px-4 py-2 bg-black/20 hover:bg-black/50 rounded-full transition-all duration-300 text-white/40 hover:text-white text-sm group ${
              isNotesOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          >
            <ChevronUp className="w-4 h-4" />
            <span>Show Notes</span>
          </button>
        </div>
      </div>
    </div>
  );
}