import type { SelectOption } from '../Select/Select';
import type { InputFormat } from '../InputField/InputField';

export type ProductCellKind = 'input' | 'select' | 'read-only';

export interface ProductColumn {
  id: string;
  label: string;
  kind: ProductCellKind;
  /** px. User-resizable unless `resizable: false`. */
  width: number;
  min: number;
  /** EXACTLY ONE column absorbs the slack. §4.2 — and it still needs `min`. */
  flex?: boolean;
  /**
   * `start` (default) · `center` · `end`.
   *
   * §4.1 keeps the EDITABLE numeric columns left: the caret lands where the eye
   * already is, and a right-aligned input whose value grows leftward is
   * disorienting while typing. A COMPUTED column is the opposite case — it is
   * read and compared, never typed — so it right-aligns, the same reasoning the
   * totals card follows.
   */
  align?: 'start' | 'center' | 'end';
  resizable?: boolean;
  /** `kind: 'select'` only. */
  options?: SelectOption[];
  placeholder?: string;
  /**
   * Draws the asterisk in the column header — this column must be filled on
   * every item row.
   *
   * It marks the COLUMN, not a cell, because that is what is true: the rule is
   * "every line needs a quantity", not "this line does". Marking cells would put
   * an asterisk in every row of the column and say nothing extra.
   */
  required?: boolean;
  /**
   * `kind: 'input'` only. What the cell will accept — Qty and Discount are
   * `numeric`, Rate is `decimal`. Filtered on the way in, so a paste cannot get
   * past it either.
   *
   * §4.1's left alignment is about where the CARET goes; this is about what it
   * can put there. A grid whose Qty column accepts "3 boxes" produces a total
   * of NaN, and the first place anyone sees that is the totals card.
   */
  format?: InputFormat;
  /** Renders `text/secondary` regular rather than `text/default` medium. */
  muted?: boolean;
}

export interface ProductRow {
  id: string;
  kind: 'item' | 'group';
  /** Group rows only. */
  label?: string;
  /** Item rows only, keyed by column id. */
  values?: Record<string, string>;
}

export interface TotalRow {
  id: string;
  label: string;
  kind: 'static' | 'editable' | 'emphasis';
  amount: string;
  input?: string;
}
