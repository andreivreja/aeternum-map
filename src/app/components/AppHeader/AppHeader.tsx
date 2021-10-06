import { useEffect, useState } from 'react';
import { useIsNewWorldRunning } from '../../utils/games';
import { SHOW_HIDE_APP, useHotkeyBinding } from '../../utils/hotkeys';
import { classNames } from '../../utils/styles';
import {
  closeMainWindow,
  dragMoveWindow,
  getCurrentWindow,
  maximizeCurrentWindow,
  minimizeCurrentWindow,
  restoreCurrentWindow,
  togglePreferedWindow,
  WINDOWS,
} from '../../utils/windows';
import CloseIcon from '../icons/CloseIcon';
import DiscordIcon from '../icons/DiscordIcon';
import GitHubIcon from '../icons/GitHubIcon';
import MaximizeIcon from '../icons/MaximizeIcon';
import MinimizeIcon from '../icons/MinimizeIcon';
import MonitorIcon from '../icons/MonitorIcon';
import RestoreIcon from '../icons/RestoreIcon';
import classes from './AppHeader.module.css';

type AppHeaderProps = {
  className?: string;
};

function AppHeader({ className }: AppHeaderProps): JSX.Element {
  const [isMaximized, setIsMaximized] = useState(false);
  const isNewWorldRunning = useIsNewWorldRunning();
  const hotkeyBinding = useHotkeyBinding(SHOW_HIDE_APP);

  useEffect(() => {
    overwolf.windows.getCurrentWindow((result) => {
      setIsMaximized(result.window.stateEx === 'maximized');
    });
    function handleStateChanged(
      event: overwolf.windows.WindowStateChangedEvent
    ) {
      setIsMaximized(event.window_state_ex === 'maximized');
    }
    overwolf.windows.onStateChanged.addListener(handleStateChanged);
    return () => {
      overwolf.windows.onStateChanged.removeListener(handleStateChanged);
    };
  }, []);

  async function openExternalLink(url: string) {
    const currentWindow = await getCurrentWindow();
    if (currentWindow.name === WINDOWS.OVERLAY) {
      overwolf.utils.openUrlInOverwolfBrowser(url);
    } else {
      overwolf.utils.openUrlInDefaultBrowser(url);
    }
  }

  return (
    <header
      className={classNames(classes.header, className)}
      onMouseDown={dragMoveWindow}
      onDoubleClick={isMaximized ? restoreCurrentWindow : maximizeCurrentWindow}
    >
      <img src="/icon.png" alt="" className={classes.logo} />
      <h1 className={classes.title}>Aeternum Map</h1>
      <p className={classes.gameInfo}>
        {isNewWorldRunning
          ? `${hotkeyBinding} to show/hide app`
          : 'New World is not running'}
      </p>
      <div className={classes.controls}>
        <button
          className={classNames(classes.button, classes['button--github'])}
          data-tooltip="Open Source on GitHub"
          onClick={() =>
            openExternalLink('https://github.com/lmachens/aeternum-map')
          }
        >
          <GitHubIcon />
        </button>
        <button
          className={classNames(classes.button)}
          data-tooltip="Join Discord Community"
          onClick={() => openExternalLink('https://discord.gg/NTZu8Px')}
        >
          <DiscordIcon />
        </button>
        <button
          className={classNames(classes.button)}
          onClick={togglePreferedWindow}
          data-tooltip={'Toggle Desktop/Overlay'}
          disabled={!isNewWorldRunning}
        >
          <MonitorIcon />
        </button>
        <button
          className={classNames(classes.button, classes['button--padded'])}
          onClick={minimizeCurrentWindow}
        >
          <MinimizeIcon />
        </button>
        {!isMaximized ? (
          <button
            className={classNames(classes.button, classes['button--padded'])}
            onClick={() => {
              maximizeCurrentWindow();
              setIsMaximized(true);
            }}
          >
            <MaximizeIcon />
          </button>
        ) : (
          <button
            className={classNames(classes.button, classes['button--padded'])}
            onClick={() => {
              restoreCurrentWindow();
              setIsMaximized(false);
            }}
          >
            <RestoreIcon />
          </button>
        )}
        <button
          className={classNames(
            classes.button,
            classes['button--padded'],
            classes['button--danger']
          )}
          onClick={closeMainWindow}
        >
          <CloseIcon />
        </button>
      </div>
    </header>
  );
}

export default AppHeader;
