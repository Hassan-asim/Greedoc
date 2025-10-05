import Navbar from "@/components/Navbar"
import { FiCheck, FiHeart, FiSmartphone, FiUsers } from 'react-icons/fi'
import { Link } from "react-router-dom";

export const Home: React.FC = () => {
  const benefits = [
    "AI-powered health insights",
    "Secure data encryption",
    "24/7 health monitoring",
    "Personalized recommendations",
    "Multi-device synchronization"
  ];


  return (
    <>
      <div className="min-h-screen h-screen relative">
        {/* Background image for the hero section */}

        <section className="h-full relative">
          <div className="absolute top-0 left-0 w-full z-20 pt-3">
            <Navbar />
          </div>
          <div
            className="max-w-7xl mx-auto px-4 xl:px-0 grid lg:grid-cols-2 lg:gap-x-20 xl:gap-x-40 pt-24 lg:pt-28 h-full items-center"
          >
            <div className="lg:block hidden"></div>
            <div className="flex flex-col items-start lg:items-start items-center text-center lg:text-left lg:mt-0 justify-center h-full lg:h-auto">
              <div
                className="items-center justify-center rounded-full text-sm font-medium whitespace-nowrap shadow-[0_2px_10px_0px_rgba(0,0,0,0.15)] inline-flex bg-green-900 text-white px-2.5 py-1"
              >
                Introducing  Health Twin App
              </div>
              <div
                className="text-3xl font-semibold text-white text-slate-700 lg:text-5xl mt-3 lg:mt-4 lg:leading-tight"
              >
                Everything You Need for Better Health
              </div>
              <p
                className="mt-3 text-sm font-medium lg:text-slate-600 sm:w-2/3 md:w-11/12 lg:mt-4 xl:w-3/4"
              >
                Our comprehensive platform combines cutting-edge AI with user-friendly design
                to help you manage your health effectively.
              </p>
            </div>
          </div>
          <img
            className="absolute left-0 top-0 h-full w-full object-cover lg:w-1/2 -z-10"
            src="https://tailkits.com/ui/iframe/assets/img/bg-10.png"
            alt="Features"
          />
          {/* Mobile overlay for better text readability */}
          <div className="absolute inset-0 bg-black/20 lg:bg-transparent lg:w-1/2 -z-5"></div>
        </section>
      </div>





      <section className="py-20 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Why Choose Greedoc?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Join thousands of users who have transformed their health management
                with our AI-powered platform.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <FiCheck className="h-5 w-5 text-success-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl py-16 shadow-2xl p-8">
              <div className="text-center">
                <FiSmartphone className="h-16 w-16 text-primary-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Available Everywhere
                </h3>
                <p className="text-gray-600 mb-6">
                  Access your health data and insights from any device, anywhere, anytime.
                </p>
                <div className="flex justify-center space-x-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">10K+</div>
                    <div className="text-sm text-gray-600">Active Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">99.9%</div>
                    <div className="text-sm text-gray-600">Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">4.9★</div>
                    <div className="text-sm text-gray-600">Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


<section
  className="py-20 bg-cover bg-center bg-no-repeat"
  style={{ backgroundImage: "url('https://tailkits.com/ui/iframe/assets/img/bg-10.png')" }}
>        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Ready to Transform Healthcare?
          </h2>
          <p className="text-xl text-slate-700 mb-8 max-w-2xl mx-auto">
            Choose your portal to access Greedoc's AI-powered health management platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/doctor/login"
              className="btn bg-white border-green-800 border text-primary-600 hover:bg-gray-100 btn-lg inline-flex items-center w-full sm:w-auto"
            >
              <FiUsers className="mr-2 h-5 w-5" />
              Doctor Portal
            </Link>
            <Link
              to="/patient/login"
              className="btn bg-green-800 border-2 border-white text-white hover:bg-green-600 hover:text-white btn-lg inline-flex items-center w-full sm:w-auto"
            >
              <FiHeart className="mr-2 h-5 w-5" />
              Patient Portal
            </Link>
          </div>
        </div>
      </section>


      <section className="pt-12 lg:pt-16 pb-6 lg:pb-16">
        <div className="max-w-7xl mx-auto px-4 xl:px-0">
          <div className="flex flex-col items-start md:px-4 lg:items-start lg:px-8">
            <div
              className="items-center justify-center rounded-full text-sm font-medium whitespace-nowrap shadow-[0_2px_10px_0px_rgba(0,0,0,0.15)] inline-flex bg-green-900 text-white px-2.5 py-1"
            >
              Frequently Asked Questions
            </div>
            <div
              className="mt-8 bg-gradient-to-b from-slate-800 to-slate-600 bg-clip-text text-3xl font-semibold text-transparent sm:w-2/3 md:w-1/2 lg:mt-9 lg:text-4xl lg:leading-tight xl:w-2/3"
            >
              Everything You Need to Know About Greedoc
            </div>
            <p
              className="text-sm font-medium text-slate-600 leading-normal lg:leading-normal lg:text-base mt-4 sm:w-2/3 md:w-1/2 xl:w-2/5"
            >
              Get answers to common questions about our AI-powered health management platform
              and discover how Greedoc can transform your healthcare experience.
            </p>
          </div>
          <div className="mt-4 border-b border-b-neutral-100 lg:mt-6"></div>
          <div className="mt-6 space-y-0.5 md:px-4 lg:mt-9 lg:px-8">
            <details
              className="group open:bg-slate-50 divide-y divide-neutral-100 focus:shadow-[0_0px_2px_0px_rgba(0,0,0,0.10)] open:mt-3 open:rounded-2xl hover:rounded-2xl"
            >
              <summary
                className="group/question flex cursor-pointer hover:opacity-90 transition-all items-center justify-between gap-x-4 rounded-t-2xl p-4"
              >
                <div className="font-semibold text-neutral-700 md:text-lg xl:text-xl">
                  What is Greedoc and how does it work?
                </div>
                <figure
                  className="hidden shrink-0 items-center gap-x-3 whitespace-nowrap rounded-full bg-slate-200 py-1.5 pl-3 pr-1.5 text-sm text-slate-600 transition-all group-open:flex"
                >
                  Collapse
                  <svg
                    className="h-5 text-slate-600"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                    data-slot="icon"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.25 12a.75.75 0 0 1 .75-.75h14a.75.75 0 0 1 0 1.5H5a.75.75 0 0 1-.75-.75Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </figure>
                <figure
                  className="flex shrink-0 items-center justify-center transition-all rounded-full bg-slate-200 p-1.5 shadow-[0_2px_10px_0px_rgba(0,0,0,0.05)] group-open:hidden"
                >
                  <svg
                    className="h-5 text-slate-600"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                    data-slot="icon"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </figure>
              </summary>
              <p className="text-neutral-500 px-4 pb-4">
                Greedoc is an AI-powered health management platform that provides comprehensive 
                healthcare solutions for both patients and doctors. Our platform uses advanced 
                artificial intelligence to analyze health data, provide personalized insights, 
                and facilitate better communication between healthcare providers and patients.
              </p>
            </details>
            <details
              className="group open:bg-slate-50 divide-y divide-neutral-100 focus:shadow-[0_0px_2px_0px_rgba(0,0,0,0.10)] open:mt-3 open:rounded-2xl hover:rounded-2xl"
            >
              <summary
                className="group/question flex cursor-pointer hover:opacity-90 transition-all items-center justify-between gap-x-4 rounded-t-2xl p-4"
              >
                <div className="font-semibold text-neutral-700 md:text-lg xl:text-xl">
                  Is my health data secure on Greedoc?
                </div>
                <figure
                  className="hidden shrink-0 items-center gap-x-3 whitespace-nowrap rounded-full bg-slate-200 py-1.5 pl-3 pr-1.5 text-sm text-slate-600 transition-all group-open:flex"
                >
                  Collapse
                  <svg
                    className="h-5 text-slate-600"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                    data-slot="icon"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.25 12a.75.75 0 0 1 .75-.75h14a.75.75 0 0 1 0 1.5H5a.75.75 0 0 1-.75-.75Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </figure>
                <figure
                  className="flex shrink-0 items-center justify-center transition-all rounded-full bg-slate-200 p-1.5 shadow-[0_2px_10px_0px_rgba(0,0,0,0.05)] group-open:hidden"
                >
                  <svg
                    className="h-5 text-slate-600"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                    data-slot="icon"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </figure>
              </summary>
              <p className="text-neutral-500 px-4 pb-4">
                Absolutely! We take data security very seriously at Greedoc. All health data 
                is encrypted using industry-standard encryption protocols, and we comply with 
                HIPAA regulations. Your personal health information is stored securely and 
                is only accessible to authorized healthcare providers with your consent.
              </p>
            </details>
            <details
              className="group open:bg-slate-50 divide-y divide-neutral-100 focus:shadow-[0_0px_2px_0px_rgba(0,0,0,0.10)] open:mt-3 open:rounded-2xl hover:rounded-2xl"
            >
              <summary
                className="group/question flex cursor-pointer hover:opacity-90 transition-all items-center justify-between gap-x-4 rounded-t-2xl p-4"
              >
                <div className="font-semibold text-neutral-700 md:text-lg xl:text-xl">
                  How do I connect with doctors on Greedoc?
                </div>
                <figure
                  className="hidden shrink-0 items-center gap-x-3 whitespace-nowrap rounded-full bg-slate-200 py-1.5 pl-3 pr-1.5 text-sm text-slate-600 transition-all group-open:flex"
                >
                  Collapse
                  <svg
                    className="h-5 text-slate-600"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                    data-slot="icon"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.25 12a.75.75 0 0 1 .75-.75h14a.75.75 0 0 1 0 1.5H5a.75.75 0 0 1-.75-.75Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </figure>
                <figure
                  className="flex shrink-0 items-center justify-center transition-all rounded-full bg-slate-200 p-1.5 shadow-[0_2px_10px_0px_rgba(0,0,0,0.05)] group-open:hidden"
                >
                  <svg
                    className="h-5 text-slate-600"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                    data-slot="icon"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </figure>
              </summary>
              <p className="text-neutral-500 px-4 pb-4">
                Connecting with doctors on Greedoc is simple. Create your patient account, 
                browse our network of verified healthcare professionals, and book appointments 
                directly through the platform. You can also share your health data and receive 
                AI-powered insights that help doctors provide more personalized care.
              </p>
            </details>
            <details
              className="group open:bg-slate-50 divide-y divide-neutral-100 focus:shadow-[0_0px_2px_0px_rgba(0,0,0,0.10)] open:mt-3 open:rounded-2xl hover:rounded-2xl"
            >
              <summary
                className="group/question flex cursor-pointer hover:opacity-90 transition-all items-center justify-between gap-x-4 rounded-t-2xl p-4"
              >
                <div className="font-semibold text-neutral-700 md:text-lg xl:text-xl">
                  What devices can I use to access Greedoc?
                </div>
                <figure
                  className="hidden shrink-0 items-center gap-x-3 whitespace-nowrap rounded-full bg-slate-200 py-1.5 pl-3 pr-1.5 text-sm text-slate-600 transition-all group-open:flex"
                >
                  Collapse
                  <svg
                    className="h-5 text-slate-600"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                    data-slot="icon"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.25 12a.75.75 0 0 1 .75-.75h14a.75.75 0 0 1 0 1.5H5a.75.75 0 0 1-.75-.75Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </figure>
                <figure
                  className="flex shrink-0 items-center justify-center transition-all rounded-full bg-slate-200 p-1.5 shadow-[0_2px_10px_0px_rgba(0,0,0,0.05)] group-open:hidden"
                >
                  <svg
                    className="h-5 text-slate-600"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                    data-slot="icon"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </figure>
              </summary>
              <p className="text-neutral-500 px-4 pb-4">
                Greedoc is fully responsive and works seamlessly across all devices. 
                You can access the platform from your smartphone, tablet, laptop, or desktop computer 
                through our web application. We also have dedicated mobile apps for iOS and Android 
                for the best mobile experience.
              </p>
            </details>
            <details
              className="group open:bg-slate-50 divide-y divide-neutral-100 focus:shadow-[0_0px_2px_0px_rgba(0,0,0,0.10)] open:mt-3 open:rounded-2xl hover:rounded-2xl"
            >
              <summary
                className="group/question flex cursor-pointer hover:opacity-90 transition-all items-center justify-between gap-x-4 rounded-t-2xl p-4"
              >
                <div className="font-semibold text-neutral-700 md:text-lg xl:text-xl">
                  How much does Greedoc cost?
                </div>
                <figure
                  className="hidden shrink-0 items-center gap-x-3 whitespace-nowrap rounded-full bg-slate-200 py-1.5 pl-3 pr-1.5 text-sm text-slate-600 transition-all group-open:flex"
                >
                  Collapse
                  <svg
                    className="h-5 text-slate-600"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                    data-slot="icon"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.25 12a.75.75 0 0 1 .75-.75h14a.75.75 0 0 1 0 1.5H5a.75.75 0 0 1-.75-.75Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </figure>
                <figure
                  className="flex shrink-0 items-center justify-center transition-all rounded-full bg-slate-200 p-1.5 shadow-[0_2px_10px_0px_rgba(0,0,0,0.05)] group-open:hidden"
                >
                  <svg
                    className="h-5 text-slate-600"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                    data-slot="icon"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </figure>
              </summary>
              <p className="text-neutral-500 px-4 pb-4">
                Greedoc offers flexible pricing plans to suit different needs. We have a free basic plan 
                for individual users, premium plans for families and healthcare professionals, and 
                enterprise solutions for healthcare institutions. Visit our pricing page to see detailed 
                information about all available plans and features.
              </p>
            </details>
          </div>
        </div>
      </section>



      <footer  className="bg-green-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <FiHeart className="h-6 w-6 text-primary-400" />
                <h3 className="ml-2 text-lg font-bold">Greedoc</h3>
              </div>
              <p className="text-gray-200">
                Your AI-powered health companion for better wellness management.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-200">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-200">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-200">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-200">
            <p>&copy; 2025 Greedoc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  )
}
