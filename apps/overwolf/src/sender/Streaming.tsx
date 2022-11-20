import { patchLiveShareToken } from 'ui/components/ShareLiveStatus/api';
import { copyTextToClipboard } from 'ui/utils/clipboard';
import useShareLivePosition from './useShareLivePosition';
import { writeError } from 'ui/utils/logs';
import CopyIcon from 'ui/components/icons/CopyIcon';
import RefreshIcon from 'ui/components/icons/RefreshIcon';
import BroadcastIcon from 'ui/components/icons/BroadcastIcon';
import { classNames } from 'ui/utils/styles';
import { v4 as uuid } from 'uuid';
import { useEffect, useState } from 'react';
import styles from './Streaming.module.css';
import Settings from '../components/Settings/Settings';
import ServerRadioButton from 'ui/components/LiveServer/ServerRadioButton';
import useServers from 'ui/components/ShareLiveStatus/useServers';
import SyncStatusSender from '../components/SyncStatus/SyncStatusSender';
import useMinimap from '../components/useMinimap';
import { useIsNewWorldRunning } from '../components/store';
import { useUserStore } from 'ui/utils/userStore';
import shallow from 'zustand/shallow';
import { ActionIcon, Group, Tooltip } from '@mantine/core';
import DebouncedInput from '../components/DebouncedInput/DebouncedInput';
import { IconMenu2, IconScreenshot, IconX } from '@tabler/icons';
import { toggleWindow, WINDOWS } from 'ui/utils/windows';

function Streaming(): JSX.Element {
  const { account, refreshAccount } = useUserStore(
    (state) => ({
      account: state.account!,
      refreshAccount: state.refreshAccount,
    }),
    shallow
  );
  const { status, isConnected, peerConnections } = useShareLivePosition();
  const newWorldIsRunning = useIsNewWorldRunning();
  const [showSettings, setShowSettings] = useState(false);
  const [showMinimap, setShowMinimap] = useMinimap();
  const servers = useServers();

  useEffect(() => {
    refreshAccount();
  }, []);

  useEffect(() => {
    if (
      !account.liveShareServerUrl ||
      !servers.some((server) => server.url === account.liveShareServerUrl)
    ) {
      const onlineServers = [...servers]
        .filter((server) => server.delay)
        .sort((a, b) => a.delay! - b.delay!);
      const server = onlineServers[0];
      if (server) {
        updateAccount(account.liveShareToken, server.url);
      }
    }
  }, [servers, account.liveShareServerUrl]);

  const updateAccount = (
    token: string | undefined,
    serverUrl: string | undefined
  ) => {
    patchLiveShareToken(token || uuid(), serverUrl || servers[0].url)
      .then(() => refreshAccount())
      .catch((error) => writeError(error));
  };

  const players = status ? Object.values(status.group) : [];

  return (
    <div className={styles.streaming}>
      <Group
        spacing="xs"
        sx={{
          position: 'absolute',
          right: '0.2em',
          top: '0',
          zIndex: 2,
        }}
      >
        {account.isModerator && (
          <Tooltip label="Toggle influence screenshot overlay">
            <ActionIcon onClick={() => toggleWindow(WINDOWS.INFLUENCE, true)}>
              <IconScreenshot />
            </ActionIcon>
          </Tooltip>
        )}
        <Tooltip label="Toggle settings">
          <ActionIcon
            onClick={() => setShowSettings((showSettings) => !showSettings)}
          >
            {showSettings ? <IconX /> : <IconMenu2 />}
          </ActionIcon>
        </Tooltip>
      </Group>
      <div className={styles.user}>
        <span>
          Welcome back, {account!.name}!<br />
          <SyncStatusSender newWorldIsRunning={newWorldIsRunning} />
        </span>
      </div>
      <div className={styles.form}>
        <p className={styles.guide}>
          Use the token shown below on{' '}
          <a href="https://aeternum-map.gg" target="_blank">
            aeternum-map.gg
          </a>{' '}
          or{' '}
          <a href="https://newworld-map.com" target="_blank">
            newworld&#8209;map.com
          </a>{' '}
          to see your live location on the map. You can use any device that has
          a browser. Share this token and server with your friends to see each
          others' location 🤗.
        </p>
        <div>
          Server
          {servers.map((server) => (
            <ServerRadioButton
              key={server.name}
              server={server}
              checked={account.liveShareServerUrl === server.url}
              onChange={(serverUrl) =>
                updateAccount(account.liveShareToken, serverUrl)
              }
            />
          ))}
        </div>
        <div className={styles.tokenContainer}>
          <Tooltip
            multiline
            label="This token is used to identify you on the map. You can use the
            same token in your group to see each other 🤘."
          >
            <label className={styles.label}>
              Token
              <DebouncedInput
                value={account.liveShareToken}
                placeholder="Use this token to access your live status..."
                onChange={(value) =>
                  updateAccount(value, account.liveShareServerUrl)
                }
              />
            </label>
          </Tooltip>
          <Tooltip label="Generate Random Token">
            <button
              className={styles.action}
              type="button"
              onClick={() => updateAccount(uuid(), account.liveShareServerUrl)}
            >
              <RefreshIcon />
            </button>
          </Tooltip>
          <Tooltip label="Copy Token">
            <button
              className={styles.action}
              type="button"
              disabled={!account.liveShareToken}
              onClick={() => {
                copyTextToClipboard(account.liveShareToken!);
              }}
            >
              <CopyIcon />
            </button>
          </Tooltip>
        </div>
        <div className={styles.status}>
          <aside>
            <h5>Senders</h5>
            <ul className={styles.list}>
              {players.length > 0 ? (
                players.map((player) => (
                  <li key={player.steamName}>
                    {player.username ? player.username : player.steamName}
                  </li>
                ))
              ) : (
                <li>No connections</li>
              )}
            </ul>
          </aside>
          <div
            className={classNames(
              styles.sharing,
              !isConnected && styles.connecting,
              isConnected && styles.connected
            )}
          >
            <BroadcastIcon />
            {!isConnected && 'Connecting'}
            {isConnected && 'Sharing'}
          </div>

          <aside>
            <h5>Receivers</h5>
            <ul className={styles.list}>
              {status?.connections.length ? (
                status.connections.map((connection) => (
                  <li key={connection}>
                    Browser{' '}
                    {peerConnections[connection]?.open
                      ? '(Direct)'
                      : '(Socket)'}
                  </li>
                ))
              ) : (
                <li>No connections</li>
              )}
            </ul>
          </aside>
        </div>
      </div>
      {showSettings && (
        <Settings showMinimap={showMinimap} onShowMinimap={setShowMinimap} />
      )}
    </div>
  );
}

export default Streaming;
