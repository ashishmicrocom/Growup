import { useRef } from 'react';
import { Home, GraduationCap, Briefcase, Clock, TrendingUp, Users, CheckCircle2, Target } from 'lucide-react';
import { TimelineContent } from '@/components/ui/timeline-animation';

// Homemakers Card (Large - Left Column)
const HomemakersCard = () => (
  <div className="flex flex-col justify-between relative bg-secondary overflow-hidden rounded-lg border border-gray-200 p-5 h-full">
    <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:50px_56px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
    <article className="mt-auto relative z-10">
      <div className="flex items-center gap-2 mb-3">
        <Home className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-primary">Homemakers</h2>
      </div>
      <p className="text-sm text-black/80 leading-relaxed mb-4">
        Earn from home while managing household. Perfect for stay-at-home moms who want financial independence without leaving their families.
      </p>
      <div className="space-y-2">
        <div className="flex items-start gap-2 text-xs text-black/70">
          <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
          <span>Work from home during free time</span>
        </div>
        <div className="flex items-start gap-2 text-xs text-black/70">
          <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
          <span>Zero investment required</span>
        </div>
        <div className="flex items-start gap-2 text-xs text-black/70">
          <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
          <span>Flexible hours - work anytime</span>
        </div>
        <div className="flex items-start gap-2 text-xs text-black/70">
          <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
          <span>Earn ₹50K+ monthly</span>
        </div>
      </div>
    </article>
  </div>
);

// Students Card (Small - Left Column)
const StudentsCard = () => (
  <div className="flex flex-col justify-between relative bg-primary text-white overflow-hidden rounded-lg border border-gray-200 p-5 h-full">
    <article className="mt-auto">
      <div className="flex items-center gap-2 mb-3">
        <GraduationCap className="w-5 h-5 text-secondary" />
        <h2 className="text-lg font-semibold text-secondary">Students</h2>
      </div>
      <p className="text-sm text-white/90 leading-relaxed mb-3">
        Make pocket money while studying. Flexible hours, no interference with classes.
      </p>
      <div className="space-y-2">
        <div className="flex items-start gap-2 text-xs text-white/90">
          <CheckCircle2 className="w-3.5 h-3.5 text-secondary mt-0.5 shrink-0" />
          <span>Work between classes & exams</span>
        </div>
        <div className="flex items-start gap-2 text-xs text-white/90">
          <CheckCircle2 className="w-3.5 h-3.5 text-secondary mt-0.5 shrink-0" />
          <span>Earn ₹10K-₹30K monthly</span>
        </div>
      </div>
    </article>
  </div>
);

// Main Feature Card (Middle Column - First)
const MainFeatureCard = () => (
  <div className="flex flex-col justify-between relative bg-[#111111] text-white overflow-hidden rounded-lg border border-gray-200 p-5 h-full">
    <article className="mt-auto">
      <div className="flex items-center gap-2 mb-3">
        <Target className="w-5 h-5 text-secondary" />
        <h2 className="text-lg font-semibold text-secondary">Flourisel</h2>
      </div>
      <p className="text-sm text-white/90 leading-relaxed mb-3">
        Start your earning journey today with just a smartphone! Zero investment, instant earnings, work from home.
      </p>
      <div className="flex flex-wrap gap-2 mt-4">
        <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-white/30">
          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
          <span className="text-xs font-medium text-white">Zero Investment</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-white/30">
          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
          <span className="text-xs font-medium text-white">Instant Earnings</span>
        </div>
      </div>
    </article>
  </div>
);

