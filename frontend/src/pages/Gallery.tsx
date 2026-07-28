import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import ImageModal from '@/components/ui/ImageModal';
import { apiClient, type Achiever, type GalleryImage } from '@/lib/api';
import { SkeletonGrid } from '@/components/ui/Skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Trash2, Plus, Edit } from 'lucide-react';

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
                            {/* In a real app, clicking Add would open a modal form. Here we keep it simple or redirect to an admin panel */}
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
                                <Button onClick={handleAddImage} className="bg-dsce-blue text-white flex items-center gap-2">
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
        </>
    );
}
