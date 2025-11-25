import { Header } from '@/components/dashboard/Header';
import { HeroSlider } from '@/components/dashboard/HeroSlider';
import { FundraisingSection } from '@/components/dashboard/FundraisingSection';
import { JobsSection } from '@/components/dashboard/JobsSection';
import { GallerySection } from '@/components/dashboard/GallerySection';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { AlumniMap } from '@/components/dashboard/AlumniMap';
import { Footer } from '@/components/dashboard/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            <HeroSlider />
            <FundraisingSection />
            <JobsSection />
            <GallerySection />
          </div>

          {/* Sidebar */}
          <Sidebar />
        </div>

        <AlumniMap />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
