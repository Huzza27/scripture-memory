// VERSE TYPE — types/Verse.ts
// Shared data shape for a Bible verse used throughout the app.
//   id:          URL-safe slug, e.g. "john-3-16" (used as the route param in /practice/[id])
//   reference:   Human-readable reference, e.g. "John 3:16"
//   translation: Version code, e.g. "NIV", "ESV"
//   text:        The actual verse text (may be empty string when not yet fetched)

export interface Verse {
    id: string
    reference: string
    translation: string
    text: string
    category: string
    book: string
    month: string

}