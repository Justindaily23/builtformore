import { imageVariant, isShowableImage } from "@/lib/images";

/** A square portrait, cropped around the face. Shows nothing without a photo. */
export function PersonPhoto({ url, name, className = "size-28" }: { url: string | null; name: string; className?: string }) {
  if (!isShowableImage(url)) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- Cloudinary already resizes it
    <img src={imageVariant(url, "c_fill,g_face,h_480,w_480")} alt={`Photo of ${name}`} width={480} height={480} loading="lazy"
      className={`aspect-square shrink-0 rounded-t-full bg-rose-light object-cover ${className}`} />
  );
}
