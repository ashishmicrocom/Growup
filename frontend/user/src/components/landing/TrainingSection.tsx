import { motion } from 'framer-motion';
import { BookOpen, TrendingUp, BarChart3, Headphones, Users, Share2, FileBarChart, IndianRupee, MessageCircle, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const trainingFeatures = [
  {
    title: 'Product Training',
    subtitle: 'Learn about sarees, suits, bedsheets & more',
    icon: <BookOpen className="w-4 h-4" />,
  },
  {
    title: 'Selling Strategies',
    subtitle: 'Marketing tips & proven selling techniques',
    icon: <TrendingUp className="w-4 h-4" />,
  },
  {
    title: 'Earnings Dashboard',
    subtitle: 'Track sales & earnings in real-time',
    icon: <BarChart3 className="w-4 h-4" />,
  },
  {
    title: '24/7 Support',
    subtitle: 'WhatsApp support & personal mentoring',
    icon: <Headphones className="w-4 h-4" />,
  },
  {
    title: 'Team Building',
    subtitle: 'Build your reseller network & earn more',
    icon: <Users className="w-4 h-4" />,
  },
  {
    title: 'Social Media Tips',
    subtitle: 'Share products effectively on social platforms',
    icon: <Share2 className="w-4 h-4" />,
  },
  {
    title: 'Performance Reports',
    subtitle: 'Weekly insights & growth analytics',
    icon: <FileBarChart className="w-4 h-4" />,
  },
  {
    title: 'Commission Tracking',
    subtitle: 'Monitor your earnings & payouts',
    icon: <IndianRupee className="w-4 h-4" />,
  },
  {
    title: 'WhatsApp Groups',
    subtitle: 'Join active reseller communities',
    icon: <MessageCircle className="w-4 h-4" />,
  },
  {
    title: 'Achievement Rewards',
    subtitle: 'Earn badges & recognition for milestones',
    icon: <Award className="w-4 h-4" />,
  },
];

export const TrainingSection = () => {
  return (
    <section className="relative w-full py-20 px-4 bg-secondary text-foreground">
      <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 items-center gap-12">
        {/* LEFT SIDE - Training Features Loop with Vertical Bar */}
        <div className="relative w-full max-w-sm">
          <Card className="overflow-hidden bg-white dark:bg-card shadow-lg rounded-lg border border-primary/20" style={{ boxShadow: '0 10px 40px -10px hsl(var(--primary) / 0.3)' }}>
            <CardContent className="relative h-[320px] p-0 overflow-hidden">
              {/* Scrollable Container */}
              <div className="relative h-full overflow-hidden">
                {/* Motion list */}
                <motion.div
                  className="flex flex-col gap-2 absolute w-full"
                  animate={{ y: ["0%", "-50%"] }}
                  transition={{
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: 20,
                    ease: "linear",
                  }}
                >
                  {[...trainingFeatures, ...trainingFeatures].map((feature, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700 relative"
                    >
                      {/* Icon + Content */}
                      <div className="flex items-center justify-between flex-1">
                        <div className="flex items-center gap-2">
                          <div className="bg-secondary/20 w-10 h-10 rounded-full shadow-md flex items-center justify-center">
                            <div className="text-primary">
                              {feature.icon}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{feature.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{feature.subtitle}</p>
                          </div>
                        </div>
                        <div className="text-primary/60">
                          {feature.icon}
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>

                {/* Fade effect only inside card */}
                <div className="absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-background via-background/70 to-transparent pointer-events-none z-10" />
                <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-background via-background/70 to-transparent pointer-events-none z-10" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT SIDE - Content */}
        <div className="space-y-6">
          <Badge  className="px-3 py-1 text-sm bg-primary text-primary-foreground">
            Training & Support
          </Badge>
          <h3 className="text-lg sm:text-xl lg:text-2xl font-normal text-gray-900 dark:text-white leading-relaxed">
            Complete Training Program{" "}
            <span className="text-gray-500 dark:text-gray-400 text-sm sm:text-base lg:text-xl">we help you succeed with comprehensive training — from product knowledge and selling strategies to dashboard tracking and team building. Our support system includes 24/7 WhatsApp assistance, personal mentorship, and performance analytics to help you grow your reseller business and maximize your earnings.</span>
          </h3>

          <div className="flex gap-3 flex-wrap">
            <Badge className="px-4 py-2 text-sm">Product Training</Badge>
            <Badge className="px-4 py-2 text-sm">24/7 Support</Badge>
            <Badge className="px-4 py-2 text-sm">Mentorship Program</Badge>
          </div>
        </div>
      </div>
    </section>
  );
};