// Job Seekers Card (Middle Column - Second)
const JobSeekersCard = () => (
  <div className="flex flex-col justify-between relative bg-[#111111] text-white overflow-hidden rounded-lg border border-gray-200 p-5 h-full">
    <article className="mt-auto">
      <div className="flex items-center gap-2 mb-3">
        <Briefcase className="w-5 h-5 text-secondary" />
        <h2 className="text-lg font-semibold text-secondary">Job Seekers</h2>
      </div>
      <p className="text-sm text-white/90 leading-relaxed mb-3">
        Start earning while looking for jobs. Build skills and income together. Perfect opportunity to gain experience and financial stability.
      </p>
      <div className="space-y-2">
        <div className="flex items-start gap-2 text-xs text-white/90">
          <CheckCircle2 className="w-3.5 h-3.5 text-secondary mt-0.5 shrink-0" />
          <span>Earn while searching for jobs</span>
        </div>
        <div className="flex items-start gap-2 text-xs text-white/90">
          <CheckCircle2 className="w-3.5 h-3.5 text-secondary mt-0.5 shrink-0" />
          <span>Build sales & marketing skills</span>
        </div>
      </div>
    </article>
  </div>
);

// Statistic Card (Middle Column - Third)
const StatCard = () => (
  <div className="flex flex-col justify-between relative bg-[#111111] text-white overflow-hidden rounded-lg border border-gray-200 p-5 h-full">
    <article className="mt-auto">
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-5 h-5 text-secondary" />
        <h2 className="text-lg font-semibold text-secondary">50,000+ Active Resellers</h2>
      </div>
      <p className="text-2xl font-bold text-secondary mb-2">₹50K+</p>
      <p className="text-sm text-white/90 leading-relaxed mb-3">
        Average monthly earnings with Flourisel platform.
      </p>
      <div className="space-y-2">
        <div className="flex items-start gap-2 text-xs text-white/90">
          <CheckCircle2 className="w-3.5 h-3.5 text-secondary mt-0.5 shrink-0" />
          <span>Zero investment required</span>
        </div>
        <div className="flex items-start gap-2 text-xs text-white/90">
          <CheckCircle2 className="w-3.5 h-3.5 text-secondary mt-0.5 shrink-0" />
          <span>100% commission on sales</span>
        </div>
      </div>
    </article>
  </div>
);

// Part-Time Earners Card (Small - Right Column)
const PartTimeEarnersCard = () => (
  <div className="flex flex-col justify-between relative bg-primary text-white overflow-hidden rounded-lg border border-gray-200 p-5 h-full">
    <article className="mt-auto">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-5 h-5 text-secondary" />
        <h2 className="text-lg font-semibold text-secondary">Part-Time Earners</h2>
      </div>
      <p className="text-sm text-white/90 leading-relaxed mb-3">
        Add to your existing income. Work on weekends or spare hours. Supplement your salary with extra earnings.
      </p>
      <div className="space-y-2">
        <div className="flex items-start gap-2 text-xs text-white/90">
          <CheckCircle2 className="w-3.5 h-3.5 text-secondary mt-0.5 shrink-0" />
          <span>Work on weekends only</span>
        </div>
        <div className="flex items-start gap-2 text-xs text-white/90">
          <CheckCircle2 className="w-3.5 h-3.5 text-secondary mt-0.5 shrink-0" />
          <span>Earn extra ₹20K-₹40K</span>
        </div>
      </div>
    </article>
  </div>
);

// Entrepreneurs Card (Large - Right Column)
const EntrepreneursCard = () => (
  <div className="flex flex-col justify-between relative bg-secondary overflow-hidden rounded-lg border border-gray-200 p-5 h-full">
    <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:50px_56px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
    <article className="mt-auto relative z-10">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-primary">Entrepreneurs</h2>
      </div>
      <p className="text-sm text-black/80 leading-relaxed mb-4">
        Scale your business with Flourisel. Build a team, earn team income, and create multiple revenue streams. Perfect for ambitious individuals who want to build a sustainable business.
      </p>
      <div className="space-y-2">
        <div className="flex items-start gap-2 text-xs text-black/70">
          <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
          <span>Build your own team</span>
        </div>
        <div className="flex items-start gap-2 text-xs text-black/70">
          <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
          <span>Earn team income & bonuses</span>
        </div>
        <div className="flex items-start gap-2 text-xs text-black/70">
          <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
          <span>Unlimited earning potential</span>
        </div>
        <div className="flex items-start gap-2 text-xs text-black/70">
          <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
          <span>Business training & support</span>
        </div>
      </div>
    </article>
  </div>
);

