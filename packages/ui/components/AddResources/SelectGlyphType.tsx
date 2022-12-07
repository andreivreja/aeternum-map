import { forwardRef } from 'react';

import { glyphs } from 'static';
import { Avatar, Group, Select, Text } from '@mantine/core';
import type { Details } from './AddResources';

interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
  image: string;
  label: string;
  description: string;
}

const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
  ({ image, label, ...others }: ItemProps, ref) => (
    <div ref={ref} {...others}>
      <Group noWrap>
        <Avatar src={image} size="sm" />
        <Text size="xs">{label}</Text>
      </Group>
    </div>
  )
);

type SelectGlyphTypeIsRequired = {
  details: Details;
  isRequired: boolean;
  onChange: (details: Details) => void;
};

function SelectGlyphType({
  details,
  onChange,
  isRequired,
}: SelectGlyphTypeIsRequired): JSX.Element {
  return (
    <Select
      label={'Glyph ' + (isRequired ? '(required)' : '')}
      placeholder="Search glyph..."
      autoFocus
      itemComponent={SelectItem}
      searchable
      value={details?.requiredGlyphId?.toString()}
      onChange={(value) => {
        onChange({
          ...details,
          requiredGlyphId: value ? +value : undefined,
        });
      }}
      data={glyphs.map((glyph) => ({
        value: glyph.id.toString(),
        image: glyph.iconUrl,
        label: glyph.name,
      }))}
    />
  );
}

export default SelectGlyphType;