/**
 * WaitlistForm (F-007) — Unit Tests
 * Pre-launch email capture. Validates the email, inserts into the `waitlist`
 * table, and shows success / already-on-list / error states.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const insert = vi.fn()

vi.mock('../../../lib/supabase', () => ({
  supabase: { from: vi.fn(() => ({ insert: (...args: unknown[]) => insert(...args) })) },
}))

import { WaitlistForm } from '../WaitlistForm'

describe('F-007: WaitlistForm', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('rejects an invalid email without hitting the database', async () => {
    const user = userEvent.setup()
    render(<WaitlistForm source="test" />)
    await user.type(screen.getByLabelText('Email address'), 'not-an-email')
    await user.click(screen.getByRole('button', { name: /notify me/i }))
    expect(screen.getByText(/valid email address/i)).toBeDefined()
    expect(insert).not.toHaveBeenCalled()
  })

  it('submits a valid email and shows the success state', async () => {
    insert.mockResolvedValue({ error: null })
    const user = userEvent.setup()
    render(<WaitlistForm source="marketing" />)
    await user.type(screen.getByLabelText('Email address'), 'scout@club.com')
    await user.click(screen.getByRole('button', { name: /notify me/i }))
    expect(await screen.findByText(/on the list/i)).toBeDefined()
    expect(insert).toHaveBeenCalledWith({ email: 'scout@club.com', source: 'marketing' })
  })

  it('treats a duplicate (23505) as a friendly already-on-list message', async () => {
    insert.mockResolvedValue({ error: { code: '23505' } })
    const user = userEvent.setup()
    render(<WaitlistForm source="test" />)
    await user.type(screen.getByLabelText('Email address'), 'dupe@club.com')
    await user.click(screen.getByRole('button', { name: /notify me/i }))
    expect(await screen.findByText(/already on the waitlist/i)).toBeDefined()
  })

  it('shows an error message when the insert fails', async () => {
    insert.mockResolvedValue({ error: { code: '500' } })
    const user = userEvent.setup()
    render(<WaitlistForm source="test" />)
    await user.type(screen.getByLabelText('Email address'), 'fail@club.com')
    await user.click(screen.getByRole('button', { name: /notify me/i }))
    expect(await screen.findByText(/something went wrong/i)).toBeDefined()
  })
})
