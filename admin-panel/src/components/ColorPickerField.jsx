// src/components/ColorPickerField.jsx
import React, { useState } from 'react';
import { ChromePicker } from 'react-color';

const ColorPickerField = ({ name, label, value, onChange, onBlur }) => {
  const [displayPicker, setDisplayPicker] = useState(false);

  const handleClick = () => {
    setDisplayPicker(!displayPicker);
  };

  const handleClose = () => {
    setDisplayPicker(false);
  };

  return (
    <div className="mb-4 relative">
      <label className="block text-gray-700 dark:text-gray-200 mb-1">
        {label}
      </label>
      <div
        onClick={handleClick}
        className="w-full h-10 border rounded cursor-pointer flex items-center px-3"
        style={{ backgroundColor: value || '#ffffff' }}
      >
        <span className="text-sm text-gray-800 dark:text-gray-200">
          {value || 'Select Color'}
        </span>
      </div>
      {displayPicker && (
        <div className="absolute z-50 mt-2">
          <div className="fixed inset-0" onClick={handleClose} />
          <ChromePicker
            color={value || '#ffffff'}
            onChangeComplete={(color) => {
              onChange({ target: { name, value: color.hex } });
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ColorPickerField;
