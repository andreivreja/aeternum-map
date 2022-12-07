import {
  ActionIcon,
  Anchor,
  Button,
  Divider,
  Group,
  Image,
  Popover,
  Stack,
  Text,
  Tooltip,
  UnstyledButton,
} from '@mantine/core';
import { IconHelp, IconLogout, IconSettings, IconUser } from '@tabler/icons';
import { trackOutboundLinkClick } from '../../utils/stats';
import type { AccountDTO } from '../../utils/userStore';
import { useUserStore } from '../../utils/userStore';
import DiscordIcon from '../icons/DiscordIcon';
import GitHubIcon from '../icons/GitHubIcon';
import shallow from 'zustand/shallow';
import { useEffect, useState } from 'react';
import { fetchJSON } from '../../utils/api';
import ResetDiscoveredNodes from '../Settings/ResetDiscoveredNodes';
import SupporterInput from '../SupporterInput/SupporterInput';
import FAQModal from '../FAQ/FAQModal';
import SettingsDialog from '../Settings/SettingsDialog';
import { isEmbed } from '../../utils/routes';
const { VITE_API_ENDPOINT = '' } = import.meta.env;

const UserAction = () => {
  const { account, setAccount, logoutAccount, refreshAccount } = useUserStore(
    (state) => ({
      account: state.account,
      setAccount: state.setAccount,
      logoutAccount: state.logoutAccount,
      refreshAccount: state.refreshAccount,
    }),
    shallow
  );

  const [verifyingSessionId, setVerifyingSessionId] = useState('');
  const [opened, setOpened] = useState(false);

  const [showFAQ, setShowFAQ] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (account) {
      refreshAccount();
    }
  }, []);

  useEffect(() => {
    if (!verifyingSessionId) {
      return;
    }
    const intervalId = setInterval(async () => {
      try {
        const init: RequestInit = {};
        if (verifyingSessionId) {
          init.headers = {
            'x-session-id': verifyingSessionId,
            'x-prevent-logout': 'true',
          };
        }
        const newAccount = await fetchJSON<AccountDTO>(
          `/api/auth/account`,
          init
        );
        setAccount(newAccount);
        setVerifyingSessionId('');
      } catch (error) {
        // Keep waiting
      }
    }, 3000);
    return () => clearInterval(intervalId);
  }, [verifyingSessionId]);

  async function handleLogin() {
    const newSessionId = await fetchJSON<string>('/api/auth/session');

    const url = `${VITE_API_ENDPOINT}/api/auth/steam?sessionId=${newSessionId}`;
    window.open(url, '_blank');

    setVerifyingSessionId(newSessionId);
  }

  if (isEmbed) {
    return <></>;
  }

  return (
    <Group spacing="xs">
      <FAQModal opened={showFAQ} onClose={() => setShowFAQ(false)} />
      <Tooltip label="Settings">
        <ActionIcon
          size="lg"
          variant="default"
          radius="xl"
          onClick={() => {
            setShowSettings(true);
            setOpened(false);
          }}
          aria-label="Settings"
        >
          <IconSettings />
        </ActionIcon>
      </Tooltip>
      <Popover
        width={300}
        withArrow
        shadow="md"
        position="bottom"
        opened={opened}
        onChange={setOpened}
      >
        <Popover.Target>
          <Button
            radius="xl"
            color={account ? 'teal' : 'blue'}
            variant="filled"
            leftIcon={<IconUser />}
            onClick={() => setOpened((o) => !o)}
          >
            <Text
              component="span"
              sx={{
                maxWidth: 100,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {account?.name || 'Sign in'}
            </Text>
          </Button>
        </Popover.Target>
        <Popover.Dropdown>
          <Stack>
            {!account ? (
              <>
                <Text size="xs" color="dimmed" align="center">
                  For some features like location sharing, creating routes and
                  setting nodes as discovered, an account is required. Please
                  sign in:
                </Text>
                <UnstyledButton onClick={handleLogin}>
                  <Image
                    src="/steam.png"
                    width={180}
                    height={35}
                    alt="Sign in through Steam"
                    sx={{
                      margin: '0 auto',
                    }}
                  />
                </UnstyledButton>
                {verifyingSessionId && (
                  <Text
                    variant="gradient"
                    gradient={{ from: 'indigo', to: 'cyan', deg: 45 }}
                    sx={{ fontFamily: 'Greycliff CF, sans-serif' }}
                    ta="center"
                    fw={700}
                  >
                    Waiting for Steam
                  </Text>
                )}
              </>
            ) : (
              <>
                <SupporterInput />
                <ResetDiscoveredNodes />
                <Button
                  color="red"
                  onClick={logoutAccount}
                  leftIcon={<IconLogout />}
                  variant="outline"
                >
                  Sign out
                </Button>
              </>
            )}
            <Divider />

            <Group spacing="xs" position="center">
              <Tooltip label="FAQ">
                <ActionIcon
                  variant="default"
                  onClick={() => setShowFAQ(true)}
                  radius="sm"
                  size="xl"
                  aria-label="FAQ"
                >
                  <IconHelp />
                </ActionIcon>
              </Tooltip>

              <Tooltip label="Open Source on GitHub">
                <ActionIcon
                  component="a"
                  color="dark"
                  variant="filled"
                  href="https://github.com/lmachens/aeternum-map"
                  target="_blank"
                  onClick={() =>
                    trackOutboundLinkClick(
                      'https://github.com/lmachens/aeternum-map'
                    )
                  }
                  size="xl"
                  radius="sm"
                  aria-label="Open Source on GitHub"
                >
                  <GitHubIcon />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Join Discord Community">
                <ActionIcon
                  component="a"
                  href="https://discord.gg/NTZu8Px"
                  target="_blank"
                  onClick={() =>
                    trackOutboundLinkClick('https://discord.gg/NTZu8Px')
                  }
                  sx={{
                    backgroundColor: 'rgb(88, 101, 242)',
                    ':hover': {
                      backgroundColor: 'rgb(105, 116, 243)',
                    },
                  }}
                  size="xl"
                  radius="sm"
                  aria-label="Join Discord Community"
                >
                  <DiscordIcon />
                </ActionIcon>
              </Tooltip>
            </Group>
            <Divider />
            <Group spacing="xs" position="center">
              <Anchor
                size="xs"
                href="https://www.overwolf.com/app/Leon_Machens-Aeternum_Map"
                title="Aeternum Map Companion"
                target="_blank"
              >
                Overwolf App
              </Anchor>
              <Anchor
                size="xs"
                href="https://www.arkesia.gg/"
                title="Interactive map for Lost Ark"
                target="_blank"
              >
                Arkesia.gg
              </Anchor>
              <Anchor
                size="xs"
                href="https://th.gl/"
                title="Trophies app for League of Legends"
                target="_blank"
              >
                Trophy Hunter
              </Anchor>
              <Anchor
                size="xs"
                href="https://www.soc.gg/"
                title="A Songs of Conquest fansite"
                target="_blank"
              >
                SoC.gg
              </Anchor>
              <Anchor
                size="xs"
                href="https://github.com/lmachens/skeleton"
                title="Simply display any website as customizable Overlay"
                target="_blank"
              >
                Skeleton
              </Anchor>
              <Anchor size="xs" href="/privacy.html" target="_blank">
                Privacy Policy
              </Anchor>
            </Group>
          </Stack>
        </Popover.Dropdown>
      </Popover>
      <SettingsDialog
        opened={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </Group>
  );
};

export default UserAction;
