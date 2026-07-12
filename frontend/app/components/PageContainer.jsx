const sizeClasses = {
  narrow: "max-w-3xl",
  standard: "max-w-6xl",
  wide: "max-w-[1600px]",
};

export default function PageContainer({
  children,
  size = "standard",
  className = "",
}) {
  const sizeClass = sizeClasses[size] || sizeClasses.standard;

  return (
    <div className={`mx-auto w-full ${sizeClass} ${className}`.trim()}>
      {children}
    </div>
  );
}
