import { ReactNode } from 'react'
import { Header } from './Header'

interface AppShellProps {
  children: ReactNode
  fullWidth?: boolean
}

export function AppShell({ children, fullWidth = false }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className={`flex-1 ${fullWidth ? '' : 'max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8'}`}>
        {children}
      </main>
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <p>Agentic Payments Demo - AI-powered financial automation</p>
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
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
        {sidebar && (
          <aside className="hidden lg:block w-80 border-l border-slate-200 bg-white overflow-y-auto">
            {sidebar}
          </aside>
        )}
      </div>
      {bottomPanel && (
        <div className="border-t border-slate-200 bg-white p-4">
          {bottomPanel}
        </div>
      )}
    </div>
  )
}
