import { useMarkers } from '../../contexts/MarkersContext';
import { getScreenshotUrl } from '../../utils/api';
import { toTimeAgo } from '../../utils/dates';
import AddComment from '../AddComment/AddComment';
import Comment from '../Comment/Comment';
import type { MarkerFull } from './useMarker';
import useMarker from './useMarker';
import { findMapDetails, mapFilters } from 'static';
import Markdown from 'markdown-to-jsx';
import HideMarkerInput from './HideMarkerInput';
import { useAccount } from '../../contexts/UserContext';
import Credit from './Credit';
import Coordinates from './Coordinates';
import Loot from './Loot/Loot';
import {
  Button,
  Drawer,
  Group,
  Image,
  ScrollArea,
  Skeleton,
  Stack,
  Text,
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import ImagePreview from './ImagePreview';
import { lootableMapFilters } from 'static';
import ReportIssueButton from './ReportIssueButton';
import DeleteNode from './DeleteNode';

type MarkerDetailsProps = {
  nodeId?: string;
  onEdit: (marker: MarkerFull) => void;
};

function MarkerDetails({ nodeId, onEdit }: MarkerDetailsProps): JSX.Element {
  const { marker, comments, refresh, loading } = useMarker(nodeId);
  const { setMarkers } = useMarkers();
  const { account } = useAccount();
  const navigate = useNavigate();

  // async function handleUploadScreenshot(screenshotId?: string) {
  //   try {
  //     closeLatestModal();
  //     if (!screenshotId || !marker) {
  //       return;
  //     }
  //     const patchedMarker = await notify(
  //       patchMarker(marker._id, { ...marker, screenshotId })
  //     );
  //     marker.screenshotFilename = patchedMarker.screenshotFilename;
  //     setMarkers((markers) => {
  //       const markersClone = [...markers];
  //       const index = markersClone.findIndex(
  //         (marker) => marker._id === patchedMarker._id
  //       );
  //       if (index === -1) {
  //         return markers;
  //       }
  //       markersClone[index] = patchedMarker;
  //       return markersClone;
  //     });
  //   } catch (error) {
  //     writeError(error);
  //   }
  // }

  const handleClose = () => {
    if (!marker || !marker.map) {
      navigate(`/${location.search}`);
    } else {
      const mapDetail = findMapDetails(marker.map);
      if (mapDetail) {
        navigate(`/${mapDetail.title}${location.search}`);
      }
    }
  };

  const filterItem =
    marker && mapFilters.find((mapFilter) => mapFilter.type === marker.type);
  return (
    <Drawer
      opened={!!nodeId}
      withOverlay={false}
      zIndex={99999}
      padding="sm"
      size="xl"
      styles={(theme) => ({
        header: {
          marginBottom: theme.spacing.xs,
        },
      })}
      title={
        filterItem ? (
          <Group>
            <Image width={32} height={32} src={filterItem.iconUrl} alt="" />{' '}
            {marker.chestType
              ? `${marker.chestType} Chest T${marker.tier}`
              : marker.name || filterItem.title}
          </Group>
        ) : (
          <Skeleton height={20} width={120} />
        )
      }
      onClose={handleClose}
    >
      {(!filterItem || loading) && <Skeleton height={50} />}
      {filterItem && !loading && (
        <Stack style={{ height: 'calc(100% - 50px)' }} spacing="xs">
          <Group>
            {marker.name && (
              <Text size="sm" color="cyan" weight="bold">
                {filterItem.title}
              </Text>
            )}
            {marker.level && <Text size="sm">Level {marker.level}</Text>}
            {marker.customRespawnTimer && (
              <Text size="sm" color="lime">
                Respawns {marker.customRespawnTimer}s
              </Text>
            )}
            <Coordinates position={marker.position} />
          </Group>
          <Text size="xs">
            Added {marker && toTimeAgo(new Date(marker.createdAt))}{' '}
            {marker.username && <Credit username={marker.username} />}
          </Text>
          {marker.description && (
            <Text italic size="sm">
              <Markdown>{marker.description}</Markdown>
            </Text>
          )}
          {marker.screenshotFilename && (
            <ImagePreview src={getScreenshotUrl(marker.screenshotFilename)} />
          )}
          {lootableMapFilters.includes(marker.type) && (
            <ScrollArea style={{ flex: 1, minHeight: 100 }}>
              <Loot markerId={marker._id} />
            </ScrollArea>
          )}
          <ScrollArea
            style={
              lootableMapFilters.includes(marker.type) ? {} : { flexGrow: 1 }
            }
          >
            <Stack spacing="xs">
              {comments?.map((comment) => (
                <Comment
                  key={comment._id}
                  id={comment._id}
                  username={comment.username}
                  message={comment.message}
                  createdAt={comment.createdAt}
                  isIssue={comment.isIssue}
                  removable={Boolean(
                    account &&
                      (account.isModerator ||
                        account.steamId === comment.userId)
                  )}
                  onRemove={() => {
                    refresh();
                    setMarkers((markers) => {
                      const markersClone = [...markers];
                      const index = markersClone.findIndex(
                        (marker) => marker._id === comment.markerId
                      );
                      if (index === -1) {
                        return markers;
                      }
                      markersClone[index].comments =
                        markersClone[index].comments! - 1;
                      return markersClone;
                    });
                  }}
                />
              ))}
            </Stack>
          </ScrollArea>
          <AddComment markerId={marker._id} onAdd={refresh} />
          <HideMarkerInput markerId={marker._id} />
          <ReportIssueButton markerId={marker._id} onReport={refresh} />
          {account &&
            (account.isModerator || account.steamId === marker.userId) && (
              <>
                <Button
                  color="teal"
                  leftIcon="✍"
                  onClick={() => {
                    onEdit(marker);
                    handleClose();
                  }}
                >
                  Edit node
                </Button>
                <DeleteNode
                  markerId={marker._id}
                  onDelete={() => {
                    setMarkers((markers) =>
                      markers.filter(
                        (existingMarker) => existingMarker._id !== marker._id
                      )
                    );
                    refresh();
                    handleClose();
                  }}
                />
              </>
            )}
          {/* <button
          onClick={() =>
            addModal({
              title: 'Add screenshot',
              children: <UploadScreenshot onUpload={handleUploadScreenshot} />,
            })
          }
        >
          <img className={styles.preview} src={'/icon.png'} alt="" />
          Take a screenshot
        </button> */}
        </Stack>
      )}
    </Drawer>
  );
}

export default MarkerDetails;
