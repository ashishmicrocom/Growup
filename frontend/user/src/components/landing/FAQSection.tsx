import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type FAQItem = {
  question: string;
  answer: string;
};

const faqsLeft: FAQItem[] = [
  {
    question: 'Is there any joining fee?',
    answer: 'No, joining Flourisel India is completely FREE. We don\'t charge any registration fee, training fee, or hidden charges. You can start earning immediately after signup.',
  },
  {
    question: 'Do I need GST registration?',
    answer: 'No, you don\'t need GST registration to start. We handle all the invoicing and GST compliance. Your customers receive proper GST invoices directly from us.',
  },
  {
    question: 'How much can I earn?',
    answer: 'Your earnings depend entirely on your sales. Commission ranges from ₹50 to ₹500 per product. Active resellers typically earn ₹10,000 to ₹50,000+ monthly. However, we don\'t guarantee any fixed income.',
  },
  {
    question: 'When and how do I get paid?',
    answer: 'Earnings are credited to your wallet instantly after order delivery. You can withdraw to your bank account anytime - no minimum threshold, no waiting period.',
  },
  {
    question: 'Do I need to keep inventory?',
    answer: 'Absolutely not! We handle all inventory, packing, and shipping. You just share product links with customers. When they order, we deliver directly to them.',
  },
];

const faqsRight: FAQItem[] = [
  {
    question: 'What if a customer returns a product?',
    answer: 'We have a hassle-free return policy. If a customer returns a product, the commission for that order is adjusted. We handle all return logistics.',
  },
  {
    question: 'Is this a legal business?',
    answer: 'Yes, Flourisel India is a legally registered company, recognized by Startup India (DPIIT) and iStart Rajasthan. All transactions are invoice-based and GST compliant.',
  },
  {
    question: 'Is this MLM or pyramid scheme?',
    answer: 'No, we are NOT an MLM or pyramid scheme. Your primary income is from product sales, not from recruiting people. Team building is optional and provides only small bonuses on your team\'s sales.',
  },
  {
    question: 'What products can I sell?',
    answer: 'You can sell a wide range of products including sarees, suits, bedsheets, and daily-use items. All products are quality-checked and come with proper invoices.',
  },
  {
    question: 'How do I get started?',
    answer: 'Simply register on our platform for free, complete your profile, and start sharing product links. We provide complete training and support to help you succeed.',
  },
];

export const FAQSection = () => {
  return (
    <section className={cn("w-full max-w-5xl mx-auto py-16 px-4")}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10"
      >
        <p className="text-sm text-muted-foreground font-medium tracking-wide mb-2 bg-secondary px-4 py-1.5 rounded-full w-fit mx-auto">
          Frequently Asked Questions
        </p>
        <h2 className="text-3xl md:text-4xl font-semibold mb-3">
          Product & Account Help
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto mb-6">
          Get instant answers to the most common questions about your account, product setup, and earning opportunities with Flourisel India.
        </p>
        <Link to="/contact">
          <Button variant="default" className="rounded-full">
            Browse All FAQs →
          </Button>
        </Link>
      </motion.div>

      {/* FAQs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left"
      >
        {[faqsLeft, faqsRight].map((faqColumn, columnIndex) => (
          <Accordion
            key={columnIndex}
            type="single"
            collapsible
            className="space-y-4"
          >
            {faqColumn.map((faq, i) => (
              <AccordionItem key={i} value={`item-${columnIndex}-${i}`}>
                <AccordionTrigger className="text-base font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  <div className="min-h-[40px] transition-all duration-200 ease-in-out">
                    {faq.answer}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ))}
      </motion.div>
    </section>
  );
};
