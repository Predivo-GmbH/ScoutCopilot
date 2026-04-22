/**
 * Badge Component — Unit Tests
 * Tests rendering, variants, className, ref
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from '../Badge'

describe('Badge', () => {
  it('renders children text', () => {
    render(<Badge>New</Badge>)
    expect(screen.getByText('New')).toBeDefined()
  })

  it('renders as a span element', () => {
    render(<Badge>Tag</Badge>)
    expect(screen.getByText('Tag').tagName).toBe('SPAN')
  })

  describe('Variants', () => {
    it('applies default variant', () => {
      render(<Badge>Default</Badge>)
      expect(screen.getByText('Default').className).toContain('bg-surface-container-high')
    })

    it('applies primary variant', () => {
      render(<Badge variant="primary">Primary</Badge>)
      expect(screen.getByText('Primary').className).toContain('text-primary-light')
    })

    it('applies secondary variant', () => {
      render(<Badge variant="secondary">Sec</Badge>)
      expect(screen.getByText('Sec').className).toContain('text-secondary-light')
    })

    it('applies tertiary variant', () => {
      render(<Badge variant="tertiary">Tert</Badge>)
      expect(screen.getByText('Tert').className).toContain('text-tertiary-light')
    })

    it('applies error variant', () => {
      render(<Badge variant="error">Err</Badge>)
      expect(screen.getByText('Err').className).toContain('text-error')
    })

    it('applies outline variant', () => {
      render(<Badge variant="outline">Out</Badge>)
      expect(screen.getByText('Out').className).toContain('border')
    })
  })

  it('applies uppercase tracking styles', () => {
    render(<Badge>Style</Badge>)
    expect(screen.getByText('Style').className).toContain('uppercase')
    expect(screen.getByText('Style').className).toContain('tracking-')
  })

  it('accepts custom className', () => {
    render(<Badge className="custom">Custom</Badge>)
    expect(screen.getByText('Custom').className).toContain('custom')
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLSpanElement | null }
    render(<Badge ref={ref}>Ref</Badge>)
    expect(ref.current).not.toBeNull()
    expect(ref.current?.tagName).toBe('SPAN')
  })
})
