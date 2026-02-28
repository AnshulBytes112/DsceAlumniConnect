import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';

// Fix default icon using CDN to avoid Vite asset import issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Premium Marker Icon
const customIcon = new L.DivIcon({
    className: 'custom-marker-icon',
    html: `<div style="width:32px;height:32px;background:#003366;border-radius:50%;border:3px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
               <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
             </svg>
           </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -36],
});

// Fast city lookup table to avoid API calls for common locations
const CITY_COORDS: Record<string, [number, number]> = {
    // India
    'bangalore': [12.9716, 77.5946], 'bengaluru': [12.9716, 77.5946],
    'mumbai': [19.0760, 72.8777], 'bombay': [19.0760, 72.8777],
    'delhi': [28.6139, 77.2090], 'new delhi': [28.6139, 77.2090],
    'hyderabad': [17.3850, 78.4867], 'chennai': [13.0827, 80.2707],
    'madras': [13.0827, 80.2707], 'kolkata': [22.5726, 88.3639],
    'pune': [18.5204, 73.8567], 'ahmedabad': [23.0225, 72.5714],
    'jaipur': [26.9124, 75.7873], 'surat': [21.1702, 72.8311],
    'lucknow': [26.8467, 80.9462], 'kanpur': [26.4499, 80.3319],
    'nagpur': [21.1458, 79.0882], 'indore': [22.7196, 75.8577],
    'bhopal': [23.2599, 77.4126], 'patna': [25.5941, 85.1376],
    'coimbatore': [11.0168, 76.9558], 'mysuru': [12.2958, 76.6394],
    'mysore': [12.2958, 76.6394], 'mangalore': [12.9141, 74.8560],
    'visakhapatnam': [17.6868, 83.2185], 'kochi': [9.9312, 76.2673],
    'cochin': [9.9312, 76.2673], 'thiruvananthapuram': [8.5241, 76.9366],
    'gurgaon': [28.4595, 77.0266], 'gurugram': [28.4595, 77.0266],
    'noida': [28.5355, 77.3910], 'chandigarh': [30.7333, 76.7794],
    'bhubaneswar': [20.2961, 85.8245], 'vadodara': [22.3072, 73.1812],
    'rajkot': [22.3039, 70.8022], 'amritsar': [31.6340, 74.8723],
    // USA
    'new york': [40.7128, -74.0060], 'new york city': [40.7128, -74.0060],
    'los angeles': [34.0522, -118.2437], 'san francisco': [37.7749, -122.4194],
    'seattle': [47.6062, -122.3321], 'boston': [42.3601, -71.0589],
    'chicago': [41.8781, -87.6298], 'austin': [30.2672, -97.7431],
    'dallas': [32.7767, -96.7970], 'houston': [29.7604, -95.3698],
    'washington': [38.9072, -77.0369], 'washington dc': [38.9072, -77.0369],
    'atlanta': [33.7490, -84.3880], 'miami': [25.7617, -80.1918],
    'denver': [39.7392, -104.9903], 'phoenix': [33.4484, -112.0740],
    'san jose': [37.3382, -121.8863], 'san diego': [32.7157, -117.1611],
    'united states': [37.0902, -95.7129], 'usa': [37.0902, -95.7129],
    // UK
    'london': [51.5074, -0.1278], 'manchester': [53.4808, -2.2426],
    'birmingham': [52.4862, -1.8904], 'united kingdom': [55.3781, -3.4360],
    // Europe
    'berlin': [52.5200, 13.4050], 'paris': [48.8566, 2.3522],
    'amsterdam': [52.3676, 4.9041], 'zurich': [47.3769, 8.5417],
    'dubai': [25.2048, 55.2708], 'abu dhabi': [24.4539, 54.3773],
    // Canada
    'toronto': [43.6532, -79.3832], 'vancouver': [49.2827, -123.1207],
    'canada': [56.1304, -106.3468],
    // Australia
    'sydney': [-33.8688, 151.2093], 'melbourne': [-37.8136, 144.9631],
    'australia': [-25.2744, 133.7751],
    // Asia
    'singapore': [1.3521, 103.8198], 'tokyo': [35.6762, 139.6503],
    'hong kong': [22.3193, 114.1694], 'beijing': [39.9042, 116.4074],
    'shanghai': [31.2304, 121.4737],
};

// Geocode a location string → [lat, lng] using lookup table then Nominatim
const geocodeCache = new Map<string, [number, number] | null>();

async function geocodeLocation(location: string): Promise<[number, number] | null> {
    const key = location.toLowerCase().trim();
    if (geocodeCache.has(key)) return geocodeCache.get(key)!;

    // 1. Try exact match in lookup table
    if (CITY_COORDS[key]) {
        geocodeCache.set(key, CITY_COORDS[key]);
        return CITY_COORDS[key];
    }

    // 2. Try partial match (e.g. "Bangalore, India" → "bangalore")
    for (const [city, coords] of Object.entries(CITY_COORDS)) {
        if (key.includes(city)) {
            geocodeCache.set(key, coords);
            return coords;
        }
    }

    // 3. Fall back to Nominatim API
    try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;
        const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
        if (res.ok) {
            const data = await res.json();
            if (data?.length > 0) {
                const coords: [number, number] = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
                geocodeCache.set(key, coords);
                return coords;
            }
        }
    } catch (_) {
        // Silently fail — return null
    }

    geocodeCache.set(key, null);
    return null;
}

interface AlumniMapProps {
    alumni: any[];
}

interface PinnedAlumni {
    alum: any;
    lat: number;
    lng: number;
}

const AlumniMap: React.FC<AlumniMapProps> = ({ alumni }) => {
    const navigate = useNavigate();
    const [pinned, setPinned] = useState<PinnedAlumni[]>([]);
    const [geocoding, setGeocoding] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const resolveCoords = async () => {
            setGeocoding(true);
            const results: PinnedAlumni[] = [];

            for (const alum of alumni) {
                // Use explicit lat/lng if available on the object
                if (typeof alum.lat === 'number' && typeof alum.lng === 'number' && !isNaN(alum.lat) && !isNaN(alum.lng)) {
                    results.push({ alum, lat: alum.lat, lng: alum.lng });
                } else if (alum.location) {
                    // Geocode from location string
                    const coords = await geocodeLocation(alum.location);
                    if (coords) {
                        results.push({ alum, lat: coords[0], lng: coords[1] });
                    }
                }
            }

            if (!cancelled) {
                setPinned(results);
                setGeocoding(false);
            }
        };

        resolveCoords();
        return () => { cancelled = true; };
    }, [alumni]);

    const center: [number, number] = [20.5937, 78.9629];
    const zoom = 3;

    return (
        <div style={{ position: 'relative', width: '100%', height: '600px', borderRadius: '1.5rem', overflow: 'hidden', border: '1px solid rgba(0,51,102,0.1)', boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }}>
            <style>{`
                .leaflet-container { width: 100% !important; height: 100% !important; }
                .custom-marker-icon { background: transparent !important; border: none !important; }
                .custom-popup .leaflet-popup-content-wrapper {
                    border-radius: 1rem; padding: 0; overflow: hidden;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.15); border: none;
                }
                .custom-popup .leaflet-popup-content { margin: 0; width: 270px !important; }
                .custom-popup .leaflet-popup-tip { background: white; }
            `}</style>

            {/* Loading overlay while geocoding */}
            {geocoding && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(248,249,250,0.9)', zIndex: 1000 }}>
                    <div style={{ width: 36, height: 36, border: '3px solid #003366', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: 12 }}></div>
                    <div style={{ fontWeight: 600, color: '#003366' }}>Locating alumni...</div>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            )}

            <MapContainer
                center={center}
                zoom={zoom}
                scrollWheelZoom={true}
                zoomControl={false}
                style={{ width: '100%', height: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <ZoomControl position="bottomright" />

                {pinned.map(({ alum, lat, lng }) => (
                    <Marker key={alum.id} position={[lat, lng]} icon={customIcon}>
                        <Popup className="custom-popup">
                            <div style={{ fontFamily: 'inherit', overflow: 'hidden', background: 'white' }}>
                                {/* Header */}
                                <div style={{ background: 'linear-gradient(135deg, #003366, #002244)', padding: '14px 16px', color: 'white' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 'bold', border: '1px solid rgba(255,255,255,0.2)', overflow: 'hidden', flexShrink: 0 }}>
                                            {alum.image
                                                ? <img src={alum.image} alt={alum.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                : alum.name?.[0] || '?'}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: 13 }}>{alum.name}</div>
                                            <div style={{ fontSize: 10, color: '#bbd0e8', textTransform: 'uppercase', letterSpacing: 1 }}>Class of {alum.graduationYear}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Body */}
                                <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {alum.department && <div style={{ fontSize: 12, color: '#555', display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ color: '#c9a227' }}>🎓</span> {alum.department}</div>}
                                    {alum.position && <div style={{ fontSize: 12, fontWeight: 600, color: '#333', display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ color: '#003366' }}>💼</span> {alum.position}</div>}
                                    {alum.company && <div style={{ fontSize: 12, color: '#555', display: 'flex', alignItems: 'center', gap: 6 }}><span>🏢</span> {alum.company}</div>}
                                    {alum.location && <div style={{ fontSize: 11, color: '#888', display: 'flex', alignItems: 'center', gap: 6 }}><span>📍</span> {alum.location}</div>}
                                    <button
                                        onClick={() => navigate(`/alumni/${alum.id}`)}
                                        style={{ marginTop: 6, width: '100%', padding: '7px 0', background: '#003366', color: 'white', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                                    >
                                        View Profile →
                                    </button>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Stats Overlay */}
            {!geocoding && (
                <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', padding: '10px 16px', borderRadius: 14, border: '1px solid rgba(0,51,102,0.12)', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', zIndex: 1000, pointerEvents: 'none' }}>
                    <div style={{ fontSize: 9, color: '#999', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2 }}>Global Network</div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: '#003366', lineHeight: 1.2 }}>{pinned.length} Alumni</div>
                    <div style={{ fontSize: 10, color: '#aaa' }}>Pinned worldwide</div>
                </div>
            )}

            {!geocoding && pinned.length === 0 && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(248,249,250,0.9)', zIndex: 500 }}>
                    <div style={{ fontSize: 48 }}>🗺️</div>
                    <div style={{ fontWeight: 700, color: '#555', marginTop: 12 }}>No location data available</div>
                    <div style={{ fontSize: 13, color: '#999', marginTop: 4 }}>Set your location in your profile to appear here</div>
                </div>
            )}
        </div>
    );
};

export default AlumniMap;
