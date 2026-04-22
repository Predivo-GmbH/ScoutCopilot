/**
 * Card Component — Unit Tests
 * Tests rendering, header, footer, children, className, ref
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card } from '../Card'

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>)
    expect(screen.getByText('Card content')).toBeDefined()
  })

  it('renders header when provided', () => {
    render(<Card header={<h3>Header</h3>}>Body</Card>)
    expect(screen.getByText('Header')).toBeDefined()
  })

  it('renders footer when provided', () => {
    render(<Card footer={<button>Action</button>}>Body</Card>)
    expect(screen.getByRole('button', { name: 'Action' })).toBeDefined()
  })

  it('applies default card styles', () => {
    const { container } = render(<Card>Content</Card>)
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('bg-surface-container-low')
    expect(card.className).toContain('border')
    expect(card.className).toContain('rounded-md')
  })

  it('accepts custom className', () => {
    const { container } = render(<Card className="my-custom">Content</Card>)
    expect((container.firstChild as HTMLElement).className).toContain('my-custom')
  })

  it('header has bottom border', () => {
    const { container } = render(<Card header={<span>H</span>}>Body</Card>)
    const headerDiv = container.querySelector('[class*="border-b"]')
    expect(headerDiv).not.toBeNull()
  })

  it('footer has top border', () => {
    const { container } = render(<Card footer={<span>F</span>}>Body</Card>)
    const footerDiv = container.querySelector('[class*="border-t"]')
    expect(footerDiv).not.toBeNull()
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<Card ref={ref}>Content</Card>)
    expect(ref.current).not.toBeNull()
    expect(ref.current?.tagName).toBe('DIV')
  })

  it('renders without header and footer', () => {
    const { container } = render(<Card>Solo</Card>)
    expect(container.querySelectorAll('[class*="border-b"]').length).toBe(0)
    expect(container.querySelectorAll('[class*="border-t"]').length).toBe(0)
  })
})
