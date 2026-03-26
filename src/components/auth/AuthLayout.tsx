import { Link } from 'react-router-dom'

export default function AuthLayout({
  children,
  maxWidth = 'max-w-sm',
}: {
  children: React.ReactNode
  maxWidth?: string
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex h-14 shrink-0 items-center px-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-lg font-bold tracking-tight text-on-surface"
        >
          <img src="/logo.png" alt="" className="h-7 w-7 shrink-0" />
          ScoutCopilot
        </Link>
      </div>
      <div className="flex flex-1 items-center justify-center px-4">
        <div className={`w-full ${maxWidth}`}>{children}</div>
      </div>
    </div>
  )
}
