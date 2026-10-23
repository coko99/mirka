"use client";

import { useActionState } from "react";
import { unlockPreview } from "@/app/uskoro/actions";

export function UnlockForm() {
  const [state, action, pending] = useActionState(unlockPreview, null);

  return (
    <form action={action} className="mt-8 space-y-4">
      <label className="block text-sm">
        Šifra
        <input
          required
          type="password"
          name="password"
          inputMode="numeric"
          autoComplete="off"
          className="mt-1 w-full border border-ink/10 bg-white px-4 py-3 outline-none focus:border-ink"
        />
      </label>
      {state?.error ? (
        <p className="border border-rose/30 bg-blush/40 px-3 py-2 text-sm">
          {state.error}
        </p>
      ) : null}
      <button type="submit" className="btn-solid w-full" disabled={pending}>
        {pending ? "…" : "Uđi"}
      </button>
    </form>
  );
}
