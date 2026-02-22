import { useState } from 'react';
import { mockAlumni, upcomingEvents } from '@/data/mockData';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';

const TABS = [
	{ label: 'Achievers', value: 'achievers' },
	{ label: 'Campus', value: 'campus' },
	{ label: 'Events', value: 'events' },
];

const campusGalleryImages = [
	'https://www.dsce.edu.in/images/Gallery/2.jpg',
	'https://www.dsce.edu.in/images/Gallery/20.JPG',
	'https://www.dsce.edu.in/images/Gallery/21.JPG',
	'https://www.dsce.edu.in/images/Gallery/22.JPG',
	'https://www.dsce.edu.in/images/Gallery/23.JPG',
	'https://www.dsce.edu.in/images/Gallery/24.JPG',
	'https://www.dsce.edu.in/images/Gallery/25.JPG',
	'https://www.dsce.edu.in/images/Gallery/26.JPG',
	'https://www.dsce.edu.in/images/Gallery/27.JPG',
	'https://www.dsce.edu.in/images/Gallery/28.JPG',
	'https://www.dsce.edu.in/images/Gallery/29.JPG',
	'https://www.dsce.edu.in/images/Gallery/3.jpg',
	'https://www.dsce.edu.in/images/Gallery/30.JPG',
	'https://www.dsce.edu.in/images/Gallery/31.JPG',
	'https://www.dsce.edu.in/images/Gallery/32.JPG',
	'https://image-static.collegedunia.com/public/reviewPhotos/1138713/Mech.jpeg',
	'https://image-static.collegedunia.com/public/reviewPhotos/1052623/1000053507.jpg',
	'https://image-static.collegedunia.com/public/reviewPhotos/1138713/download.jpeg',
	'https://image-static.collegedunia.com/public/reviewPhotos/1138713/Campus.jpeg',
	'https://image-static.collegedunia.com/public/reviewPhotos/1049554/WhatsApp%20Image%202025-01-13%20at%2015.39.33_5528f4e8.jpg',
	'https://image-static.collegedunia.com/public/college_data/images/campusimage/15676586023evnntt.jpg',
	'https://image-static.collegedunia.com/public/college_data/images/campusimage/1567658602eervnnt.jpg',
	'https://image-static.collegedunia.com/public/college_data/images/campusimage/1567658602eregvennnttttt.jpg',
	'https://image-static.collegedunia.com/public/college_data/images/campusimage/1567658602errevnt.jpg',
	'https://image-static.collegedunia.com/public/college_data/images/campusimage/1567658602ervent.jpg',
	'https://image-static.collegedunia.com/public/college_data/images/campusimage/1567658602evejntt.jpg',
	'https://image-static.collegedunia.com/public/college_data/images/campusimage/1567658602eventr.jpg',
	'https://image-static.collegedunia.com/public/college_data/images/campusimage/15901531393.jpg',
	'https://image-static.collegedunia.com/public/college_data/images/campusimage/15901531394.jpg',
	'https://image-static.collegedunia.com/public/college_data/images/campusimage/15901531396.jpg',
	'https://image-static.collegedunia.com/public/college_data/images/campusimage/15901531397.jpg',
	'https://image-static.collegedunia.com/public/college_data/images/campusimage/15901531398.jpg',
	'https://image-static.collegedunia.com/public/college_data/images/campusimage/15901531399.jpg',
	'https://image-static.collegedunia.com/public/college_data/images/campusimage/159015314010.jpg',
	'https://image-static.collegedunia.com/public/college_data/images/campusimage/159015314012.jpg',
	'https://image-static.collegedunia.com/public/college_data/images/campusimage/159015314013.jpg',
];

const campusGalleryRows = Array.from({ length: 4 }, (_, rowIndex) => {
	const shift = (rowIndex * 3) % campusGalleryImages.length;
	return [
		...campusGalleryImages.slice(shift),
		...campusGalleryImages.slice(0, shift),
	];
});

export default function Gallery() {
	const [tab, setTab] = useState('achievers');

	return (
		<div className="min-h-screen bg-white py-16 px-6">
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
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
						{mockAlumni.map((alumni) => (
							<div key={alumni.id} className="bg-white rounded-xl shadow p-4 flex flex-col items-center border border-dsce-blue/10">
								{alumni.image ? (
									<img src={alumni.image} alt={alumni.name} className="w-32 h-32 object-cover rounded-full mb-4" />
								) : (
									<div className="w-32 h-32 rounded-full bg-dsce-blue flex items-center justify-center text-white text-3xl font-bold mb-4">
										{alumni.name.split(' ').map(n => n[0]).join('')}
									</div>
								)}
								<div className="text-center">
									<h3 className="font-bold text-lg">{alumni.name}</h3>
									<p className="text-sm text-dsce-gold">Class of {alumni.graduationYear}</p>
									<p className="text-sm text-gray-700">{alumni.position}</p>
									<p className="text-xs text-gray-500">{alumni.company}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{tab === 'campus' && (
				<div>
					<h2 className="text-2xl font-bold mb-6 text-center">Campus Memories</h2>
					<div className="space-y-4">
						{campusGalleryRows.map((rowImages, rowIndex) => (
							<div key={rowIndex} className="overflow-hidden">
								<div className={`flex w-max gap-4 ${rowIndex % 2 === 0 ? 'animate-campus-scroll' : 'animate-campus-scroll-reverse'}`}>
									{[...rowImages, ...rowImages, ...rowImages, ...rowImages].map((img, i) => (
										<div key={`${rowIndex}-${i}`} className="overflow-hidden rounded-xl shadow shrink-0 group">
											<img src={img} alt={`Campus ${rowIndex + 1}-${i + 1}`} className="w-[250px] h-[190px] object-cover transition-transform duration-300 group-hover:scale-110" />
										</div>
									))}
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{tab === 'events' && (
				<div>
					<h2 className="text-2xl font-bold mb-6 text-center">Event Highlights</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{upcomingEvents.map((event) => (
							<div key={event.id} className="bg-white rounded-xl shadow p-6 border border-dsce-blue/10">
								<h3 className="font-bold text-lg mb-2">{event.title}</h3>
								<p className="text-sm text-gray-700 mb-1">{event.day} {event.month} | {event.time}</p>
								<p className="text-xs text-gray-500 mb-2">{event.location}</p>
								<p className="text-gray-600 mb-2">{event.description}</p>
								<div className="text-xs text-dsce-blue font-semibold">Organized by: {event.organizerName}</div>
							</div>
						))}
					</div>
				</div>
			)}

			<div className="text-center mt-12">
				<Link to="/">
					<Button variant="outline">Back to Home</Button>
				</Link>
			</div>
		</div>
	);
}
