"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronDown,
  MessageCircle,
  QrCode,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Store,
  TrendingUp,
  UtensilsCrossed,
} from "lucide-react";

import { AnimatePresence, motion } from "framer-motion";

import Navbar from "@/components/layout/Navbar";

import {
  PLAN_ORDER,
  BillingPeriod,
  SUBSCRIPTION_FEATURES,
  SUBSCRIPTION_PLANS,
} from "@/components/Plan";

/* -------------------------------------------------------------------------- */
/* FAQ                                                                         */
/* -------------------------------------------------------------------------- */

const faqs = [
  {
    q: "Do I need a website or app already?",
    a: "No. Bukka gives you a digital menu and ordering page out of the box. Just create your menu and share your link or QR code.",
  },
  {
    q: "How do orders reach me?",
    a: "Customers browse your digital menu, place their order and can continue the conversation directly through WhatsApp.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes. Every new Bukka account starts with a 14-day free trial. No card is required to get your menu online.",
  },
  {
    q: "What happens after my 14-day free trial?",
    a: "Choose monthly, 6-month or annual billing to continue managing your menu and using Bukka.",
  },
  {
    q: "Do all subscriptions have the same features?",
    a: "Yes. Every paid Bukka subscription includes the same product features. The only difference is the billing period you choose.",
  },
  {
    q: "What happens if my subscription expires?",
    a: "Your account and existing business information remain stored, but subscription-only management features are restricted until you renew.",
  },
  {
    q: "Can I change my billing period?",
    a: "Yes. You can choose a different billing period when renewing your subscription.",
  },
];

const easing = [0.22, 1, 0.36, 1] as const;

