import { Logo } from '../shared/Logo'
import { ThemeToggle } from '../shared/ThemeToggle'
import { LanguageSelector } from '../shared/LanguageSelector'

export default function AuthLayout({
  children,
  maxWidth = 'max-w-sm',
}: {
  children: React.ReactNode
  maxWidth?: string
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex h-14 shrink-0 items-center justify-between px-6">
        <Logo size="md" linkTo="/" />
        <div className="flex items-center gap-2">
          <LanguageSelector />
          <ThemeToggle className="p-2" />
        </div>
      </div>
      <main className="flex flex-1 items-center justify-center px-4">
        <div className={`w-full ${maxWidth}`}>{children}</div>
      </main>
    </div>
  )
}
