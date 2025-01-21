import type { Record } from '@atproto/api/dist/client/types/com/atproto/repo/listRecords';

export interface RecordExt extends Record {
  value: RecordValue;
}

interface RecordValue {
  $type: string,
  createdAt: string,
  text?: string,
  reply?: { parent: { uri: string } },
  subject?: { 
    cid: string,
    uri: string,
  },
}
