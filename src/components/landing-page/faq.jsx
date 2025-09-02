"use client";

import { useState } from "react";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";

const faqs = [
  {
    question: "What is a digital membercard?",
    answer:
      "A digital membercard is a secure, virtual version of a traditional loyalty or membership card. It allows you to collect points, access exclusive rewards, and manage your membership easily from your smartphone or device—no physical card required! Enjoy seamless transactions, instant updates, and enhanced security with our digital membercard platform.",
  },
  {
    question: "How do I update my billing information?",
    answer:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec ante vitae purus tempus egestas. Curabitur euismod purus sed elit faucibus. Vivamus in ante sed libero feugiat fermentum.",
  },
  {
    question: "How can I change my password?",
    answer:
      "You can change your password from your account settings page. Look for the 'Security' tab and you will find the option to update your password.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards, PayPal, and direct bank transfers. All transactions are secure and encrypted.",
  },
  {
    question: "Is there a free trial available?",
    answer:
      "Yes, we offer a 14-day free trial for all new users. You can explore all our features without any commitment. No credit card is required to start.",
  },
];

export default function Faq() {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleToggle = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="py-16 md:py-24 lg:py-28 bg-transparent">
      <div className="mx-auto max-w-3xl px-4 md:px-8 lg:px-12">
        <h2 className="text-center text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-14 drop-shadow-lg animate-fade-in-up">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6 animate-fade-in-delay">
          {faqs.map((faq, index) => {
            const isOpen = activeIndex === index;
            return (
              <div
                key={index}
                className={`transition-all duration-300 bg-white/5 rounded-2xl shadow-lg overflow-hidden border border-indigo-400/20 ${
                  isOpen ? "ring-2 ring-indigo-400/40" : ""
                }`}
              >
                <button
                  onClick={() => handleToggle(index)}
                  className="flex w-full items-center justify-between px-6 py-6 text-left focus:outline-none group"
                >
                  <h3
                    className={`text-lg sm:text-xl font-semibold leading-7 transition-colors duration-200 ${
                      isOpen ? "text-indigo-400" : "text-white"
                    } group-hover:text-indigo-300`}
                  >
                    {faq.question}
                  </h3>
                  <span className="ml-4 flex-shrink-0">
                    {isOpen ? (
                      <FaChevronUp className="h-5 w-5 text-indigo-400 transition-transform duration-300 rotate-180" />
                    ) : (
                      <FaChevronDown className="h-5 w-5 text-white group-hover:text-indigo-300 transition-colors duration-200" />
                    )}
                  </span>
                </button>
                <div
                  className={`transition-all duration-300 px-6 ${
                    isOpen
                      ? "max-h-40 py-2 opacity-100"
                      : "max-h-0 py-0 opacity-0"
                  } overflow-hidden`}
                  style={{ pointerEvents: isOpen ? "auto" : "none" }}
                >
                  <p className="text-base leading-7 text-indigo-100">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
