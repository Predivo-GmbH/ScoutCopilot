/**
 * Input Component — Unit Tests
 * Tests rendering, labels, errors, helper text, disabled, and accessibility
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '../Input'

describe('Input', () => {
  describe('Rendering', () => {
    it('renders an input element', () => {
      render(<Input />)
      expect(screen.getByRole('textbox')).toBeDefined()
    })

    it('renders with placeholder', () => {
      render(<Input placeholder="Enter text" />)
      expect(screen.getByPlaceholderText('Enter text')).toBeDefined()
    })
  })

  describe('Label', () => {
    it('renders label when provided', () => {
      render(<Input label="Email" />)
      expect(screen.getByText('Email')).toBeDefined()
    })

    it('associates label with input via htmlFor/id', () => {
      render(<Input label="Email" id="email-input" />)
      const label = screen.getByText('Email')
      expect(label).toHaveAttribute('for', 'email-input')
    })

    it('auto-generates id from label when no id provided', () => {
      render(<Input label="Work email" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('id', 'work-email')
    })
  })

  describe('Error state', () => {
    it('shows error message when error prop is set', () => {
      render(<Input error="Required field" />)
      expect(screen.getByRole('alert')).toBeDefined()
      expect(screen.getByText('Required field')).toBeDefined()
    })

    it('sets aria-invalid to true when error exists', () => {
      render(<Input error="Invalid" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
    })

    it('applies error border style', () => {
      render(<Input error="Error" />)
      expect(screen.getByRole('textbox').className).toContain('border-error')
    })

    it('sets aria-describedby to error id', () => {
      render(<Input id="test" error="Oops" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-describedby', 'test-error')
    })
  })

  describe('Helper text', () => {
    it('shows helper text when provided', () => {
      render(<Input id="test" helperText="Helpful hint" />)
      expect(screen.getByText('Helpful hint')).toBeDefined()
    })

    it('hides helper text when error is shown', () => {
      render(<Input id="test" helperText="Hint" error="Error" />)
      expect(screen.queryByText('Hint')).toBeNull()
      expect(screen.getByText('Error')).toBeDefined()
    })

    it('sets aria-describedby to helper id when no error', () => {
      render(<Input id="test" helperText="Help" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-describedby', 'test-helper')
    })
  })

  describe('Disabled state', () => {
    it('disables input when disabled prop is true', () => {
      render(<Input disabled />)
      expect(screen.getByRole('textbox')).toBeDisabled()
    })

    it('applies disabled styles', () => {
      render(<Input disabled />)
      expect(screen.getByRole('textbox').className).toContain('disabled:opacity-50')
    })
  })

  describe('User interaction', () => {
    it('accepts text input', async () => {
      const user = userEvent.setup()
      render(<Input />)
      const input = screen.getByRole('textbox') as HTMLInputElement
      await user.type(input, 'Hello world')
      expect(input.value).toBe('Hello world')
    })
  })

  describe('Accessibility', () => {
    it('meets 44px minimum touch target', () => {
      render(<Input />)
      expect(screen.getByRole('textbox').className).toContain('min-h-[44px]')
    })

    it('has no aria-invalid when no error', () => {
      render(<Input />)
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'false')
    })

    it('forwards ref', () => {
      const ref = { current: null as HTMLInputElement | null }
      render(<Input ref={ref} />)
      expect(ref.current).not.toBeNull()
      expect(ref.current?.tagName).toBe('INPUT')
    })

    it('supports type prop', () => {
      render(<Input type="email" />)
      // email type input won't have textbox role — query by tag
      const input = document.querySelector('input[type="email"]')
      expect(input).not.toBeNull()
    })
  })
})
