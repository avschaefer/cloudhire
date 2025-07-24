"use client"

import { useEffect, useRef } from "react"

// This component creates the animated starry background using the HTML5 Canvas API.
// It is designed to be efficient and run entirely on the client side.
export default function StarryBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let stars: { x: number; y: number; size: number; maxAlpha: number; alphaOffset: number }[] = []
    let animationFrameId: number
    let frameCount = 0

    const numStars = 800

    // Initializes or re-initializes the stars array
    const createStars = () => {
      stars = []
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.5 + 0.5,
          maxAlpha: Math.random() * 155 + 100, // Random max brightness
          alphaOffset: Math.random() * Math.PI * 2, // Random start for the sparkle effect
        })
      }
    }

    // Handles window resizing
    const resizeHandler = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      createStars()
    }

    // The main animation loop
    const draw = () => {
      if (!ctx) return

      // Clear the canvas with the dark background color each frame
      ctx.fillStyle = "rgb(13, 17, 23)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw each star with a sparkling effect
      stars.forEach((star) => {
        // Sine wave creates a smooth pulsing effect for the alpha (transparency)
        const pulse = (Math.sin(frameCount * 0.02 + star.alphaOffset) + 1) / 2
        const currentAlpha = star.maxAlpha * pulse

        ctx.fillStyle = `rgba(220, 225, 255, ${currentAlpha / 255})`
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fill()
      })

      frameCount++
      animationFrameId = window.requestAnimationFrame(draw)
    }

    // Initial setup
    resizeHandler()
    draw()

    // Add event listener for resizing
    window.addEventListener("resize", resizeHandler)

    // Cleanup function to stop animation and remove listener when component unmounts
    return () => {
      window.removeEventListener("resize", resizeHandler)
      window.cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-50" // Use a very low z-index to ensure it's in the back
      style={{
        // This CSS background provides the static gradient overlay
        backgroundImage: "radial-gradient(at 50% 0%, hsla(220, 40%, 15%, 1) 0px, transparent 70%)",
      }}
    />
  )
}
