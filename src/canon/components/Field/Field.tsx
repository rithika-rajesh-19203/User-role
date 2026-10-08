import { useId } from 'react';
import type { ReactNode } from 'react';
import { InputField } from '../InputField/InputField';
import type { InputFieldProps } from '../InputField/InputField';
import { Stack, Text } from '../../primitives';
import { cn } from '../../utils/cn';

/**
 * FIELD — design-refs/zf-input-field.md, the `zf-field` half. **Use this one.**
 *
 * The whole field: label, required marker, input, help or error message. §1.1
 * explains why it exists — `Label` and `Help Text` were two loose instances of a
 * remote library sitting on the page, "not in the set, not composed with it. So
 * 'just a label and an input' was not something anyone could take from the
 * library; it was an assembly job, done from memory, with the gap guessed each
 * time."
 *
 * ── THE PART THAT CANNOT LIVE IN FIGMA ───────────────────────────────────────
 * §6: `aria-describedby` is what makes the error message reach a screen reader,
 * and `aria-invalid` is what makes the red border mean anything. Neither is
 * expressible in a component set — "which is the argument for `zf-field`
 * existing: the component's shape is what reminds a developer that a message and
 * a label belong to the input, not beside it."
 *
 * Here the shape does more than remind. `useId` generates the pair, and the
 * wiring is not optional because there is no way to render the message without
 * it.
 *
 * ── AN ERROR STATE CANNOT HIDE ITS MESSAGE ───────────────────────────────────
 * §2.1, and it is the sharpest decision in this md. On the five non-error
 * variants the message is driven by `Show Message`, default off. On the four
 * error variants the visibility reference is **deliberately absent** and the
 * node is permanently on, because a red border with no explanation fails
 * **WCAG 3.3.1 Error Identification**.
 *
 * Figma could only express that by deleting the reference. Here `showMessage` is
 * simply ignored when `error` is set — same guarantee, stated rather than
 * implied. A `message` is therefore required whenever `error` is.
 */
export interface FieldProps
  //  `children` too: an <input> has no children, and this component uses the
  //  name for a render prop.
  extends Omit<InputFieldProps, 'aria-describedby' | 'aria-required' | 'children'> {
  label: string;
  /** Shows a `danger/default` asterisk, and sets `aria-required`. */
  required?: boolean;
  /** Help text, or the error text when `error` is set. */
  message?: string;
  /** Ignored when `error` is set — an error message is never optional (§2.1). */
  showMessage?: boolean;
  /**
   * Render the control yourself — a `Select`, a `Textarea`, a radio group.
   *
   * Without this the component is an `InputField` with a label, which is the
   * common case and stays the default. With it, `Field` is what it should always
   * have been: the LABEL/required/message contract, over any control. A form
   * where the text fields carry that contract and the selects next to them do
   * not is a form with two accessibility stories.
   *
   * It receives everything the control needs to be correctly associated —
   * exactly what `FormRow` hands its own render prop, so the two label
   * treatments cannot drift apart.
   */
  children?: (props: {
    id: string;
    required: boolean;
    error: boolean;
    describedBy: string | undefined;
  }) => ReactNode;
  className?: string;
}

export function Field({
  label, required, message, showMessage, error, disabled, children, className, ...input
}: FieldProps) {
  const id = useId();
  const msgId = `${id}-msg`;

  //  §5: Disabled + error does not exist. Kept consistent with the box.
  const invalid = Boolean(error) && !disabled;
  //  §2.1: on error the message is not optional.
  const visible = Boolean(message) && (invalid || Boolean(showMessage));

  return (
    //  §2: the rows are space/2 (4px) apart.
    <Stack gap={2} className={cn('w-full', className)}>
      {/*
        §2's label row is space/1 (2px) — the asterisk sits tight to the word.
        It is `aria-hidden`: `aria-required` on the input is what announces the
        requirement, and a screen reader reading "asterisk" is noise.
      */}
      <label htmlFor={id} className="inline-flex items-baseline gap-1">
        {/*
          §2.2: the label is the same SIZE as the value and one weight heavier.
          "Same size keeps the vertical rhythm; the weight is what stops a label
          reading as content." The loose instance it replaces was 13 Regular —
          identical to value text, which is the confusion worth removing.
        */}
        <Text as="span" size="body" weight="medium" tone={disabled ? 'disabled' : 'default'}>
          {label}
        </Text>
        {required ? (
          <Text as="span" size="body" tone="danger" aria-hidden>*</Text>
        ) : null}
      </label>

      {/*
        The RENDER PROP. `Field` owns the label, the asterisk, the message and
        the wiring between them — `htmlFor`/`id`, `aria-required`,
        `aria-describedby`. What it does NOT own is the control: a Select, a
        Textarea and an InputField all need exactly the same label row, and
        three near-identical wrappers is the duplication this repo exists to
        avoid. So the control is passed in, and gets handed the four things
        only `Field` can compute.
      */}
      {children
        ? children({
          id,
          required: Boolean(required),
          error: invalid,
          describedBy: visible ? msgId : undefined,
        })
        : (
          <InputField
            id={id}
            error={error}
            disabled={disabled}
            aria-required={required || undefined}
            aria-describedby={visible ? msgId : undefined}
            {...input}
          />
        )}

      {visible ? (
        //  §2.2: body-sm. `text/secondary` for help, `danger/text` for an error —
        //  7.04:1, and a different role from the border's `danger/default`
        //  because one is text and one is a boundary.
        <Text id={msgId} size="body-sm" tone={invalid ? 'danger' : 'secondary'}>
          {message}
        </Text>
      ) : null}
    </Stack>
  );
}
