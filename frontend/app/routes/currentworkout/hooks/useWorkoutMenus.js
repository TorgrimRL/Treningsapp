import { useCallback, useEffect, useRef, useState } from "react";

export default function useWorkoutMenus() {
  const [openMenus, setOpenMenus] = useState({});
  const [openSetMenus, setOpenSetMenus] = useState({});
  const menuRefs = useRef([]);
  const setMenuRefs = useRef({});

  const toggleSetMenu = useCallback((id) => {
    setOpenSetMenus((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  }, []);

  const toggleMenu = useCallback((id) => {
    setOpenMenus((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      let clickedOutside = true;

      menuRefs.current.forEach((ref) => {
        if (ref && ref.contains(event.target)) {
          clickedOutside = false;
        }
      });

      Object.values(setMenuRefs.current).forEach((ref) => {
        if (ref && ref.contains(event.target)) {
          clickedOutside = false;
        }
      });

      if (clickedOutside) {
        setOpenMenus({});
        setOpenSetMenus({});
      }
    };

    const handleMouseDown = (event) => {
      if (
        menuRefs.current.some((ref) => ref?.contains(event.target)) ||
        Object.values(setMenuRefs.current).some((ref) =>
          ref?.contains(event.target)
        )
      ) {
        event.stopPropagation();
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  return {
    openMenus,
    setOpenMenus,
    openSetMenus,
    setOpenSetMenus,
    menuRefs,
    setMenuRefs,
    toggleMenu,
    toggleSetMenu,
  };
}
