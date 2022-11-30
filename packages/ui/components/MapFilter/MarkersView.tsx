import { mapFiltersCategories } from 'static';
import MarkerSection from './MarkerSection';
import { useFilters } from '../../contexts/FiltersContext';
import { usePersistentState } from '../../utils/storage';
import PresetSelect from '../PresetSelect/PresetSelect';
import MarkerSearch from '../MarkerSearch/MarkerSearch';
import { useUserStore } from '../../utils/userStore';
import { Button, ScrollArea, Stack, TextInput } from '@mantine/core';
import { IconFilter } from '@tabler/icons';

type MarkersViewProps = {
  onAdd: () => void;
};
function MarkersView({ onAdd }: MarkersViewProps): JSX.Element {
  const { filters, setFilters } = useFilters();
  const [search, setSearch] = usePersistentState('searchMarkerTypes', '');
  const account = useUserStore((state) => state.account);

  function handleToggle(filterTypes: string[], checked: boolean) {
    const newFilters = [...filters];
    if (checked) {
      newFilters.push(...filterTypes);
    } else {
      filterTypes.forEach((filterType) => {
        const index = newFilters.indexOf(filterType);
        if (index !== -1) {
          newFilters.splice(newFilters.indexOf(filterType), 1);
        }
      });
    }
    const uniqueFilters = Array.from(new Set(newFilters));
    setFilters(uniqueFilters);
  }
  return (
    <Stack>
      <Button disabled={!account} onClick={onAdd}>
        {account ? 'Add node' : 'Login to add nodes'}
      </Button>
      <MarkerSearch />
      <TextInput
        placeholder="Filter node types..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        icon={<IconFilter />}
      />
      <PresetSelect onChange={setFilters} />
      <ScrollArea style={{ height: 'calc(100vh - 270px)' }} offsetScrollbars>
        {mapFiltersCategories.map((mapFilterCategory) => (
          <MarkerSection
            key={mapFilterCategory.value}
            mapFilterCategory={mapFilterCategory}
            filters={filters}
            onToggle={handleToggle}
            search={search}
          />
        ))}
      </ScrollArea>
    </Stack>
  );
}

export default MarkersView;
