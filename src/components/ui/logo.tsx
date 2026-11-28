import Image from "next/image";

// The header version leaves out the small "BUILT FOR MORE" lettering, which
// cannot be read at this size. The image has a white background, so only place
// it on white. Replace with the designer's SVG or transparent PNG when ready.
export function Logo({ name }: { name: string }) {
  return <Image src="/brand/logo-mark.png" alt={name} width={906} height={491} priority className="h-14 w-auto" />;
}
