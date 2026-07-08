import { Verse } from "./Verse"

export interface Pack
{
    id: string
    verses: Verse[]
    description: string
}

export function createPack(id: string, description: string, verses: Verse[]): Pack {
      return { id, description, verses }
  }