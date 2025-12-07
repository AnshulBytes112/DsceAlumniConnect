import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

// Mock data for gallery images
const mockGalleryImages = [
  { id: 1, src: '/images/gallery1.jpg', title: 'Alumni Meet 2023' },
  { id: 2, src: '/images/gallery2.jpg', title: 'Tech Talk Event' },
  { id: 3, src: '/images/gallery3.jpg', title: 'Graduation Day' },
  { id: 4, src: '/images/gallery4.jpg', title: 'Fundraising Campaign' },
  { id: 5, src: '/images/gallery5.jpg', title: 'Sports Day' },
  { id: 6, src: '/images/gallery6.jpg', title: 'Cultural Fest' },
];

export default function Gallery() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dsce-bg-light via-dsce-bg-cream to-dsce-bg-light text-gray-800">
      <Helmet>
        <title>Gallery - DSCE Alumni Connect</title>
      </Helmet>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="p-6 pt-24 max-w-[1600px] mx-auto"
      >
        <header className="mb-12 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl font-bold text-dsce-blue"
          >
            Gallery
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-lg text-dsce-text-dark mt-4"
          >
            Explore moments captured from various alumni events and activities.
          </motion.p>
        </header>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
        >
          {mockGalleryImages.map((image) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative group overflow-hidden rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <img
                src={image.src}
                alt={image.title}
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <h3 className="text-white text-lg font-bold text-center">{image.title}</h3>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}