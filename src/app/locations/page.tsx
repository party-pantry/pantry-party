import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { loggedInProtectedPage } from '@/lib/page-protection';

/* STACK (FOR NOTES):
map ui: https://openlayers.org/
map tiles: https://openstreetmap.us/
geocoding: https://nominatim.org
POI: https://wiki.openstreetmap.org/wiki/Overpass_API
OSRM: https://wiki.openstreetmap.org/wiki/Open_Source_Routing_Machine
*/

const LocationsPage = async () => {
  // Protect the page, only logged in users can access it.
  const session = await getServerSession(authOptions);
  loggedInProtectedPage(
    session as {
      user: { email: string; id: string; randomKey: string };
    } | null,
  );

  return (
    <main>
      TODO: Locations Page
    </main>
  );
};

export default LocationsPage;
