import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import ImageModal from '@/components/ui/ImageModal';
import { apiClient, type Achiever, type GalleryImage } from '@/lib/api';
import { SkeletonGrid } from '@/components/ui/Skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Trash2, Plus, Edit, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TABS = [
    { label: 'Achievers', value: 'achievers' },
    { label: 'Campus', value: 'campus' },
];

export default function Gallery() {
    const [tab, setTab] = useState('achievers');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN';
    const { toast } = useToast();

    const [achievers, setAchievers] = useState<Achiever[]>([]);
    const [campusImages, setCampusImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);

    const [isAchieverModalOpen, setIsAchieverModalOpen] = useState(false);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [newAchiever, setNewAchiever] = useState<Partial<Achiever>>({
        name: '',
        graduationYear: new Date().getFullYear(),
        headline: '',
        location: '',
        imageUrl: ''
    });
    const [newImageUrl, setNewImageUrl] = useState('');

    useEffect(() => {
        fetchData();
    }, [tab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (tab === 'achievers') {
                const data = await apiClient.getAchievers();
                setAchievers(data);
            } else if (tab === 'campus') {
                const data = await apiClient.getGalleryImages('campus');
                setCampusImages(data);
            }
        } catch (error) {
            toast({ title: 'Error fetching data', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAchiever = async (id: string) => {
        if (!confirm('Are you sure you want to delete this achiever?')) return;
        try {
            await apiClient.deleteAchiever(id);
            setAchievers(prev => prev.filter(a => a.id !== id));
            toast({ title: 'Achiever deleted' });
        } catch (error) {
            toast({ title: 'Failed to delete', variant: 'destructive' });
        }
    };

    const handleDeleteImage = async (id: string) => {
        if (!confirm('Are you sure you want to delete this image?')) return;
        try {
            await apiClient.deleteGalleryImage(id);
            setCampusImages(prev => prev.filter(i => i.id !== id));
            toast({ title: 'Image deleted' });
        } catch (error) {
            toast({ title: 'Failed to delete', variant: 'destructive' });
        }
    };

    const handleAddImage = async () => {
        const url = prompt("Enter image URL (Cloudinary):");
        if (!url) return;
        try {
            const newImg = await apiClient.addGalleryImage({ url, category: 'campus', caption: 'Campus Image' });
            setCampusImages([newImg, ...campusImages]);
            toast({ title: 'Image added' });
        } catch (error) {
            toast({ title: 'Failed to add image', variant: 'destructive' });
        }
    };

    const handleAddImageSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newImageUrl) return;
        try {
            const newImg = await apiClient.addGalleryImage({ url: newImageUrl, category: 'campus', caption: 'Campus Image' });
            setCampusImages([newImg, ...campusImages]);
            toast({ title: 'Image added' });
            setIsImageModalOpen(false);
            setNewImageUrl('');
        } catch (error) {
            toast({ title: 'Failed to add image', variant: 'destructive' });
        }
    };

    const handleAddAchieverSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const added = await apiClient.addAchiever(newAchiever);
            setAchievers([added, ...achievers]);
            toast({ title: 'Achiever added successfully!' });
            setIsAchieverModalOpen(false);
            setNewAchiever({
                name: '',
                graduationYear: new Date().getFullYear(),
                headline: '',
                location: '',
                imageUrl: ''
            });
        } catch (error) {
            toast({ title: 'Failed to add achiever', variant: 'destructive' });
        }
    };

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-dsce-bg-light via-dsce-bg-cream to-dsce-bg-light py-16 px-6">
                <h1 className="text-4xl font-bold text-center mb-8">Gallery</h1>
                <div className="flex justify-center gap-4 mb-12">
                    {TABS.map((t) => (
                        <button
                            key={t.value}
                            onClick={() => setTab(t.value)}
                            className={`px-6 py-2 rounded-full font-semibold border transition-all duration-200 ${tab === t.value ? 'bg-dsce-blue text-white border-dsce-blue' : 'bg-white text-dsce-blue border-dsce-blue/30 hover:bg-dsce-blue/10'}`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {tab === 'achievers' && (
                    <div>
                        <div className="flex justify-between items-center mb-6 max-w-6xl mx-auto px-4">
                            <h2 className="text-2xl font-bold text-center flex-1">Notable Achievers</h2>
                            {isAdmin && (
                                <Button onClick={() => setIsAchieverModalOpen(true)} className="bg-dsce-blue text-white flex items-center gap-2">
                                    <Plus className="h-4 w-4" /> Add Achiever
                                </Button>
                            )}
                        </div>
                        {loading ? (
                            <SkeletonGrid count={8} />
                        ) : achievers.length === 0 ? (
                            <div className="text-center text-gray-500">No achievers found</div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                                {achievers.map((alum) => (
                                    <div key={alum.id} className="relative bg-white rounded-xl shadow p-4 flex flex-col items-center border border-dsce-blue/10 group">
                                        {isAdmin && (
                                            <button onClick={() => handleDeleteAchiever(alum.id)} className="absolute top-2 right-2 p-2 bg-red-100 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}
                                        {alum.imageUrl ? (
                                            <img src={alum.imageUrl} alt={alum.name} className="w-32 h-32 object-cover rounded-full mb-4" />
                                        ) : (
                                            <div className="w-32 h-32 rounded-full bg-dsce-blue flex items-center justify-center text-white text-3xl font-bold mb-4">
                                                {alum.name.substring(0, 2).toUpperCase()}
                                            </div>
                                        )}
                                        <div className="text-center">
                                            <h3 className="font-bold text-lg">{alum.name}</h3>
                                            <p className="text-sm text-dsce-gold">{alum.graduationYear || 'Year unknown'}</p>
                                            <p className="text-sm text-gray-700">{alum.headline || 'Professional'}</p>
                                            <p className="text-xs text-gray-500">{alum.location || 'Location unknown'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {tab === 'campus' && (
                    <div>
                        <div className="flex justify-between items-center mb-6 max-w-6xl mx-auto px-4">
                            <h2 className="text-2xl font-bold text-center flex-1">Campus Life</h2>
                            {isAdmin && (
                                <Button onClick={() => setIsImageModalOpen(true)} className="bg-dsce-blue text-white flex items-center gap-2">
                                    <Plus className="h-4 w-4" /> Add Image
                                </Button>
                            )}
                        </div>
                        {loading ? (
                            <SkeletonGrid count={8} />
                        ) : campusImages.length === 0 ? (
                            <div className="text-center text-gray-500">No images found</div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
                                {campusImages.map((img) => (
                                    <div key={img.id} className="relative group rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer border border-gray-100 aspect-square">
                                        <img 
                                            src={img.url} 
                                            alt={img.caption} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                            onClick={() => setSelectedImage(img.url)}
                                        />
                                        {isAdmin && (
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteImage(img.id); }} className="absolute top-2 right-2 p-2 bg-white/90 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div className="text-center mt-12">
                    <Link to="/">
                        <Button variant="outline">Back to Home</Button>
                    </Link>
                </div>
            </div>

            {/* Image Modal */}
            <ImageModal
                image={selectedImage || ''}
                isOpen={!!selectedImage}
                onClose={() => setSelectedImage(null)}
                alt="DSCE Campus Memory"
            />

            {/* Add Achiever Modal */}
            <AnimatePresence>
                {isAchieverModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-8"
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h3 className="text-xl font-bold text-dsce-blue">Add Notable Achiever</h3>
                                <button
                                    onClick={() => setIsAchieverModalOpen(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <form onSubmit={handleAddAchieverSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={newAchiever.name} 
                                        onChange={e => setNewAchiever({...newAchiever, name: e.target.value})} 
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dsce-blue/20"
                                        placeholder="e.g. Jane Doe"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Graduation Year</label>
                                        <input 
                                            type="number" 
                                            required 
                                            value={newAchiever.graduationYear} 
                                            onChange={e => setNewAchiever({...newAchiever, graduationYear: parseInt(e.target.value)})} 
                                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dsce-blue/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Location</label>
                                        <input 
                                            type="text" 
                                            required 
                                            value={newAchiever.location} 
                                            onChange={e => setNewAchiever({...newAchiever, location: e.target.value})} 
                                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dsce-blue/20"
                                            placeholder="e.g. San Francisco, CA"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Headline/Position</label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={newAchiever.headline} 
                                        onChange={e => setNewAchiever({...newAchiever, headline: e.target.value})} 
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dsce-blue/20"
                                        placeholder="e.g. Software Engineer at Google"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Image URL (Cloudinary)</label>
                                    <input 
                                        type="url" 
                                        value={newAchiever.imageUrl} 
                                        onChange={e => setNewAchiever({...newAchiever, imageUrl: e.target.value})} 
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dsce-blue/20"
                                        placeholder="https://res.cloudinary.com/..."
                                    />
                                </div>
                                
                                <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                                    <Button type="button" variant="outline" onClick={() => setIsAchieverModalOpen(false)}>Cancel</Button>
                                    <Button type="submit" className="bg-dsce-blue text-white hover:bg-dsce-blue/90">Add Achiever</Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Add Image Modal */}
            <AnimatePresence>
                {isImageModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h3 className="text-xl font-bold text-dsce-blue">Add Campus Image</h3>
                                <button
                                    onClick={() => setIsImageModalOpen(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <form onSubmit={handleAddImageSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Image URL (Cloudinary)</label>
                                    <input 
                                        type="url" 
                                        required 
                                        value={newImageUrl} 
                                        onChange={e => setNewImageUrl(e.target.value)} 
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dsce-blue/20"
                                        placeholder="https://res.cloudinary.com/..."
                                    />
                                </div>
                                <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                                    <Button type="button" variant="outline" onClick={() => setIsImageModalOpen(false)}>Cancel</Button>
                                    <Button type="submit" className="bg-dsce-blue text-white hover:bg-dsce-blue/90">Add Image</Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
