import { LoaderCircle, Save } from "lucide-react";

type SubmitButtonProps = {
  isSubmitting: boolean;
  label?: string;
  submittingLabel?: string;
};

export function SubmitButton({
  isSubmitting,
  label = "Save",
  submittingLabel = "Saving...",
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className="inline-flex h-10 min-w-24 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isSubmitting ? (
        <>
          <LoaderCircle
            size={17}
            className="animate-spin"
          />
          {submittingLabel}
        </>
      ) : (
        <>
          <Save size={17} />
          {label}
        </>
      )}
    </button>
  );
}