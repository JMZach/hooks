// Libs
import { useState, useEffect, MutableRefObject } from "react"
import { useDebouncedCallback } from "use-debounce"

// 60 times in a second
const DEFAULT_DELAY = 1000 / 60

export function relativeXY(event: Event): [number, number] {
  const _event = event as MouseEvent | undefined
  const currentTarget = _event?.currentTarget as Element | undefined
  const bounds = currentTarget?.getBoundingClientRect()
  let x = (_event?.clientX || 0) - (bounds?.left || 0)
  let y = (_event?.clientY || 0) - (bounds?.top || 0)

  // remove junk values
  if (y < 0) {
    y = 0
  }
  if (x < 0) {
    x = 0
  }
  if (currentTarget?.clientHeight && y > currentTarget.clientHeight) {
    y = currentTarget.clientHeight
  }
  if (currentTarget?.clientWidth && x > currentTarget.clientWidth) {
    x = currentTarget.clientWidth
  }

  return [x, y]
}

export default function useRelativeMouseCoords<T>(
  ref: MutableRefObject<(Element & T) | null>,
  delay?: number
) {
  // Props
  const theDelay: number = (!delay && delay !== 0) ? DEFAULT_DELAY : delay


  // Local State
  const [coords, setCoords] = useState<[number, number]>([0, 0])
  const [isWithin, setIsWithin] = useState<boolean>(false)

  // When the cursor moves we need to change
  const onChange = useDebouncedCallback((event: Event) => {
    const newValue = relativeXY(event)
    setCoords(newValue)
  }, theDelay)

  // When we enter/exit the item we should toggle
  const onEnter = () => setIsWithin(true)
  const onExit = () => setIsWithin(false)

  // Only Run on the client
  // Make sure to remove on refresh or when un-mount or when the ref changes
  useEffect(() => {
    // Remove Events during live-refresh
    // ref?.current?.removeEventListener("mousemove", onChange)
    // ref?.current?.removeEventListener("mouseenter", onEnter)
    // ref?.current?.removeEventListener("mouseleave", onExit)
    // Add the events on created
    ref?.current?.addEventListener("mousemove", onChange)
    ref?.current?.addEventListener("mouseenter", onEnter)
    ref?.current?.addEventListener("mouseleave", onExit)

    // When we are done with the component we need to clean up the handlers
    return () => {
      ref?.current?.removeEventListener("mousemove", onChange)
      ref?.current?.removeEventListener("mouseenter", onEnter)
      ref?.current?.removeEventListener("mouseleave", onExit)
    }
  }, [ref])

  return [...coords, isWithin]
}
