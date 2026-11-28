import Image from "next/image";
import { imageVariant, isShowableImage } from "@/lib/images";

// Uploaded pictures are shown whole, never cropped, because event flyers carry
// text near their edges. By default it fills its parent box; with `natural` it
// keeps its own shape, so a tall flyer stays large enough to read.
export function EventPhoto({ url, alt, sizes, natural = false }: {
  url: string | null; alt: string | null; sizes: string; natural?: boolean;
}) {
  if (!isShowableImage(url)) {
    return (
      <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
        <p className="font-semibold text-plum-950">Event photo coming soon</p>
      </div>
    );
  }
  if (url.startsWith("/")) {
    return <Image src={url} alt={alt ?? ""} fill sizes={sizes} className="object-cover" />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- Cloudinary already resizes it
    <img
      src={imageVariant(url, "c_limit,w_1200")}
      srcSet={[480, 800, 1200, 1600].map((w) => `${imageVariant(url, `c_limit,w_${w}`)} ${w}w`).join(", ")}
      sizes={sizes}
      alt={alt ?? ""}
      className={natural ? "mx-auto block h-auto max-h-[48rem] w-auto max-w-full" : "absolute inset-0 size-full object-contain"}
    />
  );
}
