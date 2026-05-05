export interface PaintboxYarn {
  name: string
  hex: string
  family: string
  weight: string
}

// TODO: populate with full Paintbox yarn color library (worsted, DK, sport, chunky, etc.)
// with accurate hex values per shade. One entry per published colorway.
export const paintboxYarns: PaintboxYarn[] = []
