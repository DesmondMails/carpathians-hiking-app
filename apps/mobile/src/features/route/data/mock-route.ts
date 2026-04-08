import type { RouteDetails } from '../types'

export const MOCK_ROUTE_DETAILS: RouteDetails = {
  id: 'hovirla-zaroslyak',
  title: 'Говерла через Заросляк',
  region: 'Чорногора, Івано-Франківська обл.',
  difficulty: 'Складний',
  routeType: 'out-and-back',
  distanceKm: 9.4,
  elevationGainM: 1051,
  durationH: 5.5,
  rating: 4.7,
  reviewCount: 214,
  imageUris: [
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
    'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80',
    'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80',
  ],
  description:
    "Класичний маршрут на найвищу вершину України — Говерлу (2061 м). Стартує від метеостанції Заросляк, піднімається через субальпійські луки та кам'янисті схили. На висоті 1800 м відкривається вражаюча панорама Чорногірського хребта.",
  terrain: "Лісові стежки, субальпійські луки, кам'яний гребінь",
  bestSeason: 'Червень — Жовтень',
  notes: 'Погода в горах змінюється швидко. Рекомендується ранній старт і запасний шар одягу.',
  elevationProfile: [
    { distanceKm: 0, elevationM: 1010 },
    { distanceKm: 1, elevationM: 1135 },
    { distanceKm: 2, elevationM: 1290 },
    { distanceKm: 3, elevationM: 1430 },
    { distanceKm: 4, elevationM: 1590 },
    { distanceKm: 5, elevationM: 1730 },
    { distanceKm: 6, elevationM: 1870 },
    { distanceKm: 7, elevationM: 1970 },
    { distanceKm: 8, elevationM: 2040 },
    { distanceKm: 9, elevationM: 2061 },
    { distanceKm: 9.4, elevationM: 2061 },
  ],
  poiMarkers: [
    { id: 'w1', type: 'water', label: 'Джерело', latitude: 48.1422, longitude: 24.5278 },
    { id: 's1', type: 'shelter', label: 'Колиба', latitude: 48.1488, longitude: 24.5115 },
    { id: 'v1', type: 'viewpoint', label: 'Вид на хребет', latitude: 48.1549, longitude: 24.5042 },
    { id: 'pk1', type: 'peak', label: 'Говерла 2061м', latitude: 48.1602, longitude: 24.5003 },
  ],
  routeCoordinates: [
    // NSB Zaroslyak — parking / trailhead
    { latitude: 48.1392, longitude: 24.5386 },
    // Forest trail start — blue markers on trees
    { latitude: 48.1401, longitude: 24.5355 },
    { latitude: 48.1411, longitude: 24.5318 },
    // Гірський потік (mountain stream crossing)
    { latitude: 48.1422, longitude: 24.5278 },
    { latitude: 48.1435, longitude: 24.5240 },
    { latitude: 48.1447, longitude: 24.5203 },
    // Exit from forest — first open area with table & benches
    { latitude: 48.1460, longitude: 24.5168 },
    { latitude: 48.1473, longitude: 24.5140 },
    // Заросляк meadow — surrounding peaks come into view
    { latitude: 48.1488, longitude: 24.5115 },
    { latitude: 48.1503, longitude: 24.5092 },
    // First shoulder — panorama opens up
    { latitude: 48.1519, longitude: 24.5073 },
    { latitude: 48.1534, longitude: 24.5056 },
    // Second shoulder (~1800 m) — Chornohora ridge panorama
    { latitude: 48.1549, longitude: 24.5042 },
    { latitude: 48.1562, longitude: 24.5031 },
    { latitude: 48.1573, longitude: 24.5022 },
    // Third shoulder — final push
    { latitude: 48.1583, longitude: 24.5015 },
    { latitude: 48.1591, longitude: 24.5010 },
    // Summit approach — rocky ridge
    { latitude: 48.1597, longitude: 24.5006 },
    // Hoverla summit — 2061 m, highest point of Ukraine
    { latitude: 48.1602, longitude: 24.5003 },
  ],
  transport: {
    byBus: 'Автобус Івано-Франківськ → Яремча, далі таксі до Заросляку (~25 хв)',
    byCar: 'GPS: 48.1392° N, 24.5386° E — паркінг біля НСБ Заросляк',
    nearestTown: 'Яремча (35 км)',
  },
  createdBy: 'TrailUA',
  gpxAvailable: true,
}
