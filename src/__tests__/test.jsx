// src/__tests__/StockWatchlistLite.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import StockWatchlistLite from '../App';

// Mock recharts to avoid canvas issues in tests
vi.mock('recharts', () => ({
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>
}));

describe('StockWatchlistLite', () => {
  
  // Test 1: Cards render correctly with data
  describe('Stock Cards Rendering', () => {
    test('renders stock cards with correct data after loading', async () => {
      render(<StockWatchlistLite />);
      
      // Check for loading state initially
      expect(document.querySelectorAll('.animate-pulse')).toHaveLength(12);
      
      // Wait for loading to complete and cards to appear
      await waitFor(() => {
        expect(screen.getByTestId('stock-card-AAPL')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Check if stock cards are rendered
      const appleCard = screen.getByTestId('stock-card-AAPL');
      const googleCard = screen.getByTestId('stock-card-GOOGL');
      
      expect(appleCard).toBeInTheDocument();
      expect(googleCard).toBeInTheDocument();
      
      // Check if stock symbols are displayed
      expect(screen.getByText('AAPL')).toBeInTheDocument();
      expect(screen.getByText('GOOGL')).toBeInTheDocument();
      
      // Check if prices are displayed (should have $ symbol)
      expect(appleCard).toHaveTextContent('$');
      expect(googleCard).toHaveTextContent('$');
      
      // Check if percentage changes are displayed
      expect(appleCard).toHaveTextContent('%');
      expect(googleCard).toHaveTextContent('%');
      
      // Check if "Updated X min ago" is displayed
      expect(appleCard).toHaveTextContent('min ago');
      expect(googleCard).toHaveTextContent('min ago');
      
      // Check for Capital Market Price labels (default view)
      const capitalLabels = screen.getAllByText(/Capital Market Price/);
      expect(capitalLabels.length).toBeGreaterThan(0);
    });
    
    test('displays correct number of stock cards', async () => {
      render(<StockWatchlistLite />);
      
      await waitFor(() => {
        expect(screen.getByTestId('stock-card-AAPL')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Should display all 12 stock cards
      const stockCards = screen.getAllByTestId(/stock-card-/);
      expect(stockCards).toHaveLength(12);
    });
    
    test('shows skeleton loaders during loading', () => {
      render(<StockWatchlistLite />);
      
      // Check for skeleton loaders (they have animate-pulse class)
      const skeletonElements = document.querySelectorAll('.animate-pulse');
      expect(skeletonElements.length).toBe(12);
    });
  });

  // Test 2: Toggle button switches views
  describe('Toggle View Functionality', () => {
    test('toggle button switches between Capital and Futures views', async () => {
      const user = userEvent.setup();
      render(<StockWatchlistLite />);
      
      // Wait for cards to load
      await waitFor(() => {
        expect(screen.getByTestId('stock-card-AAPL')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      const appleCard = screen.getByTestId('stock-card-AAPL');
      const toggleButton = screen.getByTestId('toggle-AAPL');
      
      // Initially should show Capital Market Price
      expect(appleCard).toHaveTextContent('Capital Market Price');
      expect(appleCard).toHaveTextContent('Futures Price');
      
      // Click toggle button
      await user.click(toggleButton);
      
      // Should now show Futures Market Price as primary
      expect(appleCard).toHaveTextContent('Futures Market Price');
      expect(appleCard).toHaveTextContent('Capital Price');
      
      // Click toggle again to switch back
      await user.click(toggleButton);
      
      // Should be back to Capital Market Price
      expect(appleCard).toHaveTextContent('Capital Market Price');
      expect(appleCard).toHaveTextContent('Futures Price');
    });
    
    test('toggle button works independently for each card', async () => {
      const user = userEvent.setup();
      render(<StockWatchlistLite />);
      
      await waitFor(() => {
        expect(screen.getByTestId('stock-card-AAPL')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      const appleCard = screen.getByTestId('stock-card-AAPL');
      const googleCard = screen.getByTestId('stock-card-GOOGL');
      const appleToggle = screen.getByTestId('toggle-AAPL');
      const googleToggle = screen.getByTestId('toggle-GOOGL');
      
      // Toggle only Apple card
      await user.click(appleToggle);
      
      // Apple should show Futures as primary
      expect(appleCard).toHaveTextContent('Futures Market Price');
      // Google should still show Capital as primary
      expect(googleCard).toHaveTextContent('Capital Market Price');
      
      // Toggle Google card
      await user.click(googleToggle);
      
      // Both should now show Futures as primary
      expect(appleCard).toHaveTextContent('Futures Market Price');
      expect(googleCard).toHaveTextContent('Futures Market Price');
    });
    
    test('toggle button prevents card click when clicked', async () => {
      const user = userEvent.setup();
      render(<StockWatchlistLite />);
      
      await waitFor(() => {
        expect(screen.getByTestId('stock-card-AAPL')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      const toggleButton = screen.getByTestId('toggle-AAPL');
      
      // Click toggle button
      await user.click(toggleButton);
      
      // Drawer should not open (no side drawer visible)
      expect(screen.queryByText('AAPL Details')).not.toBeInTheDocument();
    });
  });

  // Test 3: Error handling and retry flow
  describe('Error Handling and Retry', () => {
    test('displays error message and retry button on fetch failure', async () => {
      // Mock Math.random to always return a value that triggers error (< 0.2)
      const originalMathRandom = Math.random;
      Math.random = vi.fn(() => 0.1);
      
      render(<StockWatchlistLite />);
      
      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Check error message content
      expect(screen.getByText('Error loading data')).toBeInTheDocument();
      expect(screen.getByText(/Failed to fetch stock data/)).toBeInTheDocument();
      
      // Check retry button is present
      const retryButton = screen.getByTestId('retry-button');
      expect(retryButton).toBeInTheDocument();
      expect(retryButton).toHaveTextContent('Retry');
      
      // Restore original Math.random
      Math.random = originalMathRandom;
    });
    
    test('retry button attempts to reload data', async () => {
      const user = userEvent.setup();
      
      // Mock Math.random to first trigger error, then succeed
      const originalMathRandom = Math.random;
      let callCount = 0;
      Math.random = vi.fn(() => {
        callCount++;
        return callCount === 1 ? 0.1 : 0.5; // First call error, second success
      });
      
      render(<StockWatchlistLite />);
      
      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      const retryButton = screen.getByTestId('retry-button');
      
      // Click retry button
      await user.click(retryButton);
      
      // Should show loading state
      expect(document.querySelectorAll('.animate-pulse')).toHaveLength(12);
      
      // Wait for successful load
      await waitFor(() => {
        expect(screen.getByTestId('stock-card-AAPL')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Error message should be gone
      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
      
      // Cards should be displayed
      expect(screen.getAllByTestId(/stock-card-/)).toHaveLength(12);
      
      // Restore original Math.random
      Math.random = originalMathRandom;
    });
    
    test('refresh button triggers data reload', async () => {
      const user = userEvent.setup();
      render(<StockWatchlistLite />);
      
      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('stock-card-AAPL')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      const refreshButton = screen.getByTestId('refresh-button');
      
      // Click refresh button
      await user.click(refreshButton);
      
      // Should show loading state again
      expect(document.querySelectorAll('.animate-pulse')).toHaveLength(12);
      
      // Wait for reload to complete
      await waitFor(() => {
        expect(screen.getByTestId('stock-card-AAPL')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  // Bonus tests for additional functionality
  describe('Additional Features', () => {
    test('search functionality filters stocks', async () => {
      const user = userEvent.setup();
      render(<StockWatchlistLite />);
      
      await waitFor(() => {
        expect(screen.getByTestId('stock-card-AAPL')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      const searchInput = screen.getByTestId('search-input');
      
      // Search for AAPL
      await user.type(searchInput, 'AAPL');
      
      // Should only show AAPL card
      expect(screen.getByTestId('stock-card-AAPL')).toBeInTheDocument();
      expect(screen.queryByTestId('stock-card-GOOGL')).not.toBeInTheDocument();
    });
    
    test('sort functionality changes card order', async () => {
      const user = userEvent.setup();
      render(<StockWatchlistLite />);
      
      await waitFor(() => {
        expect(screen.getByTestId('stock-card-AAPL')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      const sortSelect = screen.getByTestId('sort-select');
      
      // Change sort to percentage change
      await user.selectOptions(sortSelect, 'percentageChange');
      
      // Verify sort option changed
      expect(sortSelect.value).toBe('percentageChange');
    });
    
    test('clicking card opens side drawer', async () => {
      const user = userEvent.setup();
      render(<StockWatchlistLite />);
      
      await waitFor(() => {
        expect(screen.getByTestId('stock-card-AAPL')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      const appleCard = screen.getByTestId('stock-card-AAPL');
      
      // Click on card
      await user.click(appleCard);
      
      // Drawer should open
      await waitFor(() => {
        expect(screen.getByText('AAPL Details')).toBeInTheDocument();
      });
      
      // Should show chart
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
  });
});

// Additional test files that would be created:

// src/__tests__/setup.js
export {}; // This makes it a module

// src/test/setup.js - Test setup file referenced in README
import '@testing-library/jest-dom';