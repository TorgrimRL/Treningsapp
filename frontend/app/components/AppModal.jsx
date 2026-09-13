import { useEffect } from "react";
import Modal from "react-modal";

const sizeClasses = {
  standard: "max-w-md",
  wide: "max-w-3xl",
};

const joinClasses = (...classes) => classes.filter(Boolean).join(" ");

export default function AppModal({
  bodyClassName = "",
  children,
  contentLabel,
  isOpen,
  onRequestClose,
  shouldCloseOnEsc = true,
  shouldCloseOnOverlayClick = true,
  showCloseButton = true,
  size = "standard",
  title,
  ...modalProps
}) {
  useEffect(() => {
    Modal.setAppElement("#root");
  }, []);

  return (
    <Modal
      {...modalProps}
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      shouldCloseOnEsc={shouldCloseOnEsc}
      shouldCloseOnOverlayClick={shouldCloseOnOverlayClick}
      contentLabel={contentLabel}
      htmlOpenClassName="ReactModal__Html--open"
      preventScroll
      className={joinClasses(
        "relative mx-auto my-0 min-w-0 w-full bg-darkGray text-white rounded focus:outline-none shadow-lg p-0 max-h-[calc(100dvh-4rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] overflow-hidden text-2sm sm:max-h-[calc(100dvh-8rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))]",
        sizeClasses[size] || sizeClasses.standard
      )}
      overlayClassName="fixed inset-0 z-50 flex items-start justify-center overflow-hidden overscroll-none bg-black/50 px-4 pt-[calc(3rem+env(safe-area-inset-top))] pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pt-[calc(4rem+env(safe-area-inset-top))] sm:pb-[calc(4rem+env(safe-area-inset-bottom))]"
    >
      {showCloseButton && (
        <button
          type="button"
          aria-label="Close modal"
          onClick={onRequestClose}
          className="absolute right-2 top-0 z-10 inline-flex min-h-11 min-w-11 items-center justify-center text-3xl text-white transition-colors hover:text-gray-300 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
        >
          &times;
        </button>
      )}
      <div
        className={joinClasses(
          "min-w-0 max-h-[calc(100dvh-4rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] overflow-y-auto overscroll-contain p-4 sm:max-h-[calc(100dvh-8rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))]",
          bodyClassName
        )}
      >
        {title && (
          <header className="bold text-2xl mb-4 mt-2 border-b border-inputBGGray pr-8">
            {title}
          </header>
        )}
        {children}
      </div>
    </Modal>
  );
}
