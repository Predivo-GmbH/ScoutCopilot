/**
 * Table Components — Unit Tests
 * Tests Table, TableHeader, TableBody, TableRow, TableHead (sortable), TableCell
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../Table'

function renderTable() {
  return render(
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead sortable sortDirection="asc" onSort={vi.fn()}>Age</TableHead>
          <TableHead sortable sortDirection={null} onSort={vi.fn()}>Goals</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Messi</TableCell>
          <TableCell numeric>37</TableCell>
          <TableCell numeric>800</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Ronaldo</TableCell>
          <TableCell numeric>39</TableCell>
          <TableCell numeric>900</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}

describe('Table', () => {
  it('renders a table element', () => {
    renderTable()
    expect(screen.getByRole('table')).toBeDefined()
  })

  it('renders header cells', () => {
    renderTable()
    expect(screen.getByText('Name')).toBeDefined()
    expect(screen.getByText('Age')).toBeDefined()
    expect(screen.getByText('Goals')).toBeDefined()
  })

  it('renders body cells', () => {
    renderTable()
    expect(screen.getByText('Messi')).toBeDefined()
    expect(screen.getByText('Ronaldo')).toBeDefined()
    expect(screen.getByText('800')).toBeDefined()
  })

  it('wraps in scrollable container', () => {
    const { container } = renderTable()
    expect(container.querySelector('.overflow-x-auto')).not.toBeNull()
  })
})

describe('TableHead', () => {
  it('renders sortable column with aria-sort ascending', () => {
    renderTable()
    const ageHeader = screen.getByText('Age').closest('th')
    expect(ageHeader).toHaveAttribute('aria-sort', 'ascending')
  })

  it('sortable column without direction has no aria-sort', () => {
    renderTable()
    const goalsHeader = screen.getByText('Goals').closest('th')
    expect(goalsHeader).not.toHaveAttribute('aria-sort')
  })

  it('non-sortable column has no cursor-pointer', () => {
    renderTable()
    const nameHeader = screen.getByText('Name').closest('th')
    expect(nameHeader?.className).not.toContain('cursor-pointer')
  })

  it('sortable column has cursor-pointer', () => {
    renderTable()
    const ageHeader = screen.getByText('Age').closest('th')
    expect(ageHeader?.className).toContain('cursor-pointer')
  })

  it('calls onSort when sortable header clicked', () => {
    const onSort = vi.fn()
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead sortable sortDirection={null} onSort={onSort}>Click</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    )
    fireEvent.click(screen.getByText('Click').closest('th')!)
    expect(onSort).toHaveBeenCalledTimes(1)
  })
})

describe('TableCell', () => {
  it('applies font-data class for numeric cells', () => {
    renderTable()
    const cell = screen.getByText('800')
    expect(cell.className).toContain('font-data')
  })

  it('does not apply font-data for non-numeric cells', () => {
    renderTable()
    const cell = screen.getByText('Messi')
    expect(cell.className).not.toContain('font-data')
  })
})
