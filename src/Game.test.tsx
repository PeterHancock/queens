import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Game } from './Game';

// Mock the Board component since we're testing Game in isolation
vi.mock('./Board', () => ({
  Board: ({
    onStarted,
    onReset,
    size,
    seed,
    width,
  }: {
    onStarted?: () => void;
    onReset?: () => void;
    size: number;
    seed: number;
    width: number;
  }) => (
    <div data-testid="mock-board">
      <canvas
        id="board-canvas"
        data-testid="board-canvas"
        width={width}
        height={width}
        onClick={() => onStarted?.()}
      />
      <button data-testid="mock-reset-trigger" onClick={() => onReset?.()}>
        Mock Reset
      </button>
      <div data-testid="board-props">
        Size: {size}, Seed: {seed}, Width: {width}
      </div>
    </div>
  ),
}));

// Mock window.history for URL manipulation tests
const mockPushState = vi.fn();
const originalHistory = window.history;

// Mock navigator.share
const mockShare = vi.fn();
const originalShare = window.navigator.share;

// Mock URLSearchParams properly to avoid stack overflow
const createMockURLSearchParams = (searchString = '') => {
  const params = new Map<string, string>();
  if (searchString.startsWith('?')) {
    searchString = searchString.slice(1);
  }
  searchString.split('&').forEach((pair) => {
    if (pair) {
      const [key, value] = pair.split('=');
      if (key && value) {
        params.set(key, decodeURIComponent(value));
      }
    }
  });

  return {
    get: (key: string) => params.get(key) || null,
    set: (key: string, value: string) => params.set(key, value),
    toString: () =>
      Array.from(params.entries())
        .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
        .join('&'),
  };
};

