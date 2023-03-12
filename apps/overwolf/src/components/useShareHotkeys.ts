import { useEffect } from 'react';
import type { Socket } from 'socket.io-client';
import type { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { MARKER_ACTION, MARKER_ACTION_SECONDARY } from '../utils/hotkeys';

function useShareHotkeys(
  socket: Socket<DefaultEventsMap, DefaultEventsMap> | null
) {
  useEffect(() => {
    if (!socket) {
      return;
    }
    const handleHotkeyPressed = async (
      event: overwolf.settings.hotkeys.OnPressedEvent
    ) => {
      if (
        event.name === MARKER_ACTION ||
        event.name === MARKER_ACTION_SECONDARY
      ) {
        setTimeout(() => {
          socket.emit('hotkey', event.name);
        }, 100);
      } else {
        socket.emit('hotkey', event.name);
      }
    };
    overwolf.settings.hotkeys.onPressed.addListener(handleHotkeyPressed);
    return () => {
      overwolf.settings.hotkeys.onPressed.removeListener(handleHotkeyPressed);
    };
  }, [socket]);
}

export default useShareHotkeys;