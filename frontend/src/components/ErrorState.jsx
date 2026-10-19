export default function ErrorState({ message, onRetry }) {
  return (
    <div role="alert" className="rounded-xl border border-[#ff8a80]/30 bg-[#2a1830] p-6">
      <p className="text-sm text-[#ff8a80]">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry}
          className="mt-4 rounded-lg border border-[#3e3040] px-3 py-1.5 text-sm text-[#f2dcf1] hover:bg-[#3e3040]">
          Try again
        </button>
      )}
    </div>
  );
}