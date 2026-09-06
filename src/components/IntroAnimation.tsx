import React, { useEffect, useState } from 'react';

interface IntroAnimationProps {
  onComplete: () => void;
}

export function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const exitTimer = window.setTimeout(() => {
      setExiting(true);
    }, 4300);

    const completeTimer = window.setTimeout(() => {
      onComplete();
    }, 5000);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(completeTimer);
    };
  }, [onComplete]);

  const handleSkip = () => {
    setExiting(true);

    window.setTimeout(() => {
      onComplete();
    }, 500);
  };

  return (
    <div className={`tg-intro ${exiting ? 'tg-intro-exit' : ''}`}>
      {/* Background */}
      <div className="tg-stars" />
      <div className="tg-stars tg-stars-delayed" />

      {/* Ambient glow */}
      <div className="tg-intro-glow tg-intro-glow-one" />
      <div className="tg-intro-glow tg-intro-glow-two" />

      {/* Earth system */}
      <div className="tg-earth-system">

        {/* Orbit */}
        <div className="tg-orbit">
          <div className="tg-satellite-wrap">
            <div className="tg-scan-beam" />

            <svg
              className="tg-satellite"
              viewBox="0 0 120 70"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Solar panels */}
              <rect x="4" y="25" width="34" height="20" rx="2" fill="#162033" stroke="#7DD3FC" strokeWidth="1.5" />
              <path d="M10 25V45M17 25V45M24 25V45M31 25V45" stroke="#38BDF8" strokeWidth="0.7" />
              
              <rect x="82" y="25" width="34" height="20" rx="2" fill="#162033" stroke="#7DD3FC" strokeWidth="1.5" />
              <path d="M88 25V45M95 25V45M102 25V45M109 25V45" stroke="#38BDF8" strokeWidth="0.7" />

              {/* Satellite body */}
              <rect x="38" y="18" width="44" height="34" rx="6" fill="#CBD5E1" stroke="#F8FAFC" strokeWidth="1.5" />
              <rect x="45" y="24" width="30" height="22" rx="3" fill="#0F172A" />
              <rect x="50" y="28" width="20" height="14" rx="2" fill="#164E63" />

              {/* Antenna */}
              <path d="M60 18V7" stroke="#E2E8F0" strokeWidth="2" />
              <circle cx="60" cy="5" r="3" fill="#F8FAFC" />

              {/* Signal */}
              <path
                d="M53 4C57 1 63 1 67 4"
                stroke="#38BDF8"
                strokeWidth="1"
                strokeLinecap="round"
                opacity="0.8"
              />
            </svg>
          </div>
        </div>

        {/* Earth */}
        <div className="tg-earth">
          <div className="tg-earth-atmosphere" />

          <div className="tg-earth-surface">
            <div className="tg-earth-land tg-land-one" />
            <div className="tg-earth-land tg-land-two" />
            <div className="tg-earth-land tg-land-three" />
            <div className="tg-earth-land tg-land-four" />

            {/* Latitude / longitude */}
            <div className="tg-latitude tg-latitude-one" />
            <div className="tg-latitude tg-latitude-two" />
            <div className="tg-longitude tg-longitude-one" />
            <div className="tg-longitude tg-longitude-two" />
          </div>

          {/* Thermal hotspots */}
          <div className="tg-hotspot tg-hotspot-one" />
          <div className="tg-hotspot tg-hotspot-two" />
          <div className="tg-hotspot tg-hotspot-three" />
          <div className="tg-hotspot tg-hotspot-four" />
          <div className="tg-hotspot tg-hotspot-five" />
        </div>
      </div>

      {/* Intro text */}
      <div className="tg-intro-copy">

        <div className="tg-message tg-message-one">
          THE EARTH IS CONSTANTLY CHANGING.
        </div>

        <div className="tg-message tg-message-two">
          WE WATCH FOR THE MOMENTS THAT MATTER.
        </div>

        <div className="tg-system">
          <div className="tg-system-title">
            THERMALGUARD <span>AI</span>
          </div>

          <div className="tg-system-subtitle">
            HAZARD INTELLIGENCE SYSTEM
          </div>

          <div className="tg-system-status">
            <span className="tg-status-dot" />
            CONNECTING TO NASA FIRMS...
          </div>

          <div className="tg-system-status tg-status-second">
            <span className="tg-status-dot" />
            SATELLITE FEED ONLINE
          </div>
        </div>
      </div>

      {/* Skip */}
      <button
        className="tg-skip"
        onClick={handleSkip}
        type="button"
      >
        SKIP INTRO <span>→</span>
      </button>

      {/* Bottom telemetry */}
      <div className="tg-telemetry">
        <span>ORBITAL SURVEILLANCE</span>
        <span>•</span>
        <span>THERMAL ANALYSIS</span>
        <span>•</span>
        <span>REAL-TIME INTELLIGENCE</span>
      </div>
    </div>
  );
}