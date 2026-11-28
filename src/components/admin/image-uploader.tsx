"use client";

import { startTransition, useActionState, useState, type FormEvent } from "react";
import { removeImageAction, saveImageAction, type ImageTarget } from "@/app/admin/(panel)/image-actions";
import { emptyState } from "@/lib/form-state";
import { imageVariant, isShowableImage, MAX_UPLOAD_BYTES } from "@/lib/images";
import { ConfirmButton } from "./confirm-button";
import { Field, Message, inputStyle, primaryButton } from "./form-parts";

const LONGEST_SIDE = 2000;
const MAX_ORIGINAL_BYTES = 25 * 1024 * 1024;

/**
 * Makes a smaller JPEG copy before sending. Phone photos shrink a lot, and the
 * copy leaves out hidden details such as where the photo was taken.
 */
async function prepare(file: File): Promise<Blob> {
  if (file.size > MAX_ORIGINAL_BYTES) throw new Error("This file is too large. Choose one under 25 MB.");
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("This file could not be opened as a picture. Use a JPEG, PNG or WebP picture.");
  }
  const scale = Math.min(1, LONGEST_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const draw = canvas.getContext("2d")!;
  // JPEG has no transparency, so see-through areas become white.
  draw.fillStyle = "#ffffff";
  draw.fillRect(0, 0, canvas.width, canvas.height);
  draw.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const copy = await new Promise<Blob | null>((done) => canvas.toBlob(done, "image/jpeg", 0.86));
  if (!copy || copy.size > MAX_UPLOAD_BYTES) throw new Error("This picture could not be made small enough.");
  return copy;
}

type Props = {
  target: ImageTarget;
  url: string | null;
  /** Current description. Pass for event pictures only. */
  alt?: string | null;
  label: string;
  hint: string;
  ready: boolean;
  idPrefix: string;
};

export function ImageUploader({ target, url, alt, label, hint, ready, idPrefix }: Props) {
  const [state, action, pending] = useActionState(saveImageAction.bind(null, target), emptyState);
  const [problem, setProblem] = useState("");
  const [preparing, setPreparing] = useState(false);
  const askAlt = target.type === "event";
  const busy = pending || preparing;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const file = data.get("file");
    setProblem("");
    if (!(file instanceof File) || file.size === 0) return setProblem("Choose a picture first.");
    setPreparing(true);
    try {
      data.set("file", await prepare(file), "picture.jpg");
      startTransition(() => action(data));
    } catch (error) {
      setProblem((error as Error).message);
    } finally {
      setPreparing(false);
    }
  }

  return (
    <div className="space-y-3">
      <p className="font-semibold">{label}</p>
      {isShowableImage(url) ? (
        // eslint-disable-next-line @next/next/no-img-element -- Cloudinary already resizes it
        <img src={imageVariant(url, "c_limit,h_400,w_500")} alt={alt || "Current picture"} className="max-h-52 max-w-full rounded-lg border border-plum/20" />
      ) : (
        <p className="text-sm">No picture yet.</p>
      )}
      {!ready ? (
        <p className="rounded-lg bg-gold-light p-3 text-sm">
          Uploads are not set up. Add <code>CLOUDINARY_URL</code> to the server&apos;s settings and restart it.
        </p>
      ) : (
        // The key clears the chosen file after a successful save.
        <form key={state.saved} method="post" onSubmit={submit} noValidate className="space-y-3">
          <div>
            <label htmlFor={`${idPrefix}-file`} className="font-semibold">{url ? "Choose a new picture" : "Choose a picture"}</label>
            <input id={`${idPrefix}-file`} type="file" name="file" accept="image/jpeg,image/png,image/webp" className={inputStyle}
              aria-describedby={`${idPrefix}-file-hint`} />
            <p id={`${idPrefix}-file-hint`} className="mt-1 text-sm text-plum/75">{hint}</p>
          </div>
          {askAlt && (
            <Field idPrefix={idPrefix} errors={state.errors} label="Picture description" name="alt" required defaultValue={alt}
              hint="Read aloud to people who cannot see it. If it is a flyer, include its important words." />
          )}
          <button type="submit" disabled={busy} className={`w-full sm:w-auto ${primaryButton}`}>
            {preparing ? "Preparing…" : pending ? "Uploading…" : "Upload picture"}
          </button>
        </form>
      )}
      <p role="alert" className="font-semibold text-red-800 empty:hidden">{problem}</p>
      {!problem && <Message state={state} />}
      {url && (
        <ConfirmButton label="Remove picture" busyLabel="Removing…" question="Remove this picture?"
          run={() => removeImageAction(target)} />
      )}
    </div>
  );
}
