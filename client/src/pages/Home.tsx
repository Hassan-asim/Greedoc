import Navbar from "@/components/Navbar"
import { FiCheck, FiHeart, FiSmartphone, FiUsers, FiCpu, FiShield, FiActivity, FiUser, FiRefreshCw, FiZap } from 'react-icons/fi'
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import LOGO from "../../public/logo.png";

export const Home: React.FC = () => {
  const [showStickyNav, setShowStickyNav] = useState(false);

  const benefits = [
    "AI-powered health insights",
    "Secure data encryption",
    "24/7 health monitoring",
    "Personalized recommendations",
    "Multi-device synchronization"
  ];

  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = window.innerHeight * 0.8; // Approximate hero section height
      const scrollPosition = window.scrollY;

      if (scrollPosition > heroHeight) {
        setShowStickyNav(true);
      } else {
        setShowStickyNav(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  return (
    <>
      {/* Sticky Navbar */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200"
        initial={{ y: -100, opacity: 0 }}
        animate={{
          y: showStickyNav ? 0 : -100,
          opacity: showStickyNav ? 1 : 0
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 xl:px-0">
          <div className="flex items-center justify-between py-4">
            <Link className="font-semibold flex justify-center items-center" to="/" title="Home">
              <img src={LOGO} className="h-6 w-6 text-primary-400" alt="Greedoc Logo" />&nbsp;
              Greedoc
            </Link>

            <div className="flex items-center gap-x-3">
              <Link
                to="/doctor/login"
                className="items-center justify-center whitespace-nowrap text-sm font-medium transition-all border border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50 px-4 py-2 rounded-lg hidden sm:flex"
              >
                Doctor Login
              </Link>
              <Link
                to="/patient/login"
                className="items-center justify-center whitespace-nowrap text-sm font-medium transition-all bg-green-900 text-white hover:bg-green-800 px-4 py-2 rounded-lg flex"
              >
                Patient Login
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="min-h-screen w-full bg-white relative">
          <div
    className="absolute inset-0 z-0"
    style={{
      backgroundImage: `
        radial-gradient(125% 125% at 50% 100%, #ffffff 40%, #dcfce7 100%)
      `,
      backgroundSize: "100% 100%",
    }}
  />

        <section className="h-full relative z-10">
          <div className="absolute top-0 left-0 w-full z-20 pt-3">
            <Navbar />
          </div>
          <div
            className="max-w-7xl mx-auto px-4 xl:px-0 grid lg:grid-cols-2 lg:gap-x-20 xl:gap-x-40 pt-24 lg:pt-28 h-full items-center min-h-screen"
          >
            {/* Logo with heartbeat animation - visible on desktop */}
            <motion.div
              className="lg:flex hidden justify-center items-center"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div
                className="heartbeat-animation"
                style={{
                  animation: 'heartbeat 2s ease-in-out infinite'
                }}
              >
                <img
                  src="/logo.png"
                  alt="Greedoc Logo"
                  className="h-56 w-56 drop-shadow-2xl object-contain"
                />
              </div>
            </motion.div>

            {/* Logo with heartbeat animation - visible on mobile, positioned above text */}
            <motion.div
              className="lg:hidden flex justify-center items-center mb-8"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div
                className="heartbeat-animation"
                style={{
                  animation: 'heartbeat 2s ease-in-out infinite'
                }}
              >
                <img
                  src="/logo.png"
                  alt="Greedoc Logo"
                  className="h-[140px] drop-shadow-2xl object-contain"
                />
              </div>
            </motion.div>

            <div className="flex flex-col items-center lg:items-start text-center lg:text-left lg:mt-0 justify-center h-full lg:h-auto">
              <motion.div
                className="items-center justify-center rounded-full text-lg font-medium whitespace-nowrap shadow-[0_2px_10px_0px_rgba(0,0,0,0.15)] inline-flex bg-green-900 text-white px-2.5 py-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Introducing  Health Twin App
              </motion.div>
              <motion.div
                className="text-3xl font-semibold text-slate-900 lg:text-6xl mt-3 lg:mt-4 lg:leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Everything You Need for Better Health
              </motion.div>
              <motion.p
                className="mt-3 text-lg font-medium text-slate-600 sm:w-2/3 md:w-11/12 lg:mt-4 xl:w-3/4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                Our comprehensive platform combines cutting-edge AI with user-friendly design
                to help you manage your health effectively.
              </motion.p>
            </div>
          </div>
        </section>
      </div>

      {/* CSS for heartbeat animation */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes heartbeat {
            0% {
              transform: scale(1);
            }
            14% {
              transform: scale(1.15);
            }
            28% {
              transform: scale(1);
            }
            42% {
              transform: scale(1.15);
            }
            70% {
              transform: scale(1);
            }
          }
        `
      }} />


      <section className="py-20 bg-white sm:py-16 lg:py-20">
    <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
            <h2 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl xl:text-5xl font-pj">Why Choose Greedoc?</h2>
            <p className="mt-4 text-base leading-7 text-gray-600 sm:mt-8 font-pj">Join thousands of users who have transformed their health management with our AI-powered platform.</p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 mt-10 text-center sm:mt-16 sm:grid-cols-2 sm:gap-x-12 gap-y-12 md:grid-cols-3 md:gap-0 xl:mt-24"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.2
              }
            }
          }}
        >
            <motion.div
              className="md:p-8 lg:p-14"
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
              }}
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
            >
                <motion.div
                  className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center"
                  whileHover={{ rotate: 360, transition: { duration: 0.5 } }}
                >
                    <FiCpu className="w-6 h-6 text-green-600" />
                </motion.div>
                <h3 className="mt-12 text-xl font-bold text-gray-900 font-pj">AI-powered health insights</h3>
            </motion.div>

            <motion.div
              className="md:p-8 lg:p-14 md:border-l md:border-gray-200"
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
              }}
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
            >
                <motion.div
                  className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center"
                  whileHover={{ rotate: 360, transition: { duration: 0.5 } }}
                >
                    <FiShield className="w-6 h-6 text-green-600" />
                </motion.div>
                <h3 className="mt-12 text-xl font-bold text-gray-900 font-pj">Secure data encryption</h3>
            </motion.div>

            <motion.div
              className="md:p-8 lg:p-14 md:border-l md:border-gray-200"
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
              }}
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
            >
                <motion.div
                  className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center"
                  whileHover={{ rotate: 360, transition: { duration: 0.5 } }}
                >
                    <FiActivity className="w-6 h-6 text-green-600" />
                </motion.div>
                <h3 className="mt-12 text-xl font-bold text-gray-900 font-pj">24/7 health monitoring</h3>
            </motion.div>

            <motion.div
              className="md:p-8 lg:p-14 md:border-t md:border-gray-200"
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
              }}
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
            >
                <motion.div
                  className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center"
                  whileHover={{ rotate: 360, transition: { duration: 0.5 } }}
                >
                    <FiUser className="w-6 h-6 text-green-600" />
                </motion.div>
                <h3 className="mt-12 text-xl font-bold text-gray-900 font-pj">Personalized recommendations</h3>
            </motion.div>

            <motion.div
              className="md:p-8 lg:p-14 md:border-l md:border-gray-200 md:border-t"
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
              }}
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
            >
                <motion.div
                  className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center"
                  whileHover={{ rotate: 360, transition: { duration: 0.5 } }}
                >
                    <FiRefreshCw className="w-6 h-6 text-green-600" />
                </motion.div>
                <h3 className="mt-12 text-xl font-bold text-gray-900 font-pj">Multi-device synchronization</h3>
            </motion.div>

            <motion.div
              className="md:p-8 lg:p-14 md:border-l md:border-gray-200 md:border-t"
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
              }}
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
            >
                <motion.div
                  className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center"
                  whileHover={{ rotate: 360, transition: { duration: 0.5 } }}
                >
                    <FiZap className="w-6 h-6 text-green-600" />
                </motion.div>
                <h3 className="mt-12 text-xl font-bold text-gray-900 font-pj">Fluid Workflow</h3>
            </motion.div>
        </motion.div>
    </div>
</section>




<section className="pt-12 lg:pt-16 pb-12 lg:pb-16">
  <div className="max-w-7xl mx-auto px-4 xl:px-0">
    <motion.div
      className="relative overflow-hidden rounded-3xl bg-green-100 lg:grid lg:grid-cols-2 lg:rounded-[3rem]"
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <motion.div
        className="flex flex-col items-center justify-center text-center lg:items-start lg:text-left lg:justify-start px-4 py-16 lg:px-16 lg:pb-16 lg:pt-40 min-h-[400px] lg:min-h-0"
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <motion.div
          className="text-3xl font-semibold text-green-800 w-full lg:w-11/12 lg:text-5xl lg:leading-tight xl:w-3/4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
           Ready to Transform Healthcare?
        </motion.div>
        <motion.p
          className="text-lg lg:text-xl text-green-700 mb-8 max-w-2xl mt-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          Choose your portal to access Greedoc's AI-powered health management platform.
        </motion.p>

        <motion.a
          href="/patient/login"
          title="Get Started"
          className="items-center justify-center whitespace-nowrap text-sm font-medium transition-all focus:shadow-[0_0px_0px_2px_rgba(15,23,42,0.25),0_2px_10px_0px_rgba(0,0,0,0.05)] shadow-[0_2px_10px_0px_rgba(0,0,0,0.05)] bg-green-900 text-white hover:bg-green-800 disabled:bg-green-900/30 disabled:text-green-50/70 px-4 py-2.5 rounded-[0.625rem] mt-6 flex"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Get Started
          <motion.svg
            className="shrink-0 ml-2 h-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            data-slot="icon"
            whileHover={{ x: 5 }}
            transition={{ duration: 0.2 }}
          >
            <path
              fillRule="evenodd"
              d="M12.97 3.97a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 1 1-1.06-1.06l6.22-6.22H3a.75.75 0 0 1 0-1.5h16.19l-6.22-6.22a.75.75 0 0 1 0-1.06Z"
              clipRule="evenodd"
            />
          </motion.svg>
        </motion.a>
      </motion.div>
    </motion.div>
  </div>
</section>


      <section className="pt-12 lg:pt-16 pb-6 lg:pb-16">
        <div className="max-w-7xl mx-auto px-4 xl:px-0">
          <motion.div
            className="flex flex-col items-start md:px-4 lg:items-start lg:px-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="items-center justify-center rounded-full text-sm font-medium whitespace-nowrap shadow-[0_2px_10px_0px_rgba(0,0,0,0.15)] inline-flex bg-green-900 text-white px-2.5 py-1"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Frequently Asked Questions
            </motion.div>
            <motion.div
              className="mt-8 bg-gradient-to-b from-slate-800 to-slate-600 bg-clip-text text-3xl font-semibold text-transparent sm:w-2/3 md:w-1/2 lg:mt-9 lg:text-4xl lg:leading-tight xl:w-2/3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Everything You Need to Know About Greedoc
            </motion.div>
            <motion.p
              className="text-sm font-medium text-slate-600 leading-normal lg:leading-normal lg:text-base mt-4 sm:w-2/3 md:w-1/2 xl:w-2/5"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              Get answers to common questions about our AI-powered health management platform
              and discover how Greedoc can transform your healthcare experience.
            </motion.p>
          </motion.div>
          <div className="mt-4 border-b border-b-neutral-100 lg:mt-6"></div>
          <motion.div
            className="mt-6 space-y-0.5 md:px-4 lg:mt-9 lg:px-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            <motion.details
              className="group open:bg-slate-50 divide-y divide-neutral-100 focus:shadow-[0_0px_2px_0px_rgba(0,0,0,0.10)] open:mt-3 open:rounded-2xl hover:rounded-2xl"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
              }}
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
            </motion.details>
            <motion.details
              className="group open:bg-slate-50 divide-y divide-neutral-100 focus:shadow-[0_0px_2px_0px_rgba(0,0,0,0.10)] open:mt-3 open:rounded-2xl hover:rounded-2xl"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
              }}
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
            </motion.details>
            <motion.details
              className="group open:bg-slate-50 divide-y divide-neutral-100 focus:shadow-[0_0px_2px_0px_rgba(0,0,0,0.10)] open:mt-3 open:rounded-2xl hover:rounded-2xl"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
              }}
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
            </motion.details>
            <motion.details
              className="group open:bg-slate-50 divide-y divide-neutral-100 focus:shadow-[0_0px_2px_0px_rgba(0,0,0,0.10)] open:mt-3 open:rounded-2xl hover:rounded-2xl"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
              }}
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
            </motion.details>
            <motion.details
              className="group open:bg-slate-50 divide-y divide-neutral-100 focus:shadow-[0_0px_2px_0px_rgba(0,0,0,0.10)] open:mt-3 open:rounded-2xl hover:rounded-2xl"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
              }}
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
            </motion.details>
          </motion.div>
        </div>
      </section>


<div className="w-full relative">
  {/* Emerald Glow Background */}
  <div
    className="absolute inset-0 z-0"
    style={{
      backgroundImage: `
        radial-gradient(125% 125% at 50% 10%, #ffffff 40%, #dcfce7 100%)
      `,
      backgroundSize: "100% 100%",
    }}
  />

      <footer className="relative z-10 text-gray-900 py-12">
        <motion.div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <FiHeart className="h-6 w-6 text-emerald-600" />
                <h3 className="ml-2 text-lg font-bold text-gray-900">Greedoc</h3>
              </div>
              <p className="text-gray-700">
                Your AI-powered health companion for better wellness management.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-gray-900">Product</h4>
              <ul className="space-y-2 text-gray-700">
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-gray-900">Support</h4>
              <ul className="space-y-2 text-gray-700">
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-gray-900">Company</h4>
              <ul className="space-y-2 text-gray-700">
                <li><a href="#" className="hover:text-emerald-600 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Careers</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-400 mt-8 pt-8 text-center text-gray-700">
            <p>&copy; 2025 Greedoc. All rights reserved.</p>
          </div>
        </motion.div>
      </footer>
</div>
    </>
  )
}
