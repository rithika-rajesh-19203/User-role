import { useId } from 'react';
import { Radio } from '../Radio/Radio';
import { Inline, Stack, Text } from '../../primitives';
import { cn } from '../../utils/cn';

/**
 * RADIO GROUP — one choice from a few, all of them visible.
 *
 * `Radio` is the control alone: a bare `<input type="radio">` with the drawn
 * states and nothing else. That is correct for it and useless on its own — a
 * radio with no `<label>` is a dot nobody can click and a screen reader
 * announces as "radio button, unlabelled".
 *
 * ── WHY IT IS A FIELDSET ────────────────────────────────────────────────────
 * The `<legend>` is the QUESTION and each label is an ANSWER, and only a
 * fieldset expresses that. Without it a screen reader announces "Yes, radio
 * button, 1 of 2" and never says what Yes is answering — which for
 * "Installation Required" is the entire content of the question.
 *
 * ── AND WHY NOT A `Select` ──────────────────────────────────────────────────
 * Two or three options that the user should be able to compare at a glance are
 * radios; a list they have to open is a `Select`. The line is roughly five: past
 * that the row stops fitting and the options stop being comparable anyway.
 */
export interface RadioGroupOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  /** The question. Rendered as the `<legend>`. */
  label: string;
  options: RadioGroupOption[];
  value: string;
  onChange: (next: string) => void;
  /** `inline` (default) for two or three short answers; `stacked` otherwise. */
  layout?: 'inline' | 'stacked';
  /** Hide the legend visually — only when a label beside the group already asks it. */
  hideLabel?: boolean;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  name?: string;
  className?: string;
}

export function RadioGroup({
  label, options, value, onChange, layout = 'inline', hideLabel,
  required, disabled, error, name, className,
}: RadioGroupProps) {
  const uid = useId();
  const groupName = name ?? uid;
  const Row = layout === 'inline' ? Inline : Stack;

  return (
    //  `border-0 p-0 m-0`: a UA fieldset draws a groove and carries padding, and
    //  every one of those has to be cancelled before it can sit in a form row.
    <fieldset
      className={cn('border-0 p-0 m-0 min-w-0', className)}
      aria-required={required || undefined}
      aria-invalid={error || undefined}
      disabled={disabled}
    >
      <legend className={cn('p-0', hideLabel && 'sr-only')}>
        <Text as="span" size="body" weight="medium" tone={disabled ? 'disabled' : 'default'}>
          {label}
        </Text>
        {required ? <Text as="span" size="body" tone="danger" aria-hidden>{' *'}</Text> : null}
      </legend>

      <Row gap={8} align={layout === 'inline' ? 'center' : 'start'} className={cn(!hideLabel && 'mt-4')}>
        {options.map((o) => {
          const id = `${uid}-${o.value}`;
          return (
            //  The whole label is the target, not just the 12px dot — 2.5.8, and
            //  the reason a bare `Radio` is unusable without this.
            <label
              key={o.value}
              htmlFor={id}
              className={cn(
                'inline-flex items-center gap-4 min-w-0',
                disabled || o.disabled ? 'cursor-not-allowed' : 'cursor-pointer',
              )}
            >
              <Radio
                id={id}
                name={groupName}
                value={o.value}
                checked={value === o.value}
                disabled={disabled || o.disabled}
                error={error}
                onChange={() => onChange(o.value)}
              />
              <Text
                as="span"
                size="body"
                tone={disabled || o.disabled ? 'disabled' : 'default'}
                truncate
                className="min-w-0"
              >
                {o.label}
              </Text>
            </label>
          );
        })}
      </Row>
    </fieldset>
  );
}
