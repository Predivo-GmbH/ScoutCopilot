/**
 * Modal Component — Unit Tests
 * Tests open/close, title, footer, overlay click, escape key, focus trap, accessibility
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import i18n from '../../../i18n'
import { Modal } from '../Modal'

function renderModal(props: Partial<Parameters<typeof Modal>[0]> = {}) {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    children: <p>Modal content</p>,
    ...props,
  }
  return render(
    <I18nextProvider i18n={i18n}>
      <Modal {...defaultProps} />
    </I18nextProvider>
  )
}

describe('Modal', () => {
  describe('Open/Close', () => {
    it('renders when open is true', () => {
      renderModal({ open: true })
      expect(screen.getByText('Modal content')).toBeDefined()
    })

    it('does not render when open is false', () => {
      renderModal({ open: false })
      expect(screen.queryByText('Modal content')).toBeNull()
    })
  })

  describe('Title', () => {
    it('renders title when provided', () => {
      renderModal({ title: 'My Title' })
      expect(screen.getByText('My Title')).toBeDefined()
    })

    it('renders close button when title is present', () => {
      renderModal({ title: 'Title' })
      const closeBtn = screen.getByLabelText(/close/i)
      expect(closeBtn).toBeDefined()
    })

    it('does not render title area when no title', () => {
      renderModal()
      expect(screen.queryByRole('heading')).toBeNull()
    })
  })

  describe('Footer', () => {
    it('renders footer when provided', () => {
      renderModal({ footer: <button>Save</button> })
      expect(screen.getByRole('button', { name: 'Save' })).toBeDefined()
    })
  })

  describe('Close interactions', () => {
    it('calls onClose when close button clicked', () => {
      const onClose = vi.fn()
      renderModal({ title: 'Title', onClose })
      fireEvent.click(screen.getByLabelText(/close/i))
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when overlay clicked', () => {
      const onClose = vi.fn()
      renderModal({ onClose })
      // The overlay is the outermost div with role="dialog"
      const dialog = screen.getByRole('dialog')
      fireEvent.click(dialog)
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('does not close when content clicked', () => {
      const onClose = vi.fn()
      renderModal({ onClose })
      fireEvent.click(screen.getByText('Modal content'))
      expect(onClose).not.toHaveBeenCalled()
    })

    it('calls onClose on Escape key', () => {
      const onClose = vi.fn()
      renderModal({ onClose })
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('Accessibility', () => {
    it('has role="dialog"', () => {
      renderModal()
      expect(screen.getByRole('dialog')).toBeDefined()
    })

    it('has aria-modal="true"', () => {
      renderModal()
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
    })

    it('has aria-label matching title', () => {
      renderModal({ title: 'Confirm Delete' })
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', 'Confirm Delete')
    })

    it('locks body scroll when open', () => {
      renderModal({ open: true })
      expect(document.body.style.overflow).toBe('hidden')
    })
  })
})
