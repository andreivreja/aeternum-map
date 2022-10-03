import styles from './WorldMap.module.css';
import useWorldMap from './useWorldMap';
import useLayerGroups from './useLayerGroups';
import { useModal } from '../../contexts/ModalContext';
import MarkerDetails from '../MarkerDetails/MarkerDetails';
import usePlayerPosition from './usePlayerPosition';
import { classNames } from '../../utils/styles';
import type { CSSProperties } from 'react';
import type { MarkerBasic } from '../../contexts/MarkersContext';
import useReadLivePosition from '../../utils/useReadLivePosition';

type WorldMapProps = {
  isMinimap?: boolean;
  hideControls?: boolean;
  initialZoom?: number;
  className?: string;
  style?: CSSProperties;
  rotate?: boolean;
  isEditing?: boolean;
  onMarkerEdit?: (marker: MarkerBasic) => void;
};

function WorldMap({
  isMinimap,
  className,
  hideControls,
  initialZoom,
  style,
  rotate,
  isEditing,
  onMarkerEdit,
}: WorldMapProps): JSX.Element {
  const { leafletMap, elementRef } = useWorldMap({
    hideControls,
    initialZoom,
  });
  const { addModal, closeLatestModal } = useModal();
  useReadLivePosition();

  useLayerGroups({
    leafletMap,
    onMarkerClick: (marker) => {
      if (onMarkerEdit) {
        addModal({
          children: (
            <MarkerDetails
              marker={marker}
              onEdit={() => {
                onMarkerEdit(marker);
                closeLatestModal();
              }}
            />
          ),
        });
      }
    },
  });
  usePlayerPosition({ isMinimap, leafletMap, rotate, isEditing });

  return (
    <div
      className={classNames(styles.map, className)}
      ref={elementRef}
      style={style}
    />
  );
}

export default WorldMap;
