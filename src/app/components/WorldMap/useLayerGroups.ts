import { useEffect } from 'react';
import leaflet from 'leaflet';
import { mapFilters } from '../MapFilter/mapFilters';
import type { Marker } from '../../contexts/MarkersContext';
import { getTooltipContent } from './tooltips';
import { classNames } from '../../utils/styles';
import { useMarkers } from '../../contexts/MarkersContext';
import { useFilters } from '../../contexts/FiltersContext';
import 'leaflet-canvas-markers';

export const LeafIcon: new ({ iconUrl }: { iconUrl: string }) => leaflet.Icon =
  leaflet.Icon.extend({
    options: {
      iconSize: [32, 32],
      tooltipAnchor: [0, -20],
    },
  });

const allLayers: {
  [id: string]: leaflet.Layer;
} = {};

function useLayerGroups({
  leafletMap,
  onMarkerClick,
}: {
  leafletMap: leaflet.Map | null;
  onMarkerClick?: (marker: Marker) => void;
}): void {
  const { visibleMarkers } = useMarkers();
  const [filters] = useFilters();

  useEffect(() => {
    if (!leafletMap) {
      return;
    }

    const removableMarkers = Object.keys(allLayers);

    for (let i = 0; i < visibleMarkers.length; i++) {
      const marker = visibleMarkers[i];
      if (allLayers[marker._id]) {
        const index = removableMarkers.indexOf(marker._id);
        if (index > -1) {
          removableMarkers.splice(index, 1);
        }
        continue;
      }
      const mapFilter = mapFilters.find(
        (mapFilter) => mapFilter.type === marker.type
      );
      if (!mapFilter) {
        continue;
      }

      if (marker.position) {
        const mapMarker = leaflet
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          .canvasMarker([marker.position[1], marker.position[0]], {
            radius: 16,
            img: {
              url: mapFilter.iconUrl,
              size: [32, 32],
              rotate: 0,
            },
            pmIgnore: true,
          })
          .bindTooltip(getTooltipContent(marker, mapFilter), {
            direction: 'top',
          });
        if (onMarkerClick) {
          mapMarker.on('click', () => {
            onMarkerClick(marker);
          });
        }
        allLayers[marker._id] = mapMarker;
      } else if (marker.positions) {
        const layerGroup = new leaflet.LayerGroup();

        const polygon = leaflet.polygon(
          marker.positions.map((position) => [position[1], position[0]])
        );

        layerGroup.addLayer(polygon);
        const text = leaflet.divIcon({
          className: classNames(
            'leaflet-polygon-text',
            `leaflet-polygon-text-${leafletMap.getZoom()}`
          ),
          html: `${marker.name}<br/>(${marker.levelRange?.join('-')})`,
        });
        const textMarker = leaflet.marker(polygon.getCenter(), {
          icon: text,
        });

        leafletMap.on('zoomend', () => {
          const element = textMarker.getElement();
          if (element) {
            element.className = classNames(
              'leaflet-polygon-text',
              `leaflet-polygon-text-${leafletMap.getZoom()}`
            );
          }
        });
        layerGroup.addLayer(textMarker);
        allLayers[marker._id] = layerGroup;
        if (onMarkerClick) {
          polygon.on('click', () => {
            onMarkerClick(marker);
          });
        }
      }
      allLayers[marker._id].addTo(leafletMap);
    }

    removableMarkers.forEach((markerId) => {
      const layer = allLayers[markerId];
      if (layer) {
        layer.removeFrom(leafletMap);
        delete allLayers[markerId];
      }
    });
  }, [leafletMap, filters, visibleMarkers]);
}

export default useLayerGroups;
