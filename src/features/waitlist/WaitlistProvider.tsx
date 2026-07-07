import { useState, useCallback, type ReactNode } from 'react'
import { Modal } from '../../components/ui/Modal'
import { WaitlistForm } from './WaitlistForm'
import { WaitlistContext } from './waitlist-context'

/**
 * Provides openWaitlist() app-wide and renders the "registrations paused" modal.
 * Every sign-up CTA calls openWaitlist(source) instead of navigating to /signup.
 * The modal unmounts its body when closed, so the form resets on each open.
 */
export function WaitlistProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [source, setSource] = useState('unknown')

  const openWaitlist = useCallback((src = 'unknown') => {
    setSource(src)
    setOpen(true)
  }, [])

  return (
    <WaitlistContext.Provider value={{ openWaitlist }}>
      {children}
      <Modal open={open} onClose={() => setOpen(false)} title="Free trials are paused">
        <WaitlistForm source={source} />
      </Modal>
    </WaitlistContext.Provider>
  )
}
