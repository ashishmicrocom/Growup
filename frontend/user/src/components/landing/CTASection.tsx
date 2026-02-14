import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const CTASection = () => {
  return (
    <section className="py-4 md:py-12 hero-gradient relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-48 h-48 bg-secondary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-primary-foreground/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-secondary/20 flex items-center justify-center"
          >
            <Rocket className="w-10 h-10 text-secondary" />
          </motion.div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-foreground mb-4 sm:mb-6 px-4">
            Start Your Online Earning{' '}
            <span className="text-secondary">Journey Today</span>
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-primary-foreground/80 mb-8 sm:mb-10 px-4">
            Join 50,000+ resellers who are already earning from home. No investment, no risk, unlimited potential.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link to="/register" className="w-full sm:w-auto">
              <Button variant="hero" size="xl" className="w-full sm:w-auto text-sm sm:text-base md:text-lg h-12 sm:h-14 animate-pulse-glow">
                Join as Reseller
                <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
            </Link>
            <Link to="/products" className="w-full sm:w-auto">
              <Button variant="hero-outline" size="xl" className="w-full sm:w-auto text-sm sm:text-base md:text-lg h-12 sm:h-14">
                Start Earning
              </Button>
            </Link>
          </div>

          <p className="mt-6 sm:mt-8 text-xs sm:text-sm text-primary-foreground/60 px-4 mb-8 sm:mb-12">
            ✓ Free to join • ✓ No hidden charges • ✓ Instant withdrawal
          </p>
        </motion.div>
      </div>
    </section>
  );
};