describe('Game Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPushState.mockClear();
    mockShare.mockClear();

    // Mock window.history
    Object.defineProperty(window, 'history', {
      value: { pushState: mockPushState },
      writable: true,
      configurable: true,
    });

    // Mock navigator.share
    Object.defineProperty(window.navigator, 'share', {
      value: mockShare,
      writable: true,
      configurable: true,
    });

    // Mock window.location.search
    Object.defineProperty(window, 'location', {
      value: {
        search: '',
        href: 'http://localhost:3000',
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    // Restore original values
    Object.defineProperty(window, 'history', {
      value: originalHistory,
      writable: true,
      configurable: true,
    });

    if (originalShare) {
      Object.defineProperty(window.navigator, 'share', {
        value: originalShare,
        writable: true,
        configurable: true,
      });
    }
  });

  describe('Basic Rendering', () => {
    it('renders the game component with all elements', () => {
      render(<Game width={400} />);

      // Check for board
      expect(screen.getByTestId('mock-board')).toBeInTheDocument();

      // Check for slider
      expect(screen.getByRole('slider')).toBeInTheDocument();

      // Check for three buttons
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(4); // 3 game buttons + 1 mock reset button
    });

    it('renders board with correct default props', () => {
      render(<Game width={400} />);

      const boardProps = screen.getByTestId('board-props');
      expect(boardProps).toHaveTextContent('Size: 8');
      expect(boardProps).toHaveTextContent('Width: 400');
      expect(boardProps).toHaveTextContent(/Seed: \d+/);
    });

    it('renders slider with correct attributes', () => {
      render(<Game width={400} />);

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('id', 'board-size');
      expect(slider).toHaveAttribute('min', '5');
      expect(slider).toHaveAttribute('max', '16');
      expect(slider).toHaveAttribute('type', 'range');
      expect(slider).toHaveValue('8');
    });
  });

  describe('URL Parameter Handling', () => {
    it('initializes with default values when no URL params', () => {
      // Mock empty search params
      window.location.search = '';

      render(<Game width={400} />);

      const slider = screen.getByRole('slider');
      expect(slider).toHaveValue('8');
    });

    it('initializes with URL parameters when provided', () => {
      // Mock URL with params
      window.location.search = '?size=12&seed=123456';

      // Mock URLSearchParams constructor to use our mock
      const originalURLSearchParams = window.URLSearchParams;
      window.URLSearchParams = vi.fn().mockImplementation((search) => {
        return createMockURLSearchParams(search || window.location.search);
      });

      render(<Game width={400} />);

      const slider = screen.getByRole('slider');
      expect(slider).toHaveValue('12');

      const boardProps = screen.getByTestId('board-props');
      expect(boardProps).toHaveTextContent('Seed: 123456');

      // Restore
      window.URLSearchParams = originalURLSearchParams;
    });

    it('updates URL when size changes', () => {
      render(<Game width={400} />);

      const slider = screen.getByRole('slider');

      // Change slider value using fireEvent for better compatibility
      fireEvent.change(slider, { target: { value: '10' } });

      expect(slider).toHaveValue('10');
      expect(mockPushState).toHaveBeenCalledWith(
        '',
        '',
        expect.stringContaining('size=10')
      );
    });
  });

  describe('Board Size Slider', () => {
    it('changes size when slider value changes', () => {
      render(<Game width={400} />);

      const slider = screen.getByRole('slider');

      // Change slider value
      fireEvent.change(slider, { target: { value: '12' } });

      expect(slider).toHaveValue('12');

      const boardProps = screen.getByTestId('board-props');
      expect(boardProps).toHaveTextContent('Size: 12');
    });

    it('becomes disabled when game starts', async () => {
      const user = userEvent.setup();
      render(<Game width={400} />);

      const slider = screen.getByRole('slider');
      const canvas = screen.getByTestId('board-canvas');

      expect(slider).not.toBeDisabled();

      // Simulate game start by clicking canvas
      await user.click(canvas);

      expect(slider).toBeDisabled();
    });

    it('is re-enabled after reset', async () => {
      const user = userEvent.setup();
      render(<Game width={400} />);

      const slider = screen.getByRole('slider');
      const canvas = screen.getByTestId('board-canvas');
      const resetTrigger = screen.getByTestId('mock-reset-trigger');

      // Start game (disable slider)
      await user.click(canvas);
      expect(slider).toBeDisabled();

      // Trigger reset (enable slider)
      await user.click(resetTrigger);
      expect(slider).not.toBeDisabled();
    });

    it('is re-enabled after new game', async () => {
      const user = userEvent.setup();
      render(<Game width={400} />);

      const slider = screen.getByRole('slider');
      const canvas = screen.getByTestId('board-canvas');

      // Start game (disable slider)
      await user.click(canvas);
      expect(slider).toBeDisabled();

      // Find and click new game button (second button with SVG)
      const buttons = screen.getAllByRole('button');
      const newGameButton = buttons.find(
        (button) =>
          button.querySelector('svg') &&
          button.getAttribute('data-testid') !== 'mock-reset-trigger'
      );
      expect(newGameButton).toBeTruthy();

      await user.click(newGameButton!);
      expect(slider).not.toBeDisabled();
    });

    it('accepts values within valid range', () => {
      render(<Game width={400} />);

      const slider = screen.getByRole('slider');

      // Test minimum value
      fireEvent.change(slider, { target: { value: '5' } });
      expect(slider).toHaveValue('5');

      // Test maximum value
      fireEvent.change(slider, { target: { value: '16' } });
      expect(slider).toHaveValue('16');

      // Test mid-range value
      fireEvent.change(slider, { target: { value: '10' } });
      expect(slider).toHaveValue('10');
    });
  });

  describe('Control Buttons', () => {
    it('renders three game control buttons with SVG icons', () => {
      render(<Game width={400} />);

      const buttons = screen.getAllByRole('button');
      // Filter out the mock reset trigger button
      const gameButtons = buttons.filter(
        (button) => button.getAttribute('data-testid') !== 'mock-reset-trigger'
      );

      expect(gameButtons).toHaveLength(3);

      // Each button should have an SVG icon
      gameButtons.forEach((button) => {
        expect(button.querySelector('svg')).toBeInTheDocument();
      });
    });

    it('all buttons are initially enabled', () => {
      render(<Game width={400} />);

      const buttons = screen.getAllByRole('button');
      const gameButtons = buttons.filter(
        (button) => button.getAttribute('data-testid') !== 'mock-reset-trigger'
      );

      gameButtons.forEach((button) => {
        expect(button).not.toBeDisabled();
      });
    });
  });

  describe('Reset Button', () => {
    it('resets game state when clicked', async () => {
      const user = userEvent.setup();
      render(<Game width={400} />);

      const slider = screen.getByRole('slider');
      const canvas = screen.getByTestId('board-canvas');

      // Start game to lock slider
      await user.click(canvas);
      expect(slider).toBeDisabled();

      // Find and click reset button (first button)
      const buttons = screen.getAllByRole('button');
      const gameButtons = buttons.filter(
        (button) => button.getAttribute('data-testid') !== 'mock-reset-trigger'
      );
      const resetButton = gameButtons[0]; // Reset is the first button
      expect(resetButton).toBeTruthy();

      await user.click(resetButton);
      expect(slider).not.toBeDisabled();
    });

    it('triggers board re-render with new key', async () => {
      const user = userEvent.setup();
      render(<Game width={400} />);

      // Find and click reset button
      const buttons = screen.getAllByRole('button');
      const gameButtons = buttons.filter(
        (button) => button.getAttribute('data-testid') !== 'mock-reset-trigger'
      );
      const resetButton = gameButtons[0]; // Reset is the first button

      await user.click(resetButton);

      // Board should still be present (component re-rendered)
      expect(screen.getByTestId('mock-board')).toBeInTheDocument();
    });
  });

  describe('New Game Button', () => {
    it('generates new seed when clicked', async () => {
      const user = userEvent.setup();
      render(<Game width={400} />);

      const initialBoardProps = screen.getByTestId('board-props');
      const initialSeedMatch =
        initialBoardProps.textContent?.match(/Seed: (\d+)/);
      const initialSeed = initialSeedMatch ? initialSeedMatch[1] : null;

      // Find and click new game button (second button)
      const buttons = screen.getAllByRole('button');
      const gameButtons = buttons.filter(
        (button) => button.getAttribute('data-testid') !== 'mock-reset-trigger'
      );
      const newGameButton = gameButtons[1]; // New game is the second button
      expect(newGameButton).toBeTruthy();

      await user.click(newGameButton);

      const updatedBoardProps = screen.getByTestId('board-props');
      const updatedSeedMatch =
        updatedBoardProps.textContent?.match(/Seed: (\d+)/);
      const updatedSeed = updatedSeedMatch ? updatedSeedMatch[1] : null;

      expect(updatedSeed).not.toBe(initialSeed);
      expect(Number(updatedSeed)).toBeGreaterThan(Number(initialSeed || 0));
    });

    it('unlocks slider when clicked', async () => {
      const user = userEvent.setup();
      render(<Game width={400} />);

      const slider = screen.getByRole('slider');
      const canvas = screen.getByTestId('board-canvas');

      // Start game to lock slider
      await user.click(canvas);
      expect(slider).toBeDisabled();

      // Find and click new game button (second button)
      const buttons = screen.getAllByRole('button');
      const gameButtons = buttons.filter(
        (button) => button.getAttribute('data-testid') !== 'mock-reset-trigger'
      );
      const newGameButton = gameButtons[1]; // New game is the second button

      await user.click(newGameButton);
      expect(slider).not.toBeDisabled();
    });

    it('preserves board size when generating new game', async () => {
      const user = userEvent.setup();
      render(<Game width={400} />);

      const slider = screen.getByRole('slider');

      // Change size
      fireEvent.change(slider, { target: { value: '12' } });
      expect(slider).toHaveValue('12');

      // Find and click new game button (second button)
      const buttons = screen.getAllByRole('button');
      const gameButtons = buttons.filter(
        (button) => button.getAttribute('data-testid') !== 'mock-reset-trigger'
      );
      const newGameButton = gameButtons[1]; // New game is the second button

      await user.click(newGameButton);

      // Size should be preserved
      expect(slider).toHaveValue('12');
      const boardProps = screen.getByTestId('board-props');
      expect(boardProps).toHaveTextContent('Size: 12');
    });
  });

  describe('Share Button', () => {
    it('calls navigator.share when available', async () => {
      const user = userEvent.setup();
      mockShare.mockResolvedValue(undefined);

      render(<Game width={400} />);

      // Find and click share button (third button)
      const buttons = screen.getAllByRole('button');
      const gameButtons = buttons.filter(
        (button) => button.getAttribute('data-testid') !== 'mock-reset-trigger'
      );
      const shareButton = gameButtons[2]; // Share is the third button
      expect(shareButton).toBeTruthy();

      await user.click(shareButton);

      expect(mockShare).toHaveBeenCalledWith({
        title: 'Queens',
        text: 'Share game!',
        url: window.location.href,
      });
    });
  });

  describe('Board Component Integration', () => {
    it('passes correct props to Board component', () => {
      render(<Game width={400} />);

      const boardProps = screen.getByTestId('board-props');
      expect(boardProps).toHaveTextContent('Size: 8');
      expect(boardProps).toHaveTextContent('Width: 400');
      expect(boardProps).toHaveTextContent(/Seed: \d+/);
    });

    it('updates board props when size changes', () => {
      render(<Game width={400} />);

      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '10' } });

      const boardProps = screen.getByTestId('board-props');
      expect(boardProps).toHaveTextContent('Size: 10');
      expect(boardProps).toHaveTextContent('Width: 400');
    });

    it('provides correct callbacks to Board', async () => {
      const user = userEvent.setup();
      render(<Game width={400} />);

      const slider = screen.getByRole('slider');
      const canvas = screen.getByTestId('board-canvas');
      const resetTrigger = screen.getByTestId('mock-reset-trigger');

      // Test onStarted callback
      expect(slider).not.toBeDisabled();
      await user.click(canvas);
      expect(slider).toBeDisabled();

      // Test onReset callback
      await user.click(resetTrigger);
      expect(slider).not.toBeDisabled();
    });
  });

  describe('URL State Management', () => {
    it('updates URL when size changes', () => {
      render(<Game width={400} />);

      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '12' } });

      expect(mockPushState).toHaveBeenCalledWith(
        '',
        '',
        expect.stringContaining('size=12')
      );
    });

    it('updates URL when new game is started', async () => {
      const user = userEvent.setup();
      render(<Game width={400} />);

      mockPushState.mockClear(); // Clear initial calls

      // Find and click new game button
      const buttons = screen.getAllByRole('button');
      const newGameButton = buttons.find((button) =>
        button.querySelector('svg path[d*="M16.023 9.348"]')
      );

      await user.click(newGameButton!);

      expect(mockPushState).toHaveBeenCalledWith(
        '',
        '',
        expect.stringMatching(/seed=\d+&size=8/)
      );
    });
  });

  describe('Game State Management', () => {
    it('maintains consistent state across interactions', () => {
      render(<Game width={400} />);

      const slider = screen.getByRole('slider');

      // Change size and verify state consistency
      fireEvent.change(slider, { target: { value: '11' } });
      expect(slider).toHaveValue('11');

      const boardProps = screen.getByTestId('board-props');
      expect(boardProps).toHaveTextContent('Size: 11');
    });

    it('resets to unlocked state on reset', async () => {
      const user = userEvent.setup();
      render(<Game width={400} />);

      const slider = screen.getByRole('slider');
      const canvas = screen.getByTestId('board-canvas');

      // Lock slider
      await user.click(canvas);
      expect(slider).toBeDisabled();

      // Reset should unlock (using the first game button)
      const buttons = screen.getAllByRole('button');
      const gameButtons = buttons.filter(
        (button) => button.getAttribute('data-testid') !== 'mock-reset-trigger'
      );
      const resetButton = gameButtons[0]; // Reset is the first button

      await user.click(resetButton);
      expect(slider).not.toBeDisabled();
    });

    it('handles multiple state changes correctly', async () => {
      const user = userEvent.setup();
      render(<Game width={400} />);

      const slider = screen.getByRole('slider');
      const canvas = screen.getByTestId('board-canvas');

      // Multiple lock/unlock cycles
      await user.click(canvas); // Lock
      expect(slider).toBeDisabled();

      const buttons = screen.getAllByRole('button');
      const gameButtons = buttons.filter(
        (button) => button.getAttribute('data-testid') !== 'mock-reset-trigger'
      );
      const newGameButton = gameButtons[1]; // New game is the second button

      await user.click(newGameButton); // Unlock with new game
      expect(slider).not.toBeDisabled();

      await user.click(canvas); // Lock again
      expect(slider).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('slider has proper accessibility attributes', () => {
      render(<Game width={400} />);

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('id', 'board-size');
      expect(slider).toHaveAttribute('min', '5');
      expect(slider).toHaveAttribute('max', '16');
    });

    it('maintains focus management during state changes', async () => {
      render(<Game width={400} />);

      const slider = screen.getByRole('slider');

      // Focus slider
      slider.focus();
      expect(slider).toHaveFocus();

      // State changes shouldn't break focus management
      fireEvent.change(slider, { target: { value: '10' } });
      expect(slider).toHaveValue('10');
    });
  });
});
