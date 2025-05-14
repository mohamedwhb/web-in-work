"use client"

import { useState, useEffect, useRef } from "react"

interface UseIntersectionObserverProps {
  root?: Element | null
  rootMargin?: string
  threshold?: number | number[]
  freezeOnceVisible?: boolean
}

export function useIntersectionObserver({
  root = null,
  rootMargin = "0px",
  threshold = 0,
  freezeOnceVisible = false,
}: UseIntersectionObserverProps = {}): [
  (node: Element | null) => void,
  boolean,
  IntersectionObserverEntry | undefined,
] {
  const [entry, setEntry] = useState<IntersectionObserverEntry>()
  const [isIntersecting, setIsIntersecting] = useState<boolean>(false)

  const frozen = useRef(false)
  const observer = useRef<IntersectionObserver | null>(null)

  const setRef = (node: Element | null) => {
    if (frozen.current || !node) return

    if (observer.current) {
      observer.current.disconnect()
    }

    observer.current = new IntersectionObserver(
      ([entry]) => {
        setEntry(entry)
        setIsIntersecting(entry.isIntersecting)

        if (entry.isIntersecting && freezeOnceVisible) {
          frozen.current = true
        }
      },
      { root, rootMargin, threshold },
    )

    observer.current.observe(node)
  }

  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect()
      }
    }
  }, [])

  return [setRef, isIntersecting, entry]
}
