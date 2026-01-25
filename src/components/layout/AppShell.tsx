import { ReactNode, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Header } from './Header'

interface AppShellProps {
  children: ReactNode
  fullWidth?: boolean
}

const navItems = [
  { path: '/', label: 'Home', icon: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )},
  { path: '/playground', label: 'Playground', icon: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )},
  { path: '/settings', label: 'Settings', icon: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )},
]

function MobileBottomNav() {
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 sm:hidden z-50 pb-safe">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors ${
                isActive
                  ? 'text-primary-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {item.icon}
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export function AppShell({ children, fullWidth = false }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className={`flex-1 pb-20 sm:pb-0 ${fullWidth ? '' : 'max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8'}`}>
        {children}
      </main>
      <footer className="hidden sm:block border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <p>Agentic Payments SG - AI-powered financial automation</p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-slate-700 transition-colors">
                Documentation
              </a>
              <a href="#" className="hover:text-slate-700 transition-colors">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
      <MobileBottomNav />
    </div>
  )
}

interface SimulationLayoutProps {
  children: ReactNode
  sidebar?: ReactNode
  bottomPanel?: ReactNode
}

export function SimulationLayout({
  children,
  sidebar,
  bottomPanel,
}: SimulationLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header onMenuClick={() => setIsSidebarOpen(true)} showMenuButton={!!sidebar} />
      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 sm:pb-6">{children}</main>
        {sidebar && (
          <>
            {/* Desktop sidebar */}
            <aside className="hidden lg:block w-80 border-l border-slate-200 bg-white overflow-y-auto">
              {sidebar}
            </aside>
            {/* Mobile sidebar overlay */}
            {isSidebarOpen && (
              <div className="lg:hidden fixed inset-0 z-50 flex">
                <div
                  className="fixed inset-0 bg-slate-900/50"
                  onClick={() => setIsSidebarOpen(false)}
                />
                <aside className="relative ml-auto w-full max-w-xs bg-white overflow-y-auto shadow-xl">
                  <div className="sticky top-0 flex items-center justify-between p-4 border-b border-slate-200 bg-white">
                    <span className="font-semibold text-slate-900">Details</span>
                    <button
                      onClick={() => setIsSidebarOpen(false)}
                      className="p-2 -mr-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  {sidebar}
                </aside>
              </div>
            )}
          </>
        )}
      </div>
      {bottomPanel && (
        <div className="border-t border-slate-200 bg-white p-4 mb-16 sm:mb-0">
          {bottomPanel}
        </div>
      )}
      <MobileBottomNav />
    </div>
  )
}
