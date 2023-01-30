import { fetchJSON } from '../../utils/api';
import type { MarkerRouteItem } from './MarkerRoutes';

export function deleteMarkerRoute(markerRouteId: string) {
  return fetchJSON(`/api/marker-routes/${markerRouteId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export function getMarkerRoutes() {
  return fetchJSON<MarkerRouteItem[]>(`/api/marker-routes`);
}

export function postMarkerRoute(markerRoute: Partial<MarkerRouteItem>) {
  return fetchJSON<MarkerRouteItem>('/api/marker-routes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(markerRoute),
  });
}

export function patchMarkerRoute(
  markerRouteId: string,
  patch: Partial<MarkerRouteItem>
) {
  return fetchJSON<MarkerRouteItem>(`/api/marker-routes/${markerRouteId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(patch),
  });
}

export function patchFavoriteMarkerRoute(
  markerRouteId: string,
  isFavorite: boolean
) {
  return fetchJSON(`/api/auth/favorite-routes/${markerRouteId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      isFavorite,
    }),
  });
}
