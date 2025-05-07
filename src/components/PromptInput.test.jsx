import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PromptInput from './PromptInput';

describe('PromptInput Component', () => {
  it('renders the input field and a disabled send button initially', () => {
    render(<PromptInput onSendMessage={() => {}} isLoading={false} />);
    
    const inputElement = screen.getByPlaceholderText('Describe the image you want to generate...');
    expect(inputElement).toBeInTheDocument();

    const sendButton = screen.getByRole('button');
    expect(sendButton).toBeInTheDocument();
    expect(sendButton).toBeDisabled();
  });

  it('enables the send button when text is entered', () => {
    render(<PromptInput onSendMessage={() => {}} isLoading={false} />);
    
    const inputElement = screen.getByPlaceholderText('Describe the image you want to generate...');
    fireEvent.change(inputElement, { target: { value: 'A cat playing piano' } });

    const sendButton = screen.getByRole('button');
    expect(sendButton).not.toBeDisabled();
  });

  it('calls onSendMessage with the prompt text when the form is submitted', () => {
    const mockOnSendMessage = vi.fn();
    render(<PromptInput onSendMessage={mockOnSendMessage} isLoading={false} />);
    
    const inputElement = screen.getByPlaceholderText('Describe the image you want to generate...');
    fireEvent.change(inputElement, { target: { value: 'A detailed portrait' } });

    const sendButton = screen.getByRole('button');
    fireEvent.click(sendButton);

    expect(mockOnSendMessage).toHaveBeenCalledOnce();
    expect(mockOnSendMessage).toHaveBeenCalledWith('A detailed portrait');
  });

  it('disables input and button when isLoading is true', () => {
    render(<PromptInput onSendMessage={() => {}} isLoading={true} />);
    
    const inputElement = screen.getByPlaceholderText('Describe the image you want to generate...');
    expect(inputElement).toBeDisabled();

    const sendButton = screen.getByRole('button');
    expect(sendButton).toBeDisabled();
    // Check for loader icon (presence of svg with animate-spin could be a way, or a specific data-testid)
    expect(screen.getByRole('button').querySelector('.animate-spin')).toBeInTheDocument();
  });
});
