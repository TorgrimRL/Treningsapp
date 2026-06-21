import { createContext, useCallback, useContext, useMemo, useState } from "react";

const WaitModalContext = createContext();

export function WaitModalProvider({ children }) {
  const [visible, setVisible] = useState(false);
  const [duration, setDuration] = useState(60);

  const showWaitModal = useCallback((seconds = 60) => {
    setDuration(seconds);
    setVisible(true);
  }, []);

  const hideWaitModal = useCallback(() => {
    setVisible(false);
  }, []);

  const value = useMemo(
    () => ({ visible, duration, showWaitModal, hideWaitModal }),
    [visible, duration, showWaitModal, hideWaitModal]
  );

  return (
    <WaitModalContext.Provider value={value}>
      {children}
    </WaitModalContext.Provider>
  );
}

export function useWaitModal() {
  return useContext(WaitModalContext);
}
