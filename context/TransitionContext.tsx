"use client";

import React, { useState, createContext } from "react"
import gsap from "gsap"

const TransitionContext = createContext({})

const TransitionProvider = ({ children }: { children: React.ReactNode }) => {
  const [timeline, setTimeline] = useState(() =>
    gsap.timeline({ paused: true })
  )

  return (
    <TransitionContext.Provider
      value={{
        timeline,
        setTimeline,
      }}
    >
      {children}
    </TransitionContext.Provider>
  )
}

export { TransitionContext, TransitionProvider }