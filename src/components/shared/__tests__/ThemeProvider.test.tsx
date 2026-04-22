/**
 * ThemeProvider — Unit Tests
 * Tests theme context, localStorage persistence, resolved theme
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { ThemeProvider } from '../ThemeProvider'
import { useTheme } from '../useTheme'

// Test consumer component
function ThemeConsumer() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved">{resolvedTheme}</span>
      <button onClick={() => setTheme('light')}>Light</button>
      <button onClick={() => setTheme('dark')}>Dark</button>
      <button onClick={() => setTheme('system')}>System</button>
    </div>
  )
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  it('provides default dark theme when no localStorage', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    )
    expect(screen.getByTestId('theme').textContent).toBe('dark')
    expect(screen.getByTestId('resolved').textContent).toBe('dark')
  })

  it('can switch to light theme and persist', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    )
    act(() => {
      fireEvent.click(screen.getByText('Light'))
    })
    expect(screen.getByTestId('theme').textContent).toBe('light')
    expect(screen.getByTestId('resolved').textContent).toBe('light')
    expect(localStorage.getItem('scoutcopilot-theme')).toBe('light')
  })

  it('applies data-theme attribute to document', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    )
    const attr = document.documentElement.getAttribute('data-theme')
    expect(attr === 'dark' || attr === 'light').toBe(true)
  })

  it('changes theme on setTheme call', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    )
    act(() => {
      fireEvent.click(screen.getByText('Light'))
    })
    expect(screen.getByTestId('theme').textContent).toBe('light')
    expect(localStorage.getItem('scoutcopilot-theme')).toBe('light')
  })

  it('persists theme change to localStorage', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    )
    act(() => {
      fireEvent.click(screen.getByText('Dark'))
    })
    expect(localStorage.getItem('scoutcopilot-theme')).toBe('dark')
  })

  it('handles invalid localStorage value gracefully', () => {
    localStorage.setItem('scoutcopilot-theme', 'invalid')
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    )
    // Falls back to 'dark'
    expect(screen.getByTestId('theme').textContent).toBe('dark')
  })
})
