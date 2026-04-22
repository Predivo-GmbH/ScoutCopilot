/**
 * Tabs Component — Unit Tests
 * Tests compound component pattern, tab switching, keyboard nav, ARIA roles
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Tabs, TabList, TabTrigger, TabPanel } from '../Tabs'

function renderTabs(props: { onChange?: (id: string) => void } = {}) {
  return render(
    <Tabs defaultTab="one" onChange={props.onChange}>
      <TabList>
        <TabTrigger id="one">Tab One</TabTrigger>
        <TabTrigger id="two">Tab Two</TabTrigger>
        <TabTrigger id="three">Tab Three</TabTrigger>
      </TabList>
      <TabPanel id="one">Content One</TabPanel>
      <TabPanel id="two">Content Two</TabPanel>
      <TabPanel id="three">Content Three</TabPanel>
    </Tabs>
  )
}

describe('Tabs', () => {
  describe('Initial state', () => {
    it('renders default tab as active', () => {
      renderTabs()
      expect(screen.getByText('Content One')).toBeDefined()
    })

    it('does not render inactive panels', () => {
      renderTabs()
      expect(screen.queryByText('Content Two')).toBeNull()
      expect(screen.queryByText('Content Three')).toBeNull()
    })

    it('renders all tab triggers', () => {
      renderTabs()
      expect(screen.getByText('Tab One')).toBeDefined()
      expect(screen.getByText('Tab Two')).toBeDefined()
      expect(screen.getByText('Tab Three')).toBeDefined()
    })
  })

  describe('Tab switching', () => {
    it('shows second tab content when clicked', () => {
      renderTabs()
      fireEvent.click(screen.getByText('Tab Two'))
      expect(screen.getByText('Content Two')).toBeDefined()
      expect(screen.queryByText('Content One')).toBeNull()
    })

    it('shows third tab content when clicked', () => {
      renderTabs()
      fireEvent.click(screen.getByText('Tab Three'))
      expect(screen.getByText('Content Three')).toBeDefined()
    })

    it('calls onChange callback on tab switch', () => {
      const onChange = vi.fn()
      renderTabs({ onChange })
      fireEvent.click(screen.getByText('Tab Two'))
      expect(onChange).toHaveBeenCalledWith('two')
    })
  })

  describe('ARIA roles', () => {
    it('tab triggers have role="tab"', () => {
      renderTabs()
      const tabs = screen.getAllByRole('tab')
      expect(tabs.length).toBe(3)
    })

    it('active tab has aria-selected="true"', () => {
      renderTabs()
      const activeTab = screen.getByText('Tab One')
      expect(activeTab).toHaveAttribute('aria-selected', 'true')
    })

    it('inactive tabs have aria-selected="false"', () => {
      renderTabs()
      const inactiveTab = screen.getByText('Tab Two')
      expect(inactiveTab).toHaveAttribute('aria-selected', 'false')
    })

    it('tab list has role="tablist"', () => {
      renderTabs()
      expect(screen.getByRole('tablist')).toBeDefined()
    })

    it('active panel has role="tabpanel"', () => {
      renderTabs()
      expect(screen.getByRole('tabpanel')).toBeDefined()
    })

    it('tab trigger has aria-controls pointing to panel', () => {
      renderTabs()
      const tab = screen.getByText('Tab One')
      expect(tab).toHaveAttribute('aria-controls', 'panel-one')
    })

    it('panel has aria-labelledby pointing to tab', () => {
      renderTabs()
      const panel = screen.getByRole('tabpanel')
      expect(panel).toHaveAttribute('aria-labelledby', 'tab-one')
    })
  })

  describe('Keyboard navigation', () => {
    it('active tab has tabIndex 0, inactive have -1', () => {
      renderTabs()
      expect(screen.getByText('Tab One')).toHaveAttribute('tabindex', '0')
      expect(screen.getByText('Tab Two')).toHaveAttribute('tabindex', '-1')
    })

    it('meets 44px minimum touch target', () => {
      renderTabs()
      const tab = screen.getByText('Tab One')
      expect(tab.className).toContain('min-h-[44px]')
    })
  })
})
