import * as React from "react";
import { UserPlus, Share2, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TabContent {
  badge: string;
  title: string;
  description: string;
  buttonText: string;
  imageSrc: string;
  imageAlt: string;
}

interface Tab {
  value: string;
  icon: React.ReactNode;
  label: string;
  content: TabContent;
}

interface Feature108Props {
  badge?: string;
  heading?: string;
  description?: string;
  tabs?: Tab[];
}

const Feature108 = ({
  badge = "Flourisel E-Store",
  heading = "3 Simple Steps to Start Your Flourisel Journey",
  description = "Join free, share digital products on social media, and earn commission on every sale – all from your phone.",
  tabs = [
    {
      value: "step-1",
      icon: <UserPlus className="h-auto w-4 shrink-0" />,
      label: "Join Free",
      content: {
        badge: "Step 1 • Join",
        title: "Register on Flourisel in just 2 minutes.",
        description:
          "Create your free Flourisel account with your basic details. No documents, no investment, no prior experience required. You get instant access to your personal e‑store panel on mobile.",
        buttonText: "Join Flourisel Free",
        imageSrc:
          "/join.avif",
        imageAlt: "Young person joining an online business from mobile",
      },
    },
    {
      value: "step-2",
      icon: <Share2 className="h-auto w-4 shrink-0" />,
      label: "Share Products",
      content: {
        badge: "Step 2 • Share",
        title: "Share ready‑made product links on social media.",
        description:
          "Browse the Flourisel catalog of high‑demand products, generate your unique links, and share them on WhatsApp, Instagram, Facebook and more. We handle product, delivery and support for you.",
        buttonText: "Explore Product Catalog",
        imageSrc:
          "/share%20products.jpg",
        imageAlt: "Person sharing products on social media from a laptop",
      },
    },
    {
      value: "step-3",
      icon: <Wallet className="h-auto w-4 shrink-0" />,
      label: "Earn Income",
      content: {
        badge: "Step 3 • Earn",
        title: "Earn commission on every successful order.",
        description:
          "Whenever someone buys through your link, your commission is credited in your Flourisel wallet. Track all orders live in your dashboard and withdraw earnings directly to your bank account.",
        buttonText: "See Commission Benefits",
        imageSrc:
          "/earn%20income.webp",
        imageAlt: "Person checking online income and commissions",
      },
    },
  ],
}: Feature108Props) => {
  const navigate = useNavigate();

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-6 sm:gap-8 text-center mb-12 sm:mb-16">
          <Badge variant="outline" className="bg-secondary border-none">{badge}</Badge>
          <h2 className="max-w-2xl text-2xl sm:text-3xl font-semibold md:text-4xl text-white px-4">
            {heading}
          </h2>
          <p className="text-white max-w-2xl text-sm sm:text-base px-4 leading-relaxed mb-4 sm:mb-6">
            {description}
          </p>
        </div>
        <Tabs defaultValue={tabs[0]?.value} className="mt-0">
          <TabsList className="container flex flex-col items-center justify-center gap-4 sm:flex-row md:gap-10 bg-transparent p-0">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-secondary data-[state=active]:bg-secondary data-[state=active]:text-primary w-full sm:w-auto"
              >
                {tab.icon} {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="mx-auto mt-8 max-w-screen-xl rounded-2xl bg-secondary p-4 sm:p-6 lg:p-16">
            {tabs.map((tab) => (
              <TabsContent
                key={tab.value}
                value={tab.value}
                className="grid place-items-center gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-16"
              >
                <div className="flex flex-col gap-4 sm:gap-5 w-full">
                  <Badge variant="outline" className="w-fit bg-background">
                    {tab.content.badge}
                  </Badge>
                  <h3 className="text-xl sm:text-2xl font-semibold lg:text-4xl">
                    {tab.content.title}
                  </h3>
                  <p className="text-muted-foreground text-sm sm:text-base lg:text-lg leading-relaxed mb-6 sm:mb-8">
                    {tab.content.description}
                  </p>
                  <Button className="mt-6 sm:mt-8 w-full sm:w-fit gap-2 text-sm sm:text-base" size="lg" onClick={() => navigate("/register")}>
                    {tab.content.buttonText}
                  </Button>
                </div>
                <img
                  src={tab.content.imageSrc}
                  alt={tab.content.imageAlt}
                  className="h-full w-full max-h-[280px] sm:max-h-[360px] rounded-xl object-cover shadow-lg"
                />
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </section>
  );
};

export { Feature108 };