export const WhoCanJoinSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  const revealVariants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.4,
        duration: 0.5,
      },
    }),
    hidden: {
      filter: "blur(10px)",
      y: -20,
      opacity: 0,
    },
  };

  return (
    <section className="relative h-full container text-black mx-auto rounded-lg py-14 bg-white" ref={sectionRef}>
      <article className="max-w-screen-md mx-auto text-center space-y-2 mb-12">
        <TimelineContent 
          as="h1" 
          className="xl:text-4xl text-3xl font-medium" 
          animationNum={0} 
          customVariants={revealVariants} 
          timelineRef={sectionRef}
        >
          Who Can <span className="text-gradient bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Join Flourisel?</span>
        </TimelineContent>
        <TimelineContent 
          as="p" 
          className="mx-auto text-gray-500" 
          animationNum={1} 
          customVariants={revealVariants} 
          timelineRef={sectionRef}
        >
          Our platform is open to everyone. All you need is a smartphone and the desire to earn.
        </TimelineContent>
      </article>

      <div className="lg:grid lg:grid-cols-3 gap-2 flex flex-col w-full lg:py-10 pt-10 pb-4 lg:px-10 px-4">
        {/* Left Column */}
        <div className="md:flex lg:flex-col lg:space-y-2 h-full lg:gap-0 gap-2">
          <TimelineContent 
            animationNum={0} 
            customVariants={revealVariants} 
            timelineRef={sectionRef} 
            className="lg:flex-[7] flex-[6]"
          >
            <HomemakersCard />
          </TimelineContent>
          <TimelineContent 
            animationNum={1} 
            customVariants={revealVariants} 
            timelineRef={sectionRef} 
            className="lg:flex-[3] flex-[4] lg:h-fit lg:shrink-0"
          >
            <StudentsCard />
          </TimelineContent>
        </div>

        {/* Middle Column */}
        <div className="lg:h-full md:flex lg:flex-col h-fit lg:space-y-2 lg:gap-0 gap-2">
          <TimelineContent 
            animationNum={2} 
            customVariants={revealVariants} 
            timelineRef={sectionRef}
          >
            <MainFeatureCard />
          </TimelineContent>
          <TimelineContent 
            animationNum={3} 
            customVariants={revealVariants} 
            timelineRef={sectionRef}
          >
            <JobSeekersCard />
          </TimelineContent>
          <TimelineContent 
            animationNum={4} 
            customVariants={revealVariants} 
            timelineRef={sectionRef}
          >
            <StatCard />
          </TimelineContent>
        </div>

        {/* Right Column */}
        <div className="h-full md:flex lg:flex-col lg:space-y-2 lg:gap-0 gap-2">
          <TimelineContent 
            animationNum={5} 
            customVariants={revealVariants} 
            timelineRef={sectionRef} 
            className="lg:flex-[3] flex-[4]"
          >
            <PartTimeEarnersCard />
          </TimelineContent>
          <TimelineContent 
            animationNum={6} 
            customVariants={revealVariants} 
            timelineRef={sectionRef} 
            className="lg:flex-[7] flex-[6]"
          >
            <EntrepreneursCard />
          </TimelineContent>
        </div>
      </div>

      <div className="absolute border-b-2 border-[#e6e6e6] bottom-4 h-16 z-[2] md:w-full w-[90%] md:left-0 left-[5%]">
        <div className="container mx-auto w-full h-full relative before:absolute before:-left-2 before:-bottom-2 before:w-4 before:h-4 before:bg-white before:shadow-sm before:border border-gray-200 before:border-gray-300 after:absolute after:-right-2 after:-bottom-2 after:w-4 after:h-4 after:bg-white after:shadow-sm after:border after:border-gray-300"></div>
      </div>
    </section>
  );
};
