import { motion } from 'framer-motion';
import { Verified } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { getImageUrl } from '@/lib/imageUtils';
import { getAllRecognitions, type RecognitionsResponse } from '@/services/recognitionService';

export interface Recognition {
  _id: string;
  name: string;
  logo: string;
  description?: string;
  order: number;
  externalLink?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const RecognitionSection = () => {
  // Fetch recognitions from API
  const { data: recognitionsData, isLoading } = useQuery<RecognitionsResponse>({
    queryKey: ['recognitions'],
    queryFn: getAllRecognitions,
  });

  const recognitions = recognitionsData?.data || [];

  // Animation variants for the text content
  const FADE_IN_ANIMATION_VARIANTS = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 20 } },
  };

  // Duplicate recognitions for a seamless loop
  const duplicatedRecognitions = [...recognitions, ...recognitions];

  return (
    <section
      className={cn(
        "relative w-full min-h-screen overflow-hidden bg-background flex flex-col items-center text-center pt-0 px-4 py-20 pb-16 md:py-28"
      )}
    >
      <div className="z-10 flex flex-col items-center max-w-4xl mx-auto pb-64 sm:pb-72 md:pb-80">
        {/* Tagline */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={FADE_IN_ANIMATION_VARIANTS}
          className="mb-4 inline-block rounded-full border border-border bg-secondary px-4 py-1.5 text-sm font-medium backdrop-blur-sm"
        >
          Trusted & Recognized
        </motion.div>

        {/* Main Title */}
        <motion.h2
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={FADE_IN_ANIMATION_VARIANTS}
          className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter text-foreground"
        >
          Recognized & <span className="text-primary">supported by</span>
        </motion.h2>

        {/* Description */}
        <motion.p
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={FADE_IN_ANIMATION_VARIANTS}
          transition={{ delay: 0.5 }}
          className="mt-6 max-w-2xl text-lg md:text-xl text-muted-foreground"
        >
          Flourisel is proud to be recognized and supported by leading government bodies and institutions, 
          validating our commitment to empowering entrepreneurs and driving economic growth across the nation.
        </motion.p>

        {/* Trust Indicator */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={FADE_IN_ANIMATION_VARIANTS}
          transition={{ delay: 0.6 }}
          className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-secondary rounded-full border border-primary/10"
        >
          <Verified className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-muted-foreground">
            All recognitions are verified and up-to-date
          </span>
        </motion.div>
      </div>

      {/* Animated Recognition Marquee */}
      <div className="absolute bottom-0 left-0 w-full h-64 sm:h-72 md:h-80 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-muted-foreground">Loading recognitions...</p>
          </div>
        ) : recognitions.length > 0 ? (
          <motion.div
            className="flex gap-4"
            animate={{
              x: ["-100%", "0%"],
              transition: {
                ease: "linear",
                duration: 40,
                repeat: Infinity,
              },
            }}
          >
            {duplicatedRecognitions.map((recognition, index) => {
              return (
                <div
                  key={`${recognition._id}-${index}`}
                  className="relative aspect-[3/4] h-48 md:h-64 flex-shrink-0 group cursor-pointer"
                  style={{
                    rotate: `${(index % 2 === 0 ? -2 : 5)}deg`,
                  }}
                  onClick={() => {
                    if (recognition.externalLink) {
                      window.open(recognition.externalLink, '_blank');
                    }
                  }}
                >
                  <div className="w-full h-full rounded-2xl shadow-lg overflow-hidden bg-white border-2 border-primary/20 group-hover:border-primary transition-colors">
                    {/* Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-background" />
                    
                    {/* Logo and Name */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 gap-4">
                      <div className="relative w-28 h-28 md:w-36 md:h-36 flex items-center justify-center">
                        <img 
                          src={getImageUrl(recognition.logo)} 
                          alt={`${recognition.name} logo`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <h3 className="text-sm md:text-base font-bold text-foreground text-center">
                        {recognition.name}
                      </h3>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-muted-foreground">No recognitions available</p>
          </div>
        )}
      </div>
    </section>
  );
};
