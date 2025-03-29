// src/pages/ThemeSettings.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTheme, updateTheme } from '../redux/slices/themeSlice';
import { useFormik } from 'formik';
import ColorPickerField from '../components/ColorPickerField';

const ThemeSettings = () => {
  const dispatch = useDispatch();
  const { theme, loading, error } = useSelector((state) => state.theme);

  useEffect(() => {
    dispatch(fetchTheme());
  }, [dispatch]);

  // Define default values in case no theme is returned yet
  const defaultValues = {
    light: {
      backgroundHeaderColor: '',
      backgroundColor: '',
      primaryColor: '',
      secondaryColor: '',
      textColor: '',
      headerBackground: ['', ''],
      placeholderTextColor: '',
      cardBackground: '',
      cardTextColor: '',
      overlayColor: '',
      tabBarActiveTintColor: '',
      tabBarInactiveTintColor: '',
      statusBarStyle: '',
      switchTrackColorFalse: '',
      switchTrackColorTrue: '',
      switchThumbColor: '',
      switchIosBackgroundColor: '',
      borderColor: '',
      priceColor: '',
      headerTextColor: '',
      arrowColor: '',
    },
    dark: {
      backgroundHeaderColor: '',
      backgroundColor: '',
      primaryColor: '',
      secondaryColor: '',
      textColor: '',
      headerBackground: ['', ''],
      placeholderTextColor: '',
      cardBackground: '',
      cardTextColor: '',
      overlayColor: '',
      tabBarActiveTintColor: '',
      tabBarInactiveTintColor: '',
      statusBarStyle: '',
      switchTrackColorFalse: '',
      switchTrackColorTrue: '',
      switchThumbColor: '',
      switchIosBackgroundColor: '',
      borderColor: '',
      priceColor: '',
      headerTextColor: '',
      arrowColor: '',
    },
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: theme || defaultValues,
    onSubmit: (values) => {
      dispatch(updateTheme(values));
    },
  });

  // Helper to render each field. If isColor is true, we render the color picker.
  const renderField = (mode, fieldKey, label, isColor = false, isArray = false, index = null) => {
    const fieldName = isArray ? `${mode}.${fieldKey}[${index}]` : `${mode}.${fieldKey}`;
    const fieldValue = isArray
      ? formik.values[mode][fieldKey][index]
      : formik.values[mode][fieldKey];

    if (isColor) {
      return (
        <ColorPickerField
          key={fieldName}
          name={fieldName}
          label={label}
          value={fieldValue}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
      );
    }

    return (
      <div className="mb-4" key={fieldName}>
        <label className="block text-gray-700 dark:text-gray-200 mb-1">{label}</label>
        <input
          type="text"
          name={fieldName}
          value={fieldValue}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          placeholder={label}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
        />
      </div>
    );
  };

  // Render a theme section (light or dark) in a card-like layout.
  const renderThemeSection = (mode) => {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-md mb-8">
        <h3 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
          {mode.charAt(0).toUpperCase() + mode.slice(1)} Theme
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderField(mode, 'backgroundHeaderColor', 'Header Background Color', true)}
          {renderField(mode, 'backgroundColor', 'Background Color', true)}
          {renderField(mode, 'primaryColor', 'Primary Color', true)}
          {renderField(mode, 'secondaryColor', 'Secondary Color', true)}
          {renderField(mode, 'textColor', 'Text Color', true)}
          {renderField(mode, 'headerBackground', 'Header Gradient Color 1', true, true, 0)}
          {renderField(mode, 'headerBackground', 'Header Gradient Color 2', true, true, 1)}
          {renderField(mode, 'placeholderTextColor', 'Placeholder Text Color', true)}
          {renderField(mode, 'cardBackground', 'Card Background', true)}
          {renderField(mode, 'cardTextColor', 'Card Text Color', true)}
          {renderField(mode, 'overlayColor', 'Overlay Color', true)}
          {renderField(mode, 'tabBarActiveTintColor', 'TabBar Active Tint', true)}
          {renderField(mode, 'tabBarInactiveTintColor', 'TabBar Inactive Tint', true)}
          {renderField(mode, 'statusBarStyle', 'Status Bar Style')}
          {renderField(mode, 'switchTrackColorFalse', 'Switch Track (Off)', true)}
          {renderField(mode, 'switchTrackColorTrue', 'Switch Track (On)', true)}
          {renderField(mode, 'switchThumbColor', 'Switch Thumb Color', true)}
          {renderField(mode, 'switchIosBackgroundColor', 'Switch iOS Background', true)}
          {renderField(mode, 'borderColor', 'Border Color', true)}
          {renderField(mode, 'priceColor', 'Price Color', true)}
          {renderField(mode, 'headerTextColor', 'Header Text Color', true)}
          {renderField(mode, 'arrowColor', 'Arrow Color', true)}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
        Theme Settings
      </h2>
      {loading && <div>Loading theme settings...</div>}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form onSubmit={formik.handleSubmit} className="space-y-8">
        {renderThemeSection('light')}
        {renderThemeSection('dark')}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 transition"
          >
            Save Theme Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default ThemeSettings;
