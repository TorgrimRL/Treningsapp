import Modal from "react-modal";

Modal.setAppElement("#root");

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
  return (
    <Modal
      {...modalProps}
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      shouldCloseOnEsc={shouldCloseOnEsc}
      shouldCloseOnOverlayClick={shouldCloseOnOverlayClick}
      contentLabel={contentLabel}
      className={joinClasses(
        "relative mx-auto my-0 bg-darkGray text-white rounded focus:outline-none shadow-lg p-0 w-[calc(100vw-2rem)] max-h-[calc(100vh-8rem)] overflow-hidden text-2sm",
        sizeClasses[size] || sizeClasses.standard
      )}
      overlayClassName="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black bg-opacity-50 px-4 py-16"
    >
      {showCloseButton && (
        <button
          type="button"
          aria-label="Close modal"
          onClick={onRequestClose}
          className="absolute top-0 right-2 z-10 m-0 text-3xl text-white hover:text-gray-300"
        >
          &times;
        </button>
      )}
      <div
        className={joinClasses(
          "max-h-[calc(100vh-8rem)] overflow-y-auto p-4",
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
