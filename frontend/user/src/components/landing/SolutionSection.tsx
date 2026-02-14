import { motion } from 'framer-motion';
import { CheckCircle, Banknote, Package, Truck, FileCheck, Eye, Sparkles } from 'lucide-react';

const solutions = [
  {
    icon: Banknote,
    title: 'No Joining Fees',
    description: 'Start your business with zero investment. Completely free to join.',
    gradient: 'from-primary/20 to-blue-500/20',
    iconBg: 'bg-gradient-to-br from-primary/20 to-blue-500/20',
    iconColor: 'text-primary',
    borderColor: 'border-primary/30',
    hoverBorder: 'hover:border-primary/50',
  },
  {
    icon: Package,
    title: 'No Inventory',
    description: 'We handle all the stock. You just share and earn.',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    iconBg: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20',
    iconColor: 'text-blue-600',
    borderColor: 'border-blue-200/50',
    hoverBorder: 'hover:border-blue-400/60',
  },
  {
    icon: Truck,
    title: 'No Delivery Responsibility',
    description: 'We pack and ship directly to your customers.',
    gradient: 'from-cyan-500/20 to-teal-500/20',
    iconBg: 'bg-gradient-to-br from-cyan-500/20 to-teal-500/20',
    iconColor: 'text-cyan-600',
    borderColor: 'border-cyan-200/50',
    hoverBorder: 'hover:border-cyan-400/60',
  },
  {
    icon: Eye,
    title: 'Transparent Earning',
    description: 'See exactly how much you earn on each product.',
    gradient: 'from-teal-500/20 to-green-500/20',
    iconBg: 'bg-gradient-to-br from-teal-500/20 to-green-500/20',
    iconColor: 'text-teal-600',
    borderColor: 'border-teal-200/50',
    hoverBorder: 'hover:border-teal-400/60',
  },
  {
    icon: FileCheck,
    title: 'Invoice-Based Transactions',
    description: 'Every order comes with proper GST invoice.',
    gradient: 'from-green-500/20 to-primary/20',
    iconBg: 'bg-gradient-to-br from-green-500/20 to-primary/20',
    iconColor: 'text-green-600',
    borderColor: 'border-green-200/50',
    hoverBorder: 'hover:border-green-400/60',
  },
];

export const SolutionSection = () => {
  return (
    <section className="relative py-20 md:py-20 bg-gradient-to-b from-background via-card/50 to-background overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-3xl" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f6_0.5px,transparent_0.5px),linear-gradient(to_bottom,#3b82f6_0.5px,transparent_0.5px)] bg-[size:4rem_4rem] opacity-[0.03]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary/10 via-blue-500/10 to-cyan-500/10 backdrop-blur-sm border border-primary/20 rounded-full text-primary text-sm font-semibold mb-6 shadow-lg"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
            >
              <CheckCircle className="w-5 h-5" />
            </motion.div>
            <span className="font-bold">The Solution</span>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-2 h-2 bg-primary rounded-full"
            />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight"
          >
            How <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-primary via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Flourisel
              </span>
              <motion.span
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="absolute -bottom-2 left-0 right-0 h-4 bg-gradient-to-r from-primary/20 via-blue-500/20 to-cyan-500/20 -z-10 rounded-full blur-sm"
              />
            </span>{' '}Solves This
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
          >
            We've removed all the barriers so you can focus on what matters -{' '}
            <span className="font-semibold text-foreground">selling and earning</span>.
          </motion.p>
        </motion.div>

        {/* Solutions Grid - Single Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5 md:gap-6 max-w-7xl mx-auto mb-12">
          {solutions.map((solution, index) => (
            <motion.div
              key={solution.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ 
                delay: index * 0.1,
                duration: 0.4
              }}
              whileHover={{ 
                y: -4,
                transition: { duration: 0.2, ease: "easeOut" }
              }}
              className="group relative"
            >
              {/* Card */}
              <div className={`relative h-full bg-background p-5 rounded-2xl border ${solution.borderColor} ${solution.hoverBorder} shadow-sm hover:shadow-md transition-all duration-300`}>
                {/* Subtle Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${solution.gradient} opacity-0 group-hover:opacity-30 transition-opacity duration-300 rounded-2xl`} />
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Icon Container */}
                  <div className={`w-14 h-14 mx-auto mb-4 rounded-xl ${solution.iconBg} flex items-center justify-center transition-all duration-300 group-hover:scale-105`}>
                    <solution.icon className={`w-7 h-7 ${solution.iconColor} transition-transform duration-300`} />
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-semibold text-foreground mb-2 text-center group-hover:text-primary/90 transition-colors duration-300">
                    {solution.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground text-center leading-relaxed">
                    {solution.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="text-center mt-12"
        >
          <div className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-primary/10 via-blue-500/10 to-cyan-500/10 backdrop-blur-sm border border-primary/20 rounded-2xl shadow-lg">
            <Sparkles className="w-6 h-6 text-primary animate-pulse" />
            <p className="text-foreground font-semibold">
              Start your journey with <span className="text-primary">zero investment</span> today
            </p>
          </div>
        </motion.div>
      </div>

      {/* Bottom Wave Decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="w-full h-20"
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 80L60 75C120 70 240 60 360 55C480 50 600 50 720 52.5C840 55 960 60 1080 62.5C1200 65 1320 65 1380 65L1440 65V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
};
