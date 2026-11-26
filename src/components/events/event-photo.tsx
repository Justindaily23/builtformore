import Image from "next/image";

// Only images stored with the site are shown. Image uploads come in a later step.
export function EventPhoto({ url, alt, sizes }: { url: string | null; alt: string | null; sizes: string }) {
  if (url?.startsWith("/") && !url.startsWith("//")) {
    return <Image src={url} alt={alt ?? ""} fill sizes={sizes} className="object-cover" />;
  }
  return (
    <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
      <p className="font-semibold text-plum-950">Event photo coming soon</p>
    </div>
  );
}
