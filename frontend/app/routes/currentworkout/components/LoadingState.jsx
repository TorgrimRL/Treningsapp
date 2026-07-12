export default function LoadingState() {
  return (
    <div className="pt-[3.8rem] text-center flex flex-col items-center">
      <div
        className="spinner-border animate-spin inline-block w-8 h-8 border-4 border-t-red-500 border-red-200 rounded-full"
        role="status"
      ></div>
      <span className="mt-2">Loading...</span>
    </div>
  );
}
