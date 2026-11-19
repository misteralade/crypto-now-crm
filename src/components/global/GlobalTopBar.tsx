import { useEffect, useMemo, useState } from 'react'
import { Search, Menu, X } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { LOCAL_STORAGE_KEYS, ROUTES } from '../../util/constants.util'
import { useSidebarToggle } from '../../layout/sidebar-toggle-context'
import { useNavbarSearchState } from '../../layout/navbar-search-context'
import { useOwnAdminProfileQuery } from '../../queries/auth.query'
import { getLoggedInAdminId } from '../../util/auth.util'

interface DecodedAdmin {
  name: string
  role: string
  email: string
}

function decodeAdminToken(): DecodedAdmin {
  try {
    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN)
    if (!token) return { name: '', role: 'Operations', email: '' }
    const base64 = token.split('.')[1]
    if (!base64) return { name: '', role: 'Operations', email: '' }
    const payload = JSON.parse(atob(base64.replace(/-/g, '+').replace(/_/g, '/')))

    const { firstName, lastName, username, email, role } = payload
    let name = ''
    if (firstName && firstName.toLowerCase() !== 'admin' && lastName && lastName.toLowerCase() !== 'admin') {
      name = `${firstName} ${lastName}`
    } else if (firstName && firstName.toLowerCase() !== 'admin') {
      name = firstName
    } else if (username && !username.toLowerCase().startsWith('superadmin-')) {
      name = username.charAt(0).toUpperCase() + username.slice(1)
    }

    const displayRole = role ? String(role).replace(/_/g, ' ') : 'Super Admin'
    return { name, role: displayRole, email: email || '' }
  } catch {
    return { name: '', role: 'Super Admin', email: '' }
  }
}

export default function GlobalTopBar() {
  const sidebarToggle = useSidebarToggle()
  const searchConfig = useNavbarSearchState()
  const [searchInput, setSearchInput] = useState(searchConfig?.value ?? '')
  const { data: profile } = useOwnAdminProfileQuery()
  const decodedToken = useMemo(() => decodeAdminToken(), [])
  const fallbackAdminId = useMemo(() => getLoggedInAdminId(), [])

  const adminId = profile?.id || fallbackAdminId

  // Name resolution: profile first/last name -> profile username -> token name -> email prefix -> Admin
  const displayName = useMemo(() => {
    if (profile?.firstName && profile?.lastName) {
      return `${profile.firstName} ${profile.lastName}`.trim()
    }
    if (profile?.firstName) return profile.firstName.trim()
    if (profile?.username && !profile.username.toLowerCase().startsWith('superadmin-')) {
      return profile.username.trim()
    }
    if (decodedToken.name) return decodedToken.name.trim()
    const emailToUse = profile?.email || decodedToken.email
    if (emailToUse) {
      const prefix = emailToUse.split('@')[0]
      return prefix ? prefix.charAt(0).toUpperCase() + prefix.slice(1).replace(/[._-]/g, ' ') : 'Admin'
    }
    return 'Admin'
  }, [profile, decodedToken])

  const displayEmail = profile?.email || decodedToken.email || ''
  const initial = displayName.charAt(0).toUpperCase() || 'A'

  useEffect(() => {
    setSearchInput(searchConfig?.value ?? '')
  }, [searchConfig?.value])

  useEffect(() => {
    if (!searchConfig || searchInput === (searchConfig.value ?? '')) return
    const timeout = window.setTimeout(() => searchConfig.onChange(searchInput), 350)
    return () => window.clearTimeout(timeout)
  }, [searchConfig, searchInput])

  const profileLink = adminId
    ? ROUTES.ADMIN_DETAILS.replace('$adminId', adminId)
    : ROUTES.MANAGE_ADMINS

  return (
    <header className="sticky top-0 z-40 h-16 w-full bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shadow-xs">
      {/* Left: Mobile hamburger menu & Contextual search bar */}
      <div className="flex items-center gap-3 flex-1 max-w-2xl min-w-0">
        {sidebarToggle && (
          <button
            onClick={sidebarToggle.toggleSidebar}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-xs hover:bg-slate-50 active:scale-95 lg:hidden cursor-pointer touch-manipulation shrink-0"
            aria-label="Toggle Navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {/* Dynamic Contextual Search Bar - only rendered if active page registers search utility */}
        {searchConfig ? (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (searchInput !== (searchConfig.value ?? '')) searchConfig.onChange(searchInput)
              searchConfig.onSubmit?.(e)
            }}
            className="relative w-full max-w-lg"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={searchConfig.placeholder || 'Search...'}
              className="w-full h-9.5 pl-9 pr-9 bg-slate-50/90 hover:bg-slate-50 border border-slate-200/80 rounded-lg text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 transition-all"
            />
            {searchInput ? (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5 rounded-full"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </form>
        ) : null}
      </div>

      {/* Right: Admin Profile Block (name, email & direct link to admin profile page) */}
      <div className="flex shrink-0 items-center">
        <Link
          to={profileLink as any}
          className="group flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200/70 transition-all cursor-pointer touch-manipulation"
          title={`View profile for ${displayName}`}
        >
          <div className="relative shrink-0">
            {profile?.profileImg ? (
              <img
                src={profile.profileImg}
                alt={displayName}
                className="w-8.5 h-8.5 rounded-full object-cover border border-slate-200 shadow-xs"
              />
            ) : (
              <div className="w-8.5 h-8.5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                {initial}
              </div>
            )}
            {/* Live Green Online Dot */}
            <span
              className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"
              title="Online"
            />
          </div>

          <div className="hidden sm:block text-left min-w-0">
            <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight truncate max-w-[150px]">
              {displayName}
            </p>
            {displayEmail ? (
              <p className="text-2xs font-medium text-slate-500 leading-tight truncate max-w-[170px]">
                {displayEmail}
              </p>
            ) : null}
          </div>
        </Link>
      </div>
    </header>
  )
}
