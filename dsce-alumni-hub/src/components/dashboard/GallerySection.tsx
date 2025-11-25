const galleryImages = [
  'https://www.dsce.edu.in/cache/shortcodes/05-352x207-4dd298b698c3ac2e031a2cbe96d3ac1e.png',
  'https://www.dsce.edu.in/cache/shortcodes/06-352x207-03450f0e20f0ce362ecbf7e8ef61f0a6.png',
  'https://www.dsce.edu.in/cache/shortcodes/07-352x207-47e93fd784fcba8aff38ddadab5bf5aa.png',
  'https://www.dsce.edu.in/cache/shortcodes/03-352x207-d5e7cc56d7ccf161a9dca9dd674cd82c.png'
];

export function GallerySection() {
  return (
    <section className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-foreground">Gallery</h3>
        <button className="text-primary hover:text-primary-glow text-sm transition-colors">View All →</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {galleryImages.map((img, idx) => (
          <div key={idx} className="aspect-video rounded-xl overflow-hidden bg-card hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer group shadow-lg hover-lift">
            <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          </div>
        ))}
      </div>
    </section>
  );
}
