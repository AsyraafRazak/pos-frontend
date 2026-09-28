import { useEffect, useRef } from 'react'

/**
 * Listens for rapid keyboard input from a barcode scanner (keyboard-wedge type).
 * Scanners fire all characters very quickly (< 50ms apart) then send Enter.
 * Normal user typing is slower, so we reset the buffer when a gap > 100ms occurs.
 */
export function useBarcodeScanner(onScan: (barcode: string) => void) {
  const bufferRef = useRef('')
  const lastKeyTimeRef = useRef(0)
  // Keep latest onScan in a ref so we never need to re-attach the listener
  const onScanRef = useRef(onScan)
  useEffect(() => { onScanRef.current = onScan }, [onScan])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const now = Date.now()

      // Large gap → user is typing manually, not scanning → reset
      if (now - lastKeyTimeRef.current > 100) {
        bufferRef.current = ''
      }
      lastKeyTimeRef.current = now

      if (e.key === 'Enter') {
        const code = bufferRef.current.trim()
        if (code.length >= 4) {
          onScanRef.current(code)
        }
        bufferRef.current = ''
      } else if (e.key.length === 1) {
        bufferRef.current += e.key
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, []) // attach once, use refs for the callback
}
