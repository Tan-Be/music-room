import { render, screen } from '@testing-library/react'
import { Spinner } from './spinner'

describe('Spinner Component', () => {
  it('should render with default props', () => {
    render(<Spinner />)

    const spinner = screen.getByRole('status')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveAttribute('aria-label', 'Загрузка')
  })

  it('should render with custom aria-label', () => {
    render(<Spinner aria-label="Сохранение данных" />)

    const spinner = screen.getByRole('status')
    expect(spinner).toHaveAttribute('aria-label', 'Сохранение данных')
  })

  it('should apply size classes correctly', () => {
    const { rerender } = render(<Spinner size="sm" />)
    let spinner = screen.getByRole('status')
    expect(spinner.firstChild).toHaveClass('h-4', 'w-4')

    rerender(<Spinner size="md" />)
    spinner = screen.getByRole('status')
    expect(spinner.firstChild).toHaveClass('h-6', 'w-6')

    rerender(<Spinner size="lg" />)
    spinner = screen.getByRole('status')
    expect(spinner.firstChild).toHaveClass('h-8', 'w-8')
  })

  it('should apply custom className', () => {
    render(<Spinner className="custom-class" />)

    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('custom-class')
  })

  it('should have proper accessibility attributes', () => {
    render(<Spinner />)

    const spinner = screen.getByRole('status')
    expect(spinner).toHaveAttribute('role', 'status')
    expect(spinner).toHaveAttribute('aria-label')
  })

  it('should have animation classes', () => {
    render(<Spinner />)

    const spinner = screen.getByRole('status')
    expect(spinner.firstChild).toHaveClass('animate-spin')
  })

  it('should render SVG element', () => {
    render(<Spinner />)

    const svg = screen.getByRole('status').querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24')
  })

  it('should be accessible to screen readers', () => {
    render(<Spinner />)

    const spinner = screen.getByRole('status')
    expect(spinner).toBeVisible()
    expect(spinner).toHaveAttribute('aria-label')
  })

  it('should support all size variants', () => {
    const sizes = ['sm', 'md', 'lg'] as const

    sizes.forEach(size => {
      const { unmount } = render(<Spinner size={size} />)
      const spinner = screen.getByRole('status')
      expect(spinner).toBeInTheDocument()
      unmount()
    })
  })

  it('should maintain aspect ratio', () => {
    render(<Spinner />)

    const svg = screen.getByRole('status').querySelector('svg')
    expect(svg).toHaveClass('h-6', 'w-6') // default size should be square
  })

  it('should have proper color classes', () => {
    render(<Spinner />)

    const svg = screen.getByRole('status').querySelector('svg')
    expect(svg).toHaveClass('text-muted-foreground')
  })

  it('should render circle elements for spinner animation', () => {
    render(<Spinner />)

    const circles = screen.getByRole('status').querySelectorAll('circle')
    expect(circles).toHaveLength(2) // Обычно спиннер состоит из двух кругов
  })

  it('should handle edge cases gracefully', () => {
    // Тест с undefined size
    render(<Spinner size={undefined as any} />)
    const spinner = screen.getByRole('status')
    expect(spinner).toBeInTheDocument()
  })

  it('should be performant with multiple instances', () => {
    const startTime = performance.now()

    // Рендерим много спиннеров
    const { container } = render(
      <div>
        {Array.from({ length: 100 }, (_, i) => (
          <Spinner key={i} />
        ))}
      </div>
    )

    const endTime = performance.now()
    const renderTime = endTime - startTime

    expect(renderTime).toBeLessThan(100) // Должно рендериться быстро
    expect(container.querySelectorAll('[role="status"]')).toHaveLength(100)
  })
})
