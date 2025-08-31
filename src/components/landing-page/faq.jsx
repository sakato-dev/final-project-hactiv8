"use client";

import { useState } from "react";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";

const faqs = [
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
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl mb-12">
          Frequently Asked Questions
        </h2>
        <div className="divide-y divide-white/20">
          {faqs.map((faq, index) => {
            const isOpen = activeIndex === index;

            return (
              <div key={index} className="py-6">
                <button
                  onClick={() => handleToggle(index)}
                  className="flex w-full items-center justify-between text-left focus:outline-none"
                >
                  <h3
                    className={`text-lg font-semibold leading-7 transition-colors ${
                      isOpen ? "text-indigo-400" : "text-white"
                    }`}
                  >
                    {faq.question}
                  </h3>
                  {isOpen ? (
                    <FaChevronUp className="h-5 w-5 text-indigo-400" />
                  ) : (
                    <FaChevronDown className="h-5 w-5 text-white" />
                  )}
                </button>

                {isOpen && (
                  <div className="mt-4 pr-12">
                    <p className="text-base leading-7 text-gray-300">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
