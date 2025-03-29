// admin/src/pages/Policies.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FaEdit } from 'react-icons/fa';
import { Transition } from '@headlessui/react';
import { fetchPolicy, updatePolicy } from '../redux/slices/policiesSlice';

const sections = [
  { id: 'privacy', label: 'Privacy Policy' },
  { id: 'terms', label: 'Terms of Use' },
  { id: 'contact', label: 'Contact Us' },
  { id: 'about', label: 'About Us' },
  { id: 'faq', label: 'FAQ' },
];

const Policies = () => {
  const dispatch = useDispatch();
  const { policy, loading, error } = useSelector((state) => state.policies);
  const [showForm, setShowForm] = useState(false);
  const [activeSection, setActiveSection] = useState('privacy'); // default to Privacy Policy

  useEffect(() => {
    dispatch(fetchPolicy(activeSection));
  }, [dispatch, activeSection]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: { content: policy?.content || '' },
    validationSchema: Yup.object({
      content: Yup.string().required('Content is required'),
    }),
    onSubmit: async (values) => {
      try {
        await dispatch(updatePolicy({ type: activeSection, content: values.content }));
        setShowForm(false);
      } catch (err) {
        console.error('Update policy error:', err);
      }
    },
  });

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
        {sections.find((s) => s.id === activeSection)?.label} Management
      </h2>
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`px-4 py-2 rounded transition ${
              activeSection === section.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-300 text-gray-800 hover:bg-gray-400'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-gray-800 dark:text-gray-200">Loading content...</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-md">
          <pre className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">
            {policy?.content || 'No content available. Time to add some juicy details!'}
          </pre>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 flex items-center text-blue-500 hover:text-blue-700"
            aria-label="Edit Content"
          >
            <FaEdit className="mr-1" /> Edit
          </button>
        </div>
      )}

      {/* Edit Form Modal */}
      <Transition
        show={showForm}
        enter="transition ease-out duration-300 transform"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="transition ease-in duration-200 transform"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          role="dialog"
        >
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-3xl mx-4">
            <h3 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              Edit {sections.find((s) => s.id === activeSection)?.label}
            </h3>
            <form onSubmit={formik.handleSubmit}>
              <textarea
                name="content"
                rows="10"
                className="w-full p-3 border rounded focus:outline-none"
                value={formik.values.content}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter content..."
              />
              {formik.touched.content && formik.errors.content && (
                <div className="text-red-500 text-sm mt-1">{formik.errors.content}</div>
              )}
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded mr-2 hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </div>
  );
};

export default Policies;