/* -------------------------------------------------------------------------- */
/* PAGE                                                                         */
/* -------------------------------------------------------------------------- */

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <main className="min-h-screen bg-[#fffdf7]">
      <Navbar />

      {/* ==================================================================== */}
      {/* HERO                                                                 */}
      {/* ==================================================================== */}

      <section className="relative overflow-hidden">
        {/* Background decorations */}

        <motion.div
          className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full bg-green-200/40 blur-3xl"
          animate={{
            x: [0, 25, 0],
            y: [0, -15, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="pointer-events-none absolute -left-32 top-[420px] h-[360px] w-[360px] rounded-full bg-orange-100/50 blur-3xl"
          animate={{
            x: [0, -20, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 pb-28 pt-20 md:grid-cols-2 lg:pt-28">
          {/* LEFT */}

          <motion.div
            initial={{
              opacity: 0,
              x: -50,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.8,
              ease: easing,
            }}
          >
            <motion.div
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.15,
                duration: 0.6,
              }}
              className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-600" />
              </span>
              Built for food businesses
            </motion.div>

            <motion.h1
              initial={{
                opacity: 0,
                y: 25,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.25,
                duration: 0.7,
                ease: easing,
              }}
              className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight text-gray-900 md:text-6xl lg:text-7xl"
            >
              Turn your food business{" "}
              <span className="relative inline-block text-green-600">
                online
                <motion.span
                  initial={{
                    scaleX: 0,
                  }}
                  animate={{
                    scaleX: 1,
                  }}
                  transition={{
                    delay: 0.9,
                    duration: 0.6,
                  }}
                  className="absolute -bottom-2 left-0 -z-10 h-2 w-full origin-left rounded-full bg-green-200"
                />
              </span>
            </motion.h1>

            <motion.p
              initial={{
                opacity: 0,
                y: 25,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.35,
                duration: 0.7,
                ease: easing,
              }}
              className="mt-7 max-w-xl text-lg leading-8 text-gray-600 md:text-xl"
            >
              Create a beautiful digital menu, receive customer orders and
              manage your food business from one simple platform, no website or
              app required.
            </motion.p>

            <motion.div
              initial={{
                opacity: 0,
                y: 25,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.45,
                duration: 0.7,
              }}
              className="mt-9 flex flex-wrap gap-4"
            >
              <motion.div
                whileHover={{
                  y: -3,
                  scale: 1.02,
                }}
                whileTap={{
                  scale: 0.98,
                }}
              >
                <Link
                  href="/register"
                  className="group flex items-center gap-2 rounded-full bg-green-600 px-8 py-4 font-medium text-white shadow-lg shadow-green-600/20 transition-colors hover:bg-green-700"
                >
                  Create My Menu
                  <ArrowRight
                    size={18}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>
              </motion.div>

              <motion.div
                whileHover={{
                  y: -3,
                }}
                whileTap={{
                  scale: 0.98,
                }}
              >
                <a
                  href="#pricing"
                  className="flex items-center rounded-full border border-gray-300 bg-white px-8 py-4 font-medium text-gray-900 transition-colors hover:border-green-500 hover:text-green-700"
                >
                  See Pricing
                </a>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                delay: 0.65,
                duration: 0.7,
              }}
              className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-gray-500"
            >
              <Benefit text="14-day free trial" />
              <Benefit text="No card required" />
              <Benefit text="Everything included" />
            </motion.div>
          </motion.div>

          {/* RIGHT */}

          <motion.div
            initial={{
              opacity: 0,
              x: 70,
              scale: 0.96,
            }}
            animate={{
              opacity: 1,
              x: 0,
              scale: 1,
            }}
            transition={{
              delay: 0.2,
              duration: 0.9,
              ease: easing,
            }}
            className="relative"
          >
            <motion.div
              animate={{
                rotate: [3, 5, 3],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-6 rounded-[40px] bg-green-100/80"
            />

            <motion.div
              whileHover={{
                scale: 1.015,
                rotate: -0.5,
              }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
              className="relative overflow-hidden rounded-[32px] shadow-2xl shadow-black/15"
            >
              <motion.img
                whileHover={{
                  scale: 1.06,
                }}
                transition={{
                  duration: 0.7,
                }}
                src="https://images.unsplash.com/photo-1600891964092-4316c288032e"
                alt="African meals ready to serve"
                className="h-[500px] w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
            </motion.div>

            {/* Order notification */}

            <motion.div
              initial={{
                opacity: 0,
                y: 30,
                scale: 0.9,
              }}
              animate={{
                opacity: 1,
                y: [0, -10, 0],
                scale: 1,
              }}
              transition={{
                opacity: {
                  delay: 0.9,
                  duration: 0.4,
                },
                scale: {
                  delay: 0.9,
                  duration: 0.4,
                },
                y: {
                  delay: 1.3,
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
              className="absolute -bottom-8 -left-3 flex max-w-[280px] items-center gap-4 rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-2xl md:-left-8"
            >
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-600 text-white">
                <MessageCircle size={23} />

                <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-red-500" />
              </div>

              <div>
                <p className="text-[11px] font-semibold tracking-wide text-green-600">
                  NEW ORDER
                </p>

                <p className="mt-0.5 text-sm font-semibold text-gray-900">
                  2 × Jollof Rice
                </p>

                <p className="mt-0.5 text-xs text-gray-500">
                  Just now • WhatsApp
                </p>
              </div>
            </motion.div>

            {/* Order stats */}

            <motion.div
              initial={{
                opacity: 0,
                x: 30,
              }}
              animate={{
                opacity: 1,
                x: 0,
                y: [0, -8, 0],
              }}
              transition={{
                opacity: {
                  delay: 1.1,
                  duration: 0.4,
                },
                x: {
                  delay: 1.1,
                  duration: 0.4,
                },
                y: {
                  delay: 1.5,
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
              className="absolute -right-5 top-14 hidden rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-xl md:block"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag size={17} className="text-green-600" />

                <p className="text-xs text-gray-500">Orders today</p>
              </div>

              <div className="mt-2 flex items-center gap-2">
                <span className="text-xl font-bold text-gray-900">24</span>

                <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-600">
                  <TrendingUp size={12} />
                  18%
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* FEATURES                                                             */}
      {/* ==================================================================== */}

      <motion.section
        initial={{
          opacity: 0,
          y: 60,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        viewport={{
          once: true,
          amount: 0.15,
        }}
        transition={{
          duration: 0.7,
          ease: easing,
        }}
        className="mx-auto max-w-7xl px-6 py-24"
      >
        <SectionHeading
          badge="Everything included"
          title="Everything your food business needs"
          description="One simple subscription gives you all the tools to showcase your menu, receive orders and manage your business."
        />

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          <FeatureCard
            delay={0}
            icon={<UtensilsCrossed size={24} />}
            title="Digital menu"
            description="Show customers your meals, prices, descriptions and photos from any phone."
          />

          <FeatureCard
            delay={0.12}
            icon={<MessageCircle size={24} />}
            title="WhatsApp orders"
            description="Make it easy for customers to move from browsing your menu to placing their order."
          />

          <FeatureCard
            delay={0.24}
            icon={<QrCode size={24} />}
            title="QR ordering"
            description="Put your QR code on tables, flyers, storefronts or packaging so customers can access your menu instantly."
          />
        </div>
      </motion.section>

      {/* ==================================================================== */}
      {/* PRODUCT SHOWCASE                                                     */}
      {/* ==================================================================== */}

      <section className="relative overflow-hidden bg-white py-24 md:py-32">
        <motion.div
          className="pointer-events-none absolute -right-40 top-40 h-[500px] w-[500px] rounded-full bg-green-100/60 blur-3xl"
          animate={{
            x: [0, 25, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-6">
          <motion.div
            initial={{
              opacity: 0,
              y: 35,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.3,
            }}
            transition={{
              duration: 0.7,
            }}
            className="mx-auto max-w-3xl text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
              <Store size={15} />
              Built for you and your customers
            </span>

            <h2 className="mt-5 text-3xl font-bold tracking-tight text-gray-900 md:text-5xl">
              Run your food business from one simple platform
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-gray-600 md:text-lg">
              Bukka gives you the tools to manage your menu, monitor orders,
              understand performance and share your business online from one
              dashboard.
            </p>
          </motion.div>

          {/* Dashboard */}

          <div className="mt-20 grid items-center gap-12 lg:grid-cols-[0.9fr_1.4fr]">
            <motion.div
              initial={{
                opacity: 0,
                x: -50,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
                amount: 0.2,
              }}
              transition={{
                duration: 0.75,
                ease: easing,
              }}
            >
              <span className="text-sm font-semibold uppercase tracking-[0.15em] text-green-600">
                Your Business Dashboard
              </span>

              <h3 className="mt-4 text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
                See what&apos;s happening in your business at a glance.
              </h3>

              <p className="mt-5 text-base leading-7 text-gray-600 md:text-lg">
                Track your orders, monitor revenue, manage menu items and share
                your ordering page without moving between different tools.
              </p>

              <div className="mt-8 space-y-5">
                <ProductPoint
                  icon={<BarChart3 size={20} />}
                  title="Track business performance"
                  description="See revenue, total orders and menu activity from one clear overview."
                />

                <ProductPoint
                  icon={<CheckCircle2 size={20} />}
                  title="Stay on top of every order"
                  description="Monitor pending, completed and cancelled orders from your dashboard."
                />

                <ProductPoint
                  icon={<QrCode size={20} />}
                  title="Share your menu anywhere"
                  description="Use your menu link or QR code across WhatsApp, social media, tables and packaging."
                />
              </div>

              <motion.div
                whileHover={{
                  x: 4,
                }}
                className="mt-8 inline-flex"
              >
                <Link
                  href="/register"
                  className="group inline-flex items-center gap-2 font-semibold text-green-600"
                >
                  Start managing your business
                  <ArrowRight
                    size={17}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{
                opacity: 0,
                x: 60,
                scale: 0.96,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
                scale: 1,
              }}
              viewport={{
                once: true,
                amount: 0.15,
              }}
              transition={{
                duration: 0.85,
                ease: easing,
              }}
              className="relative"
            >
              <div className="absolute inset-8 rounded-[32px] bg-green-100/70 blur-2xl" />

              <motion.div
                whileHover={{
                  y: -5,
                  scale: 1.01,
                }}
                transition={{
                  type: "spring",
                  stiffness: 180,
                  damping: 20,
                }}
                className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl shadow-black/10"
              >
                <Image
                  src="/images/dash.png"
                  alt="Bukka business dashboard showing revenue, orders, menu items and QR code"
                  width={1800}
                  height={1000}
                  className="h-auto w-full"
                />
              </motion.div>

              <motion.div
                animate={{
                  y: [0, -8, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -bottom-5 -left-3 hidden items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-xl md:flex"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
                  <TrendingUp size={19} />
                </div>

                <div>
                  <p className="text-xs text-gray-500">Business overview</p>

                  <p className="text-sm font-semibold text-gray-900">
                    Everything in one place
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Customer experience */}

          <div className="mt-28 grid items-center gap-14 lg:grid-cols-2">
            <motion.div
              initial={{
                opacity: 0,
                x: -60,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
                amount: 0.2,
              }}
              transition={{
                duration: 0.8,
                ease: easing,
              }}
              className="relative flex justify-center lg:justify-start"
            >
              <div className="absolute left-1/2 top-1/2 h-[430px] w-[430px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-100/80 blur-3xl" />

              <motion.div
                animate={{
                  y: [0, -9, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative w-[270px] sm:w-[300px]"
              >
                <div className="overflow-hidden rounded-[34px] border-[7px] border-gray-900 bg-white shadow-2xl shadow-black/20">
                  <Image
                    src="/images/phone.png"
                    alt="Bukka mobile customer menu"
                    width={500}
                    height={1100}
                    className="h-auto w-full"
                  />
                </div>

                <motion.div
                  initial={{
                    opacity: 0,
                    scale: 0.85,
                  }}
                  whileInView={{
                    opacity: 1,
                    scale: 1,
                  }}
                  viewport={{
                    once: true,
                  }}
                  transition={{
                    delay: 0.5,
                  }}
                  animate={{
                    y: [0, -6, 0],
                  }}
                  className="absolute -right-16 top-[38%] hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-xl sm:block"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-white">
                      <MessageCircle size={18} />
                    </div>

                    <div>
                      <p className="text-xs font-medium text-green-600">
                        READY TO ORDER
                      </p>

                      <p className="mt-1 text-sm font-semibold text-gray-900">
                        One tap away
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{
                opacity: 0,
                x: 50,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
                amount: 0.2,
              }}
              transition={{
                duration: 0.75,
                ease: easing,
              }}
            >
              <span className="text-sm font-semibold uppercase tracking-[0.15em] text-green-600">
                Customer Experience
              </span>

              <h3 className="mt-4 text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
                Give customers a menu that makes ordering easy.
              </h3>

              <p className="mt-5 text-base leading-7 text-gray-600 md:text-lg">
                Customers get a clean, mobile-friendly menu built around your
                business. They can see your meals, prices, descriptions and
                availability without downloading another app.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <MiniFeature
                  icon={<Smartphone size={19} />}
                  title="Mobile first"
                  description="Designed to work beautifully on the phones your customers already use."
                />

                <MiniFeature
                  icon={<UtensilsCrossed size={19} />}
                  title="Beautiful menus"
                  description="Present meals clearly with photos, descriptions and prices."
                />

                <MiniFeature
                  icon={<MessageCircle size={19} />}
                  title="Easy ordering"
                  description="Move customers from browsing to placing an order without unnecessary steps."
                />

                <MiniFeature
                  icon={<QrCode size={19} />}
                  title="Scan and order"
                  description="Turn tables, flyers, packaging and storefronts into ordering points."
                />
              </div>

              <motion.div
                whileHover={{
                  y: -3,
                }}
                whileTap={{
                  scale: 0.98,
                }}
                className="mt-9 inline-block"
              >
                <Link
                  href="/register"
                  className="group inline-flex items-center gap-2 rounded-full bg-green-600 px-7 py-4 font-medium text-white shadow-lg shadow-green-600/20 transition-colors hover:bg-green-700"
                >
                  Create your digital menu
                  <ArrowRight
                    size={18}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* HOW IT WORKS                                                         */}
      {/* ==================================================================== */}

      <section className="relative overflow-hidden bg-white py-24">
        <div className="pointer-events-none absolute -right-32 top-0 h-[420px] w-[420px] rounded-full bg-green-50 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6">
          <motion.div
            initial={{
              opacity: 0,
              y: 35,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 0.65,
              ease: easing,
            }}
          >
            <SectionHeading
              badge="Simple setup"
              title="Get your menu online in minutes"
              description="No technical skills. No website. Just create, share and start receiving orders."
            />
          </motion.div>

          <div className="relative mt-16 grid gap-12 md:grid-cols-3">
            <div className="absolute left-[16%] right-[16%] top-6 hidden h-px bg-green-100 md:block" />

            <Step
              number={1}
              delay={0}
              title="Build your menu"
              description="Add your meals, prices, descriptions and photos."
            />

            <Step
              number={2}
              delay={0.15}
              title="Share your link or QR"
              description="Share it on WhatsApp, Instagram, your storefront, tables or packaging."
            />

            <Step
              number={3}
              delay={0.3}
              title="Receive orders"
              description="Customers browse your menu and move directly into ordering."
            />
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* PRICING                                                              */}
      {/* ==================================================================== */}

      <motion.section
        id="pricing"
        initial={{
          opacity: 0,
          y: 50,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        viewport={{
          once: true,
          amount: 0.1,
        }}
        transition={{
          duration: 0.7,
          ease: easing,
        }}
        className="mx-auto max-w-7xl px-6 py-24"
      >
        <SectionHeading
          badge="Simple pricing"
          title="One subscription. Everything included."
          description="Start free for 14 days, then choose the billing period that works best for your business."
        />

        {/* Trial notice */}

        <div className="mt-7 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-green-100 bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
            <Sparkles size={15} />
            14-day free trial • No card required
          </div>
        </div>

        {/* Pricing cards */}

        <div className="mt-14 grid items-stretch gap-6 md:grid-cols-3">
          {PLAN_ORDER.map((key, index) => (
            <motion.div
              key={key}
              initial={{
                opacity: 0,
                y: 50,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
                amount: 0.15,
              }}
              transition={{
                delay: index * 0.12,
                duration: 0.6,
                ease: easing,
              }}
            >
              <PlanCard planKey={key} />
            </motion.div>
          ))}
        </div>

        {/* Shared features */}

        <div className="mx-auto mt-14 max-w-3xl rounded-3xl border border-green-100 bg-white p-7 shadow-sm md:p-9">
          <div className="text-center">
            <span className="text-sm font-semibold uppercase tracking-[0.12em] text-green-600">
              Included with every subscription
            </span>

            <h3 className="mt-2 text-2xl font-bold text-gray-900">
              Everything you need to run your Bukka menu
            </h3>
          </div>

          <div className="mt-7 grid gap-x-10 gap-y-4 sm:grid-cols-2">
            {SUBSCRIPTION_FEATURES.map((feature) => (
              <div key={feature} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-50">
                  <Check size={14} strokeWidth={3} className="text-green-600" />
                </div>

                <span className="text-sm leading-6 text-gray-600">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ==================================================================== */}
      {/* TESTIMONIAL                                                          */}
      {/* ==================================================================== */}

      <motion.section
        initial={{
          opacity: 0,
        }}
        whileInView={{
          opacity: 1,
        }}
        viewport={{
          once: true,
          amount: 0.25,
        }}
        transition={{
          duration: 0.8,
        }}
        className="relative overflow-hidden bg-green-50/70 py-24"
      >
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.9,
          }}
          whileInView={{
            opacity: 1,
            scale: 1,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.7,
            ease: easing,
          }}
          className="relative mx-auto max-w-3xl px-6 text-center"
        >
          <div className="mb-7 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-600 text-white shadow-lg shadow-green-600/20">
              <MessageCircle size={25} />
            </div>
          </div>

          <p className="text-2xl font-medium leading-snug text-gray-900 md:text-3xl">
            “Our customers used to call in orders one by one. Now they scan the
            code and the order goes straight to WhatsApp.”
          </p>

          <p className="mt-6 text-gray-600">Food business owner</p>
        </motion.div>
      </motion.section>

      {/* ==================================================================== */}
      {/* FAQ                                                                  */}
      {/* ==================================================================== */}

      <motion.section
        initial={{
          opacity: 0,
          y: 50,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        viewport={{
          once: true,
          amount: 0.15,
        }}
        transition={{
          duration: 0.7,
          ease: easing,
        }}
        className="mx-auto max-w-3xl px-6 py-24"
      >
        <SectionHeading
          badge="Need help?"
          title="Questions, answered"
          description="Everything you need to know before putting your menu online."
        />

        <div className="mt-12 divide-y divide-gray-200 border-y border-gray-200">
          {faqs.map((item, index) => {
            const isOpen = openFaq === index;

            return (
              <div key={item.q} className="py-5">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="group flex w-full items-center justify-between gap-5 text-left"
                >
                  <span
                    className={`font-medium transition-colors ${
                      isOpen
                        ? "text-green-600"
                        : "text-gray-900 group-hover:text-green-600"
                    }`}
                  >
                    {item.q}
                  </span>

                  <motion.span
                    animate={{
                      rotate: isOpen ? 180 : 0,
                    }}
                    transition={{
                      duration: 0.25,
                    }}
                    className="shrink-0"
                  >
                    <ChevronDown
                      size={20}
                      className={isOpen ? "text-green-600" : "text-gray-400"}
                    />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{
                        height: 0,
                        opacity: 0,
                      }}
                      animate={{
                        height: "auto",
                        opacity: 1,
                      }}
                      exit={{
                        height: 0,
                        opacity: 0,
                      }}
                      transition={{
                        height: {
                          duration: 0.3,
                        },
                        opacity: {
                          duration: 0.2,
                        },
                      }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-2xl pt-3 leading-7 text-gray-600">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </motion.section>

      {/* ==================================================================== */}
      {/* FINAL CTA                                                            */}
      {/* ==================================================================== */}

      <section className="relative overflow-hidden bg-[#0F3D2E] py-24">
        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -right-20 -top-32 h-96 w-96 rounded-full bg-green-500/20 blur-3xl"
        />

        <motion.div
          animate={{
            x: [0, -25, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-green-300/10 blur-3xl"
        />

        <motion.div
          initial={{
            opacity: 0,
            y: 50,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.3,
          }}
          transition={{
            duration: 0.7,
            ease: easing,
          }}
          className="relative mx-auto max-w-3xl px-6 text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-green-100">
            <Sparkles size={15} />
            Start selling smarter
          </div>

          <h2 className="mt-6 text-3xl font-bold leading-tight text-white md:text-5xl">
            Your next customer could be ordering in minutes.
          </h2>

          <p className="mt-5 text-lg text-white/70">
            Create your digital menu, share your link and start receiving orders
            today.
          </p>

          <motion.div
            whileHover={{
              y: -4,
              scale: 1.03,
            }}
            whileTap={{
              scale: 0.98,
            }}
            className="mt-9 inline-block"
          >
            <Link
              href="/register"
              className="group inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 font-medium text-gray-900 shadow-xl"
            >
              Start My Free Trial
              <ArrowRight
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </motion.div>

          <p className="mt-5 text-sm text-white/50">
            14-day free trial • No card required • Full access
          </p>
        </motion.div>
      </section>

      {/* ==================================================================== */}
      {/* FOOTER                                                               */}
      {/* ==================================================================== */}

      <footer className="border-t border-gray-200 bg-[#fffdf7]">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <span className="text-lg font-bold text-gray-900">Bukka</span>

            <p className="mt-3 max-w-[220px] text-sm leading-6 text-gray-500">
              Digital menus and ordering tools for modern food businesses.
            </p>
          </div>

          <FooterColumn
            title="Product"
            links={[
              {
                label: "Pricing",
                href: "#pricing",
              },
              {
                label: "Create my menu",
                href: "/register",
              },
              {
                label: "Log in",
                href: "/login",
              },
            ]}
          />

          <FooterColumn
            title="Company"
            links={[
              {
                label: "About",
                href: "#",
              },
              {
                label: "Contact",
                href: "#",
              },
            ]}
          />

          <FooterColumn
            title="Legal"
            links={[
              {
                label: "Privacy policy",
                href: "#",
              },
              {
                label: "Terms of service",
                href: "#",
              },
            ]}
          />
        </div>

        <div className="border-t border-gray-200 py-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Bukka. All rights reserved.
        </div>
      </footer>
    </main>
  );
}

/* ========================================================================== */
/* SMALL COMPONENTS                                                           */
/* ========================================================================== */

function ProductPoint({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
        {icon}
      </div>

      <div>
        <h4 className="font-semibold text-gray-900">{title}</h4>

        <p className="mt-1 text-sm leading-6 text-gray-600">{description}</p>
      </div>
    </div>
  );
}

function MiniFeature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      whileHover={{
        y: -4,
      }}
      transition={{
        type: "spring",
        stiffness: 250,
        damping: 20,
      }}
      className="rounded-2xl border border-gray-100 bg-[#fffdf7] p-5"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
        {icon}
      </div>

      <h4 className="mt-4 font-semibold text-gray-900">{title}</h4>

      <p className="mt-2 text-sm leading-6 text-gray-600">{description}</p>
    </motion.div>
  );
}

function Benefit({ text }: { text: string }) {
  return (
    <span className="flex items-center gap-2">
      <BadgeCheck size={17} className="text-green-600" />

      {text}
    </span>
  );
}

function SectionHeading({
  badge,
  title,
  description,
}: {
  badge: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
        <Sparkles size={14} />
        {badge}
      </div>

      <h2 className="mt-5 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
        {title}
      </h2>

      <p className="mx-auto mt-4 max-w-xl leading-7 text-gray-600">
        {description}
      </p>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 45,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.2,
      }}
      transition={{
        delay,
        duration: 0.55,
        ease: easing,
      }}
      whileHover={{
        y: -10,
      }}
      className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-green-900/5"
    >
      <motion.div
        className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-green-50"
        whileHover={{
          scale: 3,
        }}
        transition={{
          duration: 0.5,
        }}
      />

      <div className="relative">
        <motion.div
          whileHover={{
            rotate: 5,
            scale: 1.1,
          }}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-600 transition-colors duration-300 group-hover:bg-green-600 group-hover:text-white"
        >
          {icon}
        </motion.div>

        <h3 className="mt-5 text-xl font-bold text-gray-900">{title}</h3>

        <p className="mt-3 leading-7 text-gray-600">{description}</p>
      </div>
    </motion.div>
  );
}

function Step({
  number,
  title,
  description,
  delay,
}: {
  number: number;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 45,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.3,
      }}
      transition={{
        delay,
        duration: 0.6,
        ease: easing,
      }}
      className="group relative text-center md:text-left"
    >
      <motion.div
        whileHover={{
          scale: 1.12,
          rotate: 4,
        }}
        className="relative z-10 mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-600 font-bold text-white shadow-lg shadow-green-600/20 md:mx-0"
      >
        {number}
      </motion.div>

      <h3 className="mt-5 text-xl font-bold text-gray-900 transition-colors group-hover:text-green-600">
        {title}
      </h3>

      <p className="mt-2 leading-7 text-gray-600">{description}</p>
    </motion.div>
  );
}

/* ========================================================================== */
/* PRICING CARD                                                               */
/* ========================================================================== */

function PlanCard({ planKey }: { planKey: BillingPeriod }) {
  const plan = SUBSCRIPTION_PLANS[planKey];

  const periodLabel =
    planKey === "monthly"
      ? "/ month"
      : planKey === "half_year"
        ? "/ 6 months"
        : "/ year";

  const saving =
    planKey === "half_year"
      ? 2000 * 6 - plan.price
      : planKey === "annual"
        ? 2000 * 12 - plan.price
        : 0;

  return (
    <motion.div
      whileHover={{
        y: -10,
      }}
      transition={{
        type: "spring",
        stiffness: 250,
        damping: 20,
      }}
      className={`flex h-full flex-col rounded-3xl bg-white p-8 ${
        plan.popular
          ? "shadow-xl ring-2 ring-green-600 md:-translate-y-3"
          : "border border-gray-100 shadow"
      }`}
    >
      <div className="min-h-[32px]">
        {plan.badge && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
            <Sparkles size={12} />
            {plan.badge}
          </span>
        )}
      </div>

      <h3 className="mt-4 text-xl font-bold text-gray-900">{plan.name}</h3>

      <p className="mt-2 min-h-[48px] text-sm leading-6 text-gray-600">
        {plan.description}
      </p>

      <div className="mt-6 flex flex-wrap items-baseline gap-1">
        <span className="text-4xl font-bold text-gray-900">
          ₦{plan.price.toLocaleString()}
        </span>

        <span className="text-gray-500">{periodLabel}</span>
      </div>

      <div className="mt-2 min-h-[24px]">
        {saving > 0 ? (
          <p className="text-sm font-medium text-green-600">
            Save ₦{saving.toLocaleString()}
          </p>
        ) : (
          <p className="text-sm text-gray-400">Pay as you go</p>
        )}
      </div>

      <div className="mt-6 border-t border-gray-100 pt-6">
        <div className="flex items-start gap-2.5">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-green-600" />

          <p className="text-sm leading-6 text-gray-600">
            Full access to all Bukka features
          </p>
        </div>
      </div>

      <motion.div
        whileTap={{
          scale: 0.98,
        }}
        className="mt-auto pt-8"
      >
        <Link
          href={`/register?billing=${planKey}`}
          className={`block rounded-full py-3.5 text-center font-medium transition-colors ${
            plan.popular
              ? "bg-green-600 text-white shadow-lg shadow-green-600/20 hover:bg-green-700"
              : "border border-gray-300 text-gray-900 hover:border-green-600 hover:text-green-600"
          }`}
        >
          Start 14-day free trial
        </Link>
      </motion.div>
    </motion.div>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: {
    label: string;
    href: string;
  }[];
}) {
  return (
    <div>
      <h4 className="font-medium text-gray-900">{title}</h4>

      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-sm text-gray-500 transition-colors hover:text-green-600"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
