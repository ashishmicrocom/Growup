import { useEffect, useRef, useCallback, useState, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(SplitText);

export interface CTAButton {
  text: string;
  link: string;
  variant?: 'primary' | 'secondary' | 'outline';
}

export interface Feature {
  text: string;
  icon?: string;
}

export interface SectionData {
  text: string;
  subtitle?: string;
  description?: string;
  img: string;
  ctaButtons?: CTAButton[];
  features?: Feature[];
  contentAlignment?: 'left' | 'right';
}

interface AnimatedSectionsProps {
  sections?: SectionData[];
  className?: string;
  headerTitle?: string;
}

const defaultSections: SectionData[] = [
  {
    text: "Whispers of Radiance",
    img: "https://raw.githubusercontent.com/66HEX/free-photos/main/img1.jpeg"
  },
  {
    text: "Ethereal Moments",
    img: "https://raw.githubusercontent.com/66HEX/free-photos/main/img3.jpeg"
  },
  {
    text: "Silent Beauty",
    img: "https://raw.githubusercontent.com/66HEX/free-photos/main/img5.jpeg"
  }
];

const AnimatedSections: React.FC<AnimatedSectionsProps> = ({
  sections = defaultSections,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const splitHeadingsRef = useRef<SplitText[]>([]);
  const currentIndexRef = useRef<number>(-1);
  const animatingRef = useRef<boolean>(false);
  const sectionsRefs = useRef<HTMLElement[]>([]);
  const imagesRefs = useRef<HTMLDivElement[]>([]);
  const outerRefs = useRef<HTMLDivElement[]>([]);
  const innerRefs = useRef<HTMLDivElement[]>([]);
  const headingRefs = useRef<HTMLHeadingElement[]>([]);
  const counterCurrentRef = useRef<HTMLSpanElement | null>(null);
  const counterNextRef = useRef<HTMLSpanElement | null>(null);
  const counterCurrentSplitRef = useRef<SplitText | null>(null);
  const counterNextSplitRef = useRef<SplitText | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null);

useEffect(() => {
  let loaded = 0;
  sections.forEach((section) => {
    const img = new Image();
    img.src = section.img;
    img.onload = () => {
      loaded++;
      if (loaded === sections.length) {
        setImagesLoaded(true);
      }
    };
    img.onerror = () => {
      loaded++;
      if (loaded === sections.length) {
        setImagesLoaded(true);
      }
    };
  });
}, [sections]);

  const gotoSection = useCallback((index: number, direction: number) => {
    if (!containerRef.current || animatingRef.current) return;

    const sectionsElements = sectionsRefs.current as Element[];
    const images = imagesRefs.current as Element[];
    const outerWrappers = outerRefs.current as Element[];
    const innerWrappers = innerRefs.current as Element[];

    const wrap = gsap.utils.wrap(0, sectionsElements.length);
    index = wrap(index);
    animatingRef.current = true;

    const fromTop = direction === -1;
    const dFactor = fromTop ? -1 : 1;

    const tl = gsap.timeline({
      defaults: { duration: 1.25, ease: 'power1.inOut' },
      onComplete: () => {
        animatingRef.current = false;
      }
    });

    timelineRef.current = tl;

    if (currentIndexRef.current >= 0) {
      gsap.set(sectionsElements[currentIndexRef.current], { zIndex: 0 });
      tl.to(images[currentIndexRef.current], { xPercent: -15 * dFactor })
        .set(sectionsElements[currentIndexRef.current], { autoAlpha: 0 });
    }

    gsap.set(sectionsElements[index], { autoAlpha: 1, zIndex: 1 });

    tl.fromTo(
      [outerWrappers[index], innerWrappers[index]],
      {
        xPercent: (i: number) => (i ? -100 * dFactor : 100 * dFactor)
      },
      { xPercent: 0 },
      0
    )
      .fromTo(
        images[index],
        { xPercent: 15 * dFactor },
        { xPercent: 0 },
        0
      );

    if (splitHeadingsRef.current[index] && splitHeadingsRef.current[index].lines) {
      const lines = splitHeadingsRef.current[index].lines;

      gsap.set(lines, {
        opacity: 0,
        yPercent: 100
      });

      tl.to(
        lines,
        {
          opacity: 1,
          yPercent: 0,
          duration: 0.8,
          ease: 'power2.out',
          stagger: {
            each: 0.1,
            from: 'start'
          }
        },
        0.4
      );
    }

    // Animate subtitle, description, and CTA buttons
    const sectionElement = sectionsElements[index];
    if (sectionElement) {
      const subtitle = sectionElement.querySelector('.section-subtitle');
      const description = sectionElement.querySelector('.section-description');
      const cta = sectionElement.querySelector('.section-cta');

      if (subtitle) {
        gsap.set(subtitle, { opacity: 0, y: -20 });
        tl.to(subtitle, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.5);
      }

      if (description) {
        gsap.set(description, { opacity: 0, y: 20 });
        tl.to(description, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.7);
      }

      if (cta) {
        gsap.set(cta, { opacity: 0, y: 20 });
        tl.to(cta, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.9);
      }
    }

    if (counterCurrentRef.current && counterNextRef.current) {
      if (!counterCurrentSplitRef.current) {
        counterCurrentSplitRef.current = new SplitText(counterCurrentRef.current, {
          type: 'lines',
          linesClass: 'line',
          mask: 'lines'
        });
      }

      counterNextRef.current.textContent = String(index + 1);
      gsap.set(counterNextRef.current, { opacity: 1 });

      if (counterNextSplitRef.current) {
        counterNextSplitRef.current.revert();
        counterNextSplitRef.current = null;
      }
      counterNextSplitRef.current = new SplitText(counterNextRef.current, {
        type: 'lines',
        linesClass: 'line',
        mask: 'lines'
      });

      const currentLines = counterCurrentSplitRef.current?.lines || [];
      const nextLines = counterNextSplitRef.current?.lines || [];

      gsap.set(currentLines, { opacity: 1, yPercent: 0 });
      gsap.set(nextLines, { opacity: 1, yPercent: 100 * dFactor });

      tl.to(
        currentLines,
        {
          yPercent: -100 * dFactor,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          stagger: { each: 0.1, from: 'start' }
        },
        0.4
      );
      tl.to(
        nextLines,
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          stagger: { each: 0.1, from: 'start' }
        },
        0.4
      ).add(() => {
        if (counterCurrentSplitRef.current) {
          counterCurrentSplitRef.current.revert();
          counterCurrentSplitRef.current = null;
        }
        if (counterNextSplitRef.current) {
          counterNextSplitRef.current.revert();
          counterNextSplitRef.current = null;
        }
        if (counterCurrentRef.current && counterNextRef.current) {
          counterCurrentRef.current.textContent = counterNextRef.current.textContent;
        }
        gsap.set(counterNextRef.current, { opacity: 0, clearProps: 'all' });
      });
    }

    currentIndexRef.current = index;
    setCurrentIndex(index);
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (!imagesLoaded || sections.length === 0) return;

    // Start auto-play after initial animation
    const startAutoPlay = () => {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
      }

      autoPlayIntervalRef.current = setInterval(() => {
        if (!animatingRef.current) {
          const nextIndex = (currentIndexRef.current + 1) % sections.length;
          gotoSection(nextIndex, 1);
        }
      }, 5000); // Change slide every 5 seconds
    };

    // Start auto-play after a short delay
    const timeout = setTimeout(startAutoPlay, 2000);

    return () => {
      clearTimeout(timeout);
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
        autoPlayIntervalRef.current = null;
      }
    };
  }, [imagesLoaded, sections.length, gotoSection]);

  useGSAP(() => {
  if (!containerRef.current || !imagesLoaded) return;

    gsap.registerPlugin(SplitText);

    const headings = headingRefs.current as HTMLElement[];
    const outerWrappers = outerRefs.current as Element[];
    const innerWrappers = innerRefs.current as Element[];

    splitHeadingsRef.current = headings.map(
      (heading) =>
        new SplitText(heading, {
          type: 'lines',
          linesClass: 'line',
          mask: 'lines'
        })
    );

    gsap.set(outerWrappers, { xPercent: 100 });
    gsap.set(innerWrappers, { xPercent: -100 });

    // Initialize first section
    gotoSection(0, 1);

    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
        timelineRef.current = null;
      }
      splitHeadingsRef.current.forEach((split) => {
        if (split && typeof split.revert === 'function') {
          split.revert();
        }
      });
      splitHeadingsRef.current = [];
      if (counterCurrentSplitRef.current && typeof counterCurrentSplitRef.current.revert === 'function') {
        counterCurrentSplitRef.current.revert();
        counterCurrentSplitRef.current = null;
      }
      if (counterNextSplitRef.current && typeof counterNextSplitRef.current.revert === 'function') {
        counterNextSplitRef.current.revert();
        counterNextSplitRef.current = null;
      }
    };
  }, { scope: containerRef, dependencies: [sections.length, imagesLoaded] });

  return (
    <div 
      ref={containerRef}
      className={`h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[80vh] w-full overflow-hidden bg-black text-white uppercase font-sans relative ${className}`}
    >

      {sections.map((section, i) => (
        <section 
          key={`section-${i}`} 
          className="absolute top-0 left-0 h-full w-full invisible"
          ref={(el) => { if (el) sectionsRefs.current[i] = el; }}
        >
          <div className="outer w-full h-full overflow-hidden" ref={(el) => { if (el) outerRefs.current[i] = el; }}>
            <div className="inner w-full h-full overflow-hidden" ref={(el) => { if (el) innerRefs.current[i] = el; }}>
              <img
                src={section.img}
                alt={`Slide ${i + 1}`}
                className="absolute top-0 left-0 w-full h-full object-contain lg:object-cover object-center"
                ref={(el) => { if (el) imagesRefs.current[i] = el; }}
              />
              
              {/* Text Content Overlay - Only for slides with features */}
              {section.features && (
                <div className={`absolute top-0 ${section.contentAlignment === 'left' ? 'left-0 md:left-0' : 'right-0 md:right-0'} h-full w-full ${section.contentAlignment === 'right' ? 'md:w-4/5 lg:w-3/5' : 'md:w-3/4 lg:w-2/3'} flex flex-col justify-start ${section.contentAlignment === 'left' ? 'items-start' : 'items-end md:items-start'} px-3 sm:px-4 md:px-12 lg:px-16 xl:px-20 pt-2 sm:pt-4 md:pt-10 lg:pt-16 ${section.contentAlignment === 'left' ? 'text-left' : 'text-right md:text-left'} z-10 pointer-events-none`}>
                  
                  {/* Subtitle */}
                  {section.subtitle && (
                    <p className="section-subtitle text-[10px] sm:text-xs md:text-sm lg:text-base text-yellow-400 mb-1 sm:mb-2 md:mb-3 tracking-wider font-semibold">
                      {section.subtitle}
                    </p>
                  )}

                  {/* Main Heading */}
                  <h2 
                    ref={(el) => { if (el) headingRefs.current[i] = el; }}
                    className="text-sm sm:text-base md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold mb-1 sm:mb-2 md:mb-4 lg:mb-6 text-blue-900 mt-8 sm:mt-12 md:mt-16 lg:mt-20"
                    style={{ 
                      textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                      lineHeight: '1.3'
                    }}
                  >
                    {section.text.split('\n').map((line, idx) => (
                      <span key={idx} className={`block ${idx === 1 ? 'text-yellow-500' : ''}`}>
                        {line}
                      </span>
                    ))}
                  </h2>

                  {/* Description */}
                  {section.description && (
                    <p className="section-description text-[9px] sm:text-[10px] md:text-sm lg:text-base xl:text-lg text-gray-700 mb-2 sm:mb-3 md:mb-6 lg:mb-8 max-w-xl leading-tight sm:leading-relaxed tracking-wide font-medium">
                      {section.description}
                    </p>
                  )}

                  {/* CTA Buttons */}
                  {section.ctaButtons && section.ctaButtons.length > 0 && (
                    <div className="section-cta flex flex-wrap gap-1.5 sm:gap-2 md:gap-4 mb-2 sm:mb-3 md:mb-6 lg:mb-8 pointer-events-auto">
                      {section.ctaButtons.map((button, btnIdx) => (
                        <Link
                          key={btnIdx}
                          to={button.link}
                          className={`
                            px-2 sm:px-3 md:px-6 lg:px-8 py-1 sm:py-1.5 md:py-2.5 lg:py-3 rounded-lg font-semibold text-[9px] sm:text-[10px] md:text-sm lg:text-base
                            transition-all duration-300 hover:scale-105 hover:shadow-xl
                            ${button.variant === 'primary' 
                              ? 'bg-blue-900 text-white hover:bg-blue-800' 
                              : button.variant === 'secondary'
                              ? 'bg-yellow-500 text-blue-900 hover:bg-yellow-400'
                              : 'bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-900'
                            }
                          `}
                        >
                          {button.text}
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Features Section */}
                  <div className={`section-features grid grid-cols-1 ${section.contentAlignment === 'left' ? 'sm:grid-cols-2' : 'sm:grid-cols-3'} md:grid-cols-3 ${section.contentAlignment === 'left' ? 'gap-1 sm:gap-2 md:gap-4' : 'gap-1 sm:gap-2 md:gap-4 lg:gap-8'} mt-1 sm:mt-2 md:mt-4 pointer-events-none`}>
                    {section.features.map((feature, featIdx) => (
                      <div key={featIdx} className="flex items-center gap-1.5 sm:gap-2">
                        {/* Feature Icon */}
                        {feature.icon === 'package' && (
                          <img src="/src/assets/hero images/no stock required.png" alt="No Stock Required" className="w-4 h-4 sm:w-5 sm:h-5 md:w-8 md:h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 flex-shrink-0" />
                        )}
                        {feature.icon === 'users' && (
                          <img src="/src/assets/hero images/pan india delivery.png" alt="Pan India Delivery" className="w-4 h-4 sm:w-5 sm:h-5 md:w-8 md:h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 flex-shrink-0" />
                        )}
                        {feature.icon === 'truck' && (
                          <img src="/src/assets/hero images/transparent earnings.png" alt="Transparent Earnings" className="w-4 h-4 sm:w-5 sm:h-5 md:w-8 md:h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 flex-shrink-0" />
                        )}
                        {/* Feature Text */}
                        <p className="text-[7px] sm:text-[8px] md:text-xs lg:text-sm font-bold text-blue-900 tracking-wider whitespace-nowrap">
                          {feature.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
};

export default AnimatedSections;

