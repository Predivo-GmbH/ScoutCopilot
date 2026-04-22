/**
 * Select Component — Unit Tests
 * Tests rendering, options, label, error, placeholder, disabled, accessibility
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Select } from '../Select'

const defaultOptions = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
  { value: 'c', label: 'Option C' },
]

describe('Select', () => {
  describe('Rendering', () => {
    it('renders a select element', () => {
      render(<Select options={defaultOptions} />)
      expect(screen.getByRole('combobox')).toBeDefined()
    })

    it('renders all options', () => {
      render(<Select options={defaultOptions} />)
      expect(screen.getByText('Option A')).toBeDefined()
      expect(screen.getByText('Option B')).toBeDefined()
      expect(screen.getByText('Option C')).toBeDefined()
    })
  })

  describe('Label', () => {
    it('renders label when provided', () => {
      render(<Select label="Country" options={defaultOptions} />)
      expect(screen.getByText('Country')).toBeDefined()
    })

    it('associates label with select via htmlFor', () => {
      render(<Select label="Country" id="country-select" options={defaultOptions} />)
      const label = screen.getByText('Country')
      expect(label).toHaveAttribute('for', 'country-select')
    })
  })

  describe('Placeholder', () => {
    it('renders placeholder option when provided', () => {
      render(<Select options={defaultOptions} placeholder="Choose..." />)
      expect(screen.getByText('Choose...')).toBeDefined()
    })

    it('placeholder option is disabled', () => {
      render(<Select options={defaultOptions} placeholder="Choose..." />)
      const placeholder = screen.getByText('Choose...') as HTMLOptionElement
      expect(placeholder.disabled).toBe(true)
    })
  })

  describe('Error state', () => {
    it('shows error message', () => {
      render(<Select id="sel" options={defaultOptions} error="Required" />)
      expect(screen.getByRole('alert')).toBeDefined()
      expect(screen.getByText('Required')).toBeDefined()
    })

    it('sets aria-invalid when error exists', () => {
      render(<Select options={defaultOptions} error="Err" />)
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true')
    })

    it('applies error border', () => {
      render(<Select options={defaultOptions} error="Err" />)
      expect(screen.getByRole('combobox').className).toContain('border-error')
    })
  })

  describe('Helper text', () => {
    it('shows helper text when no error', () => {
      render(<Select options={defaultOptions} helperText="Pick one" />)
      expect(screen.getByText('Pick one')).toBeDefined()
    })
  })

  describe('Disabled', () => {
    it('disables select when disabled prop is true', () => {
      render(<Select options={defaultOptions} disabled />)
      expect(screen.getByRole('combobox')).toBeDisabled()
    })
  })

  describe('Accessibility', () => {
    it('meets 44px min touch target', () => {
      render(<Select options={defaultOptions} />)
      expect(screen.getByRole('combobox').className).toContain('min-h-[44px]')
    })

    it('has chevron icon as decorative', () => {
      const { container } = render(<Select options={defaultOptions} />)
      const chevron = container.querySelector('[aria-hidden="true"]')
      expect(chevron).not.toBeNull()
    })

    it('disabled options are marked disabled', () => {
      render(<Select options={[...defaultOptions, { value: 'd', label: 'Disabled', disabled: true }]} />)
      const opt = screen.getByText('Disabled') as HTMLOptionElement
      expect(opt.disabled).toBe(true)
    })
  })
})
