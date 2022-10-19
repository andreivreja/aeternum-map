import { StrictMode, useState } from 'react';
import './globals.css';
import { UserProvider } from 'ui/contexts/UserContext';
import { MarkersProvider } from 'ui/contexts/MarkersContext';
import WorldMap from 'ui/components/WorldMap/WorldMap';
import styles from './Minimap.module.css';
import { usePersistentState } from 'ui/utils/storage';
import { FiltersProvider } from 'ui/contexts/FiltersContext';
import { SettingsProvider } from 'ui/contexts/SettingsContext';
import { classNames } from 'ui/utils/styles';
import useEventListener from 'ui/utils/useEventListener';
import { latestLeafletMap } from 'ui/components/WorldMap/useWorldMap';
import { initPlausible } from 'ui/utils/stats';
import { PlayerProvider } from 'ui/contexts/PlayerContext';
import { createRoot } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const root = createRoot(document.querySelector('#root')!);

function Minimap(): JSX.Element {
  const [minimapOpacity] = usePersistentState('minimapOpacity', 80);
  const [minimapBorderRadius] = usePersistentState('minimapBorderRadius', 50);
  const [minimapZoom] = usePersistentState('minimapZoom', 5);
  const [rotateMinimap] = usePersistentState('rotateMinimap', false);
  const [isHovering, setIsHovering] = useState(false);

  useEventListener(
    'hotkey-zoom_in_minimap',
    () => {
      if (latestLeafletMap) {
        const zoom = latestLeafletMap.getZoom();
        latestLeafletMap.setZoom(Math.min(zoom + 1, 6));
      }
    },
    []
  );
  useEventListener(
    'hotkey-zoom_out_minimap',
    () => {
      if (latestLeafletMap) {
        const zoom = latestLeafletMap.getZoom();
        latestLeafletMap.setZoom(Math.max(zoom - 1, 0));
      }
    },
    []
  );

  return (
    <div
      onMouseMove={() => setIsHovering(true)}
      className={classNames(styles.container, isHovering && styles.hideOnHover)}
      style={{
        opacity: minimapOpacity / 100,
        borderRadius: `${minimapBorderRadius}%`,
      }}
    >
      <WorldMap
        isMinimap
        hideControls
        initialZoom={minimapZoom}
        className={styles.minimap}
        rotate={rotateMinimap}
      />
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <MantineProvider
        theme={{
          colorScheme: 'dark',
        }}
      >
        <SettingsProvider>
          <UserProvider>
            <FiltersProvider>
              <MarkersProvider readonly>
                <PlayerProvider>
                  <Minimap />
                </PlayerProvider>
              </MarkersProvider>
            </FiltersProvider>
          </UserProvider>
        </SettingsProvider>
      </MantineProvider>
    ),
    children: [
      {
        id: 'map',
        path: ':map',
        element: null,
      },
    ],
  },
]);

root.render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);

initPlausible();
