import { motion } from 'framer-motion';
import { AlertTriangle, DollarSign, Package, Store, FileText, Eye } from 'lucide-react';

const problems = [
  {
    icon: DollarSign,
    title: 'High Investment',
    description: 'Traditional business requires lakhs in upfront capital',
    gradient: 'from-red-500/20 to-orange-500/20',
    iconBg: 'bg-gradient-to-br from-red-500/20 to-orange-500/20',
    iconColor: 'text-red-600',
    borderColor: 'border-red-200/50',
    hoverBorder: 'hover:border-red-400/60',
  },
  {
    icon: Package,
    title: 'Dead Stock Risk',
    description: 'Unsold inventory means money stuck forever',
    gradient: 'from-orange-500/20 to-amber-500/20',
    iconBg: 'bg-gradient-to-br from-orange-500/20 to-amber-500/20',
    iconColor: 'text-orange-600',
    borderColor: 'border-orange-200/50',
    hoverBorder: 'hover:border-orange-400/60',
  },
  {
    icon: Store,
    title: 'Shop Rent',
    description: 'Monthly rent eats into your profits',
    gradient: 'from-amber-500/20 to-yellow-500/20',
    iconBg: 'bg-gradient-to-br from-amber-500/20 to-yellow-500/20',
    iconColor: 'text-amber-600',
    borderColor: 'border-amber-200/50',
    hoverBorder: 'hover:border-amber-400/60',
  },
  {
    icon: FileText,
    title: 'Legal Confusion',
    description: 'GST, licenses, compliance headaches',
    gradient: 'from-yellow-500/20 to-red-500/20',
    iconBg: 'bg-gradient-to-br from-yellow-500/20 to-red-500/20',
    iconColor: 'text-yellow-600',
    borderColor: 'border-yellow-200/50',
    hoverBorder: 'hover:border-yellow-400/60',
  },
  {
    icon: Eye,
    title: 'No Transparency',
    description: 'Hidden costs and unclear margins',
    gradient: 'from-red-600/20 to-pink-500/20',
    iconBg: 'bg-gradient-to-br from-red-600/20 to-pink-500/20',
    iconColor: 'text-red-600',
    borderColor: 'border-red-200/50',
    hoverBorder: 'hover:border-red-400/60',
  },
];

export const ProblemSection = () => {
  return (
    <section id="problem-section" className="relative py-24 bg-gradient-to-b from-background via-destructive/5 to-background overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-destructive/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-destructive/3 rounded-full blur-3xl" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ef4444_0.5px,transparent_0.5px),linear-gradient(to_bottom,#ef4444_0.5px,transparent_0.5px)] bg-[size:4rem_4rem] opacity-[0.03]" />
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
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-destructive/10 via-red-500/10 to-orange-500/10 backdrop-blur-sm border border-destructive/20 rounded-full text-destructive text-sm font-semibold mb-6 shadow-lg"
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
            >
              <AlertTriangle className="w-5 h-5" />
            </motion.div>
            <span className="font-bold">The Problem</span>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-2 h-2 bg-destructive rounded-full"
            />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight"
          >
            Why Starting Self-Business Feels{' '}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-destructive via-red-600 to-orange-600 bg-clip-text text-transparent">
                Risky
              </span>
              <motion.span
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="absolute -bottom-2 left-0 right-0 h-4 bg-gradient-to-r from-destructive/20 via-red-500/20 to-orange-500/20 -z-10 rounded-full blur-sm"
              />
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
          >
            Most people want to start their own business, but traditional methods come with{' '}
            <span className="font-semibold text-foreground">too many risks and challenges</span> that stop them from taking the first step.
          </motion.p>
        </motion.div>

        {/* Problems Grid - Single Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5 md:gap-6 max-w-7xl mx-auto mb-12">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
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
              <div className={`relative h-full bg-background p-5 rounded-2xl border ${problem.borderColor} ${problem.hoverBorder} shadow-sm hover:shadow-md transition-all duration-300`}>
                {/* Subtle Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${problem.gradient} opacity-0 group-hover:opacity-30 transition-opacity duration-300 rounded-2xl`} />
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Icon Container */}
                  <div className={`w-14 h-14 mx-auto mb-4 rounded-xl ${problem.iconBg} flex items-center justify-center transition-all duration-300 group-hover:scale-105`}>
                    <problem.icon className={`w-7 h-7 ${problem.iconColor} transition-transform duration-300`} />
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-semibold text-foreground mb-2 text-center group-hover:text-destructive/90 transition-colors duration-300">
                    {problem.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground text-center leading-relaxed">
                    {problem.description}
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
          <div className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-destructive/10 via-red-500/10 to-orange-500/10 backdrop-blur-sm border border-destructive/20 rounded-2xl shadow-lg">
            <AlertTriangle className="w-6 h-6 text-destructive animate-pulse" />
            <p className="text-foreground font-semibold">
              These problems stop <span className="text-destructive">thousands</span> from starting their business
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
