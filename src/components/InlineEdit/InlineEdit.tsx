/**
 * InlineEdit Component
 * Provides inline editing functionality with pencil icon trigger and save/cancel actions
 * 
 * @version 1.0.0
 * @since 2025-01-31
 */

import React, { useState, useRef, useEffect } from 'react';
import './InlineEdit.css';

interface InlineEditProps {
  value: string;
  onSave: (newValue: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  multiline?: boolean;
  dir?: 'ltr' | 'rtl';
  maxLength?: number;
  startInEditMode?: boolean;
  onCancel?: () => void;
  hideButtons?: boolean;
}

const InlineEdit: React.FC<InlineEditProps> = ({
  value,
  onSave,
  placeholder = '',
  className = '',
  disabled = false,
  multiline = false,
  dir = 'ltr',
  maxLength,
  startInEditMode = false,
  onCancel,
  hideButtons = false
}) => {
  const [isEditing, setIsEditing] = useState(startInEditMode);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Update editValue when value prop changes
  useEffect(() => {
    setEditValue(value);
  }, [value]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Select all text for easy replacement
      if (inputRef.current instanceof HTMLInputElement) {
        inputRef.current.select();
      } else if (inputRef.current instanceof HTMLTextAreaElement) {
        inputRef.current.setSelectionRange(0, inputRef.current.value.length);
      }
    }
  }, [isEditing]);

  const handleEdit = () => {
    if (disabled) return;
    setIsEditing(true);
    setEditValue(value); // Reset to current value
  };

  const handleSave = () => {
    const trimmedValue = editValue.trim();
    if (trimmedValue !== value) {
      onSave(trimmedValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value); // Reset to original value
    setIsEditing(false);
    if (onCancel) {
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleBlur = () => {
    // Don't auto-save on blur to prevent accidental saves
    // User must explicitly click save or press Enter
  };

  if (isEditing) {
    return (
      <div className={`inline-edit-container editing ${className}`}>
        <div className="inline-edit-input-container">
          {multiline ? (
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              className="inline-edit-input"
              placeholder={placeholder}
              dir={dir}
              maxLength={maxLength}
              rows={3}
            />
          ) : (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              className="inline-edit-input"
              placeholder={placeholder}
              dir={dir}
              maxLength={maxLength}
            />
          )}
        </div>
        
        {!hideButtons && (
          <div className="inline-edit-actions">
            <button
              className="inline-edit-btn save"
              onClick={handleSave}
              title="Сохранить"
              type="button"
            >
              ✓
            </button>
            <button
              className="inline-edit-btn cancel"
              onClick={handleCancel}
              title="Отменить"
              type="button"
            >
              ✗
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`inline-edit-container display ${className}`}>
      <div className="inline-edit-display">
        <span className={`inline-edit-text ${!value ? 'placeholder' : ''}`} dir={dir}>
          {value || placeholder}
        </span>
      </div>
      
      <button
        className="inline-edit-trigger"
        onClick={handleEdit}
        disabled={disabled}
        title="Редактировать"
        type="button"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path 
            d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z" 
            fill="currentColor"
          />
        </svg>
      </button>
    </div>
  );
};

export default InlineEdit;