import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik, FormikProvider, FieldArray } from 'formik';
import * as Yup from 'yup';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaChevronLeft,
  FaChevronRight,
  FaGripVertical,
} from 'react-icons/fa';
import { Dialog, Transition } from '@headlessui/react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';

import {
  fetchCourses,
  addCourse,
  updateCourse,
  deleteCourse,
} from '../redux/slices/coursesSlice';

// --------------------------------
// Sortable video item component
// --------------------------------
const SortableVideoItem = ({
  video,
  index,
  form,
  editingVideoIndex,
  setEditingVideoIndex,
  remove,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: index,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="mb-6 border p-6 rounded-xl shadow-lg bg-white dark:bg-gray-800"
    >
      {/* Drag Handle */}
      <div {...attributes} {...listeners} className="flex items-center cursor-move mb-4">
        <FaGripVertical className="text-gray-500 mr-3" />
        <span className="font-semibold text-lg">Video {index + 1}</span>
      </div>

      {editingVideoIndex === index ? (
        // Editing view
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Video Title
            </label>
            <input
              type="text"
              name={`videos[${index}].title`}
              value={video.title || ''}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2
                         focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
              placeholder="Enter video title"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Video URL
            </label>
            <input
              type="text"
              name={`videos[${index}].url`}
              value={video.url || ''}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2
                         focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
              placeholder="https://example.com/video.mp4"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Cover Image URL
            </label>
            <input
              type="text"
              name={`videos[${index}].coverImage`}
              value={video.coverImage || ''}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2
                         focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
              placeholder="https://example.com/cover.jpg"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Video Description
            </label>
            <textarea
              name={`videos[${index}].description`}
              value={video.description || ''}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2
                         focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
              placeholder="Optional description"
            />
          </div>
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Duration (s)
              </label>
              <input
                type="number"
                name={`videos[${index}].duration`}
                value={video.duration || ''}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2
                           focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
                placeholder="Duration"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Priority
              </label>
              <input
                type="number"
                name={`videos[${index}].priority`}
                value={video.priority || 0}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2
                           focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
                placeholder="Priority"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEditingVideoIndex(null)}
            className="mt-2 inline-flex items-center rounded-md bg-blue-600 px-4 py-2
                       text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none"
          >
            Save
          </button>
        </div>
      ) : (
        // Summary view
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            {video.coverImage ? (
              <img
                src={video.coverImage}
                alt="Cover"
                className="w-16 h-16 rounded object-cover mr-3"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded mr-3" />
            )}
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200">
                {video.title || 'Untitled Video'}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {video.duration || 0}s | P: {video.priority || 0}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEditingVideoIndex(index)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Edit
          </button>
        </div>
      )}
      <div className="mt-4">
        <button
          type="button"
          onClick={() => remove(index)}
          className="inline-flex items-center rounded-md bg-red-600 px-3 py-2
                     text-sm font-medium text-white shadow hover:bg-red-700 focus:outline-none"
        >
          Remove Video
        </button>
      </div>
    </div>
  );
};

