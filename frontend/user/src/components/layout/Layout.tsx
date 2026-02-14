import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden w-full max-w-[100vw]">
      <Header />
      <main className="flex-1 w-full overflow-x-hidden pt-[120px] md:pt-[140px] lg:pt-[160px]">
        {children}
      </main>
      <Footer />
    </div>
  );
};
