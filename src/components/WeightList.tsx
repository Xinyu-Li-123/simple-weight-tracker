import { Block, BlockTitle, Button, List, ListItem } from "framework7-react";
import type { WeightEntry } from "../types/weight";

type Props = {
  entries: WeightEntry[];
  onDelete: (id: string) => Promise<void>;
};

export function WeightList({ entries, onDelete }: Props) {
  return (
    <>
      <BlockTitle>History</BlockTitle>
      {entries.length === 0 ? (
        <Block strong inset>No entries yet.</Block>
      ) : (
        <List mediaList strongIos dividersIos insetIos>
          {entries.map((entry) => (
            <ListItem key={entry.id} title={`${entry.weight} ${entry.unit}`} subtitle={entry.date} text={entry.note}>
              <Button slot="after" small color="red" type="button" onClick={() => onDelete(entry.id)}>Delete</Button>
            </ListItem>
          ))}
        </List>
      )}
    </>
  );
}
