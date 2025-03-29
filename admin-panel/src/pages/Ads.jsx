import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FaPlus, FaEdit, FaTrash, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Transition } from '@headlessui/react';
import { fetchAds, addAd, updateAd, deleteAd } from '../redux/slices/adsSlice';

const Ads = () => {
  const dispatch = useDispatch();
  const { ads, loading, error } = useSelector((state) => state.ads);
  const [showForm, setShowForm] = useState(false);
  const [currentAd, setCurrentAd] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const adsPerPage = 5;

  useEffect(() => {
    dispatch(fetchAds());
  }, [dispatch]);

  const formik = useFormik({
    initialValues: {
      image: currentAd ? currentAd.image : '',
      title: currentAd ? currentAd.title : '',
      subtitle: currentAd ? currentAd.subtitle : '',
      description: currentAd ? currentAd.description : '',
      link: currentAd ? currentAd.link : '',
      category: currentAd ? currentAd.category : 'New Course',
      templateId: currentAd ? currentAd.templateId : 'newCourse',
      price: currentAd ? currentAd.price : '',
      startDate:
        currentAd && currentAd.startDate
          ? new Date(currentAd.startDate).toISOString().substring(0, 10)
          : '',
      endDate:
        currentAd && currentAd.endDate
          ? new Date(currentAd.endDate).toISOString().substring(0, 10)
          : '',
      targetAudience: currentAd ? currentAd.targetAudience : 'General',
      ctaText: currentAd ? currentAd.ctaText : 'Learn More',
      priority: currentAd ? currentAd.priority : 1,
      cardDesign: currentAd ? currentAd.cardDesign : 'basic',
      promoCode: currentAd?.promoCode || '',
      limitedOffer: currentAd?.limitedOffer || false,
      instructor: currentAd?.instructor || '',
      courseInfo: currentAd?.courseInfo || '',
      rating: currentAd?.rating || '',
      originalPrice: currentAd?.originalPrice || '',
      salePrice: currentAd?.salePrice || '',
      discountPercentage: currentAd?.discountPercentage || '',
      saleEnds:
        currentAd && currentAd.saleEnds
          ? new Date(currentAd.saleEnds).toISOString().substring(0, 10)
          : '',
      eventDate:
        currentAd && currentAd.eventDate
          ? new Date(currentAd.eventDate).toISOString().substring(0, 10)
          : '',
      eventLocation: currentAd?.eventLocation || '',
      // New fields:
      adProdtype: currentAd ? currentAd.adProdtype : 'Product',
      adProdId: currentAd ? currentAd.adProdId : 'Product',
      // Custom styles
      customStyles: {
        gradientColors:
          currentAd && currentAd.customStyles && currentAd.customStyles.gradientColors
            ? currentAd.customStyles.gradientColors.join(', ')
            : 'rgba(247,151,30,0.95), rgba(255,210,0,0.85)',
        badgeColor:
          currentAd && currentAd.customStyles && currentAd.customStyles.badgeColor
            ? currentAd.customStyles.badgeColor
            : '#F7971E',
        textColor:
          currentAd && currentAd.customStyles && currentAd.customStyles.textColor
            ? currentAd.customStyles.textColor
            : '#ffffff',
      },
    },
    enableReinitialize: true,
    validationSchema: Yup.object().shape({
      image: Yup.string().required('Image URL is required'),
      title: Yup.string().required('Title is required'),
      subtitle: Yup.string().required('Subtitle is required'),
      description: Yup.string()
        .required('Description is required')
        .max(500, 'Max 500 characters'),
      link: Yup.string().required('Link is required'),
      category: Yup.string().required('Category is required'),
      templateId: Yup.string().required('Template is required'),
      startDate: Yup.date().when('templateId', (templateId, schema) => {
        return templateId === 'sale'
          ? schema.required('Start date is required')
          : schema.nullable();
      }),
      endDate: Yup.date().when('templateId', (templateId, schema) => {
        return templateId === 'sale'
          ? schema.required('End date is required')
          : schema.nullable();
      }),
      saleEnds: Yup.date().when('templateId', (templateId, schema) => {
        return templateId === 'sale'
          ? schema.required('Sale end date is required')
          : schema.nullable();
      }),
      eventDate: Yup.date().when('templateId', (templateId, schema) => {
        return templateId === 'event'
          ? schema.required('Event date is required')
          : schema.nullable();
      }),
      priority: Yup.number().min(1, 'Priority must be at least 1'),
      // New fields validations:
      adProdtype: Yup.string().oneOf(['Product', 'Course']),
      adProdId: Yup.string(), // No enum constraints here
    }),
    onSubmit: async (values) => {
      try {
        // Convert gradientColors from comma-separated string to an array
        const customStyles = { ...values.customStyles };
        if (typeof customStyles.gradientColors === 'string') {
          customStyles.gradientColors = customStyles.gradientColors
            .split(';')
            .map((c) => c.trim());
        }
        const adData = { ...values, customStyles };

        if (currentAd) {
          await dispatch(updateAd({ id: currentAd._id, adData })).unwrap();
        } else {
          await dispatch(addAd(adData)).unwrap();
        }
        setShowForm(false);
        setCurrentAd(null);
        formik.resetForm();
        setCurrentPage(1);
      } catch (err) {
        console.error(currentAd ? 'Update ad error:' : 'Add ad error:', err);
      }
    },
  });

  const handleEdit = (ad) => {
    setCurrentAd(ad);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this ad?')) {
      try {
        await dispatch(deleteAd(id)).unwrap();
      } catch (err) {
        console.error('Delete ad error:', err);
      }
    }
  };

  // Pagination
  const indexOfLast = currentPage * adsPerPage;
  const indexOfFirst = indexOfLast - adsPerPage;
  const currentAds = ads.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(ads.length / adsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Ads Management</h2>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      <button
        onClick={() => {
          setShowForm(true);
          setCurrentAd(null);
          formik.resetForm();
        }}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition mb-6 flex items-center"
        aria-label="Add Ad"
      >
        <FaPlus className="mr-2" /> Add Ad
      </button>
      {loading ? (
        <div className="text-gray-800 dark:text-gray-200">Loading...</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Subtitle
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {currentAds.map((ad) => (
                  <tr key={ad._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
                      <img src={ad.image} alt={ad.title} className="w-20 h-auto rounded" />
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">{ad.title}</td>
                    <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">{ad.subtitle}</td>
                    <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200 flex items-center">
                      <button
                        onClick={() => handleEdit(ad)}
                        className="text-blue-500 hover:text-blue-700 mr-4 flex items-center"
                        aria-label={`Edit ad ${ad.title}`}
                      >
                        <FaEdit className="mr-1" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(ad._id)}
                        className="text-red-500 hover:text-red-700 flex items-center"
                        aria-label={`Delete ad ${ad.title}`}
                      >
                        <FaTrash className="mr-1" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {currentAds.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-4 px-6 text-center text-gray-600 dark:text-gray-400">
                      No ads found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {ads.length > adsPerPage && (
            <div className="flex justify-center mt-6">
              <nav aria-label="Page navigation">
                <ul className="inline-flex -space-x-px">
                  <li>
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-2 ml-0 leading-tight text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-l-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        currentPage === 1 ? 'cursor-not-allowed opacity-50' : ''
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
                        className={`px-3 py-2 leading-tight border border-gray-300 dark:border-gray-700 ${
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
                      className={`px-3 py-2 leading-tight text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-r-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        currentPage === totalPages ? 'cursor-not-allowed opacity-50' : ''
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
          aria-modal="true"
          role="dialog"
        >
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-4xl mx-4 overflow-y-auto max-h-[90vh]">
            <h3 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              {currentAd ? 'Edit Ad' : 'Add New Ad'}
            </h3>
            <form onSubmit={formik.handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Basic Details */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-200">Image URL</label>
                    <input
                      type="text"
                      name="image"
                      className="w-full px-3 py-2 border rounded focus:outline-none"
                      value={formik.values.image}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="https://example.com/ad.png"
                    />
                    {formik.touched.image && formik.errors.image && (
                      <div className="text-red-500 text-sm mt-1">{formik.errors.image}</div>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-700 dark:text-gray-200">Title</label>
                    <input
                      type="text"
                      name="title"
                      className="w-full px-3 py-2 border rounded focus:outline-none"
                      value={formik.values.title}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Ad Title"
                    />
                    {formik.touched.title && formik.errors.title && (
                      <div className="text-red-500 text-sm mt-1">{formik.errors.title}</div>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-700 dark:text-gray-200">Subtitle</label>
                    <input
                      type="text"
                      name="subtitle"
                      className="w-full px-3 py-2 border rounded focus:outline-none"
                      value={formik.values.subtitle}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Ad Subtitle"
                    />
                    {formik.touched.subtitle && formik.errors.subtitle && (
                      <div className="text-red-500 text-sm mt-1">{formik.errors.subtitle}</div>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-700 dark:text-gray-200">Description</label>
                    <textarea
                      name="description"
                      className="w-full px-3 py-2 border rounded focus:outline-none"
                      value={formik.values.description}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Enter ad description (max 500 characters)"
                      rows="4"
                    />
                    {formik.touched.description && formik.errors.description && (
                      <div className="text-red-500 text-sm mt-1">{formik.errors.description}</div>
                    )}
                  </div>
                </div>
                {/* Right Column: Advanced Settings & Template Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-200">Link</label>
                    <input
                      type="text"
                      name="link"
                      className="w-full px-3 py-2 border rounded focus:outline-none"
                      value={formik.values.link}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="https://example.com"
                    />
                    {formik.touched.link && formik.errors.link && (
                      <div className="text-red-500 text-sm mt-1">{formik.errors.link}</div>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-700 dark:text-gray-200">Category</label>
                    <select
                      name="category"
                      value={formik.values.category}
                      onChange={formik.handleChange}
                      className="w-full px-3 py-2 border rounded focus:outline-none"
                    >
                      <option value="New Course">New Course</option>
                      <option value="Product">Product</option>
                      <option value="Sale">Sale</option>
                      <option value="Promotion">Promotion</option>
                      <option value="Event">Event</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 dark:text-gray-200">Template</label>
                    <select
                      name="templateId"
                      value={formik.values.templateId}
                      onChange={formik.handleChange}
                      className="w-full px-3 py-2 border rounded focus:outline-none"
                    >
                      <option value="promo">Promotion</option>
                      <option value="newCourse">New Course</option>
                      <option value="sale">Sale</option>
                      <option value="event">Event</option>
                    </select>
                    {formik.touched.templateId && formik.errors.templateId && (
                      <div className="text-red-500 text-sm mt-1">{formik.errors.templateId}</div>
                    )}
                  </div>
                  {/* New Fields: Ad Prod Type and Ad Prod Id */}
                  <div>
                    <label className="block text-gray-700 dark:text-gray-200">Ad Prod Type</label>
                    <select
                      name="adProdtype"
                      value={formik.values.adProdtype}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full px-3 py-2 border rounded focus:outline-none"
                    >
                      <option value="Product">Product</option>
                      <option value="Course">Course</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 dark:text-gray-200">Ad Prod Id</label>
                    <input
                      type="text"
                      name="adProdId"
                      value={formik.values.adProdId}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full px-3 py-2 border rounded focus:outline-none"
                      placeholder="Enter Ad Product ID"
                    />
                  </div>
                  {/* Conditional fields based on template selection */}
                  {formik.values.templateId === 'promo' && (
                    <>
                      <div>
                        <label className="block text-gray-700 dark:text-gray-200">Promo Code</label>
                        <input
                          type="text"
                          name="promoCode"
                          className="w-full px-3 py-2 border rounded focus:outline-none"
                          value={formik.values.promoCode}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          placeholder="e.g., SAVE20"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 dark:text-gray-200">Limited Offer</label>
                        <select
                          name="limitedOffer"
                          value={formik.values.limitedOffer}
                          onChange={formik.handleChange}
                          className="w-full px-3 py-2 border rounded focus:outline-none"
                        >
                          <option value={false}>No</option>
                          <option value={true}>Yes</option>
                        </select>
                      </div>
                    </>
                  )}
                  {formik.values.templateId === 'newCourse' && (
                    <>
                      <div>
                        <label className="block text-gray-700 dark:text-gray-200">Instructor</label>
                        <input
                          type="text"
                          name="instructor"
                          className="w-full px-3 py-2 border rounded focus:outline-none"
                          value={formik.values.instructor}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          placeholder="Instructor Name"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 dark:text-gray-200">Course Info</label>
                        <textarea
                          name="courseInfo"
                          className="w-full px-3 py-2 border rounded focus:outline-none"
                          value={formik.values.courseInfo}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          placeholder="Short course description"
                          rows="2"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 dark:text-gray-200">Rating</label>
                        <input
                          type="number"
                          name="rating"
                          className="w-full px-3 py-2 border rounded focus:outline-none"
                          value={formik.values.rating}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          placeholder="e.g., 4.5"
                          step="0.1"
                        />
                      </div>
                    </>
                  )}
                  {formik.values.templateId === 'sale' && (
                    <>
                      <div>
                        <label className="block text-gray-700 dark:text-gray-200">Original Price</label>
                        <input
                          type="number"
                          name="originalPrice"
                          className="w-full px-3 py-2 border rounded focus:outline-none"
                          value={formik.values.originalPrice}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          placeholder="e.g., 199.99"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 dark:text-gray-200">Sale Price</label>
                        <input
                          type="number"
                          name="salePrice"
                          className="w-full px-3 py-2 border rounded focus:outline-none"
                          value={formik.values.salePrice}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          placeholder="e.g., 149.99"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 dark:text-gray-200">Discount Percentage</label>
                        <input
                          type="number"
                          name="discountPercentage"
                          className="w-full px-3 py-2 border rounded focus:outline-none"
                          value={formik.values.discountPercentage}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          placeholder="e.g., 25"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 dark:text-gray-200">Sale Ends</label>
                        <input
                          type="date"
                          name="saleEnds"
                          className="w-full px-3 py-2 border rounded focus:outline-none"
                          value={formik.values.saleEnds}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                      </div>
                    </>
                  )}
                  {formik.values.templateId === 'event' && (
                    <>
                      <div>
                        <label className="block text-gray-700 dark:text-gray-200">Event Date</label>
                        <input
                          type="date"
                          name="eventDate"
                          className="w-full px-3 py-2 border rounded focus:outline-none"
                          value={formik.values.eventDate}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 dark:text-gray-200">Event Location</label>
                        <input
                          type="text"
                          name="eventLocation"
                          className="w-full px-3 py-2 border rounded focus:outline-none"
                          value={formik.values.eventLocation}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          placeholder="e.g., New York, NY"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
              {/* Custom Styles Section */}
              <div className="mt-6 space-y-4">
                <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Custom Styles</h4>
                <div>
                  <label className="block text-gray-700 dark:text-gray-200">
                    Gradient Colors (';' separated)
                  </label>
                  <input
                    type="text"
                    name="customStyles.gradientColors"
                    value={formik.values.customStyles.gradientColors}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="rgba(247,151,30,0.95), rgba(255,210,0,0.85)"
                    className="w-full px-3 py-2 border rounded focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-200">Badge Color</label>
                  <input
                    type="color"
                    name="customStyles.badgeColor"
                    value={formik.values.customStyles.badgeColor}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-3 py-2 border rounded focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-200">Text Color</label>
                  <input
                    type="color"
                    name="customStyles.textColor"
                    value={formik.values.customStyles.textColor}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-3 py-2 border rounded focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setCurrentAd(null);
                    formik.resetForm();
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded mr-2 hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
                  {currentAd ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </div>
  );
};

export default Ads;










// import React, { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useFormik } from 'formik';
// import * as Yup from 'yup';
// import { FaPlus, FaEdit, FaTrash, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
// import { Transition } from '@headlessui/react';
// import { fetchAds, addAd, updateAd, deleteAd } from '../redux/slices/adsSlice';

// const Ads = () => {
//   const dispatch = useDispatch();
//   const { ads, loading, error } = useSelector((state) => state.ads);
//   const [showForm, setShowForm] = useState(false);
//   const [currentAd, setCurrentAd] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const adsPerPage = 5;

//   useEffect(() => {
//     dispatch(fetchAds());
//   }, [dispatch]);

//   const formik = useFormik({
//     initialValues: {
//       image: currentAd ? currentAd.image : '',
//       title: currentAd ? currentAd.title : '',
//       subtitle: currentAd ? currentAd.subtitle : '',
//       description: currentAd ? currentAd.description : '',
//       link: currentAd ? currentAd.link : '',
//       category: currentAd ? currentAd.category : 'New Course',
//       templateId: currentAd ? currentAd.templateId : 'newCourse',
//       price: currentAd ? currentAd.price : '',
//       startDate:
//         currentAd && currentAd.startDate
//           ? new Date(currentAd.startDate).toISOString().substring(0, 10)
//           : '',
//       endDate:
//         currentAd && currentAd.endDate
//           ? new Date(currentAd.endDate).toISOString().substring(0, 10)
//           : '',
//       targetAudience: currentAd ? currentAd.targetAudience : 'General',
//       ctaText: currentAd ? currentAd.ctaText : 'Learn More',
//       priority: currentAd ? currentAd.priority : 1,
//       cardDesign: currentAd ? currentAd.cardDesign : 'basic',
//       promoCode: currentAd?.promoCode || '',
//       limitedOffer: currentAd?.limitedOffer || false,
//       instructor: currentAd?.instructor || '',
//       courseInfo: currentAd?.courseInfo || '',
//       rating: currentAd?.rating || '',
//       originalPrice: currentAd?.originalPrice || '',
//       salePrice: currentAd?.salePrice || '',
//       discountPercentage: currentAd?.discountPercentage || '',
//       saleEnds:
//         currentAd && currentAd.saleEnds
//           ? new Date(currentAd.saleEnds).toISOString().substring(0, 10)
//           : '',
//       eventDate:
//         currentAd && currentAd.eventDate
//           ? new Date(currentAd.eventDate).toISOString().substring(0, 10)
//           : '',
//       eventLocation: currentAd?.eventLocation || '',
//       // Custom styles under customStyles
//       customStyles: {
//         gradientColors:
//           currentAd && currentAd.customStyles && currentAd.customStyles.gradientColors
//             ? currentAd.customStyles.gradientColors.join(', ')
//             : 'rgba(247,151,30,0.95), rgba(255,210,0,0.85)',
//         badgeColor:
//           currentAd && currentAd.customStyles && currentAd.customStyles.badgeColor
//             ? currentAd.customStyles.badgeColor
//             : '#F7971E',
//         textColor:
//           currentAd && currentAd.customStyles && currentAd.customStyles.textColor
//             ? currentAd.customStyles.textColor
//             : '#ffffff',
//       },
//     },
//     enableReinitialize: true,
//     validationSchema: Yup.object().shape({
//       image: Yup.string().required('Image URL is required'),
//       title: Yup.string().required('Title is required'),
//       subtitle: Yup.string().required('Subtitle is required'),
//       description: Yup.string()
//         .required('Description is required')
//         .max(500, 'Max 500 characters'),
//       link: Yup.string().required('Link is required'),
//       category: Yup.string().required('Category is required'),
//       templateId: Yup.string().required('Template is required'),
//       // Use the function form for conditional validations
//       startDate: Yup.date().when('templateId', (templateId, schema) => {
//         return templateId === 'sale'
//           ? schema.required('Start date is required')
//           : schema.nullable();
//       }),
//       endDate: Yup.date().when('templateId', (templateId, schema) => {
//         return templateId === 'sale'
//           ? schema.required('End date is required')
//           : schema.nullable();
//       }),
//       saleEnds: Yup.date().when('templateId', (templateId, schema) => {
//         return templateId === 'sale'
//           ? schema.required('Sale end date is required')
//           : schema.nullable();
//       }),
//       eventDate: Yup.date().when('templateId', (templateId, schema) => {
//         return templateId === 'event'
//           ? schema.required('Event date is required')
//           : schema.nullable();
//       }),
//       priority: Yup.number().min(1, 'Priority must be at least 1'),
//     }),
//     onSubmit: async (values) => {
//       try {
//         // Convert gradientColors from comma-separated string to an array
//         const customStyles = { ...values.customStyles };
//         if (typeof customStyles.gradientColors === 'string') {
//           customStyles.gradientColors = customStyles.gradientColors
//             .split(',')
//             .map((c) => c.trim());
//         }
//         const adData = { ...values, customStyles };

//         if (currentAd) {
//           console.log(currentAd);
          
//           await dispatch(updateAd({ id: currentAd._id, adData })).unwrap();
//         } else {
//           await dispatch(addAd(adData)).unwrap();
//         }
//         setShowForm(false);
//         setCurrentAd(null);
//         formik.resetForm();
//         setCurrentPage(1);
//       } catch (err) {
//         console.error(currentAd ? 'Update ad error:' : 'Add ad error:', err);
//       }
//     },
//   });

//   const handleEdit = (ad) => {
//     setCurrentAd(ad);
//     setShowForm(true);
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm('Are you sure you want to delete this ad?')) {
//       try {
//         await dispatch(deleteAd(id)).unwrap();
//       } catch (err) {
//         console.error('Delete ad error:', err);
//       }
//     }
//   };

//   // Pagination
//   const indexOfLast = currentPage * adsPerPage;
//   const indexOfFirst = indexOfLast - adsPerPage;
//   const currentAds = ads.slice(indexOfFirst, indexOfLast);
//   const totalPages = Math.ceil(ads.length / adsPerPage);
//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   return (
//     <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
//       <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Ads Management</h2>
//       {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
//       <button
//         onClick={() => {
//           setShowForm(true);
//           setCurrentAd(null);
//           formik.resetForm();
//         }}
//         className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition mb-6 flex items-center"
//         aria-label="Add Ad"
//       >
//         <FaPlus className="mr-2" /> Add Ad
//       </button>
//       {loading ? (
//         <div className="text-gray-800 dark:text-gray-200">Loading...</div>
//       ) : (
//         <>
//           <div className="overflow-x-auto">
//             <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
//               <thead className="bg-gray-50 dark:bg-gray-700">
//                 <tr>
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Image
//                   </th>
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Title
//                   </th>
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Subtitle
//                   </th>
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
//                 {currentAds.map((ad) => (
//                   <tr key={ad._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
//                       <img src={ad.image} alt={ad.title} className="w-20 h-auto rounded" />
//                     </td>
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">{ad.title}</td>
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">{ad.subtitle}</td>
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200 flex items-center">
//                       <button
//                         onClick={() => handleEdit(ad)}
//                         className="text-blue-500 hover:text-blue-700 mr-4 flex items-center"
//                         aria-label={`Edit ad ${ad.title}`}
//                       >
//                         <FaEdit className="mr-1" /> Edit
//                       </button>
//                       <button
//                         onClick={() => handleDelete(ad._id)}
//                         className="text-red-500 hover:text-red-700 flex items-center"
//                         aria-label={`Delete ad ${ad.title}`}
//                       >
//                         <FaTrash className="mr-1" /> Delete
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//                 {currentAds.length === 0 && (
//                   <tr>
//                     <td colSpan="4" className="py-4 px-6 text-center text-gray-600 dark:text-gray-400">
//                       No ads found.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//           {ads.length > adsPerPage && (
//             <div className="flex justify-center mt-6">
//               <nav aria-label="Page navigation">
//                 <ul className="inline-flex -space-x-px">
//                   <li>
//                     <button
//                       onClick={() => paginate(currentPage - 1)}
//                       disabled={currentPage === 1}
//                       className={`px-3 py-2 ml-0 leading-tight text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-l-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
//                         currentPage === 1 ? 'cursor-not-allowed opacity-50' : ''
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
//                         className={`px-3 py-2 leading-tight border border-gray-300 dark:border-gray-700 ${
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
//                       className={`px-3 py-2 leading-tight text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-r-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
//                         currentPage === totalPages ? 'cursor-not-allowed opacity-50' : ''
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
//       <Transition
//         show={showForm}
//         enter="transition ease-out duration-300 transform"
//         enterFrom="opacity-0 scale-95"
//         enterTo="opacity-100 scale-100"
//         leave="transition ease-in duration-200 transform"
//         leaveFrom="opacity-100 scale-100"
//         leaveTo="opacity-0 scale-95"
//       >
//         <div
//           className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
//           aria-modal="true"
//           role="dialog"
//         >
//           <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-4xl mx-4 overflow-y-auto max-h-[90vh]">
//             <h3 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
//               {currentAd ? 'Edit Ad' : 'Add New Ad'}
//             </h3>
//             <form onSubmit={formik.handleSubmit}>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {/* Left Column: Basic Details */}
//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">Image URL</label>
//                     <input
//                       type="text"
//                       name="image"
//                       className="w-full px-3 py-2 border rounded focus:outline-none"
//                       value={formik.values.image}
//                       onChange={formik.handleChange}
//                       onBlur={formik.handleBlur}
//                       placeholder="https://example.com/ad.png"
//                     />
//                     {formik.touched.image && formik.errors.image && (
//                       <div className="text-red-500 text-sm mt-1">{formik.errors.image}</div>
//                     )}
//                   </div>
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">Title</label>
//                     <input
//                       type="text"
//                       name="title"
//                       className="w-full px-3 py-2 border rounded focus:outline-none"
//                       value={formik.values.title}
//                       onChange={formik.handleChange}
//                       onBlur={formik.handleBlur}
//                       placeholder="Ad Title"
//                     />
//                     {formik.touched.title && formik.errors.title && (
//                       <div className="text-red-500 text-sm mt-1">{formik.errors.title}</div>
//                     )}
//                   </div>
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">Subtitle</label>
//                     <input
//                       type="text"
//                       name="subtitle"
//                       className="w-full px-3 py-2 border rounded focus:outline-none"
//                       value={formik.values.subtitle}
//                       onChange={formik.handleChange}
//                       onBlur={formik.handleBlur}
//                       placeholder="Ad Subtitle"
//                     />
//                     {formik.touched.subtitle && formik.errors.subtitle && (
//                       <div className="text-red-500 text-sm mt-1">{formik.errors.subtitle}</div>
//                     )}
//                   </div>
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">Description</label>
//                     <textarea
//                       name="description"
//                       className="w-full px-3 py-2 border rounded focus:outline-none"
//                       value={formik.values.description}
//                       onChange={formik.handleChange}
//                       onBlur={formik.handleBlur}
//                       placeholder="Enter ad description (max 500 characters)"
//                       rows="4"
//                     />
//                     {formik.touched.description && formik.errors.description && (
//                       <div className="text-red-500 text-sm mt-1">{formik.errors.description}</div>
//                     )}
//                   </div>
//                 </div>
//                 {/* Right Column: Advanced Settings & Template Fields */}
//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">Link</label>
//                     <input
//                       type="text"
//                       name="link"
//                       className="w-full px-3 py-2 border rounded focus:outline-none"
//                       value={formik.values.link}
//                       onChange={formik.handleChange}
//                       onBlur={formik.handleBlur}
//                       placeholder="https://example.com"
//                     />
//                     {formik.touched.link && formik.errors.link && (
//                       <div className="text-red-500 text-sm mt-1">{formik.errors.link}</div>
//                     )}
//                   </div>
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">Category</label>
//                     <select
//                       name="category"
//                       value={formik.values.category}
//                       onChange={formik.handleChange}
//                       className="w-full px-3 py-2 border rounded focus:outline-none"
//                     >
//                       <option value="New Course">New Course</option>
//                       <option value="Product">Product</option>
//                       <option value="Sale">Sale</option>
//                       <option value="Promotion">Promotion</option>
//                       <option value="Event">Event</option>
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">Template</label>
//                     <select
//                       name="templateId"
//                       value={formik.values.templateId}
//                       onChange={formik.handleChange}
//                       className="w-full px-3 py-2 border rounded focus:outline-none"
//                     >
//                       <option value="promo">Promotion</option>
//                       <option value="newCourse">New Course</option>
//                       <option value="sale">Sale</option>
//                       <option value="event">Event</option>
//                     </select>
//                     {formik.touched.templateId && formik.errors.templateId && (
//                       <div className="text-red-500 text-sm mt-1">{formik.errors.templateId}</div>
//                     )}
//                   </div>
//                   {/* Conditional fields based on template selection */}
//                   {formik.values.templateId === 'promo' && (
//                     <>
//                       <div>
//                         <label className="block text-gray-700 dark:text-gray-200">Promo Code</label>
//                         <input
//                           type="text"
//                           name="promoCode"
//                           className="w-full px-3 py-2 border rounded focus:outline-none"
//                           value={formik.values.promoCode}
//                           onChange={formik.handleChange}
//                           onBlur={formik.handleBlur}
//                           placeholder="e.g., SAVE20"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-gray-700 dark:text-gray-200">Limited Offer</label>
//                         <select
//                           name="limitedOffer"
//                           value={formik.values.limitedOffer}
//                           onChange={formik.handleChange}
//                           className="w-full px-3 py-2 border rounded focus:outline-none"
//                         >
//                           <option value={false}>No</option>
//                           <option value={true}>Yes</option>
//                         </select>
//                       </div>
//                     </>
//                   )}
//                   {formik.values.templateId === 'newCourse' && (
//                     <>
//                       <div>
//                         <label className="block text-gray-700 dark:text-gray-200">Instructor</label>
//                         <input
//                           type="text"
//                           name="instructor"
//                           className="w-full px-3 py-2 border rounded focus:outline-none"
//                           value={formik.values.instructor}
//                           onChange={formik.handleChange}
//                           onBlur={formik.handleBlur}
//                           placeholder="Instructor Name"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-gray-700 dark:text-gray-200">Course Info</label>
//                         <textarea
//                           name="courseInfo"
//                           className="w-full px-3 py-2 border rounded focus:outline-none"
//                           value={formik.values.courseInfo}
//                           onChange={formik.handleChange}
//                           onBlur={formik.handleBlur}
//                           placeholder="Short course description"
//                           rows="2"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-gray-700 dark:text-gray-200">Rating</label>
//                         <input
//                           type="number"
//                           name="rating"
//                           className="w-full px-3 py-2 border rounded focus:outline-none"
//                           value={formik.values.rating}
//                           onChange={formik.handleChange}
//                           onBlur={formik.handleBlur}
//                           placeholder="e.g., 4.5"
//                           step="0.1"
//                         />
//                       </div>
//                     </>
//                   )}
//                   {formik.values.templateId === 'sale' && (
//                     <>
//                       <div>
//                         <label className="block text-gray-700 dark:text-gray-200">Original Price</label>
//                         <input
//                           type="number"
//                           name="originalPrice"
//                           className="w-full px-3 py-2 border rounded focus:outline-none"
//                           value={formik.values.originalPrice}
//                           onChange={formik.handleChange}
//                           onBlur={formik.handleBlur}
//                           placeholder="e.g., 199.99"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-gray-700 dark:text-gray-200">Sale Price</label>
//                         <input
//                           type="number"
//                           name="salePrice"
//                           className="w-full px-3 py-2 border rounded focus:outline-none"
//                           value={formik.values.salePrice}
//                           onChange={formik.handleChange}
//                           onBlur={formik.handleBlur}
//                           placeholder="e.g., 149.99"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-gray-700 dark:text-gray-200">Discount Percentage</label>
//                         <input
//                           type="number"
//                           name="discountPercentage"
//                           className="w-full px-3 py-2 border rounded focus:outline-none"
//                           value={formik.values.discountPercentage}
//                           onChange={formik.handleChange}
//                           onBlur={formik.handleBlur}
//                           placeholder="e.g., 25"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-gray-700 dark:text-gray-200">Sale Ends</label>
//                         <input
//                           type="date"
//                           name="saleEnds"
//                           className="w-full px-3 py-2 border rounded focus:outline-none"
//                           value={formik.values.saleEnds}
//                           onChange={formik.handleChange}
//                           onBlur={formik.handleBlur}
//                         />
//                       </div>
//                     </>
//                   )}
//                   {formik.values.templateId === 'event' && (
//                     <>
//                       <div>
//                         <label className="block text-gray-700 dark:text-gray-200">Event Date</label>
//                         <input
//                           type="date"
//                           name="eventDate"
//                           className="w-full px-3 py-2 border rounded focus:outline-none"
//                           value={formik.values.eventDate}
//                           onChange={formik.handleChange}
//                           onBlur={formik.handleBlur}
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-gray-700 dark:text-gray-200">Event Location</label>
//                         <input
//                           type="text"
//                           name="eventLocation"
//                           className="w-full px-3 py-2 border rounded focus:outline-none"
//                           value={formik.values.eventLocation}
//                           onChange={formik.handleChange}
//                           onBlur={formik.handleBlur}
//                           placeholder="e.g., New York, NY"
//                         />
//                       </div>
//                     </>
//                   )}
//                 </div>
//               </div>
//               {/* Custom Styles Section */}
//               <div className="mt-6 space-y-4">
//                 <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Custom Styles</h4>
//                 <div>
//                   <label className="block text-gray-700 dark:text-gray-200">
//                     Gradient Colors (comma separated)
//                   </label>
//                   <input
//                     type="text"
//                     name="customStyles.gradientColors"
//                     value={formik.values.customStyles.gradientColors}
//                     onChange={formik.handleChange}
//                     onBlur={formik.handleBlur}
//                     placeholder="rgba(247,151,30,0.95), rgba(255,210,0,0.85)"
//                     className="w-full px-3 py-2 border rounded focus:outline-none"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-gray-700 dark:text-gray-200">Badge Color</label>
//                   <input
//                     type="color"
//                     name="customStyles.badgeColor"
//                     value={formik.values.customStyles.badgeColor}
//                     onChange={formik.handleChange}
//                     onBlur={formik.handleBlur}
//                     className="w-full px-3 py-2 border rounded focus:outline-none"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-gray-700 dark:text-gray-200">Text Color</label>
//                   <input
//                     type="color"
//                     name="customStyles.textColor"
//                     value={formik.values.customStyles.textColor}
//                     onChange={formik.handleChange}
//                     onBlur={formik.handleBlur}
//                     className="w-full px-3 py-2 border rounded focus:outline-none"
//                   />
//                 </div>
//               </div>
//               <div className="flex justify-end mt-6">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowForm(false);
//                     setCurrentAd(null);
//                     formik.resetForm();
//                   }}
//                   className="bg-gray-500 text-white px-4 py-2 rounded mr-2 hover:bg-gray-600 transition"
//                 >
//                   Cancel
//                 </button>
//                 <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
//                   {currentAd ? 'Update' : 'Add'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </Transition>
//     </div>
//   );
// };

// export default Ads;







// // src/pages/Ads.jsx
// import React, { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useFormik } from 'formik';
// import * as Yup from 'yup';
// import { FaPlus, FaEdit, FaTrash, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
// import { Transition } from '@headlessui/react';
// import { fetchAds, addAd, updateAd, deleteAd } from '../redux/slices/adsSlice';

// const Ads = () => {
//   const dispatch = useDispatch();
//   const { ads, loading, error } = useSelector((state) => state.ads);
//   const [showForm, setShowForm] = useState(false);
//   const [currentAd, setCurrentAd] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const adsPerPage = 5;

//   useEffect(() => {
//     dispatch(fetchAds());
//   }, [dispatch]);

//   const formik = useFormik({
//     initialValues: {
//       image: currentAd ? currentAd.image : '',
//       title: currentAd ? currentAd.title : '',
//       subtitle: currentAd ? currentAd.subtitle : '',
//       description: currentAd ? currentAd.description : '',
//       link: currentAd ? currentAd.link : '',
//       category: currentAd ? currentAd.category : 'New Course',
//       templateId: currentAd ? currentAd.templateId : 'newCourse', // Template selection
//       price: currentAd ? currentAd.price : '',
//       startDate: currentAd ? currentAd.startDate.substring(0, 10) : '',
//       endDate: currentAd ? currentAd.endDate.substring(0, 10) : '',
//       targetAudience: currentAd ? currentAd.targetAudience : 'General',
//       ctaText: currentAd ? currentAd.ctaText : 'Learn More',
//       priority: currentAd ? currentAd.priority : 1,
//       cardDesign: currentAd ? currentAd.cardDesign : 'basic',
//       backgroundColor: currentAd ? currentAd.backgroundColor : '#ffffff',
//       textColor: currentAd ? currentAd.textColor : '#000000',
//       // Additional fields per template:
//       promoCode: currentAd?.promoCode || '',
//       limitedOffer: currentAd?.limitedOffer || false,
//       instructor: currentAd?.instructor || '',
//       courseInfo: currentAd?.courseInfo || '',
//       rating: currentAd?.rating || '',
//       originalPrice: currentAd?.originalPrice || '',
//       salePrice: currentAd?.salePrice || '',
//       discountPercentage: currentAd?.discountPercentage || '',
//       saleEnds: currentAd?.saleEnds || '',
//       eventDate: currentAd?.eventDate || '',
//       eventLocation: currentAd?.eventLocation || '',
//     },
//     enableReinitialize: true,
//     validationSchema: Yup.object({
//       image: Yup.string().required('Image URL is required'),
//       title: Yup.string().required('Title is required'),
//       subtitle: Yup.string().required('Subtitle is required'),
//       description: Yup.string().required('Description is required').max(500, 'Max 500 characters'),
//       link: Yup.string().required('Link is required'),
//       category: Yup.string().required('Category is required'),
//       templateId: Yup.string().required('Template is required'),
//       startDate: Yup.date().required('Start date is required'),
//       endDate: Yup.date().required('End date is required'),
//       priority: Yup.number().min(1, 'Priority must be at least 1'),
//     }),
//     onSubmit: async (values) => {
//       try {
//         if (currentAd) {
//           await dispatch(updateAd({ id: currentAd._id, adData: values })).unwrap();
//         } else {
//           await dispatch(addAd(values)).unwrap();
//         }
//         setShowForm(false);
//         setCurrentAd(null);
//         formik.resetForm();
//         setCurrentPage(1);
//       } catch (err) {
//         console.error(currentAd ? 'Update ad error:' : 'Add ad error:', err);
//       }
//     },
//   });

//   const handleEdit = (ad) => {
//     setCurrentAd(ad);
//     setShowForm(true);
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm('Are you sure you want to delete this ad?')) {
//       try {
//         await dispatch(deleteAd(id)).unwrap();
//       } catch (err) {
//         console.error('Delete ad error:', err);
//       }
//     }
//   };

//   // Pagination
//   const indexOfLast = currentPage * adsPerPage;
//   const indexOfFirst = indexOfLast - adsPerPage;
//   const currentAds = ads.slice(indexOfFirst, indexOfLast);
//   const totalPages = Math.ceil(ads.length / adsPerPage);
//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   return (
//     <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
//       <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Ads Management</h2>
//       {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
//       <button
//         onClick={() => {
//           setShowForm(true);
//           setCurrentAd(null);
//           formik.resetForm();
//         }}
//         className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition mb-6 flex items-center"
//         aria-label="Add Ad"
//       >
//         <FaPlus className="mr-2" /> Add Ad
//       </button>
//       {loading ? (
//         <div className="text-gray-800 dark:text-gray-200">Loading...</div>
//       ) : (
//         <>
//           <div className="overflow-x-auto">
//             <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
//               <thead className="bg-gray-50 dark:bg-gray-700">
//                 <tr>
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Image</th>
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Subtitle</th>
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
//                 {currentAds.map((ad) => (
//                   <tr key={ad._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
//                       <img src={ad.image} alt={ad.title} className="w-20 h-auto rounded" />
//                     </td>
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">{ad.title}</td>
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">{ad.subtitle}</td>
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200 flex items-center">
//                       <button onClick={() => handleEdit(ad)} className="text-blue-500 hover:text-blue-700 mr-4 flex items-center" aria-label={`Edit ad ${ad.title}`}>
//                         <FaEdit className="mr-1" /> Edit
//                       </button>
//                       <button onClick={() => handleDelete(ad._id)} className="text-red-500 hover:text-red-700 flex items-center" aria-label={`Delete ad ${ad.title}`}>
//                         <FaTrash className="mr-1" /> Delete
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//                 {currentAds.length === 0 && (
//                   <tr>
//                     <td colSpan="4" className="py-4 px-6 text-center text-gray-600 dark:text-gray-400">
//                       No ads found.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//           {ads.length > adsPerPage && (
//             <div className="flex justify-center mt-6">
//               <nav aria-label="Page navigation">
//                 <ul className="inline-flex -space-x-px">
//                   <li>
//                     <button
//                       onClick={() => paginate(currentPage - 1)}
//                       disabled={currentPage === 1}
//                       className={`px-3 py-2 ml-0 leading-tight text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-l-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${currentPage === 1 ? 'cursor-not-allowed opacity-50' : ''}`}
//                       aria-label="Previous Page"
//                     >
//                       <FaChevronLeft />
//                     </button>
//                   </li>
//                   {[...Array(totalPages)].map((_, index) => (
//                     <li key={index + 1}>
//                       <button
//                         onClick={() => paginate(index + 1)}
//                         className={`px-3 py-2 leading-tight border border-gray-300 dark:border-gray-700 ${currentPage === index + 1 ? 'text-blue-600 bg-blue-50 dark:bg-gray-700 dark:text-white' : 'text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
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
//                       className={`px-3 py-2 leading-tight text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-r-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${currentPage === totalPages ? 'cursor-not-allowed opacity-50' : ''}`}
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
//       <Transition
//         show={showForm}
//         enter="transition ease-out duration-300 transform"
//         enterFrom="opacity-0 scale-95"
//         enterTo="opacity-100 scale-100"
//         leave="transition ease-in duration-200 transform"
//         leaveFrom="opacity-100 scale-100"
//         leaveTo="opacity-0 scale-95"
//       >
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" aria-modal="true" role="dialog">
//           <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-4xl mx-4 overflow-y-auto max-h-[90vh]">
//             <h3 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
//               {currentAd ? 'Edit Ad' : 'Add New Ad'}
//             </h3>
//             <form onSubmit={formik.handleSubmit}>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {/* Left Column: Basic Details */}
//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">Image URL</label>
//                     <input
//                       type="text"
//                       name="image"
//                       className="w-full px-3 py-2 border rounded focus:outline-none"
//                       value={formik.values.image}
//                       onChange={formik.handleChange}
//                       onBlur={formik.handleBlur}
//                       placeholder="https://example.com/ad.png"
//                     />
//                     {formik.touched.image && formik.errors.image && (
//                       <div className="text-red-500 text-sm mt-1">{formik.errors.image}</div>
//                     )}
//                   </div>
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">Title</label>
//                     <input
//                       type="text"
//                       name="title"
//                       className="w-full px-3 py-2 border rounded focus:outline-none"
//                       value={formik.values.title}
//                       onChange={formik.handleChange}
//                       onBlur={formik.handleBlur}
//                       placeholder="Ad Title"
//                     />
//                     {formik.touched.title && formik.errors.title && (
//                       <div className="text-red-500 text-sm mt-1">{formik.errors.title}</div>
//                     )}
//                   </div>
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">Subtitle</label>
//                     <input
//                       type="text"
//                       name="subtitle"
//                       className="w-full px-3 py-2 border rounded focus:outline-none"
//                       value={formik.values.subtitle}
//                       onChange={formik.handleChange}
//                       onBlur={formik.handleBlur}
//                       placeholder="Ad Subtitle"
//                     />
//                     {formik.touched.subtitle && formik.errors.subtitle && (
//                       <div className="text-red-500 text-sm mt-1">{formik.errors.subtitle}</div>
//                     )}
//                   </div>
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">Description</label>
//                     <textarea
//                       name="description"
//                       className="w-full px-3 py-2 border rounded focus:outline-none"
//                       value={formik.values.description}
//                       onChange={formik.handleChange}
//                       onBlur={formik.handleBlur}
//                       placeholder="Enter ad description (max 500 characters)"
//                       rows="4"
//                     />
//                     {formik.touched.description && formik.errors.description && (
//                       <div className="text-red-500 text-sm mt-1">{formik.errors.description}</div>
//                     )}
//                   </div>
//                 </div>
//                 {/* Right Column: Advanced Settings & Template Fields */}
//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">Link</label>
//                     <input
//                       type="text"
//                       name="link"
//                       className="w-full px-3 py-2 border rounded focus:outline-none"
//                       value={formik.values.link}
//                       onChange={formik.handleChange}
//                       onBlur={formik.handleBlur}
//                       placeholder="https://example.com"
//                     />
//                     {formik.touched.link && formik.errors.link && (
//                       <div className="text-red-500 text-sm mt-1">{formik.errors.link}</div>
//                     )}
//                   </div>
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">Category</label>
//                     <select
//                       name="category"
//                       value={formik.values.category}
//                       onChange={formik.handleChange}
//                       className="w-full px-3 py-2 border rounded focus:outline-none"
//                     >
//                       <option value="New Course">New Course</option>
//                       <option value="Product">Product</option>
//                       <option value="Sale">Sale</option>
//                       <option value="Promotion">Promotion</option>
//                       <option value="Event">Event</option>
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">Template</label>
//                     <select
//                       name="templateId"
//                       value={formik.values.templateId}
//                       onChange={formik.handleChange}
//                       className="w-full px-3 py-2 border rounded focus:outline-none"
//                     >
//                       <option value="promo">Promotion</option>
//                       <option value="newCourse">New Course</option>
//                       <option value="sale">Sale</option>
//                       <option value="event">Event</option>
//                     </select>
//                     {formik.touched.templateId && formik.errors.templateId && (
//                       <div className="text-red-500 text-sm mt-1">{formik.errors.templateId}</div>
//                     )}
//                   </div>
//                   {/* Conditional fields based on template selection */}
//                   {formik.values.templateId === 'promo' && (
//                     <>
//                       <div>
//                         <label className="block text-gray-700 dark:text-gray-200">Promo Code</label>
//                         <input
//                           type="text"
//                           name="promoCode"
//                           className="w-full px-3 py-2 border rounded focus:outline-none"
//                           value={formik.values.promoCode}
//                           onChange={formik.handleChange}
//                           onBlur={formik.handleBlur}
//                           placeholder="e.g., SAVE20"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-gray-700 dark:text-gray-200">Limited Offer</label>
//                         <select
//                           name="limitedOffer"
//                           value={formik.values.limitedOffer}
//                           onChange={formik.handleChange}
//                           className="w-full px-3 py-2 border rounded focus:outline-none"
//                         >
//                           <option value={false}>No</option>
//                           <option value={true}>Yes</option>
//                         </select>
//                       </div>
//                     </>
//                   )}
//                   {formik.values.templateId === 'newCourse' && (
//                     <>
//                       <div>
//                         <label className="block text-gray-700 dark:text-gray-200">Instructor</label>
//                         <input
//                           type="text"
//                           name="instructor"
//                           className="w-full px-3 py-2 border rounded focus:outline-none"
//                           value={formik.values.instructor}
//                           onChange={formik.handleChange}
//                           onBlur={formik.handleBlur}
//                           placeholder="Instructor Name"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-gray-700 dark:text-gray-200">Course Info</label>
//                         <textarea
//                           name="courseInfo"
//                           className="w-full px-3 py-2 border rounded focus:outline-none"
//                           value={formik.values.courseInfo}
//                           onChange={formik.handleChange}
//                           onBlur={formik.handleBlur}
//                           placeholder="Short course description"
//                           rows="2"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-gray-700 dark:text-gray-200">Rating</label>
//                         <input
//                           type="number"
//                           name="rating"
//                           className="w-full px-3 py-2 border rounded focus:outline-none"
//                           value={formik.values.rating}
//                           onChange={formik.handleChange}
//                           onBlur={formik.handleBlur}
//                           placeholder="e.g., 4.5"
//                           step="0.1"
//                         />
//                       </div>
//                     </>
//                   )}
//                   {formik.values.templateId === 'sale' && (
//                     <>
//                       <div>
//                         <label className="block text-gray-700 dark:text-gray-200">Original Price</label>
//                         <input
//                           type="number"
//                           name="originalPrice"
//                           className="w-full px-3 py-2 border rounded focus:outline-none"
//                           value={formik.values.originalPrice}
//                           onChange={formik.handleChange}
//                           onBlur={formik.handleBlur}
//                           placeholder="e.g., 199.99"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-gray-700 dark:text-gray-200">Sale Price</label>
//                         <input
//                           type="number"
//                           name="salePrice"
//                           className="w-full px-3 py-2 border rounded focus:outline-none"
//                           value={formik.values.salePrice}
//                           onChange={formik.handleChange}
//                           onBlur={formik.handleBlur}
//                           placeholder="e.g., 149.99"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-gray-700 dark:text-gray-200">Discount Percentage</label>
//                         <input
//                           type="number"
//                           name="discountPercentage"
//                           className="w-full px-3 py-2 border rounded focus:outline-none"
//                           value={formik.values.discountPercentage}
//                           onChange={formik.handleChange}
//                           onBlur={formik.handleBlur}
//                           placeholder="e.g., 25"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-gray-700 dark:text-gray-200">Sale Ends</label>
//                         <input
//                           type="date"
//                           name="saleEnds"
//                           className="w-full px-3 py-2 border rounded focus:outline-none"
//                           value={formik.values.saleEnds}
//                           onChange={formik.handleChange}
//                           onBlur={formik.handleBlur}
//                         />
//                       </div>
//                     </>
//                   )}
//                   {formik.values.templateId === 'event' && (
//                     <>
//                       <div>
//                         <label className="block text-gray-700 dark:text-gray-200">Event Date</label>
//                         <input
//                           type="date"
//                           name="eventDate"
//                           className="w-full px-3 py-2 border rounded focus:outline-none"
//                           value={formik.values.eventDate}
//                           onChange={formik.handleChange}
//                           onBlur={formik.handleBlur}
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-gray-700 dark:text-gray-200">Event Location</label>
//                         <input
//                           type="text"
//                           name="eventLocation"
//                           className="w-full px-3 py-2 border rounded focus:outline-none"
//                           value={formik.values.eventLocation}
//                           onChange={formik.handleChange}
//                           onBlur={formik.handleBlur}
//                           placeholder="e.g., New York, NY"
//                         />
//                       </div>
//                     </>
//                   )}
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">Background Color</label>
//                     <input
//                       type="color"
//                       name="backgroundColor"
//                       className="w-full px-3 py-2 border rounded"
//                       value={formik.values.backgroundColor}
//                       onChange={formik.handleChange}
//                       onBlur={formik.handleBlur}
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">Text Color</label>
//                     <input
//                       type="color"
//                       name="textColor"
//                       className="w-full px-3 py-2 border rounded"
//                       value={formik.values.textColor}
//                       onChange={formik.handleChange}
//                       onBlur={formik.handleBlur}
//                     />
//                   </div>
//                 </div>
//               </div>
//               <div className="flex justify-end mt-6">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowForm(false);
//                     setCurrentAd(null);
//                     formik.resetForm();
//                   }}
//                   className="bg-gray-500 text-white px-4 py-2 rounded mr-2 hover:bg-gray-600 transition"
//                 >
//                   Cancel
//                 </button>
//                 <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
//                   {currentAd ? 'Update' : 'Add'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </Transition>
//     </div>
//   );
// };

// export default Ads;











// // src/pages/Ads.jsx
// import React, { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useFormik } from 'formik';
// import * as Yup from 'yup';
// import { FaPlus, FaEdit, FaTrash, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
// import { Transition } from '@headlessui/react';
// import { fetchAds, addAd, updateAd, deleteAd } from '../redux/slices/adsSlice';

// const Ads = () => {
//   const dispatch = useDispatch();
//   const { ads, loading, error } = useSelector((state) => state.ads);
//   const [showForm, setShowForm] = useState(false);
//   const [currentAd, setCurrentAd] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const adsPerPage = 5;

//   useEffect(() => {
//     dispatch(fetchAds());
//   }, [dispatch]);

//   const formik = useFormik({
//     initialValues: {
//       image: currentAd ? currentAd.image : '',
//       title: currentAd ? currentAd.title : '',
//       subtitle: currentAd ? currentAd.subtitle : '',
//       description: currentAd ? currentAd.description : '',
//       link: currentAd ? currentAd.link : '',
//       category: currentAd ? currentAd.category : 'New Course',
//       templateId: currentAd ? currentAd.templateId : 'newCourse', // Template selection
//       price: currentAd ? currentAd.price : '',
//       startDate: currentAd ? currentAd.startDate.substring(0, 10) : '',
//       endDate: currentAd ? currentAd.endDate.substring(0, 10) : '',
//       targetAudience: currentAd ? currentAd.targetAudience : 'General',
//       ctaText: currentAd ? currentAd.ctaText : 'Learn More',
//       priority: currentAd ? currentAd.priority : 1,
//       cardDesign: currentAd ? currentAd.cardDesign : 'basic',
//       backgroundColor: currentAd ? currentAd.backgroundColor : '#ffffff',
//       textColor: currentAd ? currentAd.textColor : '#000000',
//     },
//     enableReinitialize: true,
//     validationSchema: Yup.object({
//       image: Yup.string().required('Image URL is required'),
//       title: Yup.string().required('Title is required'),
//       subtitle: Yup.string().required('Subtitle is required'),
//       description: Yup.string().required('Description is required').max(500, 'Max 500 characters'),
//       link: Yup.string().required('Link is required'),
//       category: Yup.string().required('Category is required'),
//       templateId: Yup.string().required('Template is required'),
//       startDate: Yup.date().required('Start date is required'),
//       endDate: Yup.date().required('End date is required'),
//       priority: Yup.number().min(1, 'Priority must be at least 1'),
//     }),
//     onSubmit: async (values) => {
//       try {
//         if (currentAd) {
//           await dispatch(updateAd({ id: currentAd._id, adData: values })).unwrap();
//         } else {
//           await dispatch(addAd(values)).unwrap();
//         }
//         setShowForm(false);
//         setCurrentAd(null);
//         formik.resetForm();
//         setCurrentPage(1);
//       } catch (err) {
//         console.error(currentAd ? 'Update ad error:' : 'Add ad error:', err);
//       }
//     },
//   });

//   const handleEdit = (ad) => {
//     setCurrentAd(ad);
//     setShowForm(true);
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm('Are you sure you want to delete this ad?')) {
//       try {
//         await dispatch(deleteAd(id)).unwrap();
//       } catch (err) {
//         console.error('Delete ad error:', err);
//       }
//     }
//   };

//   // Pagination
//   const indexOfLast = currentPage * adsPerPage;
//   const indexOfFirst = indexOfLast - adsPerPage;
//   const currentAds = ads.slice(indexOfFirst, indexOfLast);
//   const totalPages = Math.ceil(ads.length / adsPerPage);
//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   return (
//     <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
//       <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Ads Management</h2>
//       {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
//       <button
//         onClick={() => {
//           setShowForm(true);
//           setCurrentAd(null);
//           formik.resetForm();
//         }}
//         className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition mb-6 flex items-center"
//         aria-label="Add Ad"
//       >
//         <FaPlus className="mr-2" /> Add Ad
//       </button>
//       {loading ? (
//         <div className="text-gray-800 dark:text-gray-200">Loading...</div>
//       ) : (
//         <>
//           <div className="overflow-x-auto">
//             <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
//               <thead className="bg-gray-50 dark:bg-gray-700">
//                 <tr>
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Image</th>
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Subtitle</th>
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
//                 {currentAds.map((ad) => (
//                   <tr key={ad._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
//                       <img src={ad.image} alt={ad.title} className="w-20 h-auto rounded" />
//                     </td>
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">{ad.title}</td>
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">{ad.subtitle}</td>
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200 flex items-center">
//                       <button onClick={() => handleEdit(ad)} className="text-blue-500 hover:text-blue-700 mr-4 flex items-center" aria-label={`Edit ad ${ad.title}`}>
//                         <FaEdit className="mr-1" /> Edit
//                       </button>
//                       <button onClick={() => handleDelete(ad._id)} className="text-red-500 hover:text-red-700 flex items-center" aria-label={`Delete ad ${ad.title}`}>
//                         <FaTrash className="mr-1" /> Delete
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//                 {currentAds.length === 0 && (
//                   <tr>
//                     <td colSpan="4" className="py-4 px-6 text-center text-gray-600 dark:text-gray-400">
//                       No ads found.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//           {ads.length > adsPerPage && (
//             <div className="flex justify-center mt-6">
//               <nav aria-label="Page navigation">
//                 <ul className="inline-flex -space-x-px">
//                   <li>
//                     <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className={`px-3 py-2 ml-0 leading-tight text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-l-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${currentPage === 1 ? 'cursor-not-allowed opacity-50' : ''}`} aria-label="Previous Page">
//                       <FaChevronLeft />
//                     </button>
//                   </li>
//                   {[...Array(totalPages)].map((_, index) => (
//                     <li key={index + 1}>
//                       <button onClick={() => paginate(index + 1)} className={`px-3 py-2 leading-tight border border-gray-300 dark:border-gray-700 ${currentPage === index + 1 ? 'text-blue-600 bg-blue-50 dark:bg-gray-700 dark:text-white' : 'text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`} aria-label={`Go to page ${index + 1}`}>
//                         {index + 1}
//                       </button>
//                     </li>
//                   ))}
//                   <li>
//                     <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className={`px-3 py-2 leading-tight text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-r-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${currentPage === totalPages ? 'cursor-not-allowed opacity-50' : ''}`} aria-label="Next Page">
//                       <FaChevronRight />
//                     </button>
//                   </li>
//                 </ul>
//               </nav>
//             </div>
//           )}
//         </>
//       )}
//       <Transition
//         show={showForm}
//         enter="transition ease-out duration-300 transform"
//         enterFrom="opacity-0 scale-95"
//         enterTo="opacity-100 scale-100"
//         leave="transition ease-in duration-200 transform"
//         leaveFrom="opacity-100 scale-100"
//         leaveTo="opacity-0 scale-95"
//       >
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" aria-modal="true" role="dialog">
//           <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-4xl mx-4 overflow-y-auto max-h-[90vh]">
//             <h3 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
//               {currentAd ? 'Edit Ad' : 'Add New Ad'}
//             </h3>
//             <form onSubmit={formik.handleSubmit}>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">Image URL</label>
//                     <input type="text" name="image" className="w-full px-3 py-2 border rounded focus:outline-none" value={formik.values.image} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="https://example.com/ad.png" />
//                     {formik.touched.image && formik.errors.image && <div className="text-red-500 text-sm mt-1">{formik.errors.image}</div>}
//                   </div>
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">Title</label>
//                     <input type="text" name="title" className="w-full px-3 py-2 border rounded focus:outline-none" value={formik.values.title} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="Ad Title" />
//                     {formik.touched.title && formik.errors.title && <div className="text-red-500 text-sm mt-1">{formik.errors.title}</div>}
//                   </div>
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">Subtitle</label>
//                     <input type="text" name="subtitle" className="w-full px-3 py-2 border rounded focus:outline-none" value={formik.values.subtitle} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="Ad Subtitle" />
//                     {formik.touched.subtitle && formik.errors.subtitle && <div className="text-red-500 text-sm mt-1">{formik.errors.subtitle}</div>}
//                   </div>
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">Description</label>
//                     <textarea name="description" className="w-full px-3 py-2 border rounded focus:outline-none" value={formik.values.description} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="Enter ad description (max 500 characters)" rows="4" />
//                     {formik.touched.description && formik.errors.description && <div className="text-red-500 text-sm mt-1">{formik.errors.description}</div>}
//                   </div>
//                 </div>
//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">Link</label>
//                     <input type="text" name="link" className="w-full px-3 py-2 border rounded focus:outline-none" value={formik.values.link} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="https://example.com" />
//                     {formik.touched.link && formik.errors.link && <div className="text-red-500 text-sm mt-1">{formik.errors.link}</div>}
//                   </div>
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">Category</label>
//                     <select name="category" value={formik.values.category} onChange={formik.handleChange} className="w-full px-3 py-2 border rounded focus:outline-none">
//                       <option value="New Course">New Course</option>
//                       <option value="Product">Product</option>
//                       <option value="Sale">Sale</option>
//                       <option value="Promotion">Promotion</option>
//                       <option value="Event">Event</option>
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">Template</label>
//                     <select name="templateId" value={formik.values.templateId} onChange={formik.handleChange} className="w-full px-3 py-2 border rounded focus:outline-none">
//                       <option value="promo">Promotion</option>
//                       <option value="newCourse">New Course</option>
//                       <option value="sale">Sale</option>
//                       <option value="event">Event</option>
//                     </select>
//                     {formik.touched.templateId && formik.errors.templateId && <div className="text-red-500 text-sm mt-1">{formik.errors.templateId}</div>}
//                   </div>
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">Price (if applicable)</label>
//                     <input type="number" name="price" className="w-full px-3 py-2 border rounded focus:outline-none" value={formik.values.price} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="e.g. 19.99" />
//                   </div>
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">Start Date</label>
//                     <input type="date" name="startDate" className="w-full px-3 py-2 border rounded focus:outline-none" value={formik.values.startDate} onChange={formik.handleChange} onBlur={formik.handleBlur} />
//                     {formik.touched.startDate && formik.errors.startDate && <div className="text-red-500 text-sm mt-1">{formik.errors.startDate}</div>}
//                   </div>
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">End Date</label>
//                     <input type="date" name="endDate" className="w-full px-3 py-2 border rounded focus:outline-none" value={formik.values.endDate} onChange={formik.handleChange} onBlur={formik.handleBlur} />
//                     {formik.touched.endDate && formik.errors.endDate && <div className="text-red-500 text-sm mt-1">{formik.errors.endDate}</div>}
//                   </div>
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">Target Audience</label>
//                     <select name="targetAudience" value={formik.values.targetAudience} onChange={formik.handleChange} className="w-full px-3 py-2 border rounded focus:outline-none">
//                       <option value="Beginner">Beginner</option>
//                       <option value="Intermediate">Intermediate</option>
//                       <option value="Advanced">Advanced</option>
//                       <option value="General">General</option>
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">CTA Text</label>
//                     <input type="text" name="ctaText" className="w-full px-3 py-2 border rounded focus:outline-none" value={formik.values.ctaText} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="Learn More" />
//                   </div>
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">Priority</label>
//                     <input type="number" name="priority" className="w-full px-3 py-2 border rounded focus:outline-none" value={formik.values.priority} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="Priority (lower numbers display first)" />
//                   </div>
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">Card Design</label>
//                     <select name="cardDesign" value={formik.values.cardDesign} onChange={formik.handleChange} className="w-full px-3 py-2 border rounded focus:outline-none">
//                       <option value="basic">Basic</option>
//                       <option value="modern">Modern</option>
//                       <option value="minimal">Minimal</option>
//                       <option value="detailed">Detailed</option>
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">Background Color</label>
//                     <input type="color" name="backgroundColor" value={formik.values.backgroundColor} onChange={formik.handleChange} onBlur={formik.handleBlur} className="w-full px-3 py-2 border rounded" />
//                   </div>
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">Text Color</label>
//                     <input type="color" name="textColor" value={formik.values.textColor} onChange={formik.handleChange} onBlur={formik.handleBlur} className="w-full px-3 py-2 border rounded" />
//                   </div>
//                 </div>
//               </div>
//               <div className="flex justify-end mt-6">
//                 <button type="button" onClick={() => { setShowForm(false); setCurrentAd(null); formik.resetForm(); }} className="bg-gray-500 text-white px-4 py-2 rounded mr-2 hover:bg-gray-600 transition">Cancel</button>
//                 <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
//                   {currentAd ? 'Update' : 'Add'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </Transition>
//     </div>
//   );
// };

// export default Ads;









// import React, { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useFormik } from 'formik';
// import * as Yup from 'yup';
// import {
//   FaPlus,
//   FaEdit,
//   FaTrash,
//   FaChevronLeft,
//   FaChevronRight,
// } from 'react-icons/fa';
// import { Transition } from '@headlessui/react';
// import { fetchAds, addAd, updateAd, deleteAd } from '../redux/slices/adsSlice';

// const Ads = () => {
//   const dispatch = useDispatch();
//   const { ads, loading, error } = useSelector((state) => state.ads);

//   const [showForm, setShowForm] = useState(false);
//   const [currentAd, setCurrentAd] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const adsPerPage = 5;

//   useEffect(() => {
//     dispatch(fetchAds());
//   }, [dispatch]);

//   const formik = useFormik({
//     initialValues: {
//       image: currentAd ? currentAd.image : '',
//       title: currentAd ? currentAd.title : '',
//       subtitle: currentAd ? currentAd.subtitle : '',
//       description: currentAd ? currentAd.description : '',
//       link: currentAd ? currentAd.link : '',
//       category: currentAd ? currentAd.category : 'New Course',
//       price: currentAd ? currentAd.price : '',
//       startDate: currentAd ? currentAd.startDate.substring(0, 10) : '',
//       endDate: currentAd ? currentAd.endDate.substring(0, 10) : '',
//       targetAudience: currentAd ? currentAd.targetAudience : 'General',
//       ctaText: currentAd ? currentAd.ctaText : 'Learn More',
//       priority: currentAd ? currentAd.priority : 1,
//       cardDesign: currentAd ? currentAd.cardDesign : 'basic',
//       backgroundColor: currentAd ? currentAd.backgroundColor : '#ffffff',
//       textColor: currentAd ? currentAd.textColor : '#000000',
//       styleConfig: {
//         cardHeight:
//           currentAd && currentAd.styleConfig
//             ? currentAd.styleConfig.cardHeight
//             : '',
//         cardWidth:
//           currentAd && currentAd.styleConfig
//             ? currentAd.styleConfig.cardWidth
//             : '',
//         gradientColors:
//           currentAd && currentAd.styleConfig && currentAd.styleConfig.gradientColors
//             ? currentAd.styleConfig.gradientColors.join(',')
//             : '#000000,#ffffff',
//         badgeColor:
//           currentAd && currentAd.styleConfig
//             ? currentAd.styleConfig.badgeColor
//             : '#3498db',
//         layoutType:
//           currentAd && currentAd.styleConfig
//             ? currentAd.styleConfig.layoutType
//             : 'carousel',
//       },
//     },
//     enableReinitialize: true,
//     validationSchema: Yup.object({
//       image: Yup.string().required('Image URL is required'),
//       title: Yup.string().required('Title is required'),
//       subtitle: Yup.string().required('Subtitle is required'),
//       description: Yup.string()
//         .required('Description is required')
//         .max(500, 'Description cannot exceed 500 characters'),
//       link: Yup.string().required('Link is required'),
//       category: Yup.string().required('Category is required'),
//       startDate: Yup.date().required('Start date is required'),
//       endDate: Yup.date().required('End date is required'),
//       priority: Yup.number().min(1, 'Priority must be at least 1'),
//       styleConfig: Yup.object({
//         cardHeight: Yup.number().required('Card height is required'),
//         cardWidth: Yup.number().required('Card width is required'),
//         gradientColors: Yup.string().required('Gradient colors are required'),
//         badgeColor: Yup.string().required('Badge color is required'),
//         layoutType: Yup.string()
//           .oneOf(['carousel', 'marquee'])
//           .required('Layout type is required'),
//       }),
//     }),
//     onSubmit: async (values) => {
//       // Transform gradientColors from comma-separated string to array
//       const updatedValues = {
//         ...values,
//         styleConfig: {
//           ...values.styleConfig,
//           gradientColors: values.styleConfig.gradientColors
//             .split(',')
//             .map((color) => color.trim()),
//         },
//       };

//       try {
//         if (currentAd) {
//           await dispatch(updateAd({ id: currentAd._id, adData: updatedValues })).unwrap();
//         } else {
//           await dispatch(addAd(updatedValues)).unwrap();
//         }
//         setShowForm(false);
//         setCurrentAd(null);
//         formik.resetForm();
//         setCurrentPage(1);
//       } catch (err) {
//         console.error(currentAd ? 'Update ad error:' : 'Add ad error:', err);
//       }
//     },
//   });

//   const handleEdit = (ad) => {
//     setCurrentAd(ad);
//     setShowForm(true);
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm('Are you sure you want to delete this ad?')) {
//       try {
//         await dispatch(deleteAd(id)).unwrap();
//       } catch (err) {
//         console.error('Delete ad error:', err);
//       }
//     }
//   };

//   // Pagination
//   const indexOfLast = currentPage * adsPerPage;
//   const indexOfFirst = indexOfLast - adsPerPage;
//   const currentAds = ads.slice(indexOfFirst, indexOfLast);
//   const totalPages = Math.ceil(ads.length / adsPerPage);
//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   return (
//     <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
//       <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
//         Ads Management
//       </h2>

//       {error && (
//         <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
//       )}

//       <button
//         onClick={() => {
//           setShowForm(true);
//           setCurrentAd(null);
//           formik.resetForm();
//         }}
//         className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition mb-6 flex items-center"
//         aria-label="Add Ad"
//       >
//         <FaPlus className="mr-2" />
//         Add Ad
//       </button>

//       {loading ? (
//         <div className="text-gray-800 dark:text-gray-200">Loading...</div>
//       ) : (
//         <>
//           <div className="overflow-x-auto">
//             <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
//               <thead className="bg-gray-50 dark:bg-gray-700">
//                 <tr>
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Image
//                   </th>
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Title
//                   </th>
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Subtitle
//                   </th>
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
//                 {currentAds.map((ad) => (
//                   <tr
//                     key={ad._id}
//                     className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
//                   >
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
//                       <img
//                         src={ad.image}
//                         alt={ad.title}
//                         className="w-20 h-auto rounded"
//                       />
//                     </td>
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
//                       {ad.title}
//                     </td>
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
//                       {ad.subtitle}
//                     </td>
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200 flex items-center">
//                       <button
//                         onClick={() => handleEdit(ad)}
//                         className="text-blue-500 hover:text-blue-700 mr-4 flex items-center"
//                         aria-label={`Edit ad ${ad.title}`}
//                       >
//                         <FaEdit className="mr-1" />
//                         Edit
//                       </button>
//                       <button
//                         onClick={() => handleDelete(ad._id)}
//                         className="text-red-500 hover:text-red-700 flex items-center"
//                         aria-label={`Delete ad ${ad.title}`}
//                       >
//                         <FaTrash className="mr-1" />
//                         Delete
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//                 {currentAds.length === 0 && (
//                   <tr>
//                     <td
//                       colSpan="4"
//                       className="py-4 px-6 text-center text-gray-600 dark:text-gray-400"
//                     >
//                       No ads found.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//           {ads.length > adsPerPage && (
//             <div className="flex justify-center mt-6">
//               <nav aria-label="Page navigation">
//                 <ul className="inline-flex -space-x-px">
//                   <li>
//                     <button
//                       onClick={() => paginate(currentPage - 1)}
//                       disabled={currentPage === 1}
//                       className={`px-3 py-2 ml-0 leading-tight text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-l-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
//                         currentPage === 1 ? 'cursor-not-allowed opacity-50' : ''
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
//                         className={`px-3 py-2 leading-tight border border-gray-300 dark:border-gray-700 ${
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
//                       className={`px-3 py-2 leading-tight text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-r-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
//                         currentPage === totalPages ? 'cursor-not-allowed opacity-50' : ''
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

//       <Transition
//         show={showForm}
//         enter="transition ease-out duration-300 transform"
//         enterFrom="opacity-0 scale-95"
//         enterTo="opacity-100 scale-100"
//         leave="transition ease-in duration-200 transform"
//         leaveFrom="opacity-100 scale-100"
//         leaveTo="opacity-0 scale-95"
//       >
//         <div
//           className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
//           aria-modal="true"
//           role="dialog"
//         >
//           <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-4xl mx-4 overflow-y-auto max-h-[90vh]">
//             <h3 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
//               {currentAd ? 'Edit Ad' : 'Add New Ad'}
//             </h3>
//             <form onSubmit={formik.handleSubmit}>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {/* Left Column: Basic Details */}
//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">
//                       Image URL
//                     </label>
//                     <input
//                       type="text"
//                       name="image"
//                       className="w-full px-3 py-2 border rounded focus:outline-none"
//                       value={formik.values.image}
//                       onChange={formik.handleChange}
//                       onBlur={formik.handleBlur}
//                       placeholder="https://example.com/ad.png"
//                     />
//                     {formik.touched.image && formik.errors.image && (
//                       <div className="text-red-500 text-sm mt-1">
//                         {formik.errors.image}
//                       </div>
//                     )}
//                   </div>
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">
//                       Title
//                     </label>
//                     <input
//                       type="text"
//                       name="title"
//                       className="w-full px-3 py-2 border rounded focus:outline-none"
//                       value={formik.values.title}
//                       onChange={formik.handleChange}
//                       onBlur={formik.handleBlur}
//                       placeholder="Ad Title"
//                     />
//                     {formik.touched.title && formik.errors.title && (
//                       <div className="text-red-500 text-sm mt-1">
//                         {formik.errors.title}
//                       </div>
//                     )}
//                   </div>
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">
//                       Subtitle
//                     </label>
//                     <input
//                       type="text"
//                       name="subtitle"
//                       className="w-full px-3 py-2 border rounded focus:outline-none"
//                       value={formik.values.subtitle}
//                       onChange={formik.handleChange}
//                       onBlur={formik.handleBlur}
//                       placeholder="Ad Subtitle"
//                     />
//                     {formik.touched.subtitle && formik.errors.subtitle && (
//                       <div className="text-red-500 text-sm mt-1">
//                         {formik.errors.subtitle}
//                       </div>
//                     )}
//                   </div>
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">
//                       Description
//                     </label>
//                     <textarea
//                       name="description"
//                       className="w-full px-3 py-2 border rounded focus:outline-none"
//                       value={formik.values.description}
//                       onChange={formik.handleChange}
//                       onBlur={formik.handleBlur}
//                       placeholder="Enter ad description (max 500 characters)"
//                       rows="4"
//                     />
//                     {formik.touched.description && formik.errors.description && (
//                       <div className="text-red-500 text-sm mt-1">
//                         {formik.errors.description}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//                 {/* Right Column: Advanced Settings */}
//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">
//                       Link
//                     </label>
//                     <input
//                       type="text"
//                       name="link"
//                       className="w-full px-3 py-2 border rounded focus:outline-none"
//                       value={formik.values.link}
//                       onChange={formik.handleChange}
//                       onBlur={formik.handleBlur}
//                       placeholder="https://example.com"
//                     />
//                     {formik.touched.link && formik.errors.link && (
//                       <div className="text-red-500 text-sm mt-1">
//                         {formik.errors.link}
//                       </div>
//                     )}
//                   </div>
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">
//                       Category
//                     </label>
//                     <select
//                       name="category"
//                       value={formik.values.category}
//                       onChange={formik.handleChange}
//                       className="w-full px-3 py-2 border rounded focus:outline-none"
//                     >
//                       <option value="New Course">New Course</option>
//                       <option value="Product">Product</option>
//                       <option value="Sale">Sale</option>
//                       <option value="Promotion">Promotion</option>
//                       <option value="Event">Event</option>
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">
//                       Price (if applicable)
//                     </label>
//                     <input
//                       type="number"
//                       name="price"
//                       className="w-full px-3 py-2 border rounded focus:outline-none"
//                       value={formik.values.price}
//                       onChange={formik.handleChange}
//                       onBlur={formik.handleBlur}
//                       placeholder="e.g. 19.99"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">
//                       Start Date
//                     </label>
//                     <input
//                       type="date"
//                       name="startDate"
//                       className="w-full px-3 py-2 border rounded focus:outline-none"
//                       value={formik.values.startDate}
//                       onChange={formik.handleChange}
//                       onBlur={formik.handleBlur}
//                     />
//                     {formik.touched.startDate && formik.errors.startDate && (
//                       <div className="text-red-500 text-sm mt-1">
//                         {formik.errors.startDate}
//                       </div>
//                     )}
//                   </div>
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">
//                       End Date
//                     </label>
//                     <input
//                       type="date"
//                       name="endDate"
//                       className="w-full px-3 py-2 border rounded focus:outline-none"
//                       value={formik.values.endDate}
//                       onChange={formik.handleChange}
//                       onBlur={formik.handleBlur}
//                     />
//                     {formik.touched.endDate && formik.errors.endDate && (
//                       <div className="text-red-500 text-sm mt-1">
//                         {formik.errors.endDate}
//                       </div>
//                     )}
//                   </div>
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">
//                       Target Audience
//                     </label>
//                     <select
//                       name="targetAudience"
//                       value={formik.values.targetAudience}
//                       onChange={formik.handleChange}
//                       className="w-full px-3 py-2 border rounded focus:outline-none"
//                     >
//                       <option value="Beginner">Beginner</option>
//                       <option value="Intermediate">Intermediate</option>
//                       <option value="Advanced">Advanced</option>
//                       <option value="General">General</option>
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">
//                       CTA Text
//                     </label>
//                     <input
//                       type="text"
//                       name="ctaText"
//                       className="w-full px-3 py-2 border rounded focus:outline-none"
//                       value={formik.values.ctaText}
//                       onChange={formik.handleChange}
//                       onBlur={formik.handleBlur}
//                       placeholder="Learn More"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">
//                       Priority
//                     </label>
//                     <input
//                       type="number"
//                       name="priority"
//                       className="w-full px-3 py-2 border rounded focus:outline-none"
//                       value={formik.values.priority}
//                       onChange={formik.handleChange}
//                       onBlur={formik.handleBlur}
//                       placeholder="Priority (lower numbers display first)"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">
//                       Card Design
//                     </label>
//                     <select
//                       name="cardDesign"
//                       value={formik.values.cardDesign}
//                       onChange={formik.handleChange}
//                       className="w-full px-3 py-2 border rounded focus:outline-none"
//                     >
//                       <option value="basic">Basic</option>
//                       <option value="modern">Modern</option>
//                       <option value="minimal">Minimal</option>
//                       <option value="detailed">Detailed</option>
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">
//                       Background Color
//                     </label>
//                     <input
//                       type="color"
//                       name="backgroundColor"
//                       value={formik.values.backgroundColor}
//                       onChange={formik.handleChange}
//                       onBlur={formik.handleBlur}
//                       className="w-full px-3 py-2 border rounded"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">
//                       Text Color
//                     </label>
//                     <input
//                       type="color"
//                       name="textColor"
//                       value={formik.values.textColor}
//                       onChange={formik.handleChange}
//                       onBlur={formik.handleBlur}
//                       className="w-full px-3 py-2 border rounded"
//                     />
//                   </div>
//                 </div>
//                 {/* Full-Width Style Config Section */}
//                 <div className="col-span-1 md:col-span-2 border-t border-gray-300 dark:border-gray-700 pt-4">
//                   <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
//                     Style Configuration
//                   </h4>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-gray-700 dark:text-gray-200">
//                         Card Height (px)
//                       </label>
//                       <input
//                         type="number"
//                         name="styleConfig.cardHeight"
//                         value={formik.values.styleConfig.cardHeight}
//                         onChange={formik.handleChange}
//                         onBlur={formik.handleBlur}
//                         className="w-full px-3 py-2 border rounded focus:outline-none"
//                       />
//                       {formik.touched.styleConfig?.cardHeight &&
//                         formik.errors.styleConfig?.cardHeight && (
//                           <div className="text-red-500 text-sm mt-1">
//                             {formik.errors.styleConfig.cardHeight}
//                           </div>
//                         )}
//                     </div>
//                     <div>
//                       <label className="block text-gray-700 dark:text-gray-200">
//                         Card Width (px)
//                       </label>
//                       <input
//                         type="number"
//                         name="styleConfig.cardWidth"
//                         value={formik.values.styleConfig.cardWidth}
//                         onChange={formik.handleChange}
//                         onBlur={formik.handleBlur}
//                         className="w-full px-3 py-2 border rounded focus:outline-none"
//                       />
//                       {formik.touched.styleConfig?.cardWidth &&
//                         formik.errors.styleConfig?.cardWidth && (
//                           <div className="text-red-500 text-sm mt-1">
//                             {formik.errors.styleConfig.cardWidth}
//                           </div>
//                         )}
//                     </div>
//                     <div>
//                       <label className="block text-gray-700 dark:text-gray-200">
//                         Gradient Colors (comma separated)
//                       </label>
//                       <input
//                         type="text"
//                         name="styleConfig.gradientColors"
//                         value={formik.values.styleConfig.gradientColors}
//                         onChange={formik.handleChange}
//                         onBlur={formik.handleBlur}
//                         placeholder="#000000,#ffffff"
//                         className="w-full px-3 py-2 border rounded focus:outline-none"
//                       />
//                       {formik.touched.styleConfig?.gradientColors &&
//                         formik.errors.styleConfig?.gradientColors && (
//                           <div className="text-red-500 text-sm mt-1">
//                             {formik.errors.styleConfig.gradientColors}
//                           </div>
//                         )}
//                     </div>
//                     <div>
//                       <label className="block text-gray-700 dark:text-gray-200">
//                         Badge Color
//                       </label>
//                       <input
//                         type="color"
//                         name="styleConfig.badgeColor"
//                         value={formik.values.styleConfig.badgeColor}
//                         onChange={formik.handleChange}
//                         onBlur={formik.handleBlur}
//                         className="w-full px-3 py-2 border rounded"
//                       />
//                       {formik.touched.styleConfig?.badgeColor &&
//                         formik.errors.styleConfig?.badgeColor && (
//                           <div className="text-red-500 text-sm mt-1">
//                             {formik.errors.styleConfig.badgeColor}
//                           </div>
//                         )}
//                     </div>
//                     <div>
//                       <label className="block text-gray-700 dark:text-gray-200">
//                         Layout Type
//                       </label>
//                       <select
//                         name="styleConfig.layoutType"
//                         value={formik.values.styleConfig.layoutType}
//                         onChange={formik.handleChange}
//                         className="w-full px-3 py-2 border rounded focus:outline-none"
//                       >
//                         <option value="carousel">Carousel</option>
//                         <option value="marquee">Marquee</option>
//                       </select>
//                       {formik.touched.styleConfig?.layoutType &&
//                         formik.errors.styleConfig?.layoutType && (
//                           <div className="text-red-500 text-sm mt-1">
//                             {formik.errors.styleConfig.layoutType}
//                           </div>
//                         )}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//               <div className="flex justify-end mt-6">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowForm(false);
//                     setCurrentAd(null);
//                     formik.resetForm();
//                   }}
//                   className="bg-gray-500 text-white px-4 py-2 rounded mr-2 hover:bg-gray-600 transition"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
//                 >
//                   {currentAd ? 'Update' : 'Add'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </Transition>
//     </div>
//   );
// };

// export default Ads;







// import React, { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useFormik } from 'formik';
// import * as Yup from 'yup';
// import {
//   FaPlus,
//   FaEdit,
//   FaTrash,
//   FaChevronLeft,
//   FaChevronRight,
// } from 'react-icons/fa';
// import { Transition } from '@headlessui/react';
// import { fetchAds, addAd, updateAd, deleteAd } from '../redux/slices/adsSlice';

// const Ads = () => {
//   const dispatch = useDispatch();
//   const { ads, loading, error } = useSelector((state) => state.ads);

//   const [showForm, setShowForm] = useState(false);
//   const [currentAd, setCurrentAd] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const adsPerPage = 5;

//   useEffect(() => {
//     dispatch(fetchAds());
//   }, [dispatch]);

//   const formik = useFormik({
//     initialValues: {
//       image: currentAd ? currentAd.image : '',
//       title: currentAd ? currentAd.title : '',
//       subtitle: currentAd ? currentAd.subtitle : '',
//       description: currentAd ? currentAd.description : '',
//       link: currentAd ? currentAd.link : '',
//       category: currentAd ? currentAd.category : 'New Course',
//       price: currentAd ? currentAd.price : '',
//       startDate: currentAd ? currentAd.startDate.substring(0, 10) : '',
//       endDate: currentAd ? currentAd.endDate.substring(0, 10) : '',
//       targetAudience: currentAd ? currentAd.targetAudience : 'General',
//       ctaText: currentAd ? currentAd.ctaText : 'Learn More',
//       priority: currentAd ? currentAd.priority : 1,
//       cardDesign: currentAd ? currentAd.cardDesign : 'basic',
//       backgroundColor: currentAd ? currentAd.backgroundColor : '#ffffff',
//       textColor: currentAd ? currentAd.textColor : '#000000',
//     },
//     enableReinitialize: true,
//     validationSchema: Yup.object({
//       image: Yup.string().required('Image URL is required'),
//       title: Yup.string().required('Title is required'),
//       subtitle: Yup.string().required('Subtitle is required'),
//       description: Yup.string()
//         .required('Description is required')
//         .max(500, 'Description cannot exceed 500 characters'),
//       link: Yup.string().required('Link is required'),
//       category: Yup.string().required('Category is required'),
//       startDate: Yup.date().required('Start date is required'),
//       endDate: Yup.date().required('End date is required'),
//       priority: Yup.number().min(1, 'Priority must be at least 1'),
//     }),
//     onSubmit: async (values) => {
//       if (currentAd) {
//         try {
//           await dispatch(updateAd({ id: currentAd._id, adData: values })).unwrap();
//           setShowForm(false);
//           setCurrentAd(null);
//           formik.resetForm();
//           setCurrentPage(1);
//         } catch (err) {
//           console.error('Update ad error:', err);
//         }
//       } else {
//         try {
//           await dispatch(addAd(values)).unwrap();
//           setShowForm(false);
//           formik.resetForm();
//           setCurrentPage(1);
//         } catch (err) {
//           console.error('Add ad error:', err);
//         }
//       }
//     },
//   });

//   const handleEdit = (ad) => {
//     setCurrentAd(ad);
//     setShowForm(true);
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm('Are you sure you want to delete this ad?')) {
//       try {
//         await dispatch(deleteAd(id)).unwrap();
//       } catch (err) {
//         console.error('Delete ad error:', err);
//       }
//     }
//   };

//   // Pagination
//   const indexOfLast = currentPage * adsPerPage;
//   const indexOfFirst = indexOfLast - adsPerPage;
//   const currentAds = ads.slice(indexOfFirst, indexOfLast);
//   const totalPages = Math.ceil(ads.length / adsPerPage);
//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   return (
//     <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
//       <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
//         Ads Management
//       </h2>

//       {error && (
//         <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
//       )}

//       <button
//         onClick={() => {
//           setShowForm(true);
//           setCurrentAd(null);
//           formik.resetForm();
//         }}
//         className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition mb-6 flex items-center"
//         aria-label="Add Ad"
//       >
//         <FaPlus className="mr-2" />
//         Add Ad
//       </button>

//       {loading ? (
//         <div className="text-gray-800 dark:text-gray-200">Loading...</div>
//       ) : (
//         <>
//           <div className="overflow-x-auto">
//             <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
//               <thead className="bg-gray-50 dark:bg-gray-700">
//                 <tr>
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Image
//                   </th>
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Title
//                   </th>
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Subtitle
//                   </th>
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
//                 {currentAds.map((ad) => (
//                   <tr
//                     key={ad._id}
//                     className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
//                   >
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
//                       <img src={ad.image} alt={ad.title} className="w-20 h-auto rounded" />
//                     </td>
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
//                       {ad.title}
//                     </td>
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
//                       {ad.subtitle}
//                     </td>
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200 flex items-center">
//                       <button
//                         onClick={() => handleEdit(ad)}
//                         className="text-blue-500 hover:text-blue-700 mr-4 flex items-center"
//                         aria-label={`Edit ad ${ad.title}`}
//                       >
//                         <FaEdit className="mr-1" />
//                         Edit
//                       </button>
//                       <button
//                         onClick={() => handleDelete(ad._id)}
//                         className="text-red-500 hover:text-red-700 flex items-center"
//                         aria-label={`Delete ad ${ad.title}`}
//                       >
//                         <FaTrash className="mr-1" />
//                         Delete
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//                 {currentAds.length === 0 && (
//                   <tr>
//                     <td
//                       colSpan="4"
//                       className="py-4 px-6 text-center text-gray-600 dark:text-gray-400"
//                     >
//                       No ads found.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//           {ads.length > adsPerPage && (
//             <div className="flex justify-center mt-6">
//               <nav aria-label="Page navigation">
//                 <ul className="inline-flex -space-x-px">
//                   <li>
//                     <button
//                       onClick={() => paginate(currentPage - 1)}
//                       disabled={currentPage === 1}
//                       className={`px-3 py-2 ml-0 leading-tight text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-l-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
//                         currentPage === 1 ? 'cursor-not-allowed opacity-50' : ''
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
//                         className={`px-3 py-2 leading-tight border border-gray-300 dark:border-gray-700 ${
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
//                       className={`px-3 py-2 leading-tight text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-r-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
//                         currentPage === totalPages ? 'cursor-not-allowed opacity-50' : ''
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

//       <Transition
//         show={showForm}
//         enter="transition ease-out duration-300 transform"
//         enterFrom="opacity-0 scale-95"
//         enterTo="opacity-100 scale-100"
//         leave="transition ease-in duration-200 transform"
//         leaveFrom="opacity-100 scale-100"
//         leaveTo="opacity-0 scale-95"
//       >
//         <div
//           className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
//           aria-modal="true"
//           role="dialog"
//         >
//           {/* Modal container with max height and vertical scrolling */}
//           <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-4xl mx-4 overflow-y-auto max-h-[90vh]">
//             <h3 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
//               {currentAd ? 'Edit Ad' : 'Add New Ad'}
//             </h3>
//             <form onSubmit={formik.handleSubmit}>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {/* Left Column: Basic Details */}
//                 <div className="space-y-4">
//                   {/* Image URL */}
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">
//                       Image URL
//                     </label>
//                     <input
//                       type="text"
//                       name="image"
//                       className="w-full px-3 py-2 border rounded focus:outline-none focus:ring border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500"
//                       value={formik.values.image}
//                       onChange={formik.handleChange}
//                       onBlur={formik.handleBlur}
//                       placeholder="https://example.com/ad.png"
//                     />
//                     {formik.touched.image && formik.errors.image && (
//                       <div className="text-red-500 text-sm mt-1">
//                         {formik.errors.image}
//                       </div>
//                     )}
//                   </div>
//                   {/* Title */}
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">
//                       Title
//                     </label>
//                     <input
//                       type="text"
//                       name="title"
//                       className="w-full px-3 py-2 border rounded focus:outline-none focus:ring border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500"
//                       value={formik.values.title}
//                       onChange={formik.handleChange}
//                       onBlur={formik.handleBlur}
//                       placeholder="Ad Title"
//                     />
//                     {formik.touched.title && formik.errors.title && (
//                       <div className="text-red-500 text-sm mt-1">
//                         {formik.errors.title}
//                       </div>
//                     )}
//                   </div>
//                   {/* Subtitle */}
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">
//                       Subtitle
//                     </label>
//                     <input
//                       type="text"
//                       name="subtitle"
//                       className="w-full px-3 py-2 border rounded focus:outline-none focus:ring border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500"
//                       value={formik.values.subtitle}
//                       onChange={formik.handleChange}
//                       onBlur={formik.handleBlur}
//                       placeholder="Ad Subtitle"
//                     />
//                     {formik.touched.subtitle && formik.errors.subtitle && (
//                       <div className="text-red-500 text-sm mt-1">
//                         {formik.errors.subtitle}
//                       </div>
//                     )}
//                   </div>
//                   {/* Description */}
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">
//                       Description
//                     </label>
//                     <textarea
//                       name="description"
//                       className="w-full px-3 py-2 border rounded focus:outline-none focus:ring border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500"
//                       value={formik.values.description}
//                       onChange={formik.handleChange}
//                       onBlur={formik.handleBlur}
//                       placeholder="Enter ad description (max 500 characters)"
//                       rows="4"
//                     />
//                     {formik.touched.description && formik.errors.description && (
//                       <div className="text-red-500 text-sm mt-1">
//                         {formik.errors.description}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//                 {/* Right Column: Advanced Settings */}
//                 <div className="space-y-4">
//                   {/* Link */}
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">
//                       Link
//                     </label>
//                     <input
//                       type="text"
//                       name="link"
//                       className="w-full px-3 py-2 border rounded focus:outline-none focus:ring border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500"
//                       value={formik.values.link}
//                       onChange={formik.handleChange}
//                       onBlur={formik.handleBlur}
//                       placeholder="https://example.com"
//                     />
//                     {formik.touched.link && formik.errors.link && (
//                       <div className="text-red-500 text-sm mt-1">
//                         {formik.errors.link}
//                       </div>
//                     )}
//                   </div>
//                   {/* Category */}
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">
//                       Category
//                     </label>
//                     <select
//                       name="category"
//                       value={formik.values.category}
//                       onChange={formik.handleChange}
//                       className="w-full px-3 py-2 border rounded focus:outline-none"
//                     >
//                       <option value="New Course">New Course</option>
//                       <option value="Product">Product</option>
//                       <option value="Sale">Sale</option>
//                       <option value="Promotion">Promotion</option>
//                       <option value="Event">Event</option>
//                     </select>
//                   </div>
//                   {/* Price */}
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">
//                       Price (if applicable)
//                     </label>
//                     <input
//                       type="number"
//                       name="price"
//                       className="w-full px-3 py-2 border rounded focus:outline-none focus:ring border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500"
//                       value={formik.values.price}
//                       onChange={formik.handleChange}
//                       onBlur={formik.handleBlur}
//                       placeholder="e.g. 19.99"
//                     />
//                   </div>
//                   {/* Start Date */}
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">
//                       Start Date
//                     </label>
//                     <input
//                       type="date"
//                       name="startDate"
//                       className="w-full px-3 py-2 border rounded focus:outline-none focus:ring border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500"
//                       value={formik.values.startDate}
//                       onChange={formik.handleChange}
//                       onBlur={formik.handleBlur}
//                     />
//                     {formik.touched.startDate && formik.errors.startDate && (
//                       <div className="text-red-500 text-sm mt-1">
//                         {formik.errors.startDate}
//                       </div>
//                     )}
//                   </div>
//                   {/* End Date */}
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">
//                       End Date
//                     </label>
//                     <input
//                       type="date"
//                       name="endDate"
//                       className="w-full px-3 py-2 border rounded focus:outline-none focus:ring border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500"
//                       value={formik.values.endDate}
//                       onChange={formik.handleChange}
//                       onBlur={formik.handleBlur}
//                     />
//                     {formik.touched.endDate && formik.errors.endDate && (
//                       <div className="text-red-500 text-sm mt-1">
//                         {formik.errors.endDate}
//                       </div>
//                     )}
//                   </div>
//                   {/* Target Audience */}
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">
//                       Target Audience
//                     </label>
//                     <select
//                       name="targetAudience"
//                       value={formik.values.targetAudience}
//                       onChange={formik.handleChange}
//                       className="w-full px-3 py-2 border rounded focus:outline-none"
//                     >
//                       <option value="Beginner">Beginner</option>
//                       <option value="Intermediate">Intermediate</option>
//                       <option value="Advanced">Advanced</option>
//                       <option value="General">General</option>
//                     </select>
//                   </div>
//                   {/* CTA Text */}
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">
//                       CTA Text
//                     </label>
//                     <input
//                       type="text"
//                       name="ctaText"
//                       className="w-full px-3 py-2 border rounded focus:outline-none focus:ring border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500"
//                       value={formik.values.ctaText}
//                       onChange={formik.handleChange}
//                       onBlur={formik.handleBlur}
//                       placeholder="Learn More"
//                     />
//                   </div>
//                   {/* Priority */}
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">
//                       Priority
//                     </label>
//                     <input
//                       type="number"
//                       name="priority"
//                       className="w-full px-3 py-2 border rounded focus:outline-none focus:ring border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500"
//                       value={formik.values.priority}
//                       onChange={formik.handleChange}
//                       onBlur={formik.handleBlur}
//                       placeholder="Priority (lower numbers display first)"
//                     />
//                   </div>
//                   {/* Card Design */}
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">
//                       Card Design
//                     </label>
//                     <select
//                       name="cardDesign"
//                       value={formik.values.cardDesign}
//                       onChange={formik.handleChange}
//                       className="w-full px-3 py-2 border rounded focus:outline-none"
//                     >
//                       <option value="basic">Basic</option>
//                       <option value="modern">Modern</option>
//                       <option value="minimal">Minimal</option>
//                       <option value="detailed">Detailed</option>
//                     </select>
//                   </div>
//                   {/* Background Color */}
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">
//                       Background Color
//                     </label>
//                     <input
//                       type="color"
//                       name="backgroundColor"
//                       value={formik.values.backgroundColor}
//                       onChange={formik.handleChange}
//                       onBlur={formik.handleBlur}
//                       className="w-full px-3 py-2 border rounded"
//                     />
//                   </div>
//                   {/* Text Color */}
//                   <div>
//                     <label className="block text-gray-700 dark:text-gray-200">
//                       Text Color
//                     </label>
//                     <input
//                       type="color"
//                       name="textColor"
//                       value={formik.values.textColor}
//                       onChange={formik.handleChange}
//                       onBlur={formik.handleBlur}
//                       className="w-full px-3 py-2 border rounded"
//                     />
//                   </div>
//                 </div>
//               </div>
//               <div className="flex justify-end mt-6">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowForm(false);
//                     setCurrentAd(null);
//                     formik.resetForm();
//                   }}
//                   className="bg-gray-500 text-white px-4 py-2 rounded mr-2 hover:bg-gray-600 transition"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
//                 >
//                   {currentAd ? 'Update' : 'Add'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </Transition>
//     </div>
//   );
// };

// export default Ads;










// import React, { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useFormik } from 'formik';
// import * as Yup from 'yup';
// import {
//   FaPlus,
//   FaEdit,
//   FaTrash,
//   FaChevronLeft,
//   FaChevronRight,
// } from 'react-icons/fa';
// import { Transition } from '@headlessui/react';
// import { fetchAds, addAd, updateAd, deleteAd } from '../redux/slices/adsSlice';

// const Ads = () => {
//   const dispatch = useDispatch();
//   const { ads, loading, error } = useSelector((state) => state.ads);

//   const [showForm, setShowForm] = useState(false);
//   const [currentAd, setCurrentAd] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const adsPerPage = 5;

//   useEffect(() => {
//     dispatch(fetchAds());
//   }, [dispatch]);

//   const formik = useFormik({
//     initialValues: {
//       image: currentAd ? currentAd.image : '',
//       title: currentAd ? currentAd.title : '',
//       subtitle: currentAd ? currentAd.subtitle : '',
//     },
//     enableReinitialize: true,
//     validationSchema: Yup.object({
//       image: Yup.string().required('Image URL is required'),
//       title: Yup.string().required('Title is required'),
//       subtitle: Yup.string().required('Subtitle is required'),
//     }),
//     onSubmit: async (values) => {
//       if (currentAd) {
//         try {
//           await dispatch(updateAd({ id: currentAd._id, adData: values })).unwrap();
//           setShowForm(false);
//           setCurrentAd(null);
//           formik.resetForm();
//           setCurrentPage(1);
//         } catch (err) {
//           console.error('Update ad error:', err);
//         }
//       } else {
//         try {
//           await dispatch(addAd(values)).unwrap();
//           setShowForm(false);
//           formik.resetForm();
//           setCurrentPage(1);
//         } catch (err) {
//           console.error('Add ad error:', err);
//         }
//       }
//     },
//   });

//   const handleEdit = (ad) => {
//     setCurrentAd(ad);
//     setShowForm(true);
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm('Are you sure you want to delete this ad?')) {
//       try {
//         await dispatch(deleteAd(id)).unwrap();
//       } catch (err) {
//         console.error('Delete ad error:', err);
//       }
//     }
//   };

//   // Pagination
//   const indexOfLast = currentPage * adsPerPage;
//   const indexOfFirst = indexOfLast - adsPerPage;
//   const currentAds = ads.slice(indexOfFirst, indexOfLast);
//   const totalPages = Math.ceil(ads.length / adsPerPage);
//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   return (
//     <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
//       <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
//         Ads Management
//       </h2>

//       {error && (
//         <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
//           {error}
//         </div>
//       )}

//       <button
//         onClick={() => {
//           setShowForm(true);
//           setCurrentAd(null);
//           formik.resetForm();
//         }}
//         className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition mb-6 flex items-center"
//         aria-label="Add Ad"
//       >
//         <FaPlus className="mr-2" />
//         Add Ad
//       </button>

//       {loading ? (
//         <div className="text-gray-800 dark:text-gray-200">Loading...</div>
//       ) : (
//         <>
//           <div className="overflow-x-auto">
//             <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
//               <thead className="bg-gray-50 dark:bg-gray-700">
//                 <tr>
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Image
//                   </th>
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Title
//                   </th>
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Subtitle
//                   </th>
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
//                 {currentAds.map((ad) => (
//                   <tr key={ad._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
//                       <img src={ad.image} alt={ad.title} className="w-20 h-auto rounded"/>
//                     </td>
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
//                       {ad.title}
//                     </td>
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
//                       {ad.subtitle}
//                     </td>
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200 flex items-center">
//                       <button
//                         onClick={() => handleEdit(ad)}
//                         className="text-blue-500 hover:text-blue-700 mr-4 flex items-center"
//                         aria-label={`Edit ad ${ad.title}`}
//                       >
//                         <FaEdit className="mr-1" />
//                         Edit
//                       </button>
//                       <button
//                         onClick={() => handleDelete(ad._id)}
//                         className="text-red-500 hover:text-red-700 flex items-center"
//                         aria-label={`Delete ad ${ad.title}`}
//                       >
//                         <FaTrash className="mr-1" />
//                         Delete
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//                 {currentAds.length === 0 && (
//                   <tr>
//                     <td colSpan="4" className="py-4 px-6 text-center text-gray-600 dark:text-gray-400">
//                       No ads found.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//           {ads.length > adsPerPage && (
//             <div className="flex justify-center mt-6">
//               <nav aria-label="Page navigation">
//                 <ul className="inline-flex -space-x-px">
//                   <li>
//                     <button
//                       onClick={() => paginate(currentPage - 1)}
//                       disabled={currentPage === 1}
//                       className={`px-3 py-2 ml-0 leading-tight text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-l-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
//                         currentPage === 1 ? 'cursor-not-allowed opacity-50' : ''
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
//                         className={`px-3 py-2 leading-tight border border-gray-300 dark:border-gray-700 ${
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
//                       className={`px-3 py-2 leading-tight text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-r-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
//                         currentPage === totalPages
//                           ? 'cursor-not-allowed opacity-50'
//                           : ''
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

//       <Transition
//         show={showForm}
//         enter="transition ease-out duration-300 transform"
//         enterFrom="opacity-0 scale-95"
//         enterTo="opacity-100 scale-100"
//         leave="transition ease-in duration-200 transform"
//         leaveFrom="opacity-100 scale-100"
//         leaveTo="opacity-0 scale-95"
//       >
//         <div
//           className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
//           aria-modal="true"
//           role="dialog"
//         >
//           <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md mx-4 overflow-y-auto">
//             <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
//               {currentAd ? 'Edit Ad' : 'Add New Ad'}
//             </h3>
//             <form onSubmit={formik.handleSubmit}>
//               {/* Image URL */}
//               <div className="mb-4">
//                 <label className="block text-gray-700 dark:text-gray-200">
//                   Image URL
//                 </label>
//                 <input
//                   type="text"
//                   name="image"
//                   className="w-full px-3 py-2 border rounded focus:outline-none focus:ring border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500"
//                   value={formik.values.image}
//                   onChange={formik.handleChange}
//                   onBlur={formik.handleBlur}
//                   placeholder="https://example.com/ad.png"
//                 />
//                 {formik.touched.image && formik.errors.image && (
//                   <div className="text-red-500 text-sm mt-1">
//                     {formik.errors.image}
//                   </div>
//                 )}
//               </div>
//               {/* Title */}
//               <div className="mb-4">
//                 <label className="block text-gray-700 dark:text-gray-200">
//                   Title
//                 </label>
//                 <input
//                   type="text"
//                   name="title"
//                   className="w-full px-3 py-2 border rounded focus:outline-none focus:ring border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500"
//                   value={formik.values.title}
//                   onChange={formik.handleChange}
//                   onBlur={formik.handleBlur}
//                   placeholder="Ad Title"
//                 />
//                 {formik.touched.title && formik.errors.title && (
//                   <div className="text-red-500 text-sm mt-1">
//                     {formik.errors.title}
//                   </div>
//                 )}
//               </div>
//               {/* Subtitle */}
//               <div className="mb-4">
//                 <label className="block text-gray-700 dark:text-gray-200">
//                   Subtitle
//                 </label>
//                 <input
//                   type="text"
//                   name="subtitle"
//                   className="w-full px-3 py-2 border rounded focus:outline-none focus:ring border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500"
//                   value={formik.values.subtitle}
//                   onChange={formik.handleChange}
//                   onBlur={formik.handleBlur}
//                   placeholder="Ad Subtitle"
//                 />
//                 {formik.touched.subtitle && formik.errors.subtitle && (
//                   <div className="text-red-500 text-sm mt-1">
//                     {formik.errors.subtitle}
//                   </div>
//                 )}
//               </div>
//               {/* Form Buttons */}
//               <div className="flex justify-end">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowForm(false);
//                     setCurrentAd(null);
//                     formik.resetForm();
//                   }}
//                   className="bg-gray-500 text-white px-4 py-2 rounded mr-2 hover:bg-gray-600 transition"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
//                 >
//                   {currentAd ? 'Update' : 'Add'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </Transition>
//     </div>
//   );
// };

// export default Ads;
