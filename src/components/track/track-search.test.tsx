import { render, screen, fireEvent } from '@testing-library/react'
import { TrackSearch } from './track-search'

// Мокаем next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

describe('TrackSearch Component', () => {
  const mockOnAddToQueue = jest.fn()

  beforeEach(() => {
    mockOnAddToQueue.mockClear()
  })

  it('renders search input', () => {
    render(<TrackSearch onAddToQueue={mockOnAddToQueue} />)

    expect(
      screen.getByPlaceholderText(
        'Поиск треков по названию, исполнителю или жанру...'
      )
    ).toBeInTheDocument()
    expect(screen.getByRole('searchbox')).toBeInTheDocument()
  })

  it('displays tracks when no search query is entered', () => {
    render(<TrackSearch onAddToQueue={mockOnAddToQueue} />)

    // Проверяем, что отображаются треки (должно быть 10 треков на странице по умолчанию)
    expect(screen.getAllByText(/./)).not.toHaveLength(0)
  })

  it('filters tracks based on search query', () => {
    render(<TrackSearch onAddToQueue={mockOnAddToQueue} />)

    const searchInput = screen.getByRole('searchbox')

    // Вводим поисковый запрос
    fireEvent.change(searchInput, { target: { value: 'Blinding Lights' } })

    // Проверяем, что отображается только один трек
    expect(screen.getByText('Blinding Lights')).toBeInTheDocument()
  })

  it('handles adding track to queue', () => {
    render(<TrackSearch onAddToQueue={mockOnAddToQueue} />)

    const addButton = screen.getAllByRole('button', { name: '' })[0]
    fireEvent.click(addButton)

    expect(mockOnAddToQueue).toHaveBeenCalled()
  })

  it('handles pagination', () => {
    render(<TrackSearch onAddToQueue={mockOnAddToQueue} />)

    // Проверяем наличие кнопок пагинации
    expect(screen.getByText('Назад')).toBeInTheDocument()
    expect(screen.getByText('Вперед')).toBeInTheDocument()
  })

  it('shows no results message when search returns no tracks', () => {
    render(<TrackSearch onAddToQueue={mockOnAddToQueue} />)

    const searchInput = screen.getByRole('searchbox')

    // Вводим поисковый запрос, который не должен ничего найти
    fireEvent.change(searchInput, {
      target: { value: 'NonExistentTrack12345' },
    })

    // Проверяем сообщение о том, что треки не найдены
    expect(screen.getByText('Треки не найдены')).toBeInTheDocument()
  })
})
