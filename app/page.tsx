"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";

type Plan = {
  name: string;
  description: string;
  monthly: number;
  yearly: number;
  popular?: boolean;
  features: string[];
};

const plans: Plan[] = [
  {
    name: "Starter",
    description: "For new food businesses just getting online.",
    monthly: 5000,
    yearly: 4000,
    features: [
      "Digital menu with photos & prices",
      "Shareable menu link + QR code",
      "Up to 30 menu items",
      "WhatsApp orders",
    ],
  },
  {
    name: "Growth",
    description: "For businesses ready to take more orders.",
    monthly: 12000,
    yearly: 9600,
    popular: true,
    features: [
      "Everything in Starter",
      "Unlimited menu items",
      "Order analytics & history",
      "Custom menu domain",
      "Priority WhatsApp support",
    ],
  },
  {
    name: "Business",
    description: "For multi-location restaurants and chains.",
    monthly: 25000,
    yearly: 20000,
    features: [
      "Everything in Growth",
      "Up to 5 outlets",
      "Staff accounts & roles",
      "Dedicated onboarding",
    ],
  },
];

const faqs = [
  {
    q: "Do I need a website or app already?",
    a: "No. Bukka gives you a digital menu and ordering page out of the box — just share the link or print the QR code.",
  },
  {
    q: "How do orders reach me?",
    a: "Customers place an order on your menu page and it lands straight in your WhatsApp, ready to confirm.",
  },
  {
    q: "Can I change plans later?",
    a: "Yes, upgrade or downgrade anytime from your dashboard. Changes apply from your next billing date.",
  },
  {
    q: "Is there a free trial?",
    a: "Every plan starts with a 14-day free trial. No card required to get your menu online.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes, there's no lock-in contract. Cancel from your account settings whenever you like.",
  },
];

