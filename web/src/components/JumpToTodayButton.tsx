import React, { useEffect, useMemo, useRef, useState } from "react"
import styles from "../styles/JumpToTodayButton.module.css"

type Props = {
  todayRef: React.RefObject<HTMLDivElement>
  onJump: () => void
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

export default function JumpToTodayButton({ todayRef, onJump }: Props) {
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)

  const [opacity, setOpacity] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [scrollDir, setScrollDir] = useState<"up" | "down">("down")

  const rafRef = useRef<number | null>(null)

  const showThreshold = 150 // px from "today" center to start appearing.
  const maxThreshold = 600 // px distance at which it's fully visible.

  const measure = () => {
    const todayEl = todayRef.current
    if (!todayEl) return

    const r = todayEl.getBoundingClientRect()
    const viewportCenterY = window.innerHeight / 2
    const todayCenterY = r.top + r.height / 2
    const distance = Math.abs(todayCenterY - viewportCenterY)

    setScrollDir(todayCenterY < viewportCenterY ? "down" : "up")

    const raw = (distance - showThreshold) / (maxThreshold - showThreshold)
    const nextOpacity = clamp(raw, 0, 1)

    setOpacity(nextOpacity)
    setIsVisible(nextOpacity > 0.01)
  }

  const onScroll = () => {
    if (rafRef.current == null) {
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null
        measure()
      })
    }
  }

  useEffect(() => {
    measure()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current!)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const arrow = useMemo(() => (scrollDir == "down" ? "↑" : "↓"), [scrollDir])

  return (
    <div
      ref={wrapperRef}
      className={styles.jumpWrapper}
      style={{
        opacity,
        pointerEvents: isVisible ? "auto" : "none",
        transform: `translateY(${(1 - opacity) * 8}px)`
      }}
    >
      <button
        ref={buttonRef}
        className={styles.jumpButton}
        onClick={onJump}
        tabIndex={isVisible ? 0 : -1}
        aria-label="Jump to today"
      >
        <span aria-hidden="true">{arrow}</span>
        <span style={{ marginLeft: 8 }}>Jump to today</span>
      </button>
    </div>
  )
}
