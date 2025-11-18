import { render, screen, fireEvent } from '@testing-library/react'
import { TrackItem } from './track-item'

describe('TrackItem Component', () => {
  const mockTrack = {
    id: '1',
    title: 'Test Track',
    artist: 'Test Artist',
    duration: 180,
    thumbnailUrl: 'https://example.com/image.jpg',
    votesUp: 5,
    votesDown: 2,
    addedBy: {
      name: 'Test User',
    },
  }

  const mockOnVoteUp = jest.fn()
  const mockOnVoteDown = jest.fn()
  const mockOnPlay = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders track information correctly', () => {
    render(
      <TrackItem
        track={mockTrack}
        roomId="test-room-id"
        onVoteUp={mockOnVoteUp}
        onVoteDown={mockOnVoteDown}
        onPlay={mockOnPlay}
      />
    )

    expect(screen.getByText('Test Track')).toBeInTheDocument()
    expect(screen.getByText('Test Artist')).toBeInTheDocument()
    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText('3:00')).toBeInTheDocument() // 180 seconds = 3:00
  })

  it('displays vote score correctly', () => {
    render(
      <TrackItem
        track={mockTrack}
        roomId="test-room-id"
        onVoteUp={mockOnVoteUp}
        onVoteDown={mockOnVoteDown}
        onPlay={mockOnPlay}
      />
    )

    // Vote score = votesUp - votesDown = 5 - 2 = 3
    expect(screen.getByText('+3')).toBeInTheDocument()
  })

  it('calls onVoteUp when thumbs up button is clicked', () => {
    render(
      <TrackItem
        track={mockTrack}
        roomId="test-room-id"
        onVoteUp={mockOnVoteUp}
        onVoteDown={mockOnVoteDown}
        onPlay={mockOnPlay}
      />
    )

    const voteUpButton = screen.getAllByRole('button')[0]
    fireEvent.click(voteUpButton)

    expect(mockOnVoteUp).toHaveBeenCalled()
  })

  it('calls onVoteDown when thumbs down button is clicked', () => {
    render(
      <TrackItem
        track={mockTrack}
        roomId="test-room-id"
        onVoteUp={mockOnVoteUp}
        onVoteDown={mockOnVoteDown}
        onPlay={mockOnPlay}
      />
    )

    const voteDownButton = screen.getAllByRole('button')[1]
    fireEvent.click(voteDownButton)

    expect(mockOnVoteDown).toHaveBeenCalled()
  })

  it('calls onPlay when play button is clicked', () => {
    render(
      <TrackItem
        track={mockTrack}
        roomId="test-room-id"
        onVoteUp={mockOnVoteUp}
        onVoteDown={mockOnVoteDown}
        onPlay={mockOnPlay}
      />
    )

    const playButton = screen.getAllByRole('button')[2]
    fireEvent.click(playButton)

    expect(mockOnPlay).toHaveBeenCalled()
  })

  it('shows playing indicator when track is playing', () => {
    const playingTrack = {
      ...mockTrack,
      isPlaying: true,
    }

    render(
      <TrackItem
        track={playingTrack}
        roomId="test-room-id"
        onVoteUp={mockOnVoteUp}
        onVoteDown={mockOnVoteDown}
        onPlay={mockOnPlay}
      />
    )

    // Check for the playing indicator (animated dot)
    expect(screen.getByRole('img')).toBeInTheDocument()
  })
})
