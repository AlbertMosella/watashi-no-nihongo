import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { Chip } from './Chip';
import { SegmentedControl } from './SegmentedControl';
import { Switch } from './Switch';

describe('Switch', () => {
  it('és un role=switch accessible pel seu text', async () => {
    const onChange = vi.fn();
    render(<Switch label="Romaji" checked={false} onChange={onChange} />);
    const sw = screen.getByRole('switch', { name: 'Romaji' });
    expect(sw).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(sw);
    expect(onChange).toHaveBeenCalledWith(true);
  });
});

describe('SegmentedControl', () => {
  function Harness() {
    const [value, setValue] = useState<'a' | 'b' | 'c'>('a');
    return (
      <SegmentedControl
        label="Opció"
        value={value}
        onChange={setValue}
        options={[
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B' },
          { value: 'c', label: 'C' },
        ]}
      />
    );
  }

  it('selecciona amb clic i es mou amb fletxes', async () => {
    render(<Harness />);
    const group = screen.getByRole('radiogroup', { name: 'Opció' });
    expect(group).toBeInTheDocument();
    await userEvent.click(screen.getByRole('radio', { name: 'B' }));
    expect(screen.getByRole('radio', { name: 'B' })).toHaveAttribute('aria-checked', 'true');
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'C' })).toHaveAttribute('aria-checked', 'true');
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'A' })).toHaveAttribute('aria-checked', 'true');
  });
});

describe('Chip', () => {
  it('reflecteix la selecció amb aria-pressed', async () => {
    const onToggle = vi.fn();
    render(
      <Chip selected onToggle={onToggle} hue={120}>
        Fruites
      </Chip>,
    );
    const chip = screen.getByRole('button', { name: 'Fruites' });
    expect(chip).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(chip);
    expect(onToggle).toHaveBeenCalled();
  });
});
