import { FaChevronUp, FaChevronDown } from "react-icons/fa";

const faqs = [
  {
    question: "How do I update my billing information?",
    answer:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec ante vitae purus tempus egestas. Curabitur euismod purus sed elit faucibus. Vivamus in ante sed libero feugiat fermentum.",
    isOpen: true, // Item pertama dibuat terbuka
  },
  {
    question: "How do I update my billing information?",
    answer: "",
    isOpen: false,
  },
  {
    question: "How do I update my billing information?",
    answer: "",
    isOpen: false,
  },
  {
    question: "How do I update my billing information?",
    answer: "",
    isOpen: false,
  },
];

export default function Faq() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl mb-12">
          Frequently Asked Questions
        </h2>
        <div className="divide-y divide-white/20">
          {faqs.map((faq, index) => (
            <div key={index} className="py-6">
              <div className="flex w-full items-center justify-between text-left">
                <h3
                  className={`text-lg font-semibold leading-7 ${
                    faq.isOpen ? "text-indigo-400" : "text-white"
                  }`}
                >
                  {faq.question}
                </h3>
                {faq.isOpen ? (
                  <FaChevronUp className="h-5 w-5 text-indigo-400" />
                ) : (
                  <FaChevronDown className="h-5 w-5 text-white" />
                )}
              </div>
              {faq.isOpen && (
                <div className="mt-4 pr-12">
                  <p className="text-base leading-7 text-gray-300">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
