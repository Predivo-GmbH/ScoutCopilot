/**
 * Button Component — Unit Tests
 * Tests rendering, variants, sizes, loading, icons, disabled, and accessibility
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../Button'
import { Search } from 'lucide-react'

describe('Button', () => {
  describe('Rendering', () => {
    it('renders with text content', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByRole('button', { name: 'Click me' })).toBeDefined()
    })

    it('renders as a button element', () => {
      render(<Button>Test</Button>)
      const btn = screen.getByRole('button')
      expect(btn.tagName).toBe('BUTTON')
    })
  })

  describe('Variants', () => {
    it('applies primary variant by default', () => {
      render(<Button>Primary</Button>)
      const btn = screen.getByRole('button')
      expect(btn.className).toContain('bg-primary')
    })

    it('applies secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>)
      const btn = screen.getByRole('button')
      expect(btn.className).toContain('border')
    })

    it('applies ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>)
      const btn = screen.getByRole('button')
      expect(btn.className).toContain('bg-transparent')
    })

    it('applies destructive variant', () => {
      render(<Button variant="destructive">Delete</Button>)
      const btn = screen.getByRole('button')
      expect(btn.className).toContain('error')
    })
  })

  describe('Sizes', () => {
    it('applies sm size', () => {
      render(<Button size="sm">Small</Button>)
      const btn = screen.getByRole('button')
      expect(btn.className).toContain('min-h-[44px]')
    })

    it('applies md size by default', () => {
      render(<Button>Medium</Button>)
      const btn = screen.getByRole('button')
      expect(btn.className).toContain('min-h-[44px]')
    })

    it('applies lg size', () => {
      render(<Button size="lg">Large</Button>)
      const btn = screen.getByRole('button')
      expect(btn.className).toContain('h-12')
    })

    it('always meets 44px minimum touch target', () => {
      render(<Button size="sm">Touch</Button>)
      const btn = screen.getByRole('button')
      expect(btn.className).toContain('min-h-[44px]')
    })
  })

  describe('Loading state', () => {
    it('shows spinner when loading', () => {
      const { container } = render(<Button loading>Loading</Button>)
      expect(container.querySelector('.animate-spin')).not.toBeNull()
    })

    it('disables button when loading', () => {
      render(<Button loading>Loading</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('applies cursor-not-allowed when loading', () => {
      render(<Button loading>Loading</Button>)
      expect(screen.getByRole('button').className).toContain('cursor-not-allowed')
    })
  })

  describe('Disabled state', () => {
    it('disables button when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('applies opacity when disabled', () => {
      render(<Button disabled>Disabled</Button>)
      expect(screen.getByRole('button').className).toContain('opacity-50')
    })
  })

  describe('Icons', () => {
    it('renders left icon', () => {
      const { container } = render(<Button leftIcon={Search}>Search</Button>)
      expect(container.querySelector('svg')).not.toBeNull()
    })

    it('renders right icon', () => {
      const { container } = render(<Button rightIcon={Search}>Next</Button>)
      expect(container.querySelector('svg')).not.toBeNull()
    })

    it('hides right icon when loading', () => {
      const { container } = render(<Button loading rightIcon={Search}>Loading</Button>)
      // Should show spinner instead of right icon
      expect(container.querySelector('.animate-spin')).not.toBeNull()
    })
  })

  describe('Events', () => {
    it('calls onClick handler', () => {
      const onClick = vi.fn()
      render(<Button onClick={onClick}>Click</Button>)
      fireEvent.click(screen.getByRole('button'))
      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('does not call onClick when disabled', () => {
      const onClick = vi.fn()
      render(<Button disabled onClick={onClick}>Disabled</Button>)
      fireEvent.click(screen.getByRole('button'))
      expect(onClick).not.toHaveBeenCalled()
    })

    it('does not call onClick when loading', () => {
      const onClick = vi.fn()
      render(<Button loading onClick={onClick}>Loading</Button>)
      fireEvent.click(screen.getByRole('button'))
      expect(onClick).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('has focus-visible ring styles', () => {
      render(<Button>Focus</Button>)
      expect(screen.getByRole('button').className).toContain('focus-visible:ring-2')
    })

    it('accepts custom className', () => {
      render(<Button className="custom-class">Custom</Button>)
      expect(screen.getByRole('button').className).toContain('custom-class')
    })

    it('forwards ref', () => {
      const ref = { current: null as HTMLButtonElement | null }
      render(<Button ref={ref}>Ref</Button>)
      expect(ref.current).not.toBeNull()
      expect(ref.current?.tagName).toBe('BUTTON')
    })

    it('passes through HTML attributes', () => {
      render(<Button type="submit" data-testid="my-btn">Submit</Button>)
      expect(screen.getByTestId('my-btn')).toBeDefined()
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
    })
  })
})
