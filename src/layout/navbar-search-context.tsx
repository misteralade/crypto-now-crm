import { useSyncExternalStore, useEffect, useRef } from 'react'

export interface NavbarSearchConfig {
  placeholder?: string
  value?: string
  onChange: (value: string) => void
  onSubmit?: (e: React.FormEvent) => void
}

type Listener = () => void

class NavbarSearchStore {
  private config: NavbarSearchConfig | null = null
  private listeners = new Set<Listener>()

  getConfig = (): NavbarSearchConfig | null => {
    return this.config
  }

  setConfig = (newConfig: NavbarSearchConfig | null) => {
    this.config = newConfig
    this.listeners.forEach((listener) => listener())
  }

  subscribe = (listener: Listener) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }
}

export const navbarSearchStore = new NavbarSearchStore()

export function useNavbarSearchState(): NavbarSearchConfig | null {
  return useSyncExternalStore(
    navbarSearchStore.subscribe,
    navbarSearchStore.getConfig,
    navbarSearchStore.getConfig
  )
}

/**
 * Hook to register an active search configuration with the global navbar searchbar.
 * Automatically cleans up when the host component unmounts.
 */
export function useNavbarSearch(config: NavbarSearchConfig | null) {
  const configRef = useRef(config)
  configRef.current = config

  useEffect(() => {
    if (!config) {
      navbarSearchStore.setConfig(null)
      return
    }

    navbarSearchStore.setConfig({
      placeholder: config.placeholder,
      value: config.value,
      onChange: (val: string) => configRef.current?.onChange(val),
      onSubmit: (e: React.FormEvent) => configRef.current?.onSubmit?.(e),
    })

    return () => {
      navbarSearchStore.setConfig(null)
    }
  }, [config?.placeholder, config?.value, Boolean(config)])
}