export default function Home() {
  const [yearly, setYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <main className="min-h-screen bg-[#fffdf7]">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full bg-green-200/40 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight text-gray-900">
              Turn your food business
              <span className="text-green-600"> online</span>
            </h1>

            <p className="mt-6 text-lg text-gray-600 max-w-md">
              Give your customers a beautiful digital menu, receive WhatsApp
              orders and grow your food business — no app or website needed.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/signup"
                className="bg-green-600 text-white px-7 py-4 rounded-full font-medium hover:bg-green-700 transition"
              >
                Create My Menu
              </Link>

              <a
                href="#pricing"
                className="border border-gray-300 px-7 py-4 rounded-full font-medium text-gray-900 hover:border-gray-400 transition"
              >
                See Pricing
              </a>
            </div>

            <p className="mt-6 text-sm text-gray-500">
              14-day free trial · No card required
            </p>
          </div>

          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1600891964092-4316c288032e"
                alt="A spread of African food, plated and ready to serve"
                className="w-full h-[500px] object-cover"
              />
            </div>

            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 max-w-[220px]">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-600" />
              </span>
              <p className="text-sm text-gray-700">
                New order received on WhatsApp
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900">
          Everything your food business needs
        </h2>
        <p className="mt-3 text-center text-gray-600 max-w-md mx-auto">
          One simple tool to show off your menu and keep the orders coming in.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <FeatureCard
            icon={<MenuIcon />}
            title="Digital menu"
            description="Customers see your meals, prices and photos anytime, from any phone."
          />
          <FeatureCard
            icon={<ChatIcon />}
            title="WhatsApp orders"
            description="Receive orders directly in the app your customers already use daily."
          />
          <FeatureCard
            icon={<QrIcon />}
            title="QR ordering"
            description="Print a code for your table or storefront — customers scan and order in seconds."
          />
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900">
            Live in three steps
          </h2>

          <div className="grid md:grid-cols-3 gap-10 mt-14">
            <Step
              number={1}
              title="Build your menu"
              description="Add your meals, prices and photos — takes about ten minutes."
            />
            <Step
              number={2}
              title="Share your link or QR"
              description="Put it on Instagram, your storefront, or your delivery packs."
            />
            <Step
              number={3}
              title="Get paid, take orders"
              description="Orders land in your WhatsApp, ready to confirm and prepare."
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900">
          Simple, honest pricing
        </h2>
        <p className="mt-3 text-center text-gray-600 max-w-md mx-auto">
          Start free for 14 days. Pick a plan that fits your business, and
          change it anytime.
        </p>

        <div className="mt-10 flex items-center justify-center gap-3">
          <span
            className={`text-sm font-medium ${
              !yearly ? "text-gray-900" : "text-gray-500"
            }`}
          >
            Monthly
          </span>
          <button
            role="switch"
            aria-checked={yearly}
            aria-label="Toggle yearly billing"
            onClick={() => setYearly((v) => !v)}
            className="relative w-12 h-7 rounded-full bg-green-600 transition"
          >
            <span
              className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                yearly ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
          <span
            className={`text-sm font-medium ${
              yearly ? "text-gray-900" : "text-gray-500"
            }`}
          >
            Yearly
          </span>
          <span className="text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
            Save 20%
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-12 items-start">
          {plans.map((plan) => (
            <PlanCard key={plan.name} plan={plan} yearly={yearly} />
          ))}
        </div>
      </section>

      {/* Testimonial */}
      <section className="bg-green-50/60 py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-2xl md:text-3xl font-medium text-gray-900 leading-snug">
            “Our customers used to call in orders one by one. Now they scan the
            code on the table and it goes straight to our WhatsApp. We turn
            tables faster and never miss an order.”
          </p>
          <p className="mt-6 text-gray-600">
            Amaka Chukwu, Owner of Amaka&rsquo;s Kitchen
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900">
          Questions, answered
        </h2>

        <div className="mt-10 divide-y divide-gray-200">
          {faqs.map((item, i) => (
            <div key={item.q} className="py-5">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                aria-expanded={openFaq === i}
                className="w-full flex items-center justify-between text-left"
              >
                <span className="font-medium text-gray-900">{item.q}</span>
                <PlusIcon
                  className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${
                    openFaq === i ? "rotate-45" : ""
                  }`}
                />
              </button>
              {openFaq === i && <p className="mt-3 text-gray-600">{item.a}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#0F3D2E] py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Ready to take your food business online?
          </h2>
          <p className="mt-4 text-white/70">
            Set up your menu today and start your 14-day free trial.
          </p>
          <Link
            href="/signup"
            className="inline-block mt-8 bg-white text-gray-900 px-8 py-4 rounded-full font-medium hover:bg-white/90 transition"
          >
            Create My Menu
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-12 grid sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <span className="font-bold text-lg text-gray-900">Bukka</span>
            <p className="mt-3 text-sm text-gray-500 max-w-[200px]">
              Digital menus and WhatsApp ordering for food businesses.
            </p>
          </div>

          <FooterColumn
            title="Product"
            links={[
              { label: "Pricing", href: "#pricing" },
              { label: "Create my menu", href: "/signup" },
              { label: "Log in", href: "/login" },
            ]}
          />
          <FooterColumn
            title="Company"
            links={[
              { label: "About", href: "#" },
              { label: "Contact", href: "#" },
            ]}
          />
          <FooterColumn
            title="Legal"
            links={[
              { label: "Privacy policy", href: "#" },
              { label: "Terms of service", href: "#" },
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

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white p-8 rounded-3xl shadow hover:shadow-md transition">
      <div className="w-11 h-11 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="font-bold text-xl mt-5 text-gray-900">{title}</h3>
      <p className="mt-3 text-gray-600">{description}</p>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center md:text-left">
      <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold mx-auto md:mx-0">
        {number}
      </div>
      <h3 className="font-bold text-xl mt-4 text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-600">{description}</p>
    </div>
  );
}

function PlanCard({ plan, yearly }: { plan: Plan; yearly: boolean }) {
  const price = yearly ? plan.yearly : plan.monthly;

  return (
    <div
      className={`rounded-3xl p-8 bg-white flex flex-col ${
        plan.popular
          ? "shadow-xl ring-2 ring-green-600 md:-translate-y-3"
          : "shadow"
      }`}
    >
      {plan.popular && (
        <span className="self-start mb-4 text-xs font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full">
          Most popular
        </span>
      )}

      <h3 className="font-bold text-xl text-gray-900">{plan.name}</h3>
      <p className="mt-2 text-gray-600 text-sm">{plan.description}</p>

      <div className="mt-6 flex items-baseline gap-1">
        <span className="text-4xl font-bold text-gray-900">
          &#8358;{price.toLocaleString()}
        </span>
        <span className="text-gray-500">/mo</span>
      </div>
      {yearly && (
        <p className="mt-1 text-sm text-gray-500">
          Billed &#8358;{(price * 12).toLocaleString()} yearly
        </p>
      )}

      <Link
        href={`/signup?plan=${plan.name.toLowerCase()}`}
        className={`mt-6 text-center py-3 rounded-full font-medium transition ${
          plan.popular
            ? "bg-green-600 text-white hover:bg-green-700"
            : "border border-gray-300 text-gray-900 hover:border-gray-400"
        }`}
      >
        Start free trial
      </Link>

      <ul className="mt-8 space-y-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5">
            <CheckIcon className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <span className="text-gray-600 text-sm">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="font-medium text-gray-900">{title}</h4>
      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-sm text-gray-500 hover:text-gray-900 transition"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 010 1.4l-7 7a1 1 0 01-1.4 0l-3-3a1 1 0 111.4-1.4l2.3 2.3 6.3-6.3a1 1 0 011.4 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className={className}
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="w-6 h-6"
    >
      <path
        d="M5 4v16M5 4h9a3 3 0 010 6H5M19 4v16"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="w-6 h-6"
    >
      <path
        d="M21 11.5a8.4 8.4 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.4 8.4 0 01-3.8-.9L3 20l1-5.7a8.4 8.4 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.4 8.4 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function QrIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="w-6 h-6"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M14 14h3v3h-3zM19 14h2v2h-2zM14 19h2v2h-2zM19 19h2v2h-2z" />
    </svg>
  );
}
