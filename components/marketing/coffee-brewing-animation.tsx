"use client"

import { motion } from "framer-motion"

export function CoffeeBrewingAnimation() {
  return (
    <div className="relative w-full h-[400px] flex items-center justify-center">
      {/* Container for the coffee scene */}
      <div className="relative w-64 h-64">
        
        {/* Steam/Smoke Animation */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-full h-32 flex justify-center gap-4 opacity-70">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={{ 
                opacity: [0, 0.5, 0], 
                y: -60,
                x: [0, (i % 2 === 0 ? 10 : -10), 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.8,
                ease: "easeInOut"
              }}
              className="w-4 blur-xl bg-gradient-to-t from-stone-400 to-transparent rounded-full h-full"
            />
          ))}
          {/* Detailed SVG Steam Lines */}
          {[0, 1, 2].map((i) => (
            <motion.svg
              key={`line-${i}`}
              viewBox="0 0 20 100"
              className="absolute bottom-0 w-12 h-32 overflow-visible"
              style={{ left: `${35 + i * 15}%` }}
            >
              <motion.path
                d="M10 100 Q 20 75 10 50 T 10 0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-stone-300/50"
                initial={{ pathLength: 0, opacity: 0, y: 20 }}
                animate={{ 
                  pathLength: [0, 1, 1], 
                  opacity: [0, 0.8, 0],
                  y: -40 
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  delay: i * 0.6,
                  ease: "easeOut"
                }}
              />
            </motion.svg>
          ))}
        </div>

        {/* Coffee Cup SVG */}
        <motion.svg
          viewBox="0 0 200 200"
          className="w-full h-full drop-shadow-2xl"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Saucer */}
          <motion.path
            d="M20 160 H180 A10 10 0 0 1 180 180 H20 A10 10 0 0 1 20 160"
            className="fill-white stroke-stone-200"
            strokeWidth="2"
          />
          
          {/* Cup Body */}
          <motion.path
            d="M40 40 H160 V100 C160 140 130 165 100 165 C70 165 40 140 40 100 Z"
            className="fill-white stroke-stone-200"
            strokeWidth="2"
          />
          
          {/* Cup Handle */}
          <motion.path
            d="M160 60 H175 C185 60 190 70 190 90 C190 110 180 120 160 120"
            className="fill-none stroke-stone-200"
            strokeWidth="8"
            strokeLinecap="round"
          />
          
          {/* Coffee Liquid Surface */}
          <motion.ellipse
            cx="100"
            cy="50"
            rx="50"
            ry="10"
            className="fill-amber-900/90"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1, duration: 1 }}
          />

          {/* Reflection */}
          <path
            d="M50 50 Q 55 150 100 150"
            className="fill-none stroke-stone-100/50"
            strokeWidth="4"
          />
        </motion.svg>

        {/* Coffee Drip Animation (optional fun detail) */}
        {/* <motion.div 
           className="absolute top-[35%] left-1/2 w-1.5 h-1.5 rounded-full bg-amber-900"
           initial={{ y: 0, opacity: 0 }}
           animate={{ y: 80, opacity: [1, 1, 0] }}
           transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 5 }}
        /> */}
      </div>
    </div>
  )
}