// --------------------------------
// Main Courses Component
// --------------------------------
const Courses = () => {
  const dispatch = useDispatch();
  const { courses, loading, error } = useSelector((state) => state.courses);
  const [showForm, setShowForm] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [editingVideoIndex, setEditingVideoIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 10;

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  // --------------------------------
  // Formik Initial Values
  // --------------------------------
  const initialValues = {
    // Original fields:
    title: currentCourse ? currentCourse.title : '',
    description: currentCourse ? currentCourse.description : '',
    instructor: currentCourse ? currentCourse.instructor : '',
    price: currentCourse ? currentCourse.price : '',
    saleEnabled: currentCourse ? currentCourse.saleEnabled : false,
    salePrice:
      currentCourse && currentCourse.salePrice !== undefined
        ? currentCourse.salePrice
        : '',
    image: currentCourse ? currentCourse.image : '',
    createdAt: currentCourse
      ? new Date(currentCourse.createdAt).toISOString().substr(0, 10)
      : '',
    videos: currentCourse && currentCourse.videos ? currentCourse.videos : [],
    isFeatured: currentCourse ? currentCourse.isFeatured : false,
    shortVideoLink: currentCourse ? currentCourse.shortVideoLink : '',

    // NEW FIELDS (optional or defaults):
    difficultyLevel: currentCourse ? currentCourse.difficultyLevel : 'Beginner',
    language: currentCourse ? currentCourse.language : 'English',
    topics:
      currentCourse && currentCourse.topics
        ? currentCourse.topics.join(', ')
        : '',
    totalDuration: currentCourse ? currentCourse.totalDuration : 0,
    numberOfLectures: currentCourse ? currentCourse.numberOfLectures : 0,
    category: currentCourse ? currentCourse.category : '',
    tags:
      currentCourse && currentCourse.tags ? currentCourse.tags.join(', ') : '',
    requirements:
      currentCourse && currentCourse.requirements
        ? currentCourse.requirements.join(', ')
        : '',
    whatYouWillLearn:
      currentCourse && currentCourse.whatYouWillLearn
        ? currentCourse.whatYouWillLearn.join(', ')
        : '',
  };

  // --------------------------------
  // Formik Setup
  // --------------------------------
  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: Yup.object({
      title: Yup.string().required('Course title is required'),
      description: Yup.string().required('Description is required'),
      instructor: Yup.string().required('Instructor is required'),
      price: Yup.number()
        .positive('Price must be a positive number')
        .required('Price is required'),
      salePrice: Yup.number().when('saleEnabled', {
        is: true,
        then: (schema) =>
          schema
            .positive('Sale Price must be a positive number')
            .required('Sale Price is required when sale is enabled'),
        otherwise: (schema) => schema,
      }),
      image: Yup.string()
        .url('Please enter a valid URL')
        .required('Image URL is required'),
      shortVideoLink: Yup.string().when('isFeatured', {
        is: true,
        then: (schema) =>
          schema
            .url('Please enter a valid URL')
            .required('Short video link is required for featured courses'),
        otherwise: (schema) => schema,
      }),
      // Add other validations as needed...
    }),
    onSubmit: async (values) => {
      // Convert comma-separated strings back into arrays
      const courseData = {
        ...values,
        topics: values.topics
          ? values.topics.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
        tags: values.tags
          ? values.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
        requirements: values.requirements
          ? values.requirements.split(',').map((r) => r.trim()).filter(Boolean)
          : [],
        whatYouWillLearn: values.whatYouWillLearn
          ? values.whatYouWillLearn
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean)
          : [],
        // Sort videos by priority before sending data
        videos: [...values.videos].sort((a, b) => a.priority - b.priority),
      };

      if (currentCourse) {
        try {
          await dispatch(updateCourse({ id: currentCourse._id, courseData })).unwrap();
          setShowForm(false);
          setCurrentCourse(null);
          setEditingVideoIndex(null);
          formik.resetForm();
          setCurrentPage(1);
        } catch (err) {
          console.error('Update course error:', err);
        }
      } else {
        try {
          await dispatch(addCourse(courseData)).unwrap();
          setShowForm(false);
          setEditingVideoIndex(null);
          formik.resetForm();
          setCurrentPage(1);
        } catch (err) {
          console.error('Add course error:', err);
        }
      }
    },
  });

  // --------------------------------
  // Handlers
  // --------------------------------
  const handleEdit = (course) => {
    setCurrentCourse(course);
    setShowForm(true);
    setEditingVideoIndex(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await dispatch(deleteCourse(id)).unwrap();
        const indexOfLast = currentPage * coursesPerPage;
        const indexOfFirst = indexOfLast - coursesPerPage;
        const currentSlice = courses.slice(indexOfFirst, indexOfLast);
        if (currentSlice.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (err) {
        console.error('Delete course error:', err);
      }
    }
  };

  // Pagination
  const indexOfLast = currentPage * coursesPerPage;
  const indexOfFirst = indexOfLast - coursesPerPage;
  const currentCourses = courses.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(courses.length / coursesPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Drag + drop reordering for videos
  const handleDragEnd = (event, form) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = Number(active.id);
      const newIndex = Number(over.id);
      let newVideos = arrayMove(form.values.videos, oldIndex, newIndex);

      // Update priority for each video
      newVideos = newVideos.map((video, idx) => ({
        ...video,
        priority: idx,
      }));
      form.setFieldValue('videos', newVideos);
    }
  };

  // --------------------------------
  // Render
  // --------------------------------
  return (
    <div className="p-8 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <h2 className="text-4xl font-bold mb-8 text-gray-800 dark:text-white">
        Courses Management
      </h2>
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-6">{error}</div>
      )}

      <button
        onClick={() => {
          setShowForm(true);
          setCurrentCourse(null);
          setEditingVideoIndex(null);
          formik.resetForm();
        }}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow
                   hover:bg-blue-700 transition mb-8 inline-flex items-center"
        aria-label="Add Course"
      >
        <FaPlus className="mr-3" /> Add Course
      </button>

      {loading ? (
        <div className="text-gray-800 dark:text-gray-200">Loading...</div>
      ) : (
        <>
          {/* Course Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Instructor
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {currentCourses.map((course) => (
                  <tr
                    key={course._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="py-4 px-6">
                      {course.image ? (
                        <img
                          src={course.image}
                          alt={course.title}
                          className="w-16 h-16 rounded object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded" />
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
                      {course.title}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
                      {course.instructor}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
                      ${course.price.toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
                      {new Date(course.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200 inline-flex items-center space-x-3">
                      <button
                        onClick={() => handleEdit(course)}
                        className="text-blue-600 hover:text-blue-700 inline-flex items-center"
                        aria-label={`Edit course ${course.title}`}
                      >
                        <FaEdit className="mr-1" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(course._id)}
                        className="text-red-600 hover:text-red-700 inline-flex items-center"
                        aria-label={`Delete course ${course.title}`}
                      >
                        <FaTrash className="mr-1" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {currentCourses.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-6 px-6 text-center text-gray-600 dark:text-gray-400">
                      No courses found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {courses.length > coursesPerPage && (
            <div className="flex justify-center mt-8">
              <nav aria-label="Page navigation">
                <ul className="inline-flex -space-x-px">
                  <li>
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 leading-tight text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-l-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        currentPage === 1 && 'cursor-not-allowed opacity-50'
                      }`}
                      aria-label="Previous Page"
                    >
                      <FaChevronLeft />
                    </button>
                  </li>
                  {[...Array(totalPages)].map((_, index) => (
                    <li key={index + 1}>
                      <button
                        onClick={() => paginate(index + 1)}
                        className={`px-4 py-2 leading-tight border border-gray-300 dark:border-gray-700 ${
                          currentPage === index + 1
                            ? 'text-blue-600 bg-blue-50 dark:bg-gray-700 dark:text-white'
                            : 'text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        aria-label={`Go to page ${index + 1}`}
                      >
                        {index + 1}
                      </button>
                    </li>
                  ))}
                  <li>
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 leading-tight text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-r-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        currentPage === totalPages && 'cursor-not-allowed opacity-50'
                      }`}
                      aria-label="Next Page"
                    >
                      <FaChevronRight />
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </>
      )}

      {/* Modal with Headless UI */}
      <Transition appear show={showForm} as={React.Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={() => {
            setShowForm(false);
            setCurrentCourse(null);
            setEditingVideoIndex(null);
            formik.resetForm();
          }}
        >
          <div className="min-h-screen px-4 text-center bg-black bg-opacity-50">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className="inline-block w-full max-w-5xl p-10 my-8 overflow-hidden
                           text-left align-middle transition-all transform bg-white dark:bg-gray-800
                           shadow-2xl rounded-2xl"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b pb-4 mb-6">
                  <Dialog.Title className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                    {currentCourse ? 'Edit Course' : 'Add New Course'}
                  </Dialog.Title>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setCurrentCourse(null);
                      setEditingVideoIndex(null);
                      formik.resetForm();
                    }}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 text-3xl leading-none"
                  >
                    &times;
                  </button>
                </div>

                <FormikProvider value={formik}>
                  <form onSubmit={formik.handleSubmit}>
                    {/* Split container: left for main fields, right for videos */}
                    <div className="flex flex-col md:flex-row gap-8">
                      {/* Left Column (course details) */}
                      <div className="flex-1">
                        {/* Title */}
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Title
                          </label>
                          <input
                            type="text"
                            name="title"
                            className={`mt-2 block w-full rounded-md border-gray-300 shadow-sm px-4 py-3
                                        focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200 ${
                                          formik.touched.title && formik.errors.title
                                            ? 'border-red-500'
                                            : ''
                                        }`}
                            value={formik.values.title}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Course Title"
                          />
                          {formik.touched.title && formik.errors.title && (
                            <div className="text-red-500 text-xs mt-1">{formik.errors.title}</div>
                          )}
                        </div>

                        {/* Description */}
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Description
                          </label>
                          <textarea
                            name="description"
                            className={`mt-2 block w-full rounded-md border-gray-300 shadow-sm px-4 py-3
                                        focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200 ${
                                          formik.touched.description && formik.errors.description
                                            ? 'border-red-500'
                                            : ''
                                        }`}
                            value={formik.values.description}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Course Description"
                          />
                          {formik.touched.description && formik.errors.description && (
                            <div className="text-red-500 text-xs mt-1">{formik.errors.description}</div>
                          )}
                        </div>

                        {/* Instructor */}
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Instructor
                          </label>
                          <input
                            type="text"
                            name="instructor"
                            className={`mt-2 block w-full rounded-md border-gray-300 shadow-sm px-4 py-3
                                        focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200 ${
                                          formik.touched.instructor && formik.errors.instructor
                                            ? 'border-red-500'
                                            : ''
                                        }`}
                            value={formik.values.instructor}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Instructor Name"
                          />
                          {formik.touched.instructor && formik.errors.instructor && (
                            <div className="text-red-500 text-xs mt-1">{formik.errors.instructor}</div>
                          )}
                        </div>

                        {/* Price */}
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Price
                          </label>
                          <input
                            type="number"
                            name="price"
                            className={`mt-2 block w-full rounded-md border-gray-300 shadow-sm px-4 py-3
                                        focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200 ${
                                          formik.touched.price && formik.errors.price
                                            ? 'border-red-500'
                                            : ''
                                        }`}
                            value={formik.values.price}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Course Price"
                            step="0.01"
                          />
                          {formik.touched.price && formik.errors.price && (
                            <div className="text-red-500 text-xs mt-1">{formik.errors.price}</div>
                          )}
                        </div>

                        {/* Sale Enabled Checkbox */}
                        <div className="mb-6 flex items-center">
                          <input
                            type="checkbox"
                            name="saleEnabled"
                            id="saleEnabled"
                            checked={formik.values.saleEnabled}
                            onChange={formik.handleChange}
                            className="mr-2 h-5 w-5 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                          />
                          <label htmlFor="saleEnabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Sale Enabled
                          </label>
                        </div>

                        {/* Conditionally Rendered Sale Price Field */}
                        {formik.values.saleEnabled && (
                          <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Sale Price
                            </label>
                            <input
                              type="number"
                              name="salePrice"
                              value={formik.values.salePrice}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              placeholder="Sale Price"
                              step="0.01"
                              className={`mt-2 block w-full rounded-md border-gray-300 shadow-sm px-4 py-3
                                focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200 ${
                                  formik.touched.salePrice && formik.errors.salePrice ? 'border-red-500' : ''
                                }`}
                            />
                            {formik.touched.salePrice && formik.errors.salePrice && (
                              <div className="text-red-500 text-xs mt-1">{formik.errors.salePrice}</div>
                            )}
                          </div>
                        )}

                        {/* Image URL */}
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Image URL
                          </label>
                          <input
                            type="text"
                            name="image"
                            className={`mt-2 block w-full rounded-md border-gray-300 shadow-sm px-4 py-3
                                        focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200 ${
                                          formik.touched.image && formik.errors.image
                                            ? 'border-red-500'
                                            : ''
                                        }`}
                            value={formik.values.image}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="https://example.com/image.jpg"
                          />
                          {formik.touched.image && formik.errors.image && (
                            <div className="text-red-500 text-xs mt-1">{formik.errors.image}</div>
                          )}
                        </div>

                        {/* isFeatured + shortVideoLink */}
                        <div className="mb-8 flex items-center">
                          <input
                            type="checkbox"
                            name="isFeatured"
                            id="isFeatured"
                            className="mr-3 h-5 w-5 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                            checked={formik.values.isFeatured}
                            onChange={formik.handleChange}
                          />
                          <label htmlFor="isFeatured" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Featured Course
                          </label>
                        </div>
                        {formik.values.isFeatured && (
                          <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Short Video Link
                            </label>
                            <input
                              type="text"
                              name="shortVideoLink"
                              className={`mt-2 block w-full rounded-md border-gray-300 shadow-sm px-4 py-3
                                          focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200 ${
                                            formik.touched.shortVideoLink && formik.errors.shortVideoLink
                                              ? 'border-red-500'
                                              : ''
                                          }`}
                              value={formik.values.shortVideoLink}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              placeholder="https://example.com/shortvideo.mp4"
                            />
                            {formik.touched.shortVideoLink && formik.errors.shortVideoLink && (
                              <div className="text-red-500 text-xs mt-1">{formik.errors.shortVideoLink}</div>
                            )}
                          </div>
                        )}

                        {/* Additional Fields */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Difficulty Level
                          </label>
                          <select
                            name="difficultyLevel"
                            value={formik.values.difficultyLevel}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="mt-2 block w-full rounded-md border-gray-300 shadow-sm px-4 py-3 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
                          >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                          </select>
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Language
                          </label>
                          <input
                            type="text"
                            name="language"
                            value={formik.values.language}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="mt-2 block w-full rounded-md border-gray-300 shadow-sm px-4 py-3 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
                          />
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Category
                          </label>
                          <input
                            type="text"
                            name="category"
                            value={formik.values.category}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="mt-2 block w-full rounded-md border-gray-300 shadow-sm px-4 py-3 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
                            placeholder="Ex: AI, Data Science"
                          />
                        </div>

                        <div className="mb-4 grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Total Duration (min)
                            </label>
                            <input
                              type="number"
                              name="totalDuration"
                              value={formik.values.totalDuration}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              className="mt-2 block w-full rounded-md border-gray-300 shadow-sm px-4 py-3 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Number Of Lectures
                            </label>
                            <input
                              type="number"
                              name="numberOfLectures"
                              value={formik.values.numberOfLectures}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              className="mt-2 block w-full rounded-md border-gray-300 shadow-sm px-4 py-3 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
                            />
                          </div>
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Topics (comma separated)
                          </label>
                          <input
                            type="text"
                            name="topics"
                            value={formik.values.topics}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="mt-2 block w-full rounded-md border-gray-300 shadow-sm px-4 py-3 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
                            placeholder="AI, Machine Learning, etc."
                          />
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Tags (comma separated)
                          </label>
                          <input
                            type="text"
                            name="tags"
                            value={formik.values.tags}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="mt-2 block w-full rounded-md border-gray-300 shadow-sm px-4 py-3 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
                            placeholder="python, ml, beginner, etc."
                          />
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Requirements (comma separated)
                          </label>
                          <input
                            type="text"
                            name="requirements"
                            value={formik.values.requirements}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="mt-2 block w-full rounded-md border-gray-300 shadow-sm px-4 py-3 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
                            placeholder="Basic Python knowledge, etc."
                          />
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            What You Will Learn (comma separated)
                          </label>
                          <input
                            type="text"
                            name="whatYouWillLearn"
                            value={formik.values.whatYouWillLearn}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="mt-2 block w-full rounded-md border-gray-300 shadow-sm px-4 py-3 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
                            placeholder="Build ML models, Fine-tune GPT, etc."
                          />
                        </div>
                      </div>

                      {/* Right Column (videos) */}
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Course Videos
                        </label>
                        <FieldArray name="videos">
                          {({ push, remove, form }) => (
                            <>
                              <SimpleBar style={{ maxHeight: 450 }} className="pr-2">
                                <DndContext
                                  collisionDetection={closestCenter}
                                  onDragEnd={(event) => handleDragEnd(event, form)}
                                >
                                  <SortableContext
                                    items={form.values.videos.map((_, idx) => idx)}
                                    strategy={verticalListSortingStrategy}
                                  >
                                    {form.values.videos && form.values.videos.length > 0 ? (
                                      form.values.videos.map((video, index) => (
                                        <SortableVideoItem
                                          key={index}
                                          video={video}
                                          index={index}
                                          form={form}
                                          editingVideoIndex={editingVideoIndex}
                                          setEditingVideoIndex={setEditingVideoIndex}
                                          remove={remove}
                                        />
                                      ))
                                    ) : (
                                      <div className="text-sm text-gray-500 dark:text-gray-400">
                                        No videos added.
                                      </div>
                                    )}
                                  </SortableContext>
                                </DndContext>
                              </SimpleBar>

                              {/* Add a new empty video */}
                              <button
                                type="button"
                                onClick={() =>
                                  push({
                                    title: '',
                                    url: '',
                                    coverImage: '',
                                    description: '',
                                    duration: 0,
                                    priority: form.values.videos.length,
                                  })
                                }
                                className="mt-4 inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-green-700 focus:outline-none"
                              >
                                Add Video
                              </button>
                            </>
                          )}
                        </FieldArray>
                      </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex justify-end space-x-4 mt-8">
                      <button
                        type="submit"
                        className="inline-flex items-center rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none"
                      >
                        {currentCourse ? 'Update' : 'Add'}
                      </button>
                    </div>
                  </form>
                </FormikProvider>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default Courses;













// import React, { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useFormik, FormikProvider, FieldArray } from 'formik';
// import * as Yup from 'yup';
// import {
//   FaPlus,
//   FaEdit,
//   FaTrash,
//   FaChevronLeft,
//   FaChevronRight,
//   FaGripVertical,
// } from 'react-icons/fa';
// import { Dialog, Transition } from '@headlessui/react';
// import { DndContext, closestCenter } from '@dnd-kit/core';
// import {
//   arrayMove,
//   SortableContext,
//   verticalListSortingStrategy,
//   useSortable,
// } from '@dnd-kit/sortable';
// import { CSS } from '@dnd-kit/utilities';
// import SimpleBar from 'simplebar-react';
// import 'simplebar/dist/simplebar.min.css';

// import {
//   fetchCourses,
//   addCourse,
//   updateCourse,
//   deleteCourse,
// } from '../redux/slices/coursesSlice';

// // --------------------------------
// // Sortable video item component
// // --------------------------------
// const SortableVideoItem = ({
//   video,
//   index,
//   form,
//   editingVideoIndex,
//   setEditingVideoIndex,
//   remove,
// }) => {
//   const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
//     id: index,
//   });
//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//   };

//   return (
//     <div
//       ref={setNodeRef}
//       style={style}
//       className="mb-6 border p-6 rounded-xl shadow-lg bg-white dark:bg-gray-800"
//     >
//       {/* Drag Handle */}
//       <div {...attributes} {...listeners} className="flex items-center cursor-move mb-4">
//         <FaGripVertical className="text-gray-500 mr-3" />
//         <span className="font-semibold text-lg">Video {index + 1}</span>
//       </div>

//       {editingVideoIndex === index ? (
//         // Editing view
//         <div>
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//               Video Title
//             </label>
//             <input
//               type="text"
//               name={`videos[${index}].title`}
//               value={video.title || ''}
//               onChange={form.handleChange}
//               onBlur={form.handleBlur}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2
//                          focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
//               placeholder="Enter video title"
//             />
//           </div>
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//               Video URL
//             </label>
//             <input
//               type="text"
//               name={`videos[${index}].url`}
//               value={video.url || ''}
//               onChange={form.handleChange}
//               onBlur={form.handleBlur}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2
//                          focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
//               placeholder="https://example.com/video.mp4"
//             />
//           </div>
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//               Cover Image URL
//             </label>
//             <input
//               type="text"
//               name={`videos[${index}].coverImage`}
//               value={video.coverImage || ''}
//               onChange={form.handleChange}
//               onBlur={form.handleBlur}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2
//                          focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
//               placeholder="https://example.com/cover.jpg"
//             />
//           </div>
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//               Video Description
//             </label>
//             <textarea
//               name={`videos[${index}].description`}
//               value={video.description || ''}
//               onChange={form.handleChange}
//               onBlur={form.handleBlur}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2
//                          focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
//               placeholder="Optional description"
//             />
//           </div>
//           <div className="mb-4 grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                 Duration (s)
//               </label>
//               <input
//                 type="number"
//                 name={`videos[${index}].duration`}
//                 value={video.duration || ''}
//                 onChange={form.handleChange}
//                 onBlur={form.handleBlur}
//                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2
//                            focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
//                 placeholder="Duration"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                 Priority
//               </label>
//               <input
//                 type="number"
//                 name={`videos[${index}].priority`}
//                 value={video.priority || 0}
//                 onChange={form.handleChange}
//                 onBlur={form.handleBlur}
//                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2
//                            focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
//                 placeholder="Priority"
//               />
//             </div>
//           </div>
//           <button
//             type="button"
//             onClick={() => setEditingVideoIndex(null)}
//             className="mt-2 inline-flex items-center rounded-md bg-blue-600 px-4 py-2
//                        text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none"
//           >
//             Save
//           </button>
//         </div>
//       ) : (
//         // Summary view
//         <div className="flex justify-between items-center">
//           <div className="flex items-center">
//             {video.coverImage ? (
//               <img
//                 src={video.coverImage}
//                 alt="Cover"
//                 className="w-16 h-16 rounded object-cover mr-3"
//               />
//             ) : (
//               <div className="w-16 h-16 bg-gray-200 rounded mr-3" />
//             )}
//             <div>
//               <p className="font-medium text-gray-800 dark:text-gray-200">
//                 {video.title || 'Untitled Video'}
//               </p>
//               <p className="text-xs text-gray-600 dark:text-gray-400">
//                 {video.duration || 0}s | P: {video.priority || 0}
//               </p>
//             </div>
//           </div>
//           <button
//             type="button"
//             onClick={() => setEditingVideoIndex(index)}
//             className="text-blue-600 hover:text-blue-700 text-sm font-medium"
//           >
//             Edit
//           </button>
//         </div>
//       )}
//       <div className="mt-4">
//         <button
//           type="button"
//           onClick={() => remove(index)}
//           className="inline-flex items-center rounded-md bg-red-600 px-3 py-2
//                      text-sm font-medium text-white shadow hover:bg-red-700 focus:outline-none"
//         >
//           Remove Video
//         </button>
//       </div>
//     </div>
//   );
// };

// // --------------------------------
// // Main Courses Component
// // --------------------------------
// const Courses = () => {
//   const dispatch = useDispatch();
//   const { courses, loading, error } = useSelector((state) => state.courses);
//   const [showForm, setShowForm] = useState(false);
//   const [currentCourse, setCurrentCourse] = useState(null);
//   const [editingVideoIndex, setEditingVideoIndex] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const coursesPerPage = 10;

//   useEffect(() => {
//     dispatch(fetchCourses());
//   }, [dispatch]);

//   // --------------------------------
//   // Formik Initial Values
//   // --------------------------------
//   const initialValues = {
//     // Original fields:
//     title: currentCourse ? currentCourse.title : '',
//     description: currentCourse ? currentCourse.description : '',
//     instructor: currentCourse ? currentCourse.instructor : '',
//     price: currentCourse ? currentCourse.price : '',
//     image: currentCourse ? currentCourse.image : '',
//     createdAt: currentCourse
//       ? new Date(currentCourse.createdAt).toISOString().substr(0, 10)
//       : '',
//     videos: currentCourse && currentCourse.videos ? currentCourse.videos : [],
//     isFeatured: currentCourse ? currentCourse.isFeatured : false,
//     shortVideoLink: currentCourse ? currentCourse.shortVideoLink : '',

//     // NEW FIELDS (optional or defaults):
//     difficultyLevel: currentCourse ? currentCourse.difficultyLevel : 'Beginner',
//     language: currentCourse ? currentCourse.language : 'English',
//     // For arrays, store them as comma-separated so user can enter them easily:
//     topics: currentCourse && currentCourse.topics
//       ? currentCourse.topics.join(', ')
//       : '',
//     totalDuration: currentCourse ? currentCourse.totalDuration : 0,
//     numberOfLectures: currentCourse ? currentCourse.numberOfLectures : 0,
//     category: currentCourse ? currentCourse.category : '',
//     tags: currentCourse && currentCourse.tags
//       ? currentCourse.tags.join(', ')
//       : '',
//     requirements: currentCourse && currentCourse.requirements
//       ? currentCourse.requirements.join(', ')
//       : '',
//     whatYouWillLearn: currentCourse && currentCourse.whatYouWillLearn
//       ? currentCourse.whatYouWillLearn.join(', ')
//       : '',
//   };

//   // --------------------------------
//   // Formik Setup
//   // --------------------------------
//   const formik = useFormik({
//     initialValues,
//     enableReinitialize: true,
//     validationSchema: Yup.object({
//       // Some required fields
//       title: Yup.string().required('Course title is required'),
//       description: Yup.string().required('Description is required'),
//       instructor: Yup.string().required('Instructor is required'),
//       price: Yup.number()
//         .positive('Price must be a positive number')
//         .required('Price is required'),
//       image: Yup.string()
//         .url('Please enter a valid URL')
//         .required('Image URL is required'),
//       shortVideoLink: Yup.string().when('isFeatured', {
//         is: true,
//         then: (schema) =>
//           schema
//             .url('Please enter a valid URL')
//             .required('Short video link is required for featured courses'),
//         otherwise: (schema) => schema,
//       }),
//       // Optional fields can stay as is, or add more validations if needed
//     }),
//     onSubmit: async (values) => {
//       // Convert comma-separated strings back into arrays
//       // for the new fields
//       const courseData = {
//         ...values,
//         topics: values.topics
//           ? values.topics.split(',').map((t) => t.trim()).filter(Boolean)
//           : [],
//         tags: values.tags
//           ? values.tags.split(',').map((t) => t.trim()).filter(Boolean)
//           : [],
//         requirements: values.requirements
//           ? values.requirements.split(',').map((r) => r.trim()).filter(Boolean)
//           : [],
//         whatYouWillLearn: values.whatYouWillLearn
//           ? values.whatYouWillLearn
//               .split(',')
//               .map((item) => item.trim())
//               .filter(Boolean)
//           : [],
//         // Sort videos by priority before sending data
//         videos: [...values.videos].sort((a, b) => a.priority - b.priority),
//       };

//       if (currentCourse) {
//         // Update existing course
//         try {
//           await dispatch(updateCourse({ id: currentCourse._id, courseData })).unwrap();
//           setShowForm(false);
//           setCurrentCourse(null);
//           setEditingVideoIndex(null);
//           formik.resetForm();
//           setCurrentPage(1);
//         } catch (err) {
//           console.error('Update course error:', err);
//         }
//       } else {
//         // Add new course
//         try {
//           await dispatch(addCourse(courseData)).unwrap();
//           setShowForm(false);
//           setEditingVideoIndex(null);
//           formik.resetForm();
//           setCurrentPage(1);
//         } catch (err) {
//           console.error('Add course error:', err);
//         }
//       }
//     },
//   });

//   // --------------------------------
//   // Handlers
//   // --------------------------------
//   const handleEdit = (course) => {
//     setCurrentCourse(course);
//     setShowForm(true);
//     setEditingVideoIndex(null);
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm('Are you sure you want to delete this course?')) {
//       try {
//         await dispatch(deleteCourse(id)).unwrap();
//         const indexOfLast = currentPage * coursesPerPage;
//         const indexOfFirst = indexOfLast - coursesPerPage;
//         const currentSlice = courses.slice(indexOfFirst, indexOfLast);
//         if (currentSlice.length === 1 && currentPage > 1) {
//           setCurrentPage(currentPage - 1);
//         }
//       } catch (err) {
//         console.error('Delete course error:', err);
//       }
//     }
//   };

//   // Pagination
//   const indexOfLast = currentPage * coursesPerPage;
//   const indexOfFirst = indexOfLast - coursesPerPage;
//   const currentCourses = courses.slice(indexOfFirst, indexOfLast);
//   const totalPages = Math.ceil(courses.length / coursesPerPage);
//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   // Drag + drop reordering for videos
//   const handleDragEnd = (event, form) => {
//     const { active, over } = event;
//     if (active.id !== over.id) {
//       const oldIndex = Number(active.id);
//       const newIndex = Number(over.id);
//       let newVideos = arrayMove(form.values.videos, oldIndex, newIndex);

//       // Update priority for each video
//       newVideos = newVideos.map((video, idx) => ({
//         ...video,
//         priority: idx,
//       }));
//       form.setFieldValue('videos', newVideos);
//     }
//   };

//   // --------------------------------
//   // Render
//   // --------------------------------
//   return (
//     <div className="p-8 bg-gray-100 dark:bg-gray-900 min-h-screen">
//       <h2 className="text-4xl font-bold mb-8 text-gray-800 dark:text-white">
//         Courses Management
//       </h2>
//       {error && (
//         <div className="bg-red-100 text-red-700 p-4 rounded mb-6">{error}</div>
//       )}

//       <button
//         onClick={() => {
//           setShowForm(true);
//           setCurrentCourse(null);
//           setEditingVideoIndex(null);
//           formik.resetForm();
//         }}
//         className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow
//                    hover:bg-blue-700 transition mb-8 inline-flex items-center"
//         aria-label="Add Course"
//       >
//         <FaPlus className="mr-3" /> Add Course
//       </button>

//       {loading ? (
//         <div className="text-gray-800 dark:text-gray-200">Loading...</div>
//       ) : (
//         <>
//           {/* Course Table */}
//           <div className="overflow-x-auto">
//             <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg">
//               <thead className="bg-gray-50 dark:bg-gray-700">
//                 <tr>
//                   <th className="py-4 px-6 text-left text-sm font-medium text-gray-500
//                                  dark:text-gray-300 uppercase tracking-wider"
//                   >
//                     Image
//                   </th>
//                   <th className="py-4 px-6 text-left text-sm font-medium text-gray-500
//                                  dark:text-gray-300 uppercase tracking-wider"
//                   >
//                     Title
//                   </th>
//                   <th className="py-4 px-6 text-left text-sm font-medium text-gray-500
//                                  dark:text-gray-300 uppercase tracking-wider"
//                   >
//                     Instructor
//                   </th>
//                   <th className="py-4 px-6 text-left text-sm font-medium text-gray-500
//                                  dark:text-gray-300 uppercase tracking-wider"
//                   >
//                     Price
//                   </th>
//                   <th className="py-4 px-6 text-left text-sm font-medium text-gray-500
//                                  dark:text-gray-300 uppercase tracking-wider"
//                   >
//                     Created At
//                   </th>
//                   <th className="py-4 px-6 text-left text-sm font-medium text-gray-500
//                                  dark:text-gray-300 uppercase tracking-wider"
//                   >
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
//                 {currentCourses.map((course) => (
//                   <tr
//                     key={course._id}
//                     className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
//                   >
//                     <td className="py-4 px-6">
//                       {course.image ? (
//                         <img
//                           src={course.image}
//                           alt={course.title}
//                           className="w-16 h-16 rounded object-cover"
//                         />
//                       ) : (
//                         <div className="w-16 h-16 bg-gray-200 rounded" />
//                       )}
//                     </td>
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
//                       {course.title}
//                     </td>
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
//                       {course.instructor}
//                     </td>
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
//                       ${course.price.toFixed(2)}
//                     </td>
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
//                       {new Date(course.createdAt).toLocaleDateString()}
//                     </td>
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200
//                                    inline-flex items-center space-x-3"
//                     >
//                       <button
//                         onClick={() => handleEdit(course)}
//                         className="text-blue-600 hover:text-blue-700 inline-flex items-center"
//                         aria-label={`Edit course ${course.title}`}
//                       >
//                         <FaEdit className="mr-1" /> Edit
//                       </button>
//                       <button
//                         onClick={() => handleDelete(course._id)}
//                         className="text-red-600 hover:text-red-700 inline-flex items-center"
//                         aria-label={`Delete course ${course.title}`}
//                       >
//                         <FaTrash className="mr-1" /> Delete
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//                 {currentCourses.length === 0 && (
//                   <tr>
//                     <td
//                       colSpan="6"
//                       className="py-6 px-6 text-center text-gray-600 dark:text-gray-400"
//                     >
//                       No courses found.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Pagination */}
//           {courses.length > coursesPerPage && (
//             <div className="flex justify-center mt-8">
//               <nav aria-label="Page navigation">
//                 <ul className="inline-flex -space-x-px">
//                   <li>
//                     <button
//                       onClick={() => paginate(currentPage - 1)}
//                       disabled={currentPage === 1}
//                       className={`px-4 py-2 leading-tight text-gray-500 bg-white dark:bg-gray-800
//                                   dark:text-gray-300 border border-gray-300 dark:border-gray-700
//                                   rounded-l-lg hover:bg-gray-100 dark:hover:bg-gray-700
//                                   ${currentPage === 1 && 'cursor-not-allowed opacity-50'}`}
//                       aria-label="Previous Page"
//                     >
//                       <FaChevronLeft />
//                     </button>
//                   </li>
//                   {[...Array(totalPages)].map((_, index) => (
//                     <li key={index + 1}>
//                       <button
//                         onClick={() => paginate(index + 1)}
//                         className={`px-4 py-2 leading-tight border border-gray-300 dark:border-gray-700
//                                     ${
//                                       currentPage === index + 1
//                                         ? 'text-blue-600 bg-blue-50 dark:bg-gray-700 dark:text-white'
//                                         : 'text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
//                                     }`}
//                         aria-label={`Go to page ${index + 1}`}
//                       >
//                         {index + 1}
//                       </button>
//                     </li>
//                   ))}
//                   <li>
//                     <button
//                       onClick={() => paginate(currentPage + 1)}
//                       disabled={currentPage === totalPages}
//                       className={`px-4 py-2 leading-tight text-gray-500 bg-white dark:bg-gray-800
//                                   dark:text-gray-300 border border-gray-300 dark:border-gray-700
//                                   rounded-r-lg hover:bg-gray-100 dark:hover:bg-gray-700
//                                   ${currentPage === totalPages && 'cursor-not-allowed opacity-50'}`}
//                       aria-label="Next Page"
//                     >
//                       <FaChevronRight />
//                     </button>
//                   </li>
//                 </ul>
//               </nav>
//             </div>
//           )}
//         </>
//       )}

//       {/* Modal with Headless UI */}
//       <Transition appear show={showForm} as={React.Fragment}>
//         <Dialog
//           as="div"
//           className="fixed inset-0 z-50 overflow-y-auto"
//           onClose={() => {
//             setShowForm(false);
//             setCurrentCourse(null);
//             setEditingVideoIndex(null);
//             formik.resetForm();
//           }}
//         >
//           <div className="min-h-screen px-4 text-center bg-black bg-opacity-50">
//             <Transition.Child
//               as={React.Fragment}
//               enter="ease-out duration-300"
//               enterFrom="opacity-0 scale-95"
//               enterTo="opacity-100 scale-100"
//               leave="ease-in duration-200"
//               leaveFrom="opacity-100 scale-100"
//               leaveTo="opacity-0 scale-95"
//             >
//               <Dialog.Panel
//                 className="inline-block w-full max-w-5xl p-10 my-8 overflow-hidden
//                            text-left align-middle transition-all transform bg-white dark:bg-gray-800
//                            shadow-2xl rounded-2xl"
//               >
//                 {/* Header */}
//                 <div className="flex items-center justify-between border-b pb-4 mb-6">
//                   <Dialog.Title className="text-3xl font-bold text-gray-800 dark:text-gray-100">
//                     {currentCourse ? 'Edit Course' : 'Add New Course'}
//                   </Dialog.Title>
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setShowForm(false);
//                       setCurrentCourse(null);
//                       setEditingVideoIndex(null);
//                       formik.resetForm();
//                     }}
//                     className="text-gray-500 hover:text-gray-700 dark:text-gray-300
//                                dark:hover:text-gray-100 text-3xl leading-none"
//                   >
//                     &times;
//                   </button>
//                 </div>

//                 <FormikProvider value={formik}>
//                   <form onSubmit={formik.handleSubmit}>
//                     {/* Split container: left for main fields, right for videos */}
//                     <div className="flex flex-col md:flex-row gap-8">
//                       {/* Left Column (course details) */}
//                       <div className="flex-1">
//                         {/* Title */}
//                         <div className="mb-6">
//                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                             Title
//                           </label>
//                           <input
//                             type="text"
//                             name="title"
//                             className={`mt-2 block w-full rounded-md border-gray-300
//                                         shadow-sm px-4 py-3 focus:border-blue-500 focus:ring
//                                         focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200
//                                         ${
//                                           formik.touched.title && formik.errors.title
//                                             ? 'border-red-500'
//                                             : ''
//                                         }`}
//                             value={formik.values.title}
//                             onChange={formik.handleChange}
//                             onBlur={formik.handleBlur}
//                             placeholder="Course Title"
//                           />
//                           {formik.touched.title && formik.errors.title && (
//                             <div className="text-red-500 text-xs mt-1">
//                               {formik.errors.title}
//                             </div>
//                           )}
//                         </div>

//                         {/* Description */}
//                         <div className="mb-6">
//                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                             Description
//                           </label>
//                           <textarea
//                             name="description"
//                             className={`mt-2 block w-full rounded-md border-gray-300
//                                         shadow-sm px-4 py-3 focus:border-blue-500 focus:ring
//                                         focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200
//                                         ${
//                                           formik.touched.description && formik.errors.description
//                                             ? 'border-red-500'
//                                             : ''
//                                         }`}
//                             value={formik.values.description}
//                             onChange={formik.handleChange}
//                             onBlur={formik.handleBlur}
//                             placeholder="Course Description"
//                           />
//                           {formik.touched.description && formik.errors.description && (
//                             <div className="text-red-500 text-xs mt-1">
//                               {formik.errors.description}
//                             </div>
//                           )}
//                         </div>

//                         {/* Instructor */}
//                         <div className="mb-6">
//                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                             Instructor
//                           </label>
//                           <input
//                             type="text"
//                             name="instructor"
//                             className={`mt-2 block w-full rounded-md border-gray-300
//                                         shadow-sm px-4 py-3 focus:border-blue-500 focus:ring
//                                         focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200
//                                         ${
//                                           formik.touched.instructor && formik.errors.instructor
//                                             ? 'border-red-500'
//                                             : ''
//                                         }`}
//                             value={formik.values.instructor}
//                             onChange={formik.handleChange}
//                             onBlur={formik.handleBlur}
//                             placeholder="Instructor Name"
//                           />
//                           {formik.touched.instructor && formik.errors.instructor && (
//                             <div className="text-red-500 text-xs mt-1">
//                               {formik.errors.instructor}
//                             </div>
//                           )}
//                         </div>

//                         {/* Price */}
//                         <div className="mb-6">
//                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                             Price
//                           </label>
//                           <input
//                             type="number"
//                             name="price"
//                             className={`mt-2 block w-full rounded-md border-gray-300
//                                         shadow-sm px-4 py-3 focus:border-blue-500 focus:ring
//                                         focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200
//                                         ${
//                                           formik.touched.price && formik.errors.price
//                                             ? 'border-red-500'
//                                             : ''
//                                         }`}
//                             value={formik.values.price}
//                             onChange={formik.handleChange}
//                             onBlur={formik.handleBlur}
//                             placeholder="Course Price"
//                             step="0.01"
//                           />
//                           {formik.touched.price && formik.errors.price && (
//                             <div className="text-red-500 text-xs mt-1">
//                               {formik.errors.price}
//                             </div>
//                           )}
//                         </div>

//                         {/* Image URL */}
//                         <div className="mb-6">
//                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                             Image URL
//                           </label>
//                           <input
//                             type="text"
//                             name="image"
//                             className={`mt-2 block w-full rounded-md border-gray-300
//                                         shadow-sm px-4 py-3 focus:border-blue-500 focus:ring
//                                         focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200
//                                         ${
//                                           formik.touched.image && formik.errors.image
//                                             ? 'border-red-500'
//                                             : ''
//                                         }`}
//                             value={formik.values.image}
//                             onChange={formik.handleChange}
//                             onBlur={formik.handleBlur}
//                             placeholder="https://example.com/image.jpg"
//                           />
//                           {formik.touched.image && formik.errors.image && (
//                             <div className="text-red-500 text-xs mt-1">
//                               {formik.errors.image}
//                             </div>
//                           )}
//                         </div>

//                         {/* isFeatured + shortVideoLink */}
//                         <div className="mb-8 flex items-center">
//                           <input
//                             type="checkbox"
//                             name="isFeatured"
//                             id="isFeatured"
//                             className="mr-3 h-5 w-5 text-blue-600 focus:ring-blue-500
//                                        dark:bg-gray-700 dark:border-gray-600"
//                             checked={formik.values.isFeatured}
//                             onChange={formik.handleChange}
//                           />
//                           <label
//                             htmlFor="isFeatured"
//                             className="text-sm font-medium text-gray-700 dark:text-gray-300"
//                           >
//                             Featured Course
//                           </label>
//                         </div>
//                         {formik.values.isFeatured && (
//                           <div className="mb-6">
//                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                               Short Video Link
//                             </label>
//                             <input
//                               type="text"
//                               name="shortVideoLink"
//                               className={`mt-2 block w-full rounded-md border-gray-300
//                                           shadow-sm px-4 py-3 focus:border-blue-500 focus:ring
//                                           focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200
//                                           ${
//                                             formik.touched.shortVideoLink &&
//                                             formik.errors.shortVideoLink
//                                               ? 'border-red-500'
//                                               : ''
//                                           }`}
//                               value={formik.values.shortVideoLink}
//                               onChange={formik.handleChange}
//                               onBlur={formik.handleBlur}
//                               placeholder="https://example.com/shortvideo.mp4"
//                             />
//                             {formik.touched.shortVideoLink && formik.errors.shortVideoLink && (
//                               <div className="text-red-500 text-xs mt-1">
//                                 {formik.errors.shortVideoLink}
//                               </div>
//                             )}
//                           </div>
//                         )}

//                         {/* ---------------------------------
//                             NEW FIELDS (Difficulty, Language, etc.)
//                            --------------------------------- */}
//                         <div className="mb-4">
//                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                             Difficulty Level
//                           </label>
//                           <select
//                             name="difficultyLevel"
//                             value={formik.values.difficultyLevel}
//                             onChange={formik.handleChange}
//                             onBlur={formik.handleBlur}
//                             className="mt-2 block w-full rounded-md border-gray-300
//                                        shadow-sm px-4 py-3 focus:border-blue-500 focus:ring
//                                        focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
//                           >
//                             <option value="Beginner">Beginner</option>
//                             <option value="Intermediate">Intermediate</option>
//                             <option value="Advanced">Advanced</option>
//                           </select>
//                         </div>

//                         <div className="mb-4">
//                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                             Language
//                           </label>
//                           <input
//                             type="text"
//                             name="language"
//                             value={formik.values.language}
//                             onChange={formik.handleChange}
//                             onBlur={formik.handleBlur}
//                             className="mt-2 block w-full rounded-md border-gray-300
//                                        shadow-sm px-4 py-3 focus:border-blue-500 focus:ring
//                                        focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
//                           />
//                         </div>

//                         <div className="mb-4">
//                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                             Category
//                           </label>
//                           <input
//                             type="text"
//                             name="category"
//                             value={formik.values.category}
//                             onChange={formik.handleChange}
//                             onBlur={formik.handleBlur}
//                             className="mt-2 block w-full rounded-md border-gray-300
//                                        shadow-sm px-4 py-3 focus:border-blue-500 focus:ring
//                                        focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
//                             placeholder="Ex: AI, Data Science"
//                           />
//                         </div>

//                         <div className="mb-4 grid grid-cols-2 gap-4">
//                           <div>
//                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                               Total Duration (min)
//                             </label>
//                             <input
//                               type="number"
//                               name="totalDuration"
//                               value={formik.values.totalDuration}
//                               onChange={formik.handleChange}
//                               onBlur={formik.handleBlur}
//                               className="mt-2 block w-full rounded-md border-gray-300
//                                          shadow-sm px-4 py-3 focus:border-blue-500 focus:ring
//                                          focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
//                             />
//                           </div>
//                           <div>
//                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                               Number Of Lectures
//                             </label>
//                             <input
//                               type="number"
//                               name="numberOfLectures"
//                               value={formik.values.numberOfLectures}
//                               onChange={formik.handleChange}
//                               onBlur={formik.handleBlur}
//                               className="mt-2 block w-full rounded-md border-gray-300
//                                          shadow-sm px-4 py-3 focus:border-blue-500 focus:ring
//                                          focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
//                             />
//                           </div>
//                         </div>

//                         <div className="mb-4">
//                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                             Topics (comma separated)
//                           </label>
//                           <input
//                             type="text"
//                             name="topics"
//                             value={formik.values.topics}
//                             onChange={formik.handleChange}
//                             onBlur={formik.handleBlur}
//                             className="mt-2 block w-full rounded-md border-gray-300
//                                        shadow-sm px-4 py-3 focus:border-blue-500 focus:ring
//                                        focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
//                             placeholder="AI, Machine Learning, etc."
//                           />
//                         </div>

//                         <div className="mb-4">
//                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                             Tags (comma separated)
//                           </label>
//                           <input
//                             type="text"
//                             name="tags"
//                             value={formik.values.tags}
//                             onChange={formik.handleChange}
//                             onBlur={formik.handleBlur}
//                             className="mt-2 block w-full rounded-md border-gray-300
//                                        shadow-sm px-4 py-3 focus:border-blue-500 focus:ring
//                                        focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
//                             placeholder="python, ml, beginner, etc."
//                           />
//                         </div>

//                         <div className="mb-4">
//                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                             Requirements (comma separated)
//                           </label>
//                           <input
//                             type="text"
//                             name="requirements"
//                             value={formik.values.requirements}
//                             onChange={formik.handleChange}
//                             onBlur={formik.handleBlur}
//                             className="mt-2 block w-full rounded-md border-gray-300
//                                        shadow-sm px-4 py-3 focus:border-blue-500 focus:ring
//                                        focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
//                             placeholder="Basic Python knowledge, etc."
//                           />
//                         </div>

//                         <div className="mb-4">
//                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                             What You Will Learn (comma separated)
//                           </label>
//                           <input
//                             type="text"
//                             name="whatYouWillLearn"
//                             value={formik.values.whatYouWillLearn}
//                             onChange={formik.handleChange}
//                             onBlur={formik.handleBlur}
//                             className="mt-2 block w-full rounded-md border-gray-300
//                                        shadow-sm px-4 py-3 focus:border-blue-500 focus:ring
//                                        focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
//                             placeholder="Build ML models, Fine-tune GPT, etc."
//                           />
//                         </div>
//                       </div>

//                       {/* Right Column (videos) */}
//                       <div className="flex-1">
//                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
//                           Course Videos
//                         </label>
//                         <FieldArray name="videos">
//                           {({ push, remove, form }) => (
//                             <>
//                               <SimpleBar style={{ maxHeight: 450 }} className="pr-2">
//                                 <DndContext
//                                   collisionDetection={closestCenter}
//                                   onDragEnd={(event) => handleDragEnd(event, form)}
//                                 >
//                                   <SortableContext
//                                     items={form.values.videos.map((_, idx) => idx)}
//                                     strategy={verticalListSortingStrategy}
//                                   >
//                                     {form.values.videos && form.values.videos.length > 0 ? (
//                                       form.values.videos.map((video, index) => (
//                                         <SortableVideoItem
//                                           key={index}
//                                           video={video}
//                                           index={index}
//                                           form={form}
//                                           editingVideoIndex={editingVideoIndex}
//                                           setEditingVideoIndex={setEditingVideoIndex}
//                                           remove={remove}
//                                         />
//                                       ))
//                                     ) : (
//                                       <div className="text-sm text-gray-500 dark:text-gray-400">
//                                         No videos added.
//                                       </div>
//                                     )}
//                                   </SortableContext>
//                                 </DndContext>
//                               </SimpleBar>

//                               {/* Add a new empty video */}
//                               <button
//                                 type="button"
//                                 onClick={() =>
//                                   push({
//                                     title: '',
//                                     url: '',
//                                     coverImage: '',
//                                     description: '',
//                                     duration: 0,
//                                     priority: form.values.videos.length,
//                                   })
//                                 }
//                                 className="mt-4 inline-flex items-center rounded-md bg-green-600
//                                            px-4 py-2 text-sm font-medium text-white shadow
//                                            hover:bg-green-700 focus:outline-none"
//                               >
//                                 Add Video
//                               </button>
//                             </>
//                           )}
//                         </FieldArray>
//                       </div>
//                     </div>

//                     {/* Footer Buttons */}
//                     <div className="flex justify-end space-x-4 mt-8">
//                       <button
//                         type="submit"
//                         className="inline-flex items-center rounded-md bg-blue-600
//                                    px-6 py-3 text-sm font-medium text-white shadow
//                                    hover:bg-blue-700 focus:outline-none"
//                       >
//                         {currentCourse ? 'Update' : 'Add'}
//                       </button>
//                     </div>
//                   </form>
//                 </FormikProvider>
//               </Dialog.Panel>
//             </Transition.Child>
//           </div>
//         </Dialog>
//       </Transition>
//     </div>
//   );
// };

// export default Courses;










// import React, { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useFormik, FormikProvider, FieldArray } from 'formik';
// import * as Yup from 'yup';
// import {
//   FaPlus,
//   FaEdit,
//   FaTrash,
//   FaChevronLeft,
//   FaChevronRight,
//   FaGripVertical,
// } from 'react-icons/fa';
// import { Dialog, Transition } from '@headlessui/react';
// import { DndContext, closestCenter } from '@dnd-kit/core';
// import {
//   arrayMove,
//   SortableContext,
//   verticalListSortingStrategy,
//   useSortable,
// } from '@dnd-kit/sortable';
// import { CSS } from '@dnd-kit/utilities';
// import SimpleBar from 'simplebar-react';
// import 'simplebar/dist/simplebar.min.css';
// import {
//   fetchCourses,
//   addCourse,
//   updateCourse,
//   deleteCourse,
// } from '../redux/slices/coursesSlice';

// // Sortable video item component using dnd-kit
// const SortableVideoItem = ({
//   video,
//   index,
//   form,
//   editingVideoIndex,
//   setEditingVideoIndex,
//   remove,
// }) => {
//   const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
//     id: index,
//   });
//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//   };

//   return (
//     <div ref={setNodeRef} style={style} className="mb-6 border p-6 rounded-xl shadow-lg bg-white dark:bg-gray-800">
//       {/* Drag Handle */}
//       <div {...attributes} {...listeners} className="flex items-center cursor-move mb-4">
//         <FaGripVertical className="text-gray-500 mr-3" />
//         <span className="font-semibold text-lg">Video {index + 1}</span>
//       </div>
//       {editingVideoIndex === index ? (
//         // Editing view for video
//         <div>
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//               Video Title
//             </label>
//             <input
//               type="text"
//               name={`videos[${index}].title`}
//               value={video.title || ''}
//               onChange={form.handleChange}
//               onBlur={form.handleBlur}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
//               placeholder="Enter video title"
//             />
//           </div>
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//               Video URL
//             </label>
//             <input
//               type="text"
//               name={`videos[${index}].url`}
//               value={video.url || ''}
//               onChange={form.handleChange}
//               onBlur={form.handleBlur}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
//               placeholder="https://example.com/video.mp4"
//             />
//           </div>
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//               Cover Image URL
//             </label>
//             <input
//               type="text"
//               name={`videos[${index}].coverImage`}
//               value={video.coverImage || ''}
//               onChange={form.handleChange}
//               onBlur={form.handleBlur}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
//               placeholder="https://example.com/cover.jpg"
//             />
//           </div>
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//               Video Description
//             </label>
//             <textarea
//               name={`videos[${index}].description`}
//               value={video.description || ''}
//               onChange={form.handleChange}
//               onBlur={form.handleBlur}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
//               placeholder="Optional description"
//             />
//           </div>
//           <div className="mb-4 grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                 Duration (s)
//               </label>
//               <input
//                 type="number"
//                 name={`videos[${index}].duration`}
//                 value={video.duration || ''}
//                 onChange={form.handleChange}
//                 onBlur={form.handleBlur}
//                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
//                 placeholder="Duration"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                 Priority
//               </label>
//               <input
//                 type="number"
//                 name={`videos[${index}].priority`}
//                 value={video.priority || 0}
//                 onChange={form.handleChange}
//                 onBlur={form.handleBlur}
//                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
//                 placeholder="Priority"
//               />
//             </div>
//           </div>
//           <button
//             type="button"
//             onClick={() => setEditingVideoIndex(null)}
//             className="mt-2 inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none"
//           >
//             Save
//           </button>
//         </div>
//       ) : (
//         // Summary view for video
//         <div className="flex justify-between items-center">
//           <div className="flex items-center">
//             {video.coverImage ? (
//               <img
//                 src={video.coverImage}
//                 alt="Cover"
//                 className="w-16 h-16 rounded object-cover mr-3"
//               />
//             ) : (
//               <div className="w-16 h-16 bg-gray-200 rounded mr-3"></div>
//             )}
//             <div>
//               <p className="font-medium text-gray-800 dark:text-gray-200">
//                 {video.title || 'Untitled Video'}
//               </p>
//               <p className="text-xs text-gray-600 dark:text-gray-400">
//                 {video.duration || 0}s | P: {video.priority || 0}
//               </p>
//             </div>
//           </div>
//           <button
//             type="button"
//             onClick={() => setEditingVideoIndex(index)}
//             className="text-blue-600 hover:text-blue-700 text-sm font-medium"
//           >
//             Edit
//           </button>
//         </div>
//       )}
//       <div className="mt-4">
//         <button
//           type="button"
//           onClick={() => remove(index)}
//           className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white shadow hover:bg-red-700 focus:outline-none"
//         >
//           Remove Video
//         </button>
//       </div>
//     </div>
//   );
// };

// const Courses = () => {
//   const dispatch = useDispatch();
//   const { courses, loading, error } = useSelector((state) => state.courses);
//   const [showForm, setShowForm] = useState(false);
//   const [currentCourse, setCurrentCourse] = useState(null);
//   const [editingVideoIndex, setEditingVideoIndex] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const coursesPerPage = 10;

//   useEffect(() => {
//     dispatch(fetchCourses());
//   }, [dispatch]);

//   // Initial values for Formik including shortVideoLink
//   const initialValues = {
//     title: currentCourse ? currentCourse.title : '',
//     description: currentCourse ? currentCourse.description : '',
//     instructor: currentCourse ? currentCourse.instructor : '',
//     price: currentCourse ? currentCourse.price : '',
//     image: currentCourse ? currentCourse.image : '',
//     createdAt: currentCourse
//       ? new Date(currentCourse.createdAt).toISOString().substr(0, 10)
//       : '',
//     videos: currentCourse && currentCourse.videos ? currentCourse.videos : [],
//     isFeatured: currentCourse ? currentCourse.isFeatured : false,
//     shortVideoLink: currentCourse ? currentCourse.shortVideoLink : '',
//   };

//   const formik = useFormik({
//     initialValues,
//     enableReinitialize: true,
//     validationSchema: Yup.object({
//       title: Yup.string().required('Course title is required'),
//       description: Yup.string().required('Description is required'),
//       instructor: Yup.string().required('Instructor is required'),
//       price: Yup.number()
//         .positive('Price must be a positive number')
//         .required('Price is required'),
//       image: Yup.string()
//         .url('Please enter a valid URL')
//         .required('Image URL is required'),
//       shortVideoLink: Yup.string().when('isFeatured', {
//         is: true,
//         then: (schema) =>
//           schema
//             .url('Please enter a valid URL')
//             .required('Short video link is required for featured courses'),
//         otherwise: (schema) => schema,
//       }),
//     }),
//     onSubmit: async (values) => {
//       // Sort videos by priority before sending data
//       const courseData = {
//         ...values,
//         videos: [...values.videos].sort((a, b) => a.priority - b.priority),
//       };

//       if (currentCourse) {
//         try {
//           await dispatch(updateCourse({ id: currentCourse._id, courseData })).unwrap();
//           setShowForm(false);
//           setCurrentCourse(null);
//           setEditingVideoIndex(null);
//           formik.resetForm();
//           setCurrentPage(1);
//         } catch (err) {
//           console.error('Update course error:', err);
//         }
//       } else {
//         try {
//           await dispatch(addCourse(courseData)).unwrap();
//           setShowForm(false);
//           setEditingVideoIndex(null);
//           formik.resetForm();
//           setCurrentPage(1);
//         } catch (err) {
//           console.error('Add course error:', err);
//         }
//       }
//     },
//   });

//   const handleEdit = (course) => {
//     setCurrentCourse(course);
//     setShowForm(true);
//     setEditingVideoIndex(null);
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm('Are you sure you want to delete this course?')) {
//       try {
//         await dispatch(deleteCourse(id)).unwrap();
//         const indexOfLast = currentPage * coursesPerPage;
//         const indexOfFirst = indexOfLast - coursesPerPage;
//         const currentSlice = courses.slice(indexOfFirst, indexOfLast);
//         if (currentSlice.length === 1 && currentPage > 1) {
//           setCurrentPage(currentPage - 1);
//         }
//       } catch (err) {
//         console.error('Delete course error:', err);
//       }
//     }
//   };

//   // Pagination calculations
//   const indexOfLast = currentPage * coursesPerPage;
//   const indexOfFirst = indexOfLast - coursesPerPage;
//   const currentCourses = courses.slice(indexOfFirst, indexOfLast);
//   const totalPages = Math.ceil(courses.length / coursesPerPage);
//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   // dnd-kit onDragEnd callback for videos
//   const handleDragEnd = (event, form) => {
//     const { active, over } = event;
//     if (active.id !== over.id) {
//       const oldIndex = Number(active.id);
//       const newIndex = Number(over.id);
//       let newVideos = arrayMove(form.values.videos, oldIndex, newIndex);
//       // Update priority for each video
//       newVideos = newVideos.map((video, index) => ({ ...video, priority: index }));
//       form.setFieldValue('videos', newVideos);
//     }
//   };

//   return (
//     <div className="p-8 bg-gray-100 dark:bg-gray-900 min-h-screen">
//       <h2 className="text-4xl font-bold mb-8 text-gray-800 dark:text-white">
//         Courses Management
//       </h2>
//       {error && (
//         <div className="bg-red-100 text-red-700 p-4 rounded mb-6">{error}</div>
//       )}
//       <button
//         onClick={() => {
//           setShowForm(true);
//           setCurrentCourse(null);
//           setEditingVideoIndex(null);
//           formik.resetForm();
//         }}
//         className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition mb-8 inline-flex items-center"
//         aria-label="Add Course"
//       >
//         <FaPlus className="mr-3" /> Add Course
//       </button>
//       {loading ? (
//         <div className="text-gray-800 dark:text-gray-200">Loading...</div>
//       ) : (
//         <>
//           <div className="overflow-x-auto">
//             <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg">
//               <thead className="bg-gray-50 dark:bg-gray-700">
//                 <tr>
//                   <th className="py-4 px-6 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Image
//                   </th>
//                   <th className="py-4 px-6 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Title
//                   </th>
//                   <th className="py-4 px-6 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Instructor
//                   </th>
//                   <th className="py-4 px-6 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Price
//                   </th>
//                   <th className="py-4 px-6 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Created At
//                   </th>
//                   <th className="py-4 px-6 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
//                 {currentCourses.map((course) => (
//                   <tr
//                     key={course._id}
//                     className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
//                   >
//                     <td className="py-4 px-6">
//                       {course.image ? (
//                         <img
//                           src={course.image}
//                           alt={course.title}
//                           className="w-16 h-16 rounded object-cover"
//                         />
//                       ) : (
//                         <div className="w-16 h-16 bg-gray-200 rounded" />
//                       )}
//                     </td>
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
//                       {course.title}
//                     </td>
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
//                       {course.instructor}
//                     </td>
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
//                       ${course.price.toFixed(2)}
//                     </td>
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
//                       {new Date(course.createdAt).toLocaleDateString()}
//                     </td>
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200 inline-flex items-center space-x-3">
//                       <button
//                         onClick={() => handleEdit(course)}
//                         className="text-blue-600 hover:text-blue-700 inline-flex items-center"
//                         aria-label={`Edit course ${course.title}`}
//                       >
//                         <FaEdit className="mr-1" /> Edit
//                       </button>
//                       <button
//                         onClick={() => handleDelete(course._id)}
//                         className="text-red-600 hover:text-red-700 inline-flex items-center"
//                         aria-label={`Delete course ${course.title}`}
//                       >
//                         <FaTrash className="mr-1" /> Delete
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//                 {currentCourses.length === 0 && (
//                   <tr>
//                     <td
//                       colSpan="6"
//                       className="py-6 px-6 text-center text-gray-600 dark:text-gray-400"
//                     >
//                       No courses found.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//           {courses.length > coursesPerPage && (
//             <div className="flex justify-center mt-8">
//               <nav aria-label="Page navigation">
//                 <ul className="inline-flex -space-x-px">
//                   <li>
//                     <button
//                       onClick={() => paginate(currentPage - 1)}
//                       disabled={currentPage === 1}
//                       className={`px-4 py-2 leading-tight text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-l-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
//                         currentPage === 1 && 'cursor-not-allowed opacity-50'
//                       }`}
//                       aria-label="Previous Page"
//                     >
//                       <FaChevronLeft />
//                     </button>
//                   </li>
//                   {[...Array(totalPages)].map((_, index) => (
//                     <li key={index + 1}>
//                       <button
//                         onClick={() => paginate(index + 1)}
//                         className={`px-4 py-2 leading-tight border border-gray-300 dark:border-gray-700 ${
//                           currentPage === index + 1
//                             ? 'text-blue-600 bg-blue-50 dark:bg-gray-700 dark:text-white'
//                             : 'text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
//                         }`}
//                         aria-label={`Go to page ${index + 1}`}
//                       >
//                         {index + 1}
//                       </button>
//                     </li>
//                   ))}
//                   <li>
//                     <button
//                       onClick={() => paginate(currentPage + 1)}
//                       disabled={currentPage === totalPages}
//                       className={`px-4 py-2 leading-tight text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-r-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
//                         currentPage === totalPages && 'cursor-not-allowed opacity-50'
//                       }`}
//                       aria-label="Next Page"
//                     >
//                       <FaChevronRight />
//                     </button>
//                   </li>
//                 </ul>
//               </nav>
//             </div>
//           )}
//         </>
//       )}
//       {/* Modern Modal using Headless UI Dialog */}
//       <Transition appear show={showForm} as={React.Fragment}>
//         <Dialog
//           as="div"
//           className="fixed inset-0 z-50 overflow-y-auto"
//           onClose={() => {
//             setShowForm(false);
//             setCurrentCourse(null);
//             setEditingVideoIndex(null);
//             formik.resetForm();
//           }}
//         >
//           <div className="min-h-screen px-4 text-center bg-black bg-opacity-50">
//             <Transition.Child
//               as={React.Fragment}
//               enter="ease-out duration-300"
//               enterFrom="opacity-0 scale-95"
//               enterTo="opacity-100 scale-100"
//               leave="ease-in duration-200"
//               leaveFrom="opacity-100 scale-100"
//               leaveTo="opacity-0 scale-95"
//             >
//               <Dialog.Panel className="inline-block w-full max-w-5xl p-10 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-2xl rounded-2xl">
//                 {/* Header */}
//                 <div className="flex items-center justify-between border-b pb-4 mb-6">
//                   <Dialog.Title className="text-3xl font-bold text-gray-800 dark:text-gray-100">
//                     {currentCourse ? 'Edit Course' : 'Add New Course'}
//                   </Dialog.Title>
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setShowForm(false);
//                       setCurrentCourse(null);
//                       setEditingVideoIndex(null);
//                       formik.resetForm();
//                     }}
//                     className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 text-3xl leading-none"
//                   >
//                     &times;
//                   </button>
//                 </div>
//                 <FormikProvider value={formik}>
//                   <form onSubmit={formik.handleSubmit}>
//                     {/* Split container: Left for Course Details, Right for Videos */}
//                     <div className="flex flex-col md:flex-row gap-8">
//                       {/* Left Column: Course Details */}
//                       <div className="flex-1">
//                         {/* Title Field */}
//                         <div className="mb-6">
//                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                             Title
//                           </label>
//                           <input
//                             type="text"
//                             name="title"
//                             className={`mt-2 block w-full rounded-md border-gray-300 shadow-sm px-4 py-3 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200 ${
//                               formik.touched.title && formik.errors.title ? 'border-red-500' : ''
//                             }`}
//                             value={formik.values.title}
//                             onChange={formik.handleChange}
//                             onBlur={formik.handleBlur}
//                             placeholder="Course Title"
//                           />
//                           {formik.touched.title && formik.errors.title && (
//                             <div className="text-red-500 text-xs mt-1">{formik.errors.title}</div>
//                           )}
//                         </div>
//                         {/* Description Field */}
//                         <div className="mb-6">
//                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                             Description
//                           </label>
//                           <textarea
//                             name="description"
//                             className={`mt-2 block w-full rounded-md border-gray-300 shadow-sm px-4 py-3 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200 ${
//                               formik.touched.description && formik.errors.description ? 'border-red-500' : ''
//                             }`}
//                             value={formik.values.description}
//                             onChange={formik.handleChange}
//                             onBlur={formik.handleBlur}
//                             placeholder="Course Description"
//                           />
//                           {formik.touched.description && formik.errors.description && (
//                             <div className="text-red-500 text-xs mt-1">{formik.errors.description}</div>
//                           )}
//                         </div>
//                         {/* Instructor Field */}
//                         <div className="mb-6">
//                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                             Instructor
//                           </label>
//                           <input
//                             type="text"
//                             name="instructor"
//                             className={`mt-2 block w-full rounded-md border-gray-300 shadow-sm px-4 py-3 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200 ${
//                               formik.touched.instructor && formik.errors.instructor ? 'border-red-500' : ''
//                             }`}
//                             value={formik.values.instructor}
//                             onChange={formik.handleChange}
//                             onBlur={formik.handleBlur}
//                             placeholder="Instructor Name"
//                           />
//                           {formik.touched.instructor && formik.errors.instructor && (
//                             <div className="text-red-500 text-xs mt-1">{formik.errors.instructor}</div>
//                           )}
//                         </div>
//                         {/* Price Field */}
//                         <div className="mb-6">
//                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                             Price
//                           </label>
//                           <input
//                             type="number"
//                             name="price"
//                             className={`mt-2 block w-full rounded-md border-gray-300 shadow-sm px-4 py-3 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200 ${
//                               formik.touched.price && formik.errors.price ? 'border-red-500' : ''
//                             }`}
//                             value={formik.values.price}
//                             onChange={formik.handleChange}
//                             onBlur={formik.handleBlur}
//                             placeholder="Course Price"
//                             step="0.01"
//                           />
//                           {formik.touched.price && formik.errors.price && (
//                             <div className="text-red-500 text-xs mt-1">{formik.errors.price}</div>
//                           )}
//                         </div>
//                         {/* Image URL Field */}
//                         <div className="mb-6">
//                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                             Image URL
//                           </label>
//                           <input
//                             type="text"
//                             name="image"
//                             className={`mt-2 block w-full rounded-md border-gray-300 shadow-sm px-4 py-3 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200 ${
//                               formik.touched.image && formik.errors.image ? 'border-red-500' : ''
//                             }`}
//                             value={formik.values.image}
//                             onChange={formik.handleChange}
//                             onBlur={formik.handleBlur}
//                             placeholder="https://example.com/image.jpg"
//                           />
//                           {formik.touched.image && formik.errors.image && (
//                             <div className="text-red-500 text-xs mt-1">{formik.errors.image}</div>
//                           )}
//                         </div>
//                         {/* Featured Course */}
//                         <div className="mb-8 flex items-center">
//                           <input
//                             type="checkbox"
//                             name="isFeatured"
//                             id="isFeatured"
//                             className="mr-3 h-5 w-5 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
//                             checked={formik.values.isFeatured}
//                             onChange={formik.handleChange}
//                           />
//                           <label
//                             htmlFor="isFeatured"
//                             className="text-sm font-medium text-gray-700 dark:text-gray-300"
//                           >
//                             Featured Course
//                           </label>
//                         </div>
//                         {/* Conditionally render Short Video Link Field */}
//                         {formik.values.isFeatured && (
//                           <div className="mb-6">
//                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                               Short Video Link
//                             </label>
//                             <input
//                               type="text"
//                               name="shortVideoLink"
//                               className={`mt-2 block w-full rounded-md border-gray-300 shadow-sm px-4 py-3 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200 ${
//                                 formik.touched.shortVideoLink && formik.errors.shortVideoLink
//                                   ? 'border-red-500'
//                                   : ''
//                               }`}
//                               value={formik.values.shortVideoLink}
//                               onChange={formik.handleChange}
//                               onBlur={formik.handleBlur}
//                               placeholder="https://example.com/shortvideo.mp4"
//                             />
//                             {formik.touched.shortVideoLink && formik.errors.shortVideoLink && (
//                               <div className="text-red-500 text-xs mt-1">{formik.errors.shortVideoLink}</div>
//                             )}
//                           </div>
//                         )}
//                       </div>

//                       {/* Right Column: Course Videos */}
//                       <div className="flex-1">
//                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
//                           Course Videos
//                         </label>
//                         {/* Modern Scrollable Container using SimpleBar */}
//                         <FieldArray name="videos">
//                           {({ push, remove, form }) => (
//                             <>
//                               <SimpleBar style={{ maxHeight: 450 }} className="pr-2">
//                                 <DndContext
//                                   collisionDetection={closestCenter}
//                                   onDragEnd={(event) => handleDragEnd(event, form)}
//                                 >
//                                   <SortableContext
//                                     items={form.values.videos.map((_, index) => index)}
//                                     strategy={verticalListSortingStrategy}
//                                   >
//                                     {form.values.videos && form.values.videos.length > 0 ? (
//                                       form.values.videos.map((video, index) => (
//                                         <SortableVideoItem
//                                           key={index}
//                                           video={video}
//                                           index={index}
//                                           form={form}
//                                           editingVideoIndex={editingVideoIndex}
//                                           setEditingVideoIndex={setEditingVideoIndex}
//                                           remove={remove}
//                                         />
//                                       ))
//                                     ) : (
//                                       <div className="text-sm text-gray-500 dark:text-gray-400">
//                                         No videos added.
//                                       </div>
//                                     )}
//                                   </SortableContext>
//                                 </DndContext>
//                               </SimpleBar>
//                               <button
//                                 type="button"
//                                 onClick={() =>
//                                   push({
//                                     title: '',
//                                     url: '',
//                                     coverImage: '',
//                                     description: '',
//                                     duration: 0,
//                                     priority: form.values.videos.length,
//                                   })
//                                 }
//                                 className="mt-4 inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-green-700 focus:outline-none"
//                               >
//                                 Add Video
//                               </button>
//                             </>
//                           )}
//                         </FieldArray>
//                       </div>
//                     </div>
//                     {/* Form Buttons */}
//                     <div className="flex justify-end space-x-4 mt-8">
//                       <button
//                         type="submit"
//                         className="inline-flex items-center rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none"
//                       >
//                         {currentCourse ? 'Update' : 'Add'}
//                       </button>
//                     </div>
//                   </form>
//                 </FormikProvider>
//               </Dialog.Panel>
//             </Transition.Child>
//           </div>
//         </Dialog>
//       </Transition>
//     </div>
//   );
// };

// export default Courses;













// import React, { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useFormik, FormikProvider, FieldArray } from 'formik';
// import * as Yup from 'yup';
// import {
//   FaPlus,
//   FaEdit,
//   FaTrash,
//   FaChevronLeft,
//   FaChevronRight,
//   FaGripVertical,
// } from 'react-icons/fa';
// import { Dialog, Transition } from '@headlessui/react';
// import { DndContext, closestCenter } from '@dnd-kit/core';
// import {
//   arrayMove,
//   SortableContext,
//   verticalListSortingStrategy,
//   useSortable,
// } from '@dnd-kit/sortable';
// import { CSS } from '@dnd-kit/utilities';
// import SimpleBar from 'simplebar-react';
// import 'simplebar/dist/simplebar.min.css';
// import {
//   fetchCourses,
//   addCourse,
//   updateCourse,
//   deleteCourse,
// } from '../redux/slices/coursesSlice';

// // Sortable video item component using dnd-kit
// const SortableVideoItem = ({
//   video,
//   index,
//   form,
//   editingVideoIndex,
//   setEditingVideoIndex,
//   remove,
// }) => {
//   const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
//     id: index,
//   });
//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//   };

//   return (
//     <div ref={setNodeRef} style={style} className="mb-6 border p-6 rounded-xl shadow-lg bg-white dark:bg-gray-800">
//       {/* Drag Handle */}
//       <div {...attributes} {...listeners} className="flex items-center cursor-move mb-4">
//         <FaGripVertical className="text-gray-500 mr-3" />
//         <span className="font-semibold text-lg">Video {index + 1}</span>
//       </div>
//       {editingVideoIndex === index ? (
//         // Editing view for video
//         <div>
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//               Video Title
//             </label>
//             <input
//               type="text"
//               name={`videos[${index}].title`}
//               value={video.title || ''}
//               onChange={form.handleChange}
//               onBlur={form.handleBlur}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
//               placeholder="Enter video title"
//             />
//           </div>
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//               Video URL
//             </label>
//             <input
//               type="text"
//               name={`videos[${index}].url`}
//               value={video.url || ''}
//               onChange={form.handleChange}
//               onBlur={form.handleBlur}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
//               placeholder="https://example.com/video.mp4"
//             />
//           </div>
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//               Cover Image URL
//             </label>
//             <input
//               type="text"
//               name={`videos[${index}].coverImage`}
//               value={video.coverImage || ''}
//               onChange={form.handleChange}
//               onBlur={form.handleBlur}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
//               placeholder="https://example.com/cover.jpg"
//             />
//           </div>
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//               Video Description
//             </label>
//             <textarea
//               name={`videos[${index}].description`}
//               value={video.description || ''}
//               onChange={form.handleChange}
//               onBlur={form.handleBlur}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
//               placeholder="Optional description"
//             />
//           </div>
//           <div className="mb-4 grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                 Duration (s)
//               </label>
//               <input
//                 type="number"
//                 name={`videos[${index}].duration`}
//                 value={video.duration || ''}
//                 onChange={form.handleChange}
//                 onBlur={form.handleBlur}
//                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
//                 placeholder="Duration"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                 Priority
//               </label>
//               <input
//                 type="number"
//                 name={`videos[${index}].priority`}
//                 value={video.priority || 0}
//                 onChange={form.handleChange}
//                 onBlur={form.handleBlur}
//                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
//                 placeholder="Priority"
//               />
//             </div>
//           </div>
//           <button
//             type="button"
//             onClick={() => setEditingVideoIndex(null)}
//             className="mt-2 inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none"
//           >
//             Save
//           </button>
//         </div>
//       ) : (
//         // Summary view for video
//         <div className="flex justify-between items-center">
//           <div className="flex items-center">
//             {video.coverImage ? (
//               <img
//                 src={video.coverImage}
//                 alt="Cover"
//                 className="w-16 h-16 rounded object-cover mr-3"
//               />
//             ) : (
//               <div className="w-16 h-16 bg-gray-200 rounded mr-3"></div>
//             )}
//             <div>
//               <p className="font-medium text-gray-800 dark:text-gray-200">
//                 {video.title || 'Untitled Video'}
//               </p>
//               <p className="text-xs text-gray-600 dark:text-gray-400">
//                 {video.duration || 0}s | P: {video.priority || 0}
//               </p>
//             </div>
//           </div>
//           <button
//             type="button"
//             onClick={() => setEditingVideoIndex(index)}
//             className="text-blue-600 hover:text-blue-700 text-sm font-medium"
//           >
//             Edit
//           </button>
//         </div>
//       )}
//       <div className="mt-4">
//         <button
//           type="button"
//           onClick={() => remove(index)}
//           className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white shadow hover:bg-red-700 focus:outline-none"
//         >
//           Remove Video
//         </button>
//       </div>
//     </div>
//   );
// };

// const Courses = () => {
//   const dispatch = useDispatch();
//   const { courses, loading, error } = useSelector((state) => state.courses);
//   const [showForm, setShowForm] = useState(false);
//   const [currentCourse, setCurrentCourse] = useState(null);
//   const [editingVideoIndex, setEditingVideoIndex] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const coursesPerPage = 10;

//   useEffect(() => {
//     dispatch(fetchCourses());
//   }, [dispatch]);

//   // Initial values for Formik
//   const initialValues = {
//     title: currentCourse ? currentCourse.title : '',
//     description: currentCourse ? currentCourse.description : '',
//     instructor: currentCourse ? currentCourse.instructor : '',
//     price: currentCourse ? currentCourse.price : '',
//     image: currentCourse ? currentCourse.image : '',
//     createdAt: currentCourse
//       ? new Date(currentCourse.createdAt).toISOString().substr(0, 10)
//       : '',
//     videos: currentCourse && currentCourse.videos ? currentCourse.videos : [],
//     isFeatured: currentCourse ? currentCourse.isFeatured : false,
//   };

//   const formik = useFormik({
//     initialValues,
//     enableReinitialize: true,
//     validationSchema: Yup.object({
//       title: Yup.string().required('Course title is required'),
//       description: Yup.string().required('Description is required'),
//       instructor: Yup.string().required('Instructor is required'),
//       price: Yup.number()
//         .positive('Price must be a positive number')
//         .required('Price is required'),
//       image: Yup.string()
//         .url('Please enter a valid URL')
//         .required('Image URL is required'),
//     }),
//     onSubmit: async (values) => {
//       // Sort videos by priority before sending data
//       const courseData = {
//         ...values,
//         videos: values.videos.sort((a, b) => a.priority - b.priority),
//       };

//       if (currentCourse) {
//         try {
//           await dispatch(updateCourse({ id: currentCourse._id, courseData })).unwrap();
//           setShowForm(false);
//           setCurrentCourse(null);
//           setEditingVideoIndex(null);
//           formik.resetForm();
//           setCurrentPage(1);
//         } catch (err) {
//           console.error('Update course error:', err);
//         }
//       } else {
//         try {
//           await dispatch(addCourse(courseData)).unwrap();
//           setShowForm(false);
//           setEditingVideoIndex(null);
//           formik.resetForm();
//           setCurrentPage(1);
//         } catch (err) {
//           console.error('Add course error:', err);
//         }
//       }
//     },
//   });

//   const handleEdit = (course) => {
//     setCurrentCourse(course);
//     setShowForm(true);
//     setEditingVideoIndex(null);
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm('Are you sure you want to delete this course?')) {
//       try {
//         await dispatch(deleteCourse(id)).unwrap();
//         const indexOfLast = currentPage * coursesPerPage;
//         const indexOfFirst = indexOfLast - coursesPerPage;
//         const currentSlice = courses.slice(indexOfFirst, indexOfLast);
//         if (currentSlice.length === 1 && currentPage > 1) {
//           setCurrentPage(currentPage - 1);
//         }
//       } catch (err) {
//         console.error('Delete course error:', err);
//       }
//     }
//   };

//   // Pagination calculations
//   const indexOfLast = currentPage * coursesPerPage;
//   const indexOfFirst = indexOfLast - coursesPerPage;
//   const currentCourses = courses.slice(indexOfFirst, indexOfLast);
//   const totalPages = Math.ceil(courses.length / coursesPerPage);
//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   // dnd-kit onDragEnd callback for videos
//   const handleDragEnd = (event, form) => {
//     const { active, over } = event;
//     if (active.id !== over.id) {
//       const oldIndex = Number(active.id);
//       const newIndex = Number(over.id);
//       let newVideos = arrayMove(form.values.videos, oldIndex, newIndex);
//       // Update priority for each video
//       newVideos = newVideos.map((video, index) => ({ ...video, priority: index }));
//       form.setFieldValue('videos', newVideos);
//     }
//   };

//   return (
//     <div className="p-8 bg-gray-100 dark:bg-gray-900 min-h-screen">
//       <h2 className="text-4xl font-bold mb-8 text-gray-800 dark:text-white">
//         Courses Management
//       </h2>
//       {error && (
//         <div className="bg-red-100 text-red-700 p-4 rounded mb-6">{error}</div>
//       )}
//       <button
//         onClick={() => {
//           setShowForm(true);
//           setCurrentCourse(null);
//           setEditingVideoIndex(null);
//           formik.resetForm();
//         }}
//         className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition mb-8 inline-flex items-center"
//         aria-label="Add Course"
//       >
//         <FaPlus className="mr-3" /> Add Course
//       </button>
//       {loading ? (
//         <div className="text-gray-800 dark:text-gray-200">Loading...</div>
//       ) : (
//         <>
//           <div className="overflow-x-auto">
//           <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg">
//             <thead className="bg-gray-50 dark:bg-gray-700">
//               <tr>
//                 <th className="py-4 px-6 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                   Image
//                 </th>
//                 <th className="py-4 px-6 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                   Title
//                 </th>
//                 <th className="py-4 px-6 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                   Instructor
//                 </th>
//                 <th className="py-4 px-6 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                   Price
//                 </th>
//                 <th className="py-4 px-6 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                   Created At
//                 </th>
//                 <th className="py-4 px-6 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
//               {currentCourses.map((course) => (
//                 <tr
//                   key={course._id}
//                   className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
//                 >
//                   <td className="py-4 px-6">
//                     {course.image ? (
//                       <img
//                         src={course.image}
//                         alt={course.title}
//                         className="w-16 h-16 rounded object-cover"
//                       />
//                     ) : (
//                       <div className="w-16 h-16 bg-gray-200 rounded" />
//                     )}
//                   </td>
//                   <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
//                     {course.title}
//                   </td>
//                   <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
//                     {course.instructor}
//                   </td>
//                   <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
//                     ${course.price.toFixed(2)}
//                   </td>
//                   <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
//                     {new Date(course.createdAt).toLocaleDateString()}
//                   </td>
//                   <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200 inline-flex items-center space-x-3">
//                     <button
//                       onClick={() => handleEdit(course)}
//                       className="text-blue-600 hover:text-blue-700 inline-flex items-center"
//                       aria-label={`Edit course ${course.title}`}
//                     >
//                       <FaEdit className="mr-1" /> Edit
//                     </button>
//                     <button
//                       onClick={() => handleDelete(course._id)}
//                       className="text-red-600 hover:text-red-700 inline-flex items-center"
//                       aria-label={`Delete course ${course.title}`}
//                     >
//                       <FaTrash className="mr-1" /> Delete
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//               {currentCourses.length === 0 && (
//                 <tr>
//                   <td
//                     colSpan="6"
//                     className="py-6 px-6 text-center text-gray-600 dark:text-gray-400"
//                   >
//                     No courses found.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>

//           </div>
//           {courses.length > coursesPerPage && (
//             <div className="flex justify-center mt-8">
//               <nav aria-label="Page navigation">
//                 <ul className="inline-flex -space-x-px">
//                   <li>
//                     <button
//                       onClick={() => paginate(currentPage - 1)}
//                       disabled={currentPage === 1}
//                       className={`px-4 py-2 leading-tight text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-l-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
//                         currentPage === 1 && 'cursor-not-allowed opacity-50'
//                       }`}
//                       aria-label="Previous Page"
//                     >
//                       <FaChevronLeft />
//                     </button>
//                   </li>
//                   {[...Array(totalPages)].map((_, index) => (
//                     <li key={index + 1}>
//                       <button
//                         onClick={() => paginate(index + 1)}
//                         className={`px-4 py-2 leading-tight border border-gray-300 dark:border-gray-700 ${
//                           currentPage === index + 1
//                             ? 'text-blue-600 bg-blue-50 dark:bg-gray-700 dark:text-white'
//                             : 'text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
//                         }`}
//                         aria-label={`Go to page ${index + 1}`}
//                       >
//                         {index + 1}
//                       </button>
//                     </li>
//                   ))}
//                   <li>
//                     <button
//                       onClick={() => paginate(currentPage + 1)}
//                       disabled={currentPage === totalPages}
//                       className={`px-4 py-2 leading-tight text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-r-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
//                         currentPage === totalPages && 'cursor-not-allowed opacity-50'
//                       }`}
//                       aria-label="Next Page"
//                     >
//                       <FaChevronRight />
//                     </button>
//                   </li>
//                 </ul>
//               </nav>
//             </div>
//           )}
//         </>
//       )}
//       {/* Modern Modal using Headless UI Dialog */}
//       <Transition appear show={showForm} as={React.Fragment}>
//         <Dialog
//           as="div"
//           className="fixed inset-0 z-50 overflow-y-auto"
//           onClose={() => {
//             setShowForm(false);
//             setCurrentCourse(null);
//             setEditingVideoIndex(null);
//             formik.resetForm();
//           }}
//         >
//           <div className="min-h-screen px-4 text-center bg-black bg-opacity-50">
//             <Transition.Child
//               as={React.Fragment}
//               enter="ease-out duration-300"
//               enterFrom="opacity-0 scale-95"
//               enterTo="opacity-100 scale-100"
//               leave="ease-in duration-200"
//               leaveFrom="opacity-100 scale-100"
//               leaveTo="opacity-0 scale-95"
//             >
//               <Dialog.Panel className="inline-block w-full max-w-5xl p-10 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-2xl rounded-2xl">
//                 {/* Header */}
//                 <div className="flex items-center justify-between border-b pb-4 mb-6">
//                   <Dialog.Title className="text-3xl font-bold text-gray-800 dark:text-gray-100">
//                     {currentCourse ? 'Edit Course' : 'Add New Course'}
//                   </Dialog.Title>
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setShowForm(false);
//                       setCurrentCourse(null);
//                       setEditingVideoIndex(null);
//                       formik.resetForm();
//                     }}
//                     className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 text-3xl leading-none"
//                   >
//                     &times;
//                   </button>
//                 </div>
//                 <FormikProvider value={formik}>
//                   <form onSubmit={formik.handleSubmit}>
//                     {/* Split container: Left for Course Details, Right for Videos */}
//                     <div className="flex flex-col md:flex-row gap-8">
//                       {/* Left Column: Course Details */}
//                       <div className="flex-1">
//                         {/* Title Field */}
//                         <div className="mb-6">
//                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                             Title
//                           </label>
//                           <input
//                             type="text"
//                             name="title"
//                             className={`mt-2 block w-full rounded-md border-gray-300 shadow-sm px-4 py-3 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200 ${
//                               formik.touched.title && formik.errors.title ? 'border-red-500' : ''
//                             }`}
//                             value={formik.values.title}
//                             onChange={formik.handleChange}
//                             onBlur={formik.handleBlur}
//                             placeholder="Course Title"
//                           />
//                           {formik.touched.title && formik.errors.title && (
//                             <div className="text-red-500 text-xs mt-1">{formik.errors.title}</div>
//                           )}
//                         </div>
//                         {/* Description Field */}
//                         <div className="mb-6">
//                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                             Description
//                           </label>
//                           <textarea
//                             name="description"
//                             className={`mt-2 block w-full rounded-md border-gray-300 shadow-sm px-4 py-3 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200 ${
//                               formik.touched.description && formik.errors.description ? 'border-red-500' : ''
//                             }`}
//                             value={formik.values.description}
//                             onChange={formik.handleChange}
//                             onBlur={formik.handleBlur}
//                             placeholder="Course Description"
//                           />
//                           {formik.touched.description && formik.errors.description && (
//                             <div className="text-red-500 text-xs mt-1">{formik.errors.description}</div>
//                           )}
//                         </div>
//                         {/* Instructor Field */}
//                         <div className="mb-6">
//                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                             Instructor
//                           </label>
//                           <input
//                             type="text"
//                             name="instructor"
//                             className={`mt-2 block w-full rounded-md border-gray-300 shadow-sm px-4 py-3 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200 ${
//                               formik.touched.instructor && formik.errors.instructor ? 'border-red-500' : ''
//                             }`}
//                             value={formik.values.instructor}
//                             onChange={formik.handleChange}
//                             onBlur={formik.handleBlur}
//                             placeholder="Instructor Name"
//                           />
//                           {formik.touched.instructor && formik.errors.instructor && (
//                             <div className="text-red-500 text-xs mt-1">{formik.errors.instructor}</div>
//                           )}
//                         </div>
//                         {/* Price Field */}
//                         <div className="mb-6">
//                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                             Price
//                           </label>
//                           <input
//                             type="number"
//                             name="price"
//                             className={`mt-2 block w-full rounded-md border-gray-300 shadow-sm px-4 py-3 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200 ${
//                               formik.touched.price && formik.errors.price ? 'border-red-500' : ''
//                             }`}
//                             value={formik.values.price}
//                             onChange={formik.handleChange}
//                             onBlur={formik.handleBlur}
//                             placeholder="Course Price"
//                             step="0.01"
//                           />
//                           {formik.touched.price && formik.errors.price && (
//                             <div className="text-red-500 text-xs mt-1">{formik.errors.price}</div>
//                           )}
//                         </div>
//                         {/* Image URL Field */}
//                         <div className="mb-6">
//                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                             Image URL
//                           </label>
//                           <input
//                             type="text"
//                             name="image"
//                             className={`mt-2 block w-full rounded-md border-gray-300 shadow-sm px-4 py-3 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200 ${
//                               formik.touched.image && formik.errors.image ? 'border-red-500' : ''
//                             }`}
//                             value={formik.values.image}
//                             onChange={formik.handleChange}
//                             onBlur={formik.handleBlur}
//                             placeholder="https://example.com/image.jpg"
//                           />
//                           {formik.touched.image && formik.errors.image && (
//                             <div className="text-red-500 text-xs mt-1">{formik.errors.image}</div>
//                           )}
//                         </div>
//                         {/* Featured Course */}
//                         <div className="mb-8 flex items-center">
//                           <input
//                             type="checkbox"
//                             name="isFeatured"
//                             id="isFeatured"
//                             className="mr-3 h-5 w-5 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
//                             checked={formik.values.isFeatured}
//                             onChange={formik.handleChange}
//                           />
//                           <label
//                             htmlFor="isFeatured"
//                             className="text-sm font-medium text-gray-700 dark:text-gray-300"
//                           >
//                             Featured Course
//                           </label>
//                         </div>
//                       </div>

//                       {/* Right Column: Course Videos */}
//                       <div className="flex-1">
//                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
//                           Course Videos
//                         </label>
//                         {/* Modern Scrollable Container using SimpleBar */}
//                         <FieldArray name="videos">
//                           {({ push, remove, form }) => (
//                             <>
//                               <SimpleBar style={{ maxHeight: 450 }} className="pr-2">
//                                 <DndContext
//                                   collisionDetection={closestCenter}
//                                   onDragEnd={(event) => handleDragEnd(event, form)}
//                                 >
//                                   <SortableContext
//                                     items={form.values.videos.map((_, index) => index)}
//                                     strategy={verticalListSortingStrategy}
//                                   >
//                                     {form.values.videos && form.values.videos.length > 0 ? (
//                                       form.values.videos.map((video, index) => (
//                                         <SortableVideoItem
//                                           key={index}
//                                           video={video}
//                                           index={index}
//                                           form={form}
//                                           editingVideoIndex={editingVideoIndex}
//                                           setEditingVideoIndex={setEditingVideoIndex}
//                                           remove={remove}
//                                         />
//                                       ))
//                                     ) : (
//                                       <div className="text-sm text-gray-500 dark:text-gray-400">
//                                         No videos added.
//                                       </div>
//                                     )}
//                                   </SortableContext>
//                                 </DndContext>
//                               </SimpleBar>
//                               <button
//                                 type="button"
//                                 onClick={() =>
//                                   push({
//                                     title: '',
//                                     url: '',
//                                     coverImage: '',
//                                     description: '',
//                                     duration: 0,
//                                     priority: form.values.videos.length,
//                                   })
//                                 }
//                                 className="mt-4 inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-green-700 focus:outline-none"
//                               >
//                                 Add Video
//                               </button>
//                             </>
//                           )}
//                         </FieldArray>

//                       </div>
//                     </div>
//                     {/* Form Buttons */}
//                     <div className="flex justify-end space-x-4 mt-8">
//                       <button
//                         type="submit"
//                         className="inline-flex items-center rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none"
//                       >
//                         {currentCourse ? 'Update' : 'Add'}
//                       </button>
//                     </div>
//                   </form>
//                 </FormikProvider>
//               </Dialog.Panel>
//             </Transition.Child>
//           </div>
//         </Dialog>
//       </Transition>
//     </div>
//   );
// };

// export default Courses;













// import React, { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useFormik, FormikProvider, FieldArray } from 'formik';
// import * as Yup from 'yup';
// import {
//   FaPlus,
//   FaEdit,
//   FaTrash,
//   FaChevronLeft,
//   FaChevronRight,
//   FaGripVertical,
// } from 'react-icons/fa';
// import { Dialog, Transition } from '@headlessui/react';
// import { DndContext, closestCenter } from '@dnd-kit/core';
// import {
//   arrayMove,
//   SortableContext,
//   verticalListSortingStrategy,
//   useSortable,
// } from '@dnd-kit/sortable';
// import { CSS } from '@dnd-kit/utilities';
// import {
//   fetchCourses,
//   addCourse,
//   updateCourse,
//   deleteCourse,
// } from '../redux/slices/coursesSlice';

// // Sortable video item component using dnd-kit
// const SortableVideoItem = ({
//   video,
//   index,
//   form,
//   editingVideoIndex,
//   setEditingVideoIndex,
//   remove,
// }) => {
//   const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
//     id: index,
//   });
//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//   };

//   return (
//     <div ref={setNodeRef} style={style} className="mb-6 border p-6 rounded-xl shadow-lg bg-white dark:bg-gray-800">
//       {/* Drag Handle */}
//       <div {...attributes} {...listeners} className="flex items-center cursor-move mb-4">
//         <FaGripVertical className="text-gray-500 mr-3" />
//         <span className="font-semibold text-lg">Video {index + 1}</span>
//       </div>
//       {editingVideoIndex === index ? (
//         // Editing view for video
//         <div>
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//               Video Title
//             </label>
//             <input
//               type="text"
//               name={`videos[${index}].title`}
//               value={video.title || ''}
//               onChange={form.handleChange}
//               onBlur={form.handleBlur}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
//               placeholder="Enter video title"
//             />
//           </div>
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//               Video URL
//             </label>
//             <input
//               type="text"
//               name={`videos[${index}].url`}
//               value={video.url || ''}
//               onChange={form.handleChange}
//               onBlur={form.handleBlur}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
//               placeholder="https://example.com/video.mp4"
//             />
//           </div>
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//               Cover Image URL
//             </label>
//             <input
//               type="text"
//               name={`videos[${index}].coverImage`}
//               value={video.coverImage || ''}
//               onChange={form.handleChange}
//               onBlur={form.handleBlur}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
//               placeholder="https://example.com/cover.jpg"
//             />
//           </div>
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//               Video Description
//             </label>
//             <textarea
//               name={`videos[${index}].description`}
//               value={video.description || ''}
//               onChange={form.handleChange}
//               onBlur={form.handleBlur}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
//               placeholder="Optional description"
//             />
//           </div>
//           <div className="mb-4 grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                 Duration (s)
//               </label>
//               <input
//                 type="number"
//                 name={`videos[${index}].duration`}
//                 value={video.duration || ''}
//                 onChange={form.handleChange}
//                 onBlur={form.handleBlur}
//                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
//                 placeholder="Duration"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                 Priority
//               </label>
//               <input
//                 type="number"
//                 name={`videos[${index}].priority`}
//                 value={video.priority || 0}
//                 onChange={form.handleChange}
//                 onBlur={form.handleBlur}
//                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
//                 placeholder="Priority"
//               />
//             </div>
//           </div>
//           <button
//             type="button"
//             onClick={() => setEditingVideoIndex(null)}
//             className="mt-2 inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none"
//           >
//             Save
//           </button>
//         </div>
//       ) : (
//         // Summary view for video
//         <div className="flex justify-between items-center">
//           <div className="flex items-center">
//             {video.coverImage ? (
//               <img
//                 src={video.coverImage}
//                 alt="Cover"
//                 className="w-16 h-16 rounded object-cover mr-3"
//               />
//             ) : (
//               <div className="w-16 h-16 bg-gray-200 rounded mr-3"></div>
//             )}
//             <div>
//               <p className="font-medium text-gray-800 dark:text-gray-200">
//                 {video.title || 'Untitled Video'}
//               </p>
//               <p className="text-xs text-gray-600 dark:text-gray-400">
//                 {video.duration || 0}s | P: {video.priority || 0}
//               </p>
//             </div>
//           </div>
//           <button
//             type="button"
//             onClick={() => setEditingVideoIndex(index)}
//             className="text-blue-600 hover:text-blue-700 text-sm font-medium"
//           >
//             Edit
//           </button>
//         </div>
//       )}
//       <div className="mt-4">
//         <button
//           type="button"
//           onClick={() => remove(index)}
//           className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white shadow hover:bg-red-700 focus:outline-none"
//         >
//           Remove Video
//         </button>
//       </div>
//     </div>
//   );
// };

// const Courses = () => {
//   const dispatch = useDispatch();
//   const { courses, loading, error } = useSelector((state) => state.courses);
//   const [showForm, setShowForm] = useState(false);
//   const [currentCourse, setCurrentCourse] = useState(null);
//   const [editingVideoIndex, setEditingVideoIndex] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const coursesPerPage = 10;

//   useEffect(() => {
//     dispatch(fetchCourses());
//   }, [dispatch]);

//   // Initial values for Formik
//   const initialValues = {
//     title: currentCourse ? currentCourse.title : '',
//     description: currentCourse ? currentCourse.description : '',
//     instructor: currentCourse ? currentCourse.instructor : '',
//     price: currentCourse ? currentCourse.price : '',
//     image: currentCourse ? currentCourse.image : '',
//     createdAt: currentCourse
//       ? new Date(currentCourse.createdAt).toISOString().substr(0, 10)
//       : '',
//     videos: currentCourse && currentCourse.videos ? currentCourse.videos : [],
//     isFeatured: currentCourse ? currentCourse.isFeatured : false,
//   };

//   const formik = useFormik({
//     initialValues,
//     enableReinitialize: true,
//     validationSchema: Yup.object({
//       title: Yup.string().required('Course title is required'),
//       description: Yup.string().required('Description is required'),
//       instructor: Yup.string().required('Instructor is required'),
//       price: Yup.number()
//         .positive('Price must be a positive number')
//         .required('Price is required'),
//       image: Yup.string()
//         .url('Please enter a valid URL')
//         .required('Image URL is required'),
//     }),
//     onSubmit: async (values) => {
//       // Sort videos by priority before sending data
//       const courseData = {
//         ...values,
//         videos: values.videos.sort((a, b) => a.priority - b.priority),
//       };

//       if (currentCourse) {
//         try {
//           await dispatch(updateCourse({ id: currentCourse._id, courseData })).unwrap();
//           setShowForm(false);
//           setCurrentCourse(null);
//           setEditingVideoIndex(null);
//           formik.resetForm();
//           setCurrentPage(1);
//         } catch (err) {
//           console.error('Update course error:', err);
//         }
//       } else {
//         try {
//           await dispatch(addCourse(courseData)).unwrap();
//           setShowForm(false);
//           setEditingVideoIndex(null);
//           formik.resetForm();
//           setCurrentPage(1);
//         } catch (err) {
//           console.error('Add course error:', err);
//         }
//       }
//     },
//   });

//   const handleEdit = (course) => {
//     setCurrentCourse(course);
//     setShowForm(true);
//     setEditingVideoIndex(null);
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm('Are you sure you want to delete this course?')) {
//       try {
//         await dispatch(deleteCourse(id)).unwrap();
//         const indexOfLast = currentPage * coursesPerPage;
//         const indexOfFirst = indexOfLast - coursesPerPage;
//         const currentSlice = courses.slice(indexOfFirst, indexOfLast);
//         if (currentSlice.length === 1 && currentPage > 1) {
//           setCurrentPage(currentPage - 1);
//         }
//       } catch (err) {
//         console.error('Delete course error:', err);
//       }
//     }
//   };

//   // Pagination calculations
//   const indexOfLast = currentPage * coursesPerPage;
//   const indexOfFirst = indexOfLast - coursesPerPage;
//   const currentCourses = courses.slice(indexOfFirst, indexOfLast);
//   const totalPages = Math.ceil(courses.length / coursesPerPage);
//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   // dnd-kit onDragEnd callback for videos
//   const handleDragEnd = (event, form) => {
//     const { active, over } = event;
//     if (active.id !== over.id) {
//       const oldIndex = Number(active.id);
//       const newIndex = Number(over.id);
//       let newVideos = arrayMove(form.values.videos, oldIndex, newIndex);
//       // Update priority for each video
//       newVideos = newVideos.map((video, index) => ({ ...video, priority: index }));
//       form.setFieldValue('videos', newVideos);
//     }
//   };

//   return (
//     <div className="p-8 bg-gray-100 dark:bg-gray-900 min-h-screen">
//       <h2 className="text-4xl font-bold mb-8 text-gray-800 dark:text-white">
//         Courses Management
//       </h2>
//       {error && (
//         <div className="bg-red-100 text-red-700 p-4 rounded mb-6">{error}</div>
//       )}
//       <button
//         onClick={() => {
//           setShowForm(true);
//           setCurrentCourse(null);
//           setEditingVideoIndex(null);
//           formik.resetForm();
//         }}
//         className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition mb-8 inline-flex items-center"
//         aria-label="Add Course"
//       >
//         <FaPlus className="mr-3" /> Add Course
//       </button>
//       {loading ? (
//         <div className="text-gray-800 dark:text-gray-200">Loading...</div>
//       ) : (
//         <>
//           <div className="overflow-x-auto">
//             <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg">
//               <thead className="bg-gray-50 dark:bg-gray-700">
//                 <tr>
//                   <th className="py-4 px-6 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Title
//                   </th>
//                   <th className="py-4 px-6 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Instructor
//                   </th>
//                   <th className="py-4 px-6 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Price
//                   </th>
//                   <th className="py-4 px-6 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Created At
//                   </th>
//                   <th className="py-4 px-6 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
//                 {currentCourses.map((course) => (
//                   <tr
//                     key={course._id}
//                     className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
//                   >
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
//                       {course.title}
//                     </td>
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
//                       {course.instructor}
//                     </td>
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
//                       ${course.price.toFixed(2)}
//                     </td>
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
//                       {new Date(course.createdAt).toLocaleDateString()}
//                     </td>
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200 inline-flex items-center space-x-3">
//                       <button
//                         onClick={() => handleEdit(course)}
//                         className="text-blue-600 hover:text-blue-700 inline-flex items-center"
//                         aria-label={`Edit course ${course.title}`}
//                       >
//                         <FaEdit className="mr-1" /> Edit
//                       </button>
//                       <button
//                         onClick={() => handleDelete(course._id)}
//                         className="text-red-600 hover:text-red-700 inline-flex items-center"
//                         aria-label={`Delete course ${course.title}`}
//                       >
//                         <FaTrash className="mr-1" /> Delete
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//                 {currentCourses.length === 0 && (
//                   <tr>
//                     <td
//                       colSpan="5"
//                       className="py-6 px-6 text-center text-gray-600 dark:text-gray-400"
//                     >
//                       No courses found.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//           {courses.length > coursesPerPage && (
//             <div className="flex justify-center mt-8">
//               <nav aria-label="Page navigation">
//                 <ul className="inline-flex -space-x-px">
//                   <li>
//                     <button
//                       onClick={() => paginate(currentPage - 1)}
//                       disabled={currentPage === 1}
//                       className={`px-4 py-2 leading-tight text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-l-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
//                         currentPage === 1 && 'cursor-not-allowed opacity-50'
//                       }`}
//                       aria-label="Previous Page"
//                     >
//                       <FaChevronLeft />
//                     </button>
//                   </li>
//                   {[...Array(totalPages)].map((_, index) => (
//                     <li key={index + 1}>
//                       <button
//                         onClick={() => paginate(index + 1)}
//                         className={`px-4 py-2 leading-tight border border-gray-300 dark:border-gray-700 ${
//                           currentPage === index + 1
//                             ? 'text-blue-600 bg-blue-50 dark:bg-gray-700 dark:text-white'
//                             : 'text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
//                         }`}
//                         aria-label={`Go to page ${index + 1}`}
//                       >
//                         {index + 1}
//                       </button>
//                     </li>
//                   ))}
//                   <li>
//                     <button
//                       onClick={() => paginate(currentPage + 1)}
//                       disabled={currentPage === totalPages}
//                       className={`px-4 py-2 leading-tight text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-r-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
//                         currentPage === totalPages && 'cursor-not-allowed opacity-50'
//                       }`}
//                       aria-label="Next Page"
//                     >
//                       <FaChevronRight />
//                     </button>
//                   </li>
//                 </ul>
//               </nav>
//             </div>
//           )}
//         </>
//       )}
//       {/* Modern Modal using Headless UI Dialog */}
//       <Transition appear show={showForm} as={React.Fragment}>
//         <Dialog
//           as="div"
//           className="fixed inset-0 z-50 overflow-y-auto"
//           onClose={() => {
//             setShowForm(false);
//             setCurrentCourse(null);
//             setEditingVideoIndex(null);
//             formik.resetForm();
//           }}
//         >
//           <div className="min-h-screen px-4 text-center bg-black bg-opacity-50">
//             <Transition.Child
//               as={React.Fragment}
//               enter="ease-out duration-300"
//               enterFrom="opacity-0 scale-95"
//               enterTo="opacity-100 scale-100"
//               leave="ease-in duration-200"
//               leaveFrom="opacity-100 scale-100"
//               leaveTo="opacity-0 scale-95"
//             >
//               <Dialog.Panel className="inline-block w-full max-w-5xl p-10 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-2xl rounded-2xl">
//                 {/* Header */}
//                 <div className="flex items-center justify-between border-b pb-4 mb-6">
//                   <Dialog.Title className="text-3xl font-bold text-gray-800 dark:text-gray-100">
//                     {currentCourse ? 'Edit Course' : 'Add New Course'}
//                   </Dialog.Title>
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setShowForm(false);
//                       setCurrentCourse(null);
//                       setEditingVideoIndex(null);
//                       formik.resetForm();
//                     }}
//                     className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 text-3xl leading-none"
//                   >
//                     &times;
//                   </button>
//                 </div>
//                 <FormikProvider value={formik}>
//                   <form onSubmit={formik.handleSubmit}>
//                     {/* Split container: Left for Course Details, Right for Videos */}
//                     <div className="flex flex-col md:flex-row gap-8">
//                       {/* Left Column: Course Details */}
//                       <div className="flex-1">
//                         {/* Title Field */}
//                         <div className="mb-6">
//                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                             Title
//                           </label>
//                           <input
//                             type="text"
//                             name="title"
//                             className={`mt-2 block w-full rounded-md border-gray-300 shadow-sm px-4 py-3 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200 ${
//                               formik.touched.title && formik.errors.title ? 'border-red-500' : ''
//                             }`}
//                             value={formik.values.title}
//                             onChange={formik.handleChange}
//                             onBlur={formik.handleBlur}
//                             placeholder="Course Title"
//                           />
//                           {formik.touched.title && formik.errors.title && (
//                             <div className="text-red-500 text-xs mt-1">{formik.errors.title}</div>
//                           )}
//                         </div>
//                         {/* Description Field */}
//                         <div className="mb-6">
//                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                             Description
//                           </label>
//                           <textarea
//                             name="description"
//                             className={`mt-2 block w-full rounded-md border-gray-300 shadow-sm px-4 py-3 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200 ${
//                               formik.touched.description && formik.errors.description ? 'border-red-500' : ''
//                             }`}
//                             value={formik.values.description}
//                             onChange={formik.handleChange}
//                             onBlur={formik.handleBlur}
//                             placeholder="Course Description"
//                           />
//                           {formik.touched.description && formik.errors.description && (
//                             <div className="text-red-500 text-xs mt-1">{formik.errors.description}</div>
//                           )}
//                         </div>
//                         {/* Instructor Field */}
//                         <div className="mb-6">
//                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                             Instructor
//                           </label>
//                           <input
//                             type="text"
//                             name="instructor"
//                             className={`mt-2 block w-full rounded-md border-gray-300 shadow-sm px-4 py-3 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200 ${
//                               formik.touched.instructor && formik.errors.instructor ? 'border-red-500' : ''
//                             }`}
//                             value={formik.values.instructor}
//                             onChange={formik.handleChange}
//                             onBlur={formik.handleBlur}
//                             placeholder="Instructor Name"
//                           />
//                           {formik.touched.instructor && formik.errors.instructor && (
//                             <div className="text-red-500 text-xs mt-1">{formik.errors.instructor}</div>
//                           )}
//                         </div>
//                         {/* Price Field */}
//                         <div className="mb-6">
//                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                             Price
//                           </label>
//                           <input
//                             type="number"
//                             name="price"
//                             className={`mt-2 block w-full rounded-md border-gray-300 shadow-sm px-4 py-3 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200 ${
//                               formik.touched.price && formik.errors.price ? 'border-red-500' : ''
//                             }`}
//                             value={formik.values.price}
//                             onChange={formik.handleChange}
//                             onBlur={formik.handleBlur}
//                             placeholder="Course Price"
//                             step="0.01"
//                           />
//                           {formik.touched.price && formik.errors.price && (
//                             <div className="text-red-500 text-xs mt-1">{formik.errors.price}</div>
//                           )}
//                         </div>
//                         {/* Image URL Field */}
//                         <div className="mb-6">
//                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                             Image URL
//                           </label>
//                           <input
//                             type="text"
//                             name="image"
//                             className={`mt-2 block w-full rounded-md border-gray-300 shadow-sm px-4 py-3 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200 ${
//                               formik.touched.image && formik.errors.image ? 'border-red-500' : ''
//                             }`}
//                             value={formik.values.image}
//                             onChange={formik.handleChange}
//                             onBlur={formik.handleBlur}
//                             placeholder="https://example.com/image.jpg"
//                           />
//                           {formik.touched.image && formik.errors.image && (
//                             <div className="text-red-500 text-xs mt-1">{formik.errors.image}</div>
//                           )}
//                         </div>
//                         {/* Featured Course */}
//                         <div className="mb-8 flex items-center">
//                           <input
//                             type="checkbox"
//                             name="isFeatured"
//                             id="isFeatured"
//                             className="mr-3 h-5 w-5 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
//                             checked={formik.values.isFeatured}
//                             onChange={formik.handleChange}
//                           />
//                           <label
//                             htmlFor="isFeatured"
//                             className="text-sm font-medium text-gray-700 dark:text-gray-300"
//                           >
//                             Featured Course
//                           </label>
//                         </div>
//                       </div>

//                       {/* Right Column: Course Videos */}
//                       <div className="flex-1">
//                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
//                           Course Videos
//                         </label>
//                         {/* Scrollable container with custom scrollbar styling */}
//                         <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 pr-2">
//                           <FieldArray name="videos">
//                             {({ push, remove, form }) => (
//                               <>
//                                 <DndContext
//                                   collisionDetection={closestCenter}
//                                   onDragEnd={(event) => handleDragEnd(event, form)}
//                                 >
//                                   <SortableContext
//                                     items={form.values.videos.map((_, index) => index)}
//                                     strategy={verticalListSortingStrategy}
//                                   >
//                                     {form.values.videos && form.values.videos.length > 0 ? (
//                                       form.values.videos.map((video, index) => (
//                                         <SortableVideoItem
//                                           key={index}
//                                           video={video}
//                                           index={index}
//                                           form={form}
//                                           editingVideoIndex={editingVideoIndex}
//                                           setEditingVideoIndex={setEditingVideoIndex}
//                                           remove={remove}
//                                         />
//                                       ))
//                                     ) : (
//                                       <div className="text-sm text-gray-500 dark:text-gray-400">
//                                         No videos added.
//                                       </div>
//                                     )}
//                                   </SortableContext>
//                                 </DndContext>
//                                 <button
//                                   type="button"
//                                   onClick={() =>
//                                     push({
//                                       title: '',
//                                       url: '',
//                                       coverImage: '',
//                                       description: '',
//                                       duration: 0,
//                                       priority: form.values.videos.length,
//                                     })
//                                   }
//                                   className="mt-4 inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-green-700 focus:outline-none"
//                                 >
//                                   Add Video
//                                 </button>
//                               </>
//                             )}
//                           </FieldArray>
//                         </div>
//                       </div>
//                     </div>
//                     {/* Form Buttons */}
//                     <div className="flex justify-end space-x-4 mt-8">
//                       {/* <button
//                         type="button"
//                         onClick={() => {
//                           setShowForm(false);
//                           setCurrentCourse(null);
//                           setEditingVideoIndex(null);
//                           formik.resetForm();
//                         }}
//                         className="inline-flex items-center rounded-md bg-gray-500 px-6 py-3 text-sm font-medium text-white shadow hover:bg-gray-600 focus:outline-none"
//                       >
//                         Cancel
//                       </button> */}
//                       <button
//                         type="submit"
//                         className="inline-flex items-center rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none"
//                       >
//                         {currentCourse ? 'Update' : 'Add'}
//                       </button>
//                     </div>
//                   </form>
//                 </FormikProvider>
//               </Dialog.Panel>
//             </Transition.Child>
//           </div>
//         </Dialog>
//       </Transition>
//     </div>
//   );
// };

// export default Courses;












// import React, { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useFormik, FormikProvider, FieldArray } from 'formik';
// import * as Yup from 'yup';
// import {
//   FaPlus,
//   FaEdit,
//   FaTrash,
//   FaChevronLeft,
//   FaChevronRight,
//   FaGripVertical,
// } from 'react-icons/fa';
// import { Dialog, Transition } from '@headlessui/react';
// import { DndContext, closestCenter } from '@dnd-kit/core';
// import {
//   arrayMove,
//   SortableContext,
//   verticalListSortingStrategy,
//   useSortable,
// } from '@dnd-kit/sortable';
// import { CSS } from '@dnd-kit/utilities';
// import {
//   fetchCourses,
//   addCourse,
//   updateCourse,
//   deleteCourse,
// } from '../redux/slices/coursesSlice';

// // Sortable video item component using dnd-kit
// const SortableVideoItem = ({
//   video,
//   index,
//   form,
//   editingVideoIndex,
//   setEditingVideoIndex,
//   remove,
// }) => {
//   const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
//     id: index,
//   });
//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//   };

//   return (
//     <div ref={setNodeRef} style={style} className="mb-6 border p-6 rounded-xl shadow-lg bg-white dark:bg-gray-800">
//       {/* Drag Handle */}
//       <div {...attributes} {...listeners} className="flex items-center cursor-move mb-4">
//         <FaGripVertical className="text-gray-500 mr-3" />
//         <span className="font-semibold text-lg">Video {index + 1}</span>
//       </div>
//       {editingVideoIndex === index ? (
//         // Editing view for video
//         <div>
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Video Title</label>
//             <input
//               type="text"
//               name={`videos[${index}].title`}
//               value={video.title || ''}
//               onChange={form.handleChange}
//               onBlur={form.handleBlur}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
//               placeholder="Enter video title"
//             />
//           </div>
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Video URL</label>
//             <input
//               type="text"
//               name={`videos[${index}].url`}
//               value={video.url || ''}
//               onChange={form.handleChange}
//               onBlur={form.handleBlur}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
//               placeholder="https://example.com/video.mp4"
//             />
//           </div>
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cover Image URL</label>
//             <input
//               type="text"
//               name={`videos[${index}].coverImage`}
//               value={video.coverImage || ''}
//               onChange={form.handleChange}
//               onBlur={form.handleBlur}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
//               placeholder="https://example.com/cover.jpg"
//             />
//           </div>
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Video Description</label>
//             <textarea
//               name={`videos[${index}].description`}
//               value={video.description || ''}
//               onChange={form.handleChange}
//               onBlur={form.handleBlur}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
//               placeholder="Optional description"
//             />
//           </div>
//           <div className="mb-4 grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Duration (s)</label>
//               <input
//                 type="number"
//                 name={`videos[${index}].duration`}
//                 value={video.duration || ''}
//                 onChange={form.handleChange}
//                 onBlur={form.handleBlur}
//                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
//                 placeholder="Duration"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
//               <input
//                 type="number"
//                 name={`videos[${index}].priority`}
//                 value={video.priority || 0}
//                 onChange={form.handleChange}
//                 onBlur={form.handleBlur}
//                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
//                 placeholder="Priority"
//               />
//             </div>
//           </div>
//           <button
//             type="button"
//             onClick={() => setEditingVideoIndex(null)}
//             className="mt-2 inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none"
//           >
//             Save
//           </button>
//         </div>
//       ) : (
//         // Summary view for video
//         <div className="flex justify-between items-center">
//           <div className="flex items-center">
//             {video.coverImage ? (
//               <img
//                 src={video.coverImage}
//                 alt="Cover"
//                 className="w-16 h-16 rounded object-cover mr-3"
//               />
//             ) : (
//               <div className="w-16 h-16 bg-gray-200 rounded mr-3"></div>
//             )}
//             <div>
//               <p className="font-medium text-gray-800 dark:text-gray-200">{video.title || 'Untitled Video'}</p>
//               <p className="text-xs text-gray-600 dark:text-gray-400">
//                 {video.duration || 0}s | P: {video.priority || 0}
//               </p>
//             </div>
//           </div>
//           <button
//             type="button"
//             onClick={() => setEditingVideoIndex(index)}
//             className="text-blue-600 hover:text-blue-700 text-sm font-medium"
//           >
//             Edit
//           </button>
//         </div>
//       )}
//       <div className="mt-4">
//         <button
//           type="button"
//           onClick={() => remove(index)}
//           className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white shadow hover:bg-red-700 focus:outline-none"
//         >
//           Remove Video
//         </button>
//       </div>
//     </div>
//   );
// };

// const Courses = () => {
//   const dispatch = useDispatch();
//   const { courses, loading, error } = useSelector((state) => state.courses);
//   const [showForm, setShowForm] = useState(false);
//   const [currentCourse, setCurrentCourse] = useState(null);
//   const [editingVideoIndex, setEditingVideoIndex] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const coursesPerPage = 10;

//   useEffect(() => {
//     dispatch(fetchCourses());
//   }, [dispatch]);

//   // Initial values for Formik
//   const initialValues = {
//     title: currentCourse ? currentCourse.title : '',
//     description: currentCourse ? currentCourse.description : '',
//     instructor: currentCourse ? currentCourse.instructor : '',
//     price: currentCourse ? currentCourse.price : '',
//     image: currentCourse ? currentCourse.image : '',
//     createdAt: currentCourse ? new Date(currentCourse.createdAt).toISOString().substr(0, 10) : '',
//     videos: currentCourse && currentCourse.videos ? currentCourse.videos : [],
//     isFeatured: currentCourse ? currentCourse.isFeatured : false,
//   };

//   const formik = useFormik({
//     initialValues,
//     enableReinitialize: true,
//     validationSchema: Yup.object({
//       title: Yup.string().required('Course title is required'),
//       description: Yup.string().required('Description is required'),
//       instructor: Yup.string().required('Instructor is required'),
//       price: Yup.number()
//         .positive('Price must be a positive number')
//         .required('Price is required'),
//       image: Yup.string().url('Please enter a valid URL').required('Image URL is required'),
//     }),
//     onSubmit: async (values) => {
//       // Sort videos by priority before sending data
//       const courseData = {
//         ...values,
//         videos: values.videos.sort((a, b) => a.priority - b.priority),
//       };

//       if (currentCourse) {
//         try {
//           await dispatch(updateCourse({ id: currentCourse._id, courseData })).unwrap();
//           setShowForm(false);
//           setCurrentCourse(null);
//           setEditingVideoIndex(null);
//           formik.resetForm();
//           setCurrentPage(1);
//         } catch (err) {
//           console.error('Update course error:', err);
//         }
//       } else {
//         try {
//           await dispatch(addCourse(courseData)).unwrap();
//           setShowForm(false);
//           setEditingVideoIndex(null);
//           formik.resetForm();
//           setCurrentPage(1);
//         } catch (err) {
//           console.error('Add course error:', err);
//         }
//       }
//     },
//   });

//   const handleEdit = (course) => {
//     setCurrentCourse(course);
//     setShowForm(true);
//     setEditingVideoIndex(null);
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm('Are you sure you want to delete this course?')) {
//       try {
//         await dispatch(deleteCourse(id)).unwrap();
//         const indexOfLast = currentPage * coursesPerPage;
//         const indexOfFirst = indexOfLast - coursesPerPage;
//         const currentSlice = courses.slice(indexOfFirst, indexOfLast);
//         if (currentSlice.length === 1 && currentPage > 1) {
//           setCurrentPage(currentPage - 1);
//         }
//       } catch (err) {
//         console.error('Delete course error:', err);
//       }
//     }
//   };

//   // Pagination calculations
//   const indexOfLast = currentPage * coursesPerPage;
//   const indexOfFirst = indexOfLast - coursesPerPage;
//   const currentCourses = courses.slice(indexOfFirst, indexOfLast);
//   const totalPages = Math.ceil(courses.length / coursesPerPage);
//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   // dnd-kit onDragEnd callback for videos
//   const handleDragEnd = (event, form) => {
//     const { active, over } = event;
//     if (active.id !== over.id) {
//       const oldIndex = Number(active.id);
//       const newIndex = Number(over.id);
//       let newVideos = arrayMove(form.values.videos, oldIndex, newIndex);
//       // Create new objects with updated priority
//       newVideos = newVideos.map((video, index) => ({ ...video, priority: index }));
//       form.setFieldValue('videos', newVideos);
//     }
//   };

//   return (
//     <div className="p-8 bg-gray-100 dark:bg-gray-900 min-h-screen">
//       <h2 className="text-4xl font-bold mb-8 text-gray-800 dark:text-white">Courses Management</h2>
//       {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-6">{error}</div>}
//       <button
//         onClick={() => {
//           setShowForm(true);
//           setCurrentCourse(null);
//           setEditingVideoIndex(null);
//           formik.resetForm();
//         }}
//         className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition mb-8 inline-flex items-center"
//         aria-label="Add Course"
//       >
//         <FaPlus className="mr-3" /> Add Course
//       </button>
//       {loading ? (
//         <div className="text-gray-800 dark:text-gray-200">Loading...</div>
//       ) : (
//         <>
//           <div className="overflow-x-auto">
//             <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg">
//               <thead className="bg-gray-50 dark:bg-gray-700">
//                 <tr>
//                   <th className="py-4 px-6 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Title
//                   </th>
//                   <th className="py-4 px-6 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Instructor
//                   </th>
//                   <th className="py-4 px-6 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Price
//                   </th>
//                   <th className="py-4 px-6 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Created At
//                   </th>
//                   <th className="py-4 px-6 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
//                 {currentCourses.map((course) => (
//                   <tr key={course._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">{course.title}</td>
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">{course.instructor}</td>
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">${course.price.toFixed(2)}</td>
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">{new Date(course.createdAt).toLocaleDateString()}</td>
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200 inline-flex items-center space-x-3">
//                       <button
//                         onClick={() => handleEdit(course)}
//                         className="text-blue-600 hover:text-blue-700 inline-flex items-center"
//                         aria-label={`Edit course ${course.title}`}
//                       >
//                         <FaEdit className="mr-1" /> Edit
//                       </button>
//                       <button
//                         onClick={() => handleDelete(course._id)}
//                         className="text-red-600 hover:text-red-700 inline-flex items-center"
//                         aria-label={`Delete course ${course.title}`}
//                       >
//                         <FaTrash className="mr-1" /> Delete
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//                 {currentCourses.length === 0 && (
//                   <tr>
//                     <td colSpan="5" className="py-6 px-6 text-center text-gray-600 dark:text-gray-400">
//                       No courses found.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//           {courses.length > coursesPerPage && (
//             <div className="flex justify-center mt-8">
//               <nav aria-label="Page navigation">
//                 <ul className="inline-flex -space-x-px">
//                   <li>
//                     <button
//                       onClick={() => paginate(currentPage - 1)}
//                       disabled={currentPage === 1}
//                       className={`px-4 py-2 leading-tight text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-l-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${currentPage === 1 && 'cursor-not-allowed opacity-50'}`}
//                       aria-label="Previous Page"
//                     >
//                       <FaChevronLeft />
//                     </button>
//                   </li>
//                   {[...Array(totalPages)].map((_, index) => (
//                     <li key={index + 1}>
//                       <button
//                         onClick={() => paginate(index + 1)}
//                         className={`px-4 py-2 leading-tight border border-gray-300 dark:border-gray-700 ${
//                           currentPage === index + 1
//                             ? 'text-blue-600 bg-blue-50 dark:bg-gray-700 dark:text-white'
//                             : 'text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
//                         }`}
//                         aria-label={`Go to page ${index + 1}`}
//                       >
//                         {index + 1}
//                       </button>
//                     </li>
//                   ))}
//                   <li>
//                     <button
//                       onClick={() => paginate(currentPage + 1)}
//                       disabled={currentPage === totalPages}
//                       className={`px-4 py-2 leading-tight text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-r-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${currentPage === totalPages && 'cursor-not-allowed opacity-50'}`}
//                       aria-label="Next Page"
//                     >
//                       <FaChevronRight />
//                     </button>
//                   </li>
//                 </ul>
//               </nav>
//             </div>
//           )}
//         </>
//       )}
//       {/* Modern Modal using Headless UI Dialog */}
//       <Transition appear show={showForm} as={React.Fragment}>
//         <Dialog
//           as="div"
//           className="fixed inset-0 z-50 overflow-y-auto"
//           onClose={() => {
//             setShowForm(false);
//             setCurrentCourse(null);
//             setEditingVideoIndex(null);
//             formik.resetForm();
//           }}
//         >
//           <div className="min-h-screen px-4 text-center bg-black bg-opacity-50">
//             <Transition.Child
//               as={React.Fragment}
//               enter="ease-out duration-300"
//               enterFrom="opacity-0 scale-95"
//               enterTo="opacity-100 scale-100"
//               leave="ease-in duration-200"
//               leaveFrom="opacity-100 scale-100"
//               leaveTo="opacity-0 scale-95"
//             >
//               <Dialog.Panel className="inline-block w-full max-w-5xl p-10 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-2xl rounded-2xl">
//                 {/* Header */}
//                 <div className="flex items-center justify-between border-b pb-4 mb-6">
//                   <Dialog.Title className="text-3xl font-bold text-gray-800 dark:text-gray-100">
//                     {currentCourse ? 'Edit Course' : 'Add New Course'}
//                   </Dialog.Title>
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setShowForm(false);
//                       setCurrentCourse(null);
//                       setEditingVideoIndex(null);
//                       formik.resetForm();
//                     }}
//                     className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 text-3xl leading-none"
//                   >
//                     &times;
//                   </button>
//                 </div>

//                 <FormikProvider value={formik}>
//                   <form onSubmit={formik.handleSubmit}>
//                     {/* Split container: Left for Course Details, Right for Videos */}
//                     <div className="flex flex-col md:flex-row gap-8">
//                       {/* Left Column: Course Details */}
//                       <div className="flex-1">
//                         {/* Title Field */}
//                         <div className="mb-6">
//                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
//                           <input
//                             type="text"
//                             name="title"
//                             className={`mt-2 block w-full rounded-md border-gray-300 shadow-sm px-4 py-3 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200 ${
//                               formik.touched.title && formik.errors.title ? 'border-red-500' : ''
//                             }`}
//                             value={formik.values.title}
//                             onChange={formik.handleChange}
//                             onBlur={formik.handleBlur}
//                             placeholder="Course Title"
//                           />
//                           {formik.touched.title && formik.errors.title && (
//                             <div className="text-red-500 text-xs mt-1">{formik.errors.title}</div>
//                           )}
//                         </div>
//                         {/* Description Field */}
//                         <div className="mb-6">
//                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
//                           <textarea
//                             name="description"
//                             className={`mt-2 block w-full rounded-md border-gray-300 shadow-sm px-4 py-3 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200 ${
//                               formik.touched.description && formik.errors.description ? 'border-red-500' : ''
//                             }`}
//                             value={formik.values.description}
//                             onChange={formik.handleChange}
//                             onBlur={formik.handleBlur}
//                             placeholder="Course Description"
//                           />
//                           {formik.touched.description && formik.errors.description && (
//                             <div className="text-red-500 text-xs mt-1">{formik.errors.description}</div>
//                           )}
//                         </div>
//                         {/* Instructor Field */}
//                         <div className="mb-6">
//                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Instructor</label>
//                           <input
//                             type="text"
//                             name="instructor"
//                             className={`mt-2 block w-full rounded-md border-gray-300 shadow-sm px-4 py-3 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200 ${
//                               formik.touched.instructor && formik.errors.instructor ? 'border-red-500' : ''
//                             }`}
//                             value={formik.values.instructor}
//                             onChange={formik.handleChange}
//                             onBlur={formik.handleBlur}
//                             placeholder="Instructor Name"
//                           />
//                           {formik.touched.instructor && formik.errors.instructor && (
//                             <div className="text-red-500 text-xs mt-1">{formik.errors.instructor}</div>
//                           )}
//                         </div>
//                         {/* Price Field */}
//                         <div className="mb-6">
//                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price</label>
//                           <input
//                             type="number"
//                             name="price"
//                             className={`mt-2 block w-full rounded-md border-gray-300 shadow-sm px-4 py-3 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200 ${
//                               formik.touched.price && formik.errors.price ? 'border-red-500' : ''
//                             }`}
//                             value={formik.values.price}
//                             onChange={formik.handleChange}
//                             onBlur={formik.handleBlur}
//                             placeholder="Course Price"
//                             step="0.01"
//                           />
//                           {formik.touched.price && formik.errors.price && (
//                             <div className="text-red-500 text-xs mt-1">{formik.errors.price}</div>
//                           )}
//                         </div>
//                         {/* Image URL Field */}
//                         <div className="mb-6">
//                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image URL</label>
//                           <input
//                             type="text"
//                             name="image"
//                             className={`mt-2 block w-full rounded-md border-gray-300 shadow-sm px-4 py-3 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200 ${
//                               formik.touched.image && formik.errors.image ? 'border-red-500' : ''
//                             }`}
//                             value={formik.values.image}
//                             onChange={formik.handleChange}
//                             onBlur={formik.handleBlur}
//                             placeholder="https://example.com/image.jpg"
//                           />
//                           {formik.touched.image && formik.errors.image && (
//                             <div className="text-red-500 text-xs mt-1">{formik.errors.image}</div>
//                           )}
//                         </div>
//                         {/* Featured Course */}
//                         <div className="mb-8 flex items-center">
//                           <input
//                             type="checkbox"
//                             name="isFeatured"
//                             id="isFeatured"
//                             className="mr-3 h-5 w-5 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
//                             checked={formik.values.isFeatured}
//                             onChange={formik.handleChange}
//                           />
//                           <label htmlFor="isFeatured" className="text-sm font-medium text-gray-700 dark:text-gray-300">
//                             Featured Course
//                           </label>
//                         </div>
//                       </div>

//                       {/* Right Column: Course Videos */}
//                       <div className="flex-1">
//                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
//                           Course Videos
//                         </label>
//                         <FieldArray name="videos">
//                           {({ push, remove, form }) => (
//                             <>
//                               <DndContext collisionDetection={closestCenter} onDragEnd={(event) => handleDragEnd(event, form)}>
//                                 <SortableContext items={form.values.videos.map((_, index) => index)} strategy={verticalListSortingStrategy}>
//                                   {form.values.videos && form.values.videos.length > 0 ? (
//                                     form.values.videos.map((video, index) => (
//                                       <SortableVideoItem
//                                         key={index}
//                                         video={video}
//                                         index={index}
//                                         form={form}
//                                         editingVideoIndex={editingVideoIndex}
//                                         setEditingVideoIndex={setEditingVideoIndex}
//                                         remove={remove}
//                                       />
//                                     ))
//                                   ) : (
//                                     <div className="text-sm text-gray-500 dark:text-gray-400">No videos added.</div>
//                                   )}
//                                 </SortableContext>
//                               </DndContext>
//                               <button
//                                 type="button"
//                                 onClick={() =>
//                                   push({
//                                     title: '',
//                                     url: '',
//                                     coverImage: '',
//                                     description: '',
//                                     duration: 0,
//                                     priority: form.values.videos.length,
//                                   })
//                                 }
//                                 className="mt-4 inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-green-700 focus:outline-none"
//                               >
//                                 Add Video
//                               </button>
//                             </>
//                           )}
//                         </FieldArray>
//                       </div>
//                     </div>

//                     {/* Form Buttons */}
//                     <div className="flex justify-end space-x-4 mt-8">
//                       <button
//                         type="button"
//                         onClick={() => {
//                           setShowForm(false);
//                           setCurrentCourse(null);
//                           setEditingVideoIndex(null);
//                           formik.resetForm();
//                         }}
//                         className="inline-flex items-center rounded-md bg-gray-500 px-6 py-3 text-sm font-medium text-white shadow hover:bg-gray-600 focus:outline-none"
//                       >
//                         Cancel
//                       </button>
//                       <button
//                         type="submit"
//                         className="inline-flex items-center rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none"
//                       >
//                         {currentCourse ? 'Update' : 'Add'}
//                       </button>
//                     </div>
//                   </form>
//                 </FormikProvider>
//               </Dialog.Panel>
//             </Transition.Child>
//           </div>
//         </Dialog>
//       </Transition>

//     </div>
//   );
// };

// export default Courses;



