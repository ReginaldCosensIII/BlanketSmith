import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface AnimationContextType {
  headerReady: boolean;
  setHeaderReady: (ready: boolean) => void;
}

const AnimationContext = createContext<AnimationContextType | undefined>(undefined);

export function AnimationProvider({ children }: { children: ReactNode }) {
  const [headerReady, setHeaderReady] = useState(false);

  const handleSetHeaderReady = useCallback((ready: boolean) => {
    setHeaderReady(ready);
  }, []);

  return (
    <AnimationContext.Provider value={{ headerReady, setHeaderReady: handleSetHeaderReady }}>
      {children}
    </AnimationContext.Provider>
  );
}

export function useAnimation() {
  const context = useContext(AnimationContext);
  if (context === undefined) {
    throw new Error("useAnimation must be used within an AnimationProvider");
  }
  return context;
}
