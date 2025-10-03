import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { CarbonActivityForm } from '../../components/carbon-activity-form';

// Mock the API service
jest.mock('../../services/api', () => ({
  apiService: {
    createUserActivity: jest.fn(() => Promise.resolve({
      success: true,
      data: { id: 1 },
    })),
  },
}) as any);

// Mock the theme hook
jest.mock('../../hooks/use-theme-color', () => ({
  useThemeColor: () => '#007AFF',
}));

describe('CarbonActivityForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form fields correctly', () => {
    render(
      <CarbonActivityForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        onError={mockOnError}
      />
    );

    expect(screen.getByText('Thêm hoạt động')).toBeTruthy();
    expect(screen.getByText('Loại hoạt động')).toBeTruthy();
    expect(screen.getByText('Danh mục')).toBeTruthy();
    expect(screen.getByText('Số lượng (km)')).toBeTruthy();
    expect(screen.getByText('Mô tả (tùy chọn)')).toBeTruthy();
  });

  it('shows validation errors for empty required fields', async () => {
    render(
      <CarbonActivityForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        onError={mockOnError}
      />
    );

    const submitButton = screen.getByText('Thêm');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Vui lòng nhập số lượng')).toBeTruthy();
    });
  });

  it('shows validation error for invalid value', async () => {
    render(
      <CarbonActivityForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        onError={mockOnError}
      />
    );

    const valueInput = screen.getByPlaceholderText('Nhập số lượng');
    fireEvent.changeText(valueInput, '-5');

    const submitButton = screen.getByText('Thêm');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Giá trị phải lớn hơn 0')).toBeTruthy();
    });
  });

  it('shows CO2 preview when value is entered', async () => {
    render(
      <CarbonActivityForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        onError={mockOnError}
      />
    );

    const valueInput = screen.getByPlaceholderText('Nhập số lượng');
    fireEvent.changeText(valueInput, '10');

    await waitFor(() => {
      expect(screen.getByText(/Ước tính:/)).toBeTruthy();
    });
  });

  it('calls onSubmit when form is valid and submitted', async () => {
    render(
      <CarbonActivityForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        onError={mockOnError}
      />
    );

    const valueInput = screen.getByPlaceholderText('Nhập số lượng');
    fireEvent.changeText(valueInput, '10');

    const submitButton = screen.getByText('Thêm');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'transport',
          category: 'motorbike',
          value: 10,
          co2Emission: 0.72,
        })
      );
    });
  });

  it('calls onCancel when cancel button is pressed', () => {
    render(
      <CarbonActivityForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        onError={mockOnError}
      />
    );

    const cancelButton = screen.getByText('Hủy');
    fireEvent.press(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('disables submit button when form is invalid', () => {
    render(
      <CarbonActivityForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        onError={mockOnError}
      />
    );

    const submitButton = screen.getByText('Thêm');
    expect(submitButton.props.accessibilityState?.disabled).toBe(true);
  });

  it('enables submit button when form is valid', async () => {
    render(
      <CarbonActivityForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        onError={mockOnError}
      />
    );

    const valueInput = screen.getByPlaceholderText('Nhập số lượng');
    fireEvent.changeText(valueInput, '10');

    await waitFor(() => {
      const submitButton = screen.getByText('Thêm');
      expect(submitButton.props.accessibilityState?.disabled).toBe(false);
    });
  });
});
