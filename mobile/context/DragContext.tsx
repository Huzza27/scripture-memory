import { createContext, useContext, useState, ReactNode } from "react";
import { SavedVerse } from "../utils/storage";

interface DragContextValue {
  pendingVerse: SavedVerse | null;
  sourceFolderId: string | null;
  setPendingDrag: (verse: SavedVerse, folderId: string) => void;
  clearPendingDrag: () => void;
}

const DragContext = createContext<DragContextValue>({
  pendingVerse: null,
  sourceFolderId: null,
  setPendingDrag: () => {},
  clearPendingDrag: () => {},
});

export function DragProvider({ children }: { children: ReactNode }) {
  const [pendingVerse, setPendingVerse] = useState<SavedVerse | null>(null);
  const [sourceFolderId, setSourceFolderId] = useState<string | null>(null);

  const setPendingDrag = (verse: SavedVerse, folderId: string) => {
    setPendingVerse(verse);
    setSourceFolderId(folderId);
  };

  const clearPendingDrag = () => {
    setPendingVerse(null);
    setSourceFolderId(null);
  };

  return (
    <DragContext.Provider value={{ pendingVerse, sourceFolderId, setPendingDrag, clearPendingDrag }}>
      {children}
    </DragContext.Provider>
  );
}

export const useDragContext = () => useContext(DragContext);
