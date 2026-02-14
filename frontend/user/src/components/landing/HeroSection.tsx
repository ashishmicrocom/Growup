import { useEffect, useState } from 'react';
import AnimatedSections, { SectionData } from '@/components/ui/animated-sections-1';
import { getHeroSlides, type HeroSlide } from '@/services/heroSlideService';

export const HeroSection = () => {
  const [heroSections, setHeroSections] = useState<SectionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHeroSlides = async () => {
      try {
        const response = await getHeroSlides();
        
        // Transform backend data to match SectionData format
        const transformedSlides: SectionData[] = response.data.map((slide: HeroSlide) => ({
          subtitle: slide.subtitle,
          text: slide.text,
          description: slide.description,
          img: slide.image,
          ctaButtons: slide.ctaButtons,
          features: slide.features,
          contentAlignment: slide.contentAlignment
        }));
        
        setHeroSections(transformedSlides);
      } catch (error) {
        console.error('Error fetching hero slides:', error);
        // Fallback to default slides if fetch fails
        setHeroSections([
          {
            subtitle: "",
            text: "Start Your Business Without\nInvestment, Inventory or Risk.",
            description: "START A BUSINESS WITH NO INVESTMENT, NO INVENTORY, AND NO RISK. WORK FROM ANYWHERE AND EARN WITH EASE.",
            img: "/src/assets/hero images/slide1.png",
            ctaButtons: [
              {
                text: "Start Earning Now",
                link: "/register",
                variant: "secondary"
              }
            ],
            features: [
              {
                text: "NO STOCK REQUIRED",
                icon: "package"
              },
              {
                text: "PAN INDIA DELIVERY",
                icon: "users"
              },
              {
                text: "TRANSPARENT EARNINGS",
                icon: "truck"
              }
            ]
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHeroSlides();
  }, []);

  if (isLoading) {
    return (
      <section className="relative w-full h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100" aria-label="Loading">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full" aria-label="Flourisel India Hero Section">
      <AnimatedSections sections={heroSections} />
    </section>
  );
};
