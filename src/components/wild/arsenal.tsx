import { useState } from "react";
import { isPortraitSrc } from "@/lib/wild/bench";
import { useWild } from "@/lib/wild/store";
import { SOLO_STACK } from "@/lib/wild/types";

const fieldClass =
  "min-h-11 w-full rounded-lg border border-line bg-inset px-3 text-sm text-ink placeholder:text-faint";

async function compressPortrait(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 720 / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not read that image.");
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.72);
}

function TagField({
  label,
  hint,
  values,
  onAdd,
  onRemove,
}: {
  label: string;
  hint: string;
  values: string[];
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const commit = () => {
    onAdd(draft);
    setDraft("");
  };
  return (
    <div>
      <label className="text-xs font-medium tracking-wide text-muted uppercase">
        {label}
      </label>
      <p className="mt-1 text-sm text-faint">{hint}</p>
      <div className="mt-2 flex gap-2">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commit();
            }
          }}
          maxLength={80}
          className={fieldClass}
          aria-label={label}
        />
        <button
          type="button"
          onClick={commit}
          className="min-h-11 shrink-0 rounded-lg border border-line px-3 text-sm font-medium text-ink"
        >
          Add
        </button>
      </div>
      {values.length > 0 ? (
        <ul className="mt-2 flex flex-wrap gap-2">
          {values.map((value) => (
            <li key={value}>
              <button
                type="button"
                onClick={() => onRemove(value)}
                className="min-h-11 rounded-full border border-line px-3 text-left text-sm text-ink"
                aria-label={`Remove ${value}`}
              >
                {value}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function Arsenal() {
  const operator = useWild((state) => state.operator);
  const patchOperator = useWild((state) => state.patchOperator);
  const addTag = useWild((state) => state.addTag);
  const removeTag = useWild((state) => state.removeTag);
  const [portraitError, setPortraitError] = useState("");

  const onPortrait = async (file: File | undefined) => {
    setPortraitError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPortraitError("Use a JPEG, PNG, or WebP.");
      return;
    }
    if (file.size > 12_000_000) {
      setPortraitError("That image is too large.");
      return;
    }
    try {
      const src = await compressPortrait(file);
      if (!isPortraitSrc(src)) {
        setPortraitError("Could not store that image.");
        return;
      }
      patchOperator({ portrait: src });
    } catch {
      setPortraitError("Could not read that image.");
    }
  };

  return (
    <section className="rounded-3xl border border-line bg-panel p-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-medium tracking-wide text-muted uppercase">
          Arsenal
        </h2>
        <button
          type="button"
          className="min-h-11 text-sm text-ink underline decoration-line underline-offset-4"
          onClick={() => patchOperator(SOLO_STACK)}
        >
          Solo local stack
        </button>
      </div>
      <p className="mt-2 text-sm text-muted">
        The bench only believes what is listed here. Search itself stays wide.
      </p>

      <label className="mt-5 block text-xs font-medium tracking-wide text-muted uppercase">
        Name on the plate
      </label>
      <input
        value={operator.name}
        onChange={(event) => patchOperator({ name: event.target.value.slice(0, 80) })}
        placeholder="Your name"
        className={`${fieldClass} mt-2`}
      />

      <div className="mt-5">
        <p className="text-xs font-medium tracking-wide text-muted uppercase">Image</p>
        <p className="mt-1 text-sm text-faint">
          Leads the restatement. Supplied by you. Never generated.
        </p>
        {operator.portrait && isPortraitSrc(operator.portrait) ? (
          <img
            src={operator.portrait}
            alt={operator.name ? `${operator.name} portrait` : "Operator portrait"}
            className="portrait-well mt-3 w-full rounded-lg object-cover"
          />
        ) : (
          <div className="portrait-well mt-3 flex items-end rounded-lg bg-inset p-4">
            <p className="text-2xl font-medium tracking-tight text-ink">
              {operator.name || "Your image"}
            </p>
          </div>
        )}
        <div className="mt-2 flex flex-wrap gap-2">
          <label className="inline-flex min-h-11 cursor-pointer items-center rounded-lg border border-line px-3 text-sm font-medium text-ink">
            {operator.portrait ? "Replace image" : "Add image"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                void onPortrait(file);
                event.target.value = "";
              }}
            />
          </label>
          {operator.portrait ? (
            <button
              type="button"
              className="min-h-11 rounded-lg px-3 text-sm text-muted"
              onClick={() => patchOperator({ portrait: "" })}
            >
              Remove
            </button>
          ) : null}
        </div>
        {portraitError ? (
          <p className="mt-2 text-sm text-danger" role="alert">
            {portraitError}
          </p>
        ) : null}
      </div>

      <div className="mt-5 grid gap-5">
        <TagField
          label="Tools"
          hint="Languages, models, libraries you can run now."
          values={operator.tools}
          onAdd={(value) => addTag("tools", value)}
          onRemove={(value) => removeTag("tools", value)}
        />
        <TagField
          label="Hardware"
          hint="Machines you actually have."
          values={operator.hardware}
          onAdd={(value) => addTag("hardware", value)}
          onRemove={(value) => removeTag("hardware", value)}
        />
        <TagField
          label="Subscriptions"
          hint="Leave empty if you are not paying for it."
          values={operator.subscriptions}
          onAdd={(value) => addTag("subscriptions", value)}
          onRemove={(value) => removeTag("subscriptions", value)}
        />
        <TagField
          label="Hard limits"
          hint="Time, money, legal, or operational lines the bench must not cross."
          values={operator.constraints}
          onAdd={(value) => addTag("constraints", value)}
          onRemove={(value) => removeTag("constraints", value)}
        />
      </div>
    </section>
  );
}
