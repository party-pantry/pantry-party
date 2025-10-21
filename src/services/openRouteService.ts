export const geocodeAddress = async (address: string) => {
    const res = await fetch(`/api/locations?address=${encodeURIComponent(address)}`);
    if (!res.ok) throw new Error('Failed to fetch geocoding data');
    return res.json();
}