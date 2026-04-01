import { Category, Route } from '../types'

const IMG_1 =
  'https://www.figma.com/api/mcp/asset/40be9126-5a87-43c4-b31b-0edd4eaddd80'
const IMG_2 =
  'https://www.figma.com/api/mcp/asset/1aa6728d-8e1f-492a-9859-cf385edd57f5'
const IMG_3 =
  'https://www.figma.com/api/mcp/asset/ba4d91a7-0cb1-4846-841e-07fd8844fb27'

export const EXPLORE_CATEGORIES: Category[] = [
  { label: 'Поруч', icon: 'map-pin' },
  { label: 'Легкі', icon: 'sun' },
  { label: 'З водою', icon: 'droplet' },
  { label: 'Види', icon: 'eye' },
  { label: 'Складні', icon: 'zap' },
]

export const NEARBY_ROUTES: Route[] = [
  {
    id: 'n1',
    title: 'Говерла через Брескул',
    region: 'Карпати, UA',
    distanceKm: 11.2,
    elevationM: 920,
    durationH: 5.5,
    difficulty: 'Помірний',
    rating: 4.7,
    reviewCount: 312,
    distanceFromUserKm: 3.1,
    imageUri: IMG_1,
  },
  {
    id: 'n2',
    title: 'Озеро Синевир',
    region: 'Закарпаття, UA',
    distanceKm: 6.4,
    elevationM: 340,
    durationH: 2.5,
    difficulty: 'Легкий',
    rating: 4.9,
    reviewCount: 541,
    distanceFromUserKm: 7.8,
    imageUri: IMG_2,
  },
  {
    id: 'n3',
    title: 'Чорногора Хребет',
    region: 'Івано-Франківськ, UA',
    distanceKm: 18.6,
    elevationM: 1480,
    durationH: 9,
    difficulty: 'Складний',
    rating: 4.8,
    reviewCount: 178,
    distanceFromUserKm: 12.4,
    imageUri: IMG_3,
  },
  {
    id: 'n4',
    title: 'Урич — Тустань',
    region: 'Львівська, UA',
    distanceKm: 8.1,
    elevationM: 420,
    durationH: 3,
    difficulty: 'Легкий',
    rating: 4.5,
    reviewCount: 223,
    distanceFromUserKm: 18.0,
    imageUri: IMG_1,
  },
]

export const RECOMMENDED_ROUTES: Route[] = [
  {
    id: 'r1',
    title: 'Мармароський Масив',
    region: 'Закарпаття, Україна',
    distanceKm: 24.3,
    elevationM: 1760,
    durationH: 11,
    difficulty: 'Складний',
    rating: 4.9,
    reviewCount: 89,
    distanceFromUserKm: 31,
    imageUri: IMG_2,
    poi: { water: 4, shelter: 2, viewpoint: 6 },
  },
  {
    id: 'r2',
    title: 'Довбуш Скелі',
    region: 'Івано-Франківськ, Україна',
    distanceKm: 13.7,
    elevationM: 680,
    durationH: 6,
    difficulty: 'Помірний',
    rating: 4.6,
    reviewCount: 204,
    distanceFromUserKm: 44,
    imageUri: IMG_3,
    poi: { water: 2, shelter: 1, viewpoint: 4 },
  },
]

export const POPULAR_ROUTES: Route[] = [
  {
    id: 'p1',
    title: 'Pip Ivan — Обсерваторія',
    region: 'Чорногора, UA',
    distanceKm: 9.2,
    elevationM: 740,
    durationH: 4.5,
    difficulty: 'Помірний',
    rating: 4.8,
    reviewCount: 634,
    distanceFromUserKm: 22,
    imageUri: IMG_1,
  },
  {
    id: 'p2',
    title: 'Петрос через Козьмеску',
    region: 'Рахів, UA',
    distanceKm: 15.4,
    elevationM: 1180,
    durationH: 7,
    difficulty: 'Складний',
    rating: 4.7,
    reviewCount: 298,
    distanceFromUserKm: 35,
    imageUri: IMG_2,
  },
  {
    id: 'p3',
    title: 'Шипіт — Водоспад',
    region: 'Закарпаття, UA',
    distanceKm: 4.8,
    elevationM: 220,
    durationH: 2,
    difficulty: 'Легкий',
    rating: 4.9,
    reviewCount: 811,
    distanceFromUserKm: 9,
    imageUri: IMG_3,
  },
  {
    id: 'p4',
    title: 'Ворохта — Яблуниця',
    region: 'Карпати, UA',
    distanceKm: 21.6,
    elevationM: 960,
    durationH: 8,
    difficulty: 'Помірний',
    rating: 4.5,
    reviewCount: 155,
    distanceFromUserKm: 27,
    imageUri: IMG_1,
  },
]

export const ALL_ROUTES: Route[] = [...NEARBY_ROUTES, ...POPULAR_ROUTES.slice(0, 3)]
