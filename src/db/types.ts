import type {
  ColumnType,
  Generated,
  Insertable,
  Selectable,
  Updateable,
} from "kysely";

export interface Database {
  labels: LabelsTable;
  label_history: LabelHistoryTable;
}

export interface LabelsTable {
  id: Generated<number>;
  did: string;
  at_uri: string | null;
  label_value: string;
  created_at: ColumnType<Date, string | undefined, never>;
  updated_at: ColumnType<Date, string | undefined, string | undefined>;
  negated: ColumnType<boolean, boolean | undefined, boolean>;
  source: ColumnType<
    "automod" | "ozone",
    "automod" | "ozone" | undefined,
    "automod" | "ozone"
  >;
}

export interface LabelHistoryTable {
  id: Generated<number>;
  did: string;
  at_uri: string | null;
  label_value: string;
  action: "created" | "negated" | "updated";
  timestamp: ColumnType<Date, string | undefined, never>;
  source: string | null;
  metadata: Record<string, unknown> | null;
}

export type Label = Selectable<LabelsTable>;
export type NewLabel = Insertable<LabelsTable>;
export type LabelUpdate = Updateable<LabelsTable>;

export type LabelHistory = Selectable<LabelHistoryTable>;
export type NewLabelHistory = Insertable<LabelHistoryTable>;
