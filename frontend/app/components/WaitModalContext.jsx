import React, { createContext, useContext, useState } from "react";

const WaitModalContext = createContext();

export function WaitModalProvider({ children }) {
  const [visible, setVisible] = useState(false);
  const [duration, setDuration] = useState(60);

  const showWaitModal = (seconds = 60) => {
    setDuration(seconds);
    setVisible(true);
  };

  const hideWaitModal = () => {
    setVisible(false);
  };

  return (
    <WaitModalContext.Provider
      value={{ visible, duration, showWaitModal, hideWaitModal }}
    >
      {children}
    </WaitModalContext.Provider>
  );
}

export function useWaitModal() {
  return useContext(WaitModalContext);
}
