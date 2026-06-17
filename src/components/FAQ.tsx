'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    id: 1,
    question: 'What is Drivly?',
    answer: 'Drivly is a trusted community-based vehicle sharing platform. It allows residents in residential societies or close-knit neighborhoods to rent out their idle cars, bikes, or scooters to verified neighbors who need temporary transportation.',
  },
  {
    id: 2,
    question: 'How are users verified?',
    answer: 'Safety and trust are our highest priorities. All users (both owners and renters) must complete a comprehensive onboarding check, including government ID verification, driving license authentication, and proof of residence inside the participating society.',
  },
  {
    id: 3,
    question: 'How is vehicle insurance and safety handled?',
    answer: 'We are partner-building comprehensive rental insurance packages that cover the vehicle during active bookings. Furthermore, vehicles can only be rented to verified members of your own society, ensuring local accountability and care.',
  },
  {
    id: 4,
    question: 'How much money can I make as an owner?',
    answer: 'Your earnings depend on your vehicle type, brand, and availability. Society owners can earn anywhere between ₹3,000 to ₹15,000+ per month by sharing their cars or bikes during hours or days they don\'t use them.',
  },
  {
    id: 5,
    question: 'How does joining the waitlist help?',
    answer: 'We launch Drivly society by society based on local demand. Joining the waitlist raises your society\'s priority score. Once we get 10-15 sign-ups in your society, we will initiate setup and verification for your community.',
  },
];

export default function FAQ() {
  const [openId, setOpenId] = useState<number | null>(null);

  const toggleFAQ = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="w-full py-24 px-4 sm:px-6 lg:px-8 bg-white scroll-reveal">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="border border-zinc-200 bg-white rounded-2xl overflow-hidden transition-all duration-200 hover:border-zinc-300 shadow-sm"
              >
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between p-6 text-left text-zinc-800 font-semibold hover:text-zinc-950 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-zinc-950/20 focus:bg-zinc-50/50"
                >
                  <span className="pr-4 text-sm sm:text-base">{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 transition-transform duration-300 flex-shrink-0 ${
                      isOpen ? 'transform rotate-180 text-zinc-800' : ''
                    }`}
                  />
                </button>
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="px-6 pb-6 pt-5 text-zinc-600 border-t border-zinc-100 text-xs sm:text-sm leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
