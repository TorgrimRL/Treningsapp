import React, { useEffect, useState } from "react";
import { useWaitModal } from "./WaitModalContext";

export default function GlobalWaitModal() {
  const { visible, duration, hideWaitModal } = useWaitModal();
  const [countdown, setCountdown] = useState(duration);

  useEffect(() => {
    if (!visible) return;
    setCountdown(duration);
    const intervalId = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);

          setTimeout(() => {
            hideWaitModal();
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalId);
  }, [visible, duration, hideWaitModal]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "#333",
          padding: "20px",
          borderRadius: "8px",
          color: "white",
          textAlign: "center",
          maxWidth: "400px",
          margin: "0 auto",
        }}
      >
        <h2>Please wait</h2>
        <p>The database is waking up</p>
        <p>It usually takes a minute. {countdown} seconds left.</p>
      </div>
    </div>
  );
}
