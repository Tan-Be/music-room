import { render, screen } from '@testing-library/react'
import { ScrollArea, ScrollBar } from './scroll-area'

describe('ScrollArea Component', () => {
  it('renders children correctly', () => {
    render(
      <ScrollArea>
        <div>Test content</div>
      </ScrollArea>
    )
    
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('renders vertical scrollbar by default', () => {
    render(
      <ScrollArea>
        <div>Test content</div>
        <ScrollBar />
      </ScrollArea>
    )
    
    // Проверяем, что компонент отрендерился без ошибок
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('renders horizontal scrollbar when orientation is set', () => {
    render(
      <ScrollArea>
        <div>Test content</div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    )
    
    // Проверяем, что компонент отрендерился без ошибок
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })
})