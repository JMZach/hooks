// Libs
import { useState, useEffect } from 'react'
import Cookies from "js-cookie"

type BaseType = {} | number

function useLocalStorage<T>(key: string, initialValue: T & BaseType) {

  // Local State
  const [storedValue, setStoredValue] = useState<T & BaseType>(initialValue)

  // Set the local storage value and update the local state
  const setValue = (value: T & BaseType) => {
    try {
      // Save state
      setStoredValue(value)
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(value))
      Cookies.set(`ls-${key}`, JSON.stringify(value))
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.trace("@useLocalStorage->setValue", error)
    }
  }

  // Read in the value or set the value to the default if it is nothing
  const getValue = () => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key)
      // Parse stored json or if none return initialValue
      setValue(item ? JSON.parse(item) : initialValue)
    } catch (error) {
      // If error also return initialValue
      console.warn("@useLocalStorage->getValue", error)
      setValue(initialValue)
    }
  }

  // When we are on the client we need to:
  // Add the change handler so when the local storage changes the react state changes
  // - During the first time running the initial value is set
  // - This only happens on the client side
  // Any SSR will use the defaults
  useEffect(() => {
    const onChange = window.addEventListener("storage", getValue)
    getValue()
    return () => {
      window.removeEventListener("storage", onChange as any)
    }
  }, [])

  return [storedValue, setValue] as [T & BaseType, (value: T & BaseType) => void]
}

export default useLocalStorage