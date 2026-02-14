import { motion } from 'framer-motion';
import { TrendingUp, Users, Award, AlertCircle, ArrowRight } from 'lucide-react';
import { AnimatedWaveVisualizer } from '@/components/ui/animated-wave-visualizer';

export const IncomeModelSection = () => {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden bg-white">
      {/* Animated Wave Background */}
      <div className="absolute inset-0 opacity-20">
        <AnimatedWaveVisualizer />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Income Model - <span className="text-secondary">Transparent & Fair</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Understand exactly how you earn with Flourisel.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
          {/* Sales Income Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="relative bg-white border border-gray-200 shadow-lg overflow-hidden rounded-2xl flex flex-col animate-float hover:shadow-xl transition-shadow"
          >
            <div className="p-4 flex justify-center relative">
              <div className="w-full h-48 rounded-xl bg-secondary">
                {/* Animated grid background */}
                <div className="absolute inset-0 opacity-20">
                  <div
                    className="w-full h-full animate-pulse"
                    style={{
                      backgroundImage:
                        'linear-gradient(90deg, rgba(79, 70, 229, 0.1) 1px, transparent 1px), linear-gradient(rgba(79, 70, 229, 0.1) 1px, transparent 1px)',
                      backgroundSize: '15px 15px',
                    }}
                  />
                </div>
                {/* Icon in center */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/30 backdrop-blur-sm">
                    <TrendingUp className="w-10 h-10 text-primary" />
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            <div className="p-4">
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium mb-3 border border-primary/30">
                Sales Income
              </span>
              <h3 className="text-lg font-medium text-foreground mb-2">Sales-Based Income</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed text-xs">
                Earn commissions on every product you sell with transparent and instant payouts.
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                  <span>Earn ₹50 - ₹500 per product</span>
                </li>
                <li className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                  <span>No cap on earnings</span>
                </li>
                <li className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                  <span>Instant wallet credit</span>
                </li>
              </ul>
              <div className="flex justify-between items-center">
                <a
                  href="#"
                  className="text-primary hover:text-primary/80 transition flex items-center text-xs font-medium bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/20"
                >
                  Learn More
                  <ArrowRight className="w-3 h-3 ml-1" />
                </a>
                <span className="text-muted-foreground text-xs bg-gray-100 px-2 py-1 rounded-full border border-gray-200">
                  Active
                </span>
              </div>
            </div>
          </motion.div>

          {/* Team Income Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="relative bg-white border border-gray-200 shadow-lg overflow-hidden rounded-2xl flex flex-col animate-float hover:shadow-xl transition-shadow"
            style={{ animationDelay: '0.2s' }}
          >
            <div className="p-4 flex justify-center relative">
              <div className="w-full h-48 rounded-xl bg-primary">
                {/* Animated grid background */}
                <div className="absolute inset-0 opacity-20">
                  <div
                    className="w-full h-full animate-pulse"
                    style={{
                      backgroundImage:
                        'linear-gradient(90deg, rgba(56, 189, 248, 0.1) 1px, transparent 1px), linear-gradient(rgba(56, 189, 248, 0.1) 1px, transparent 1px)',
                      backgroundSize: '15px 15px',
                    }}
                  />
                </div>
                {/* Icon in center */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-xl bg-secondary/10 flex items-center justify-center border border-secondary/30 backdrop-blur-sm">
                    <Users className="w-10 h-10 text-secondary" />
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-secondary/40 to-transparent" />
            <div className="p-4">
              <span className="inline-block px-3 py-1 bg-secondary/10 text-secondary rounded-full text-xs font-medium mb-3 border border-secondary/30">
                Team Income
              </span>
              <h3 className="text-lg font-medium text-foreground mb-2">Team-Based Earning</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed text-xs">
                Build a network and earn bonuses on your team's sales performance.
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5 shrink-0" />
                  <span>Refer friends & family</span>
                </li>
                <li className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5 shrink-0" />
                  <span>Earn on team sales</span>
                </li>
                <li className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5 shrink-0" />
                  <span>Multiply your income</span>
                </li>
              </ul>
              <div className="flex justify-between items-center">
                <a
                  href="#"
                  className="text-secondary hover:text-secondary/80 transition flex items-center text-xs font-medium bg-secondary/5 px-3 py-1.5 rounded-lg border border-secondary/20"
                >
                  Learn More
                  <ArrowRight className="w-3 h-3 ml-1" />
                </a>
                <span className="text-muted-foreground text-xs bg-gray-100 px-2 py-1 rounded-full border border-gray-200">
                  Optional
                </span>
              </div>
            </div>
          </motion.div>

          {/* Performance Rewards Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="relative bg-white border border-gray-200 shadow-lg overflow-hidden rounded-2xl flex flex-col animate-float hover:shadow-xl transition-shadow"
            style={{ animationDelay: '0.4s' }}
          >
            <div className="p-4 flex justify-center relative">
              <div className="w-full h-48 rounded-xl bg-secondary">
                {/* Animated grid background */}
                <div className="absolute inset-0 opacity-20">
                  <div
                    className="w-full h-full animate-pulse"
                    style={{
                      backgroundImage:
                        'linear-gradient(90deg, rgba(79, 70, 229, 0.1) 1px, transparent 1px), linear-gradient(rgba(56, 189, 248, 0.1) 1px, transparent 1px)',
                      backgroundSize: '15px 15px',
                    }}
                  />
                </div>
                {/* Icon in center */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/30 backdrop-blur-sm">
                    <Award className="w-10 h-10 text-primary" />
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            <div className="p-4">
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium mb-3 border border-primary/30">
                Rewards
              </span>
              <h3 className="text-lg font-medium text-foreground mb-2">Performance Rewards</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed text-xs">
                Unlock special bonuses and rewards based on your sales achievements and milestones.
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span>Achievement bonuses</span>
                </li>
                <li className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span>Monthly milestones</span>
                </li>
                <li className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span>Exclusive perks</span>
                </li>
              </ul>
              <div className="flex justify-between items-center">
                <a
                  href="#"
                  className="text-primary hover:text-primary/80 transition flex items-center text-xs font-medium bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/20"
                >
                  Learn More
                  <ArrowRight className="w-3 h-3 ml-1" />
                </a>
                <span className="text-muted-foreground text-xs bg-gray-100 px-2 py-1 rounded-full border border-gray-200">
                  Bonus
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto bg-red-50 border border-red-200 p-6 rounded-2xl"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0 border border-red-200">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Important Disclaimer</h4>
              <p className="text-sm text-muted-foreground">
                Income from Flourisel depends entirely on your effort and sales. We do{' '}
                <strong>not guarantee</strong> any fixed or assured income. Your earnings are directly
                proportional to the products you sell. This is a skill-based opportunity, not a get-rich-quick
                scheme.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
