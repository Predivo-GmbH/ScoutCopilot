/**
 * Skeleton Component — Unit Tests
 * Tests all variants: text, paragraph, card, avatar, table-row
 */
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Skeleton } from '../Skeleton'

describe('Skeleton', () => {
  it('renders text variant by default', () => {
    const { container } = render(<Skeleton />)
    expect(container.querySelector('.animate-pulse')).not.toBeNull()
  })

  it('renders paragraph variant with multiple lines', () => {
    const { container } = render(<Skeleton variant="paragraph" lines={4} />)
    const lines = container.querySelectorAll('.animate-pulse')
    expect(lines.length).toBe(4)
  })

  it('renders card variant with border', () => {
    const { container } = render(<Skeleton variant="card" />)
    expect(container.querySelector('[class*="border"]')).not.toBeNull()
  })

  it('renders avatar variant', () => {
    const { container } = render(<Skeleton variant="avatar" />)
    const el = container.querySelector('.animate-pulse')
    expect(el?.className).toContain('rounded-md')
  })

  it('renders table-row variant with multiple columns', () => {
    const { container } = render(<Skeleton variant="table-row" />)
    const cols = container.querySelectorAll('.animate-pulse')
    expect(cols.length).toBe(4)
  })

  it('paragraph last line is shorter (w-3/4)', () => {
    const { container } = render(<Skeleton variant="paragraph" lines={3} />)
    const lines = container.querySelectorAll('.animate-pulse')
    expect(lines[2].className).toContain('w-3/4')
  })

  it('accepts custom className', () => {
    const { container } = render(<Skeleton className="my-class" />)
    expect((container.firstChild as HTMLElement)?.className).toContain('my-class')
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<Skeleton ref={ref} />)
    expect(ref.current).not.toBeNull()
  })
})
