import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import ImageModal from '@/components/ui/ImageModal';
import { ProfileService } from '@/services/authService';
import { useAsync } from '@/hooks/useAsync';
import { SkeletonGrid } from '@/components/ui/Skeleton';

const TABS = [
	{ label: 'Achievers', value: 'achievers' },
	{ label: 'Campus', value: 'campus' },
	// { label: 'Events', value: 'events' },
];

export default function Gallery() {
	const [tab, setTab] = useState('achievers');
	const [selectedImage, setSelectedImage] = useState<string | null>(null);

	const { data: alumni, loading, error, retry } = useAsync<any[]>(
		() => ProfileService.getAllAlumni(),
		false
	);

	// Fetch when tab becomes achievers
	if (tab === 'achievers' && !loading && !alumni && !error) {
		// trigger fetch once when needed
		// useAsync returns execute as a method, but we can call retry() which invokes execute
		retry();
	}

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
						<h2 className="text-2xl font-bold mb-6 text-center">Notable Achievers</h2>
						{loading ? (
							<SkeletonGrid count={8} />
						) : error ? (
							<div className="text-center py-12 bg-white rounded-3xl border border-red-100 shadow-sm">
								<p className="text-red-500 mb-4">{error}</p>
								<Button variant="outline" onClick={() => retry()} className="text-dsce-blue border-dsce-blue">Try Again</Button>
							</div>
						) : (!alumni || alumni.length === 0) ? (
							<div className="text-center text-gray-500">No alumni found</div>
						) : (
							<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
								{alumni.map((alum: any) => (
									<div key={alum.id} className="bg-white rounded-xl shadow p-4 flex flex-col items-center border border-dsce-blue/10">
										{alum.profilePicture ? (
											<img src={alum.profilePicture} alt={alum.firstName} className="w-32 h-32 object-cover rounded-full mb-4" />
										) : (
											<div className="w-32 h-32 rounded-full bg-dsce-blue flex items-center justify-center text-white text-3xl font-bold mb-4">
												{(alum.firstName?.[0] || 'A') + (alum.lastName?.[0] || 'A')}
											</div>
										)}
										<div className="text-center">
											<h3 className="font-bold text-lg">{alum.firstName} {alum.lastName}</h3>
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
