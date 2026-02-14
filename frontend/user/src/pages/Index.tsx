import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/landing/HeroSection';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { SolutionSection } from '@/components/landing/SolutionSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { IncomeModelSection } from '@/components/landing/IncomeModelSection';
import { WhoCanJoinSection } from '@/components/landing/WhoCanJoinSection';
import { RecognitionSection } from '@/components/landing/RecognitionSection';
import { TrainingSection } from '@/components/landing/TrainingSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { CTASection } from '@/components/landing/CTASection';

const Index = () => {
  const scrollToNext = () => {
    const nextSection = document.querySelector('#problem-section');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Layout>
      <div className="relative">
        <HeroSection />
        
        {/* Mouse with Chevron Arrows - Scroll Indicator */}
        <div className="absolute -bottom-4 left-0 right-0 flex justify-center z-20">
          <div className="flex flex-col items-center gap-2">
            {/* Mouse Icon */}
            <div className="relative w-5 h-8 border-[3px] border-[#233a95] bg-white rounded-full flex items-start justify-center pt-1.5">
              <div className="w-0.5 h-1.5 bg-[#233a95] rounded-full animate-[bounce_1.5s_ease-in-out_infinite]"></div>
            </div>
            
            {/* Two Chevron Arrows */}
            <div className="flex flex-col -space-y-1">
              <svg 
                className="w-12 h-5 animate-[bounce_1.5s_ease-in-out_0.2s_infinite]" 
                viewBox="0 0 24 24"
                fill="none"
              >
                <path d="M7 10l5 5 5-5" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <svg 
                className="w-12 h-5 animate-[bounce_1.5s_ease-in-out_0.4s_infinite]" 
                viewBox="0 0 24 24"
                fill="none"
              >
                <path d="M7 10l5 5 5-5" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <ProblemSection />
      <SolutionSection />
      <HowItWorksSection />
      <IncomeModelSection />
      <WhoCanJoinSection />
      <RecognitionSection />
      <TrainingSection />
      <FAQSection />
      <CTASection />
    </Layout>
  );
};

export default Index;
