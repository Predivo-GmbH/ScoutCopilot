/**
 * SearchBar Component — Unit Tests
 * Tests rendering, search submit, clear, filters, keyboard, accessibility
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { I18nextProvider } from 'react-i18next'
import i18n from '../../../i18n'
import { SearchBar } from '../SearchBar'

function renderSearchBar(props: Partial<Parameters<typeof SearchBar>[0]> = {}) {
  const defaultProps = {
    onSearch: vi.fn(),
    ...props,
  }
  return {
    ...render(
      <I18nextProvider i18n={i18n}>
        <SearchBar {...defaultProps} />
      </I18nextProvider>
    ),
    onSearch: defaultProps.onSearch,
  }
}

describe('SearchBar', () => {
  describe('Rendering', () => {
    it('renders search input', () => {
      renderSearchBar()
      const input = screen.getByRole('searchbox')
      expect(input).toBeDefined()
    })

    it('renders with custom placeholder', () => {
      renderSearchBar({ placeholder: 'Find players...' })
      expect(screen.getByPlaceholderText('Find players...')).toBeDefined()
    })

    it('has role="search" container', () => {
      const { container } = renderSearchBar()
      expect(container.querySelector('[role="search"]')).not.toBeNull()
    })
  })

  describe('Search submission', () => {
    it('calls onSearch when search button clicked', async () => {
      const user = userEvent.setup()
      const { onSearch } = renderSearchBar()
      const input = screen.getByRole('searchbox')
      await user.type(input, 'Messi')
      fireEvent.click(screen.getByText(/search/i))
      expect(onSearch).toHaveBeenCalledWith('Messi')
    })

    it('calls onSearch on Enter key', async () => {
      const user = userEvent.setup()
      const { onSearch } = renderSearchBar()
      const input = screen.getByRole('searchbox')
      await user.type(input, 'Ronaldo{enter}')
      expect(onSearch).toHaveBeenCalledWith('Ronaldo')
    })

    it('trims whitespace from search query', async () => {
      const user = userEvent.setup()
      const { onSearch } = renderSearchBar()
      const input = screen.getByRole('searchbox')
      await user.type(input, '  Mbappe  ')
      fireEvent.click(screen.getByText(/search/i))
      expect(onSearch).toHaveBeenCalledWith('Mbappe')
    })

    it('does not search empty query', async () => {
      const { onSearch } = renderSearchBar()
      fireEvent.click(screen.getByText(/search/i))
      expect(onSearch).not.toHaveBeenCalled()
    })
  })

  describe('Clear button', () => {
    it('shows clear button when input has text', async () => {
      const user = userEvent.setup()
      renderSearchBar()
      await user.type(screen.getByRole('searchbox'), 'test')
      expect(screen.getByLabelText(/clear/i)).toBeDefined()
    })

    it('does not show clear button when input empty', () => {
      renderSearchBar()
      expect(screen.queryByLabelText(/clear/i)).toBeNull()
    })
  })

  describe('Filters', () => {
    it('renders filter chips', () => {
      renderSearchBar({
        filters: [
          { id: '1', label: 'Forward' },
          { id: '2', label: 'Under 25' },
        ],
      })
      expect(screen.getByText('Forward')).toBeDefined()
      expect(screen.getByText('Under 25')).toBeDefined()
    })

    it('calls onRemoveFilter when filter clicked', () => {
      const onRemoveFilter = vi.fn()
      renderSearchBar({
        filters: [{ id: 'pos', label: 'Midfielder' }],
        onRemoveFilter,
      })
      fireEvent.click(screen.getByLabelText(/remove.*midfielder/i))
      expect(onRemoveFilter).toHaveBeenCalledWith('pos')
    })

    it('does not render filter section when no filters', () => {
      const { container } = renderSearchBar({ filters: [] })
      expect(container.querySelectorAll('[class*="flex-wrap"]').length).toBe(0)
    })
  })

  describe('Accessibility', () => {
    it('input has aria-label', () => {
      renderSearchBar({ placeholder: 'Find players' })
      expect(screen.getByRole('searchbox')).toHaveAttribute('aria-label', 'Find players')
    })

    it('search icon is decorative (aria-hidden)', () => {
      const { container } = renderSearchBar()
      const icons = container.querySelectorAll('[aria-hidden="true"]')
      expect(icons.length).toBeGreaterThan(0)
    })

    it('input meets 44px min height', () => {
      renderSearchBar()
      expect(screen.getByRole('searchbox').className).toContain('min-h-[44px]')
    })
  })
})
