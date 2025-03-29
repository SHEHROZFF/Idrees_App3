// src/components/LandingPage.jsx

import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// Import Swiper modules
import { EffectCoverflow, Pagination, Navigation, Autoplay, Keyboard } from 'swiper';

// Import custom CSS
import '../components/styles.css';

// Import images (ensure these paths are correct)
import logo from '../assets/logo.jpg';
import playStoreBadge from '../assets/play-store-badge.png';
import appStoreBadge from '../assets/app-store-badge.png';
import appImage1 from '../assets/app-image1.jpg';
import appImage2 from '../assets/app-image2.jpg';
import appImage3 from '../assets/app-image3.jpg';
import appImage4 from '../assets/app-image4.jpg';
// Add more images as needed

// Import Accordion component
import Accordion from '../components/Accordion'; // Ensure the path is correct

// Import React Icons
import { 
  IoCheckmarkCircleOutline, 
  IoTimerOutline, 
  IoNotificationsOutline, 
  IoAnalyticsOutline, 
  IoPersonCircleOutline, 
  IoCloudDownloadOutline 
} from 'react-icons/io5';

const LandingPage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const images = [
    appImage1,
    appImage2,
    appImage3,
    appImage4,
    // Add more image imports as needed
  ];

  return (
    <div className="font-sans">
      {/* Navigation Bar */}
      <nav className="bg-gradient-to-r from-indigo-500 to-purple-600 shadow fixed w-full z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <img src={logo} alt="House of Cert Logo" className="w-14 h-auto transform hover:scale-110 transition-transform duration-300" />
          <div className="space-x-6 hidden md:flex">
            <a href="#about" className="text-white hover:text-gray-200 transition-colors duration-300">About</a>
            <a href="#features" className="text-white hover:text-gray-200 transition-colors duration-300">Features</a>
            <a href="#faq" className="text-white hover:text-gray-200 transition-colors duration-300">FAQ</a>
            <a href="#download" className="text-white hover:text-gray-200 transition-colors duration-300">Download</a>
            <a href="#contact" className="text-white hover:text-gray-200 transition-colors duration-300">Contact</a>
          </div>
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="text-white hover:text-gray-200 focus:outline-none transition-colors duration-300"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? (
                // Close Icon
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                // Menu Icon
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg">
            <a href="#about" className="block px-6 py-3 text-white hover:bg-purple-700 transition-colors duration-300">About</a>
            <a href="#features" className="block px-6 py-3 text-white hover:bg-purple-700 transition-colors duration-300">Features</a>
            <a href="#faq" className="block px-6 py-3 text-white hover:bg-purple-700 transition-colors duration-300">FAQ</a>
            <a href="#download" className="block px-6 py-3 text-white hover:bg-purple-700 transition-colors duration-300">Download</a>
            <a href="#contact" className="block px-6 py-3 text-white hover:bg-purple-700 transition-colors duration-300">Contact</a>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="bg-gray-100 pt-24"> {/* Added padding-top to accommodate fixed navbar */}
        <div className="container mx-auto flex flex-col-reverse lg:flex-row items-center px-6 py-12">
          <div className="flex flex-col mb-16 space-y-6 lg:w-1/2">
            <img src={logo} alt="House of Cert Logo" className="w-40 mx-auto lg:mx-0 " />
            <h1 className="max-w-md text-5xl font-bold text-gray-800 text-center lg:text-left">
              House of Cert
            </h1>
            <p className="max-w-sm text-gray-600 text-center lg:text-left">
              Your one-stop e-commerce platform for all your academic needs. Find a wide range of notebooks, study materials, and more to excel in your studies.
            </p>
            <div className="flex justify-center lg:justify-start space-x-4">
              <a href="https://play.google.com/store" target="_blank" rel="noopener noreferrer">
                <img src={playStoreBadge} alt="Download on Play Store" className="h-14 transform hover:scale-110 transition-transform duration-300" />
              </a>
              <a href="https://www.apple.com/app-store/" target="_blank" rel="noopener noreferrer">
                <img src={appStoreBadge} alt="Download on App Store" className="h-14 transform hover:scale-110 transition-transform duration-300" />
              </a>
            </div>
            {/* Optional Download Button */}
            
            <a 
              href="https://drive.google.com/uc?export=download&id=1s-dFbxqRCXaIG9VdjSD-OKXA-bIVrcLb" 
              className="mt-6 inline-block bg-indigo-600 text-white py-3  rounded-md hover:bg-indigo-700 transition-colors duration-300 text-center lg:w-1/2"
            >
              Download Now ( APK )
            </a> 
           
          </div>
          {/* Swiper Slider */}
          <div className="lg:w-1/2 w-full">
            <Swiper
              effect={'coverflow'}
              grabCursor={true}
              centeredSlides={true}
              slidesPerView={'auto'}
              coverflowEffect={{
                rotate: 50,
                stretch: 0,
                depth: 100,
                modifier: 1,
                slideShadows: true,
              }}
              pagination={{
                clickable: true,
              }}
              navigation={true}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
              }}
              keyboard={{
                enabled: true,
              }}
              modules={[EffectCoverflow, Pagination, Navigation, Autoplay, Keyboard]}
              className="mySwiper"
            >
              {images.map((src, index) => (
                <SwiperSlide key={index} className="swiper-slide">
                  <img src={src} alt={`App Screenshot ${index + 1}`} className="w-full h-full object-cover rounded-lg shadow-lg" />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-white py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">About House of Cert</h2>
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2">
              <img src={logo} alt="House of Cert Logo" className="w-64 mx-auto md:mx-0 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="md:w-1/2 mt-8 md:mt-0 md:pl-12">
              <p className="text-gray-700 mb-6 leading-relaxed">
                House of Cert is an innovative e-commerce platform tailored for students seeking high-quality notebooks, study guides, and other academic essentials. Our mission is to provide students with the resources they need to succeed in their educational endeavors.
              </p>
              <p className="text-gray-700 leading-relaxed">
                We curate a diverse range of products to cater to various academic disciplines, ensuring that every student finds exactly what they need to enhance their learning experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-gray-100 py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 text-center">
              <IoCheckmarkCircleOutline size={60} color="#4F46E5" className="mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">Extensive Product Range</h3>
              <p className="text-gray-600">
                Explore a wide variety of notebooks and study materials tailored to your academic needs.
              </p>
            </div>
            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 text-center">
              <IoTimerOutline size={60} color="#4F46E5" className="mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">Fast Delivery</h3>
              <p className="text-gray-600">
                Receive your orders promptly with our reliable and efficient delivery system.
              </p>
            </div>
            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 text-center">
              <IoNotificationsOutline size={60} color="#4F46E5" className="mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">Real-time Notifications</h3>
              <p className="text-gray-600">
                Stay updated with real-time notifications about your order status and special offers.
              </p>
            </div>
            {/* Feature 4 */}
            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 text-center">
              <IoAnalyticsOutline size={60} color="#4F46E5" className="mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">Comprehensive Analytics</h3>
              <p className="text-gray-600">
                Track your purchases and manage your academic resources efficiently with our analytics tools.
              </p>
            </div>
            {/* Feature 5 */}
            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 text-center">
              <IoPersonCircleOutline size={60} color="#4F46E5" className="mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">Personalized Profiles</h3>
              <p className="text-gray-600">
                Customize your user profile to receive tailored recommendations and offers.
              </p>
            </div>
            {/* Feature 6 */}
            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 text-center">
              <IoCloudDownloadOutline size={60} color="#4F46E5" className="mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">Seamless Cloud Sync</h3>
              <p className="text-gray-600">
                Access your account and manage your orders from any device with our cloud synchronization.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="bg-gray-100 py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">Frequently Asked Questions</h2>
          {/* Accordion Component for FAQs */}
          <div className="max-w-2xl mx-auto space-y-6">
            <Accordion
              question="How do I place an order?"
              answer="Browse our product catalog, select the notebook you desire, add it to your cart, and proceed to checkout to complete your purchase."
            />
            <Accordion
              question="What payment methods are accepted?"
              answer="We accept various payment methods including credit/debit cards, PayPal, and other secure online payment gateways."
            />
            <Accordion
              question="Can I track my order status?"
              answer="Yes, once your order is placed, you can track its status in real-time through your user profile."
            />
            {/* Add more Accordion items as needed */}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-gray-100 p-8 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <p className="text-gray-700 mb-6 italic">
                "House of Cert has revolutionized the way I organize my study materials. The variety of notebooks available is impressive!"
              </p>
              <p className="font-semibold text-gray-800 text-right">- Aisha Khan</p>
            </div>
            {/* Testimonial 2 */}
            <div className="bg-gray-100 p-8 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <p className="text-gray-700 mb-6 italic">
                "Fast delivery and excellent customer service. Highly recommend House of Cert to all students."
              </p>
              <p className="font-semibold text-gray-800 text-right">- Bilal Ahmed</p>
            </div>
            {/* Testimonial 3 */}
            <div className="bg-gray-100 p-8 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <p className="text-gray-700 mb-6 italic">
                "The app is user-friendly and the cloud sync feature makes it easy to manage my orders across multiple devices."
              </p>
              <p className="font-semibold text-gray-800 text-right">- Sara Malik</p>
            </div>
          </div>
        </div>
      </section>

      {/* Terms and Conditions Section */}
      <section id="terms" className="bg-gray-100 py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">Terms and Conditions</h2>
          <div className="max-w-3xl mx-auto text-gray-700 space-y-6">
            <p>
              Welcome to House of Cert! By accessing or using our app, you agree to be bound by these Terms and Conditions. Please read them carefully.
            </p>
            <div>
              <h3 className="text-2xl font-semibold">1. Use of the App</h3>
              <p>
                You agree to use House of Cert only for lawful purposes and in a way that does not infringe the rights of others or restrict their use and enjoyment of the app.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold">2. User Accounts</h3>
              <p>
                You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold">3. Privacy</h3>
              <p>
                Your privacy is important to us. Please refer to our Privacy Policy for information on how we collect, use, and protect your personal data.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold">4. Limitation of Liability</h3>
              <p>
                House of Cert is provided on an "as is" basis. We make no warranties, express or implied, regarding the app's performance or reliability.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold">5. Changes to Terms</h3>
              <p>
                We reserve the right to modify these Terms and Conditions at any time. Changes will be effective immediately upon posting in the app.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold">6. Governing Law</h3>
              <p>
                These Terms and Conditions are governed by and construed in accordance with the laws of your jurisdiction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section id="download" className="bg-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-6">Get House of Cert Now</h2>
          <p className="text-lg text-gray-600 mb-12">
            Experience the ultimate e-commerce platform designed to meet all your academic needs.
          </p>
          <div className="flex justify-center space-x-8">
            <a href="https://play.google.com/store" target="_blank" rel="noopener noreferrer" className="transform hover:scale-110 transition-transform duration-300">
              <img src={playStoreBadge} alt="Download on Play Store" className="h-16" />
            </a>
            <a href="https://www.apple.com/app-store/" target="_blank" rel="noopener noreferrer" className="transform hover:scale-110 transition-transform duration-300">
              <img src={appStoreBadge} alt="Download on App Store" className="h-16" />
            </a>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="bg-gray-100 py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">Contact Us</h2>
          <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
            <form className="space-y-6" action="https://formspree.io/f/{your_form_id}" method="POST">
              <div>
                <label htmlFor="name" className="block text-gray-700 font-semibold">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Your Name"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-gray-700 font-semibold">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-gray-700 font-semibold">Message</label>
                <textarea
                  id="message"
                  name="message"
                  className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Your message..."
                  rows="5"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-700 transition-colors duration-300 font-semibold"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer (Optional) */}
      <footer className="bg-indigo-600 text-white py-6">
        <div className="container mx-auto px-6 text-center">
          <p>&copy; {new Date().getFullYear()} House of Cert. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
