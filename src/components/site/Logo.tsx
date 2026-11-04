import logoAsset from "@/assets/hybrid-hub-logo.png.asset.json";

export function Logo({ src, className = "" }: { src?: string; className?: string }) {
  return (
    <img
      src={src ?? logoAsset.url}
      alt="Hybrid Hub"
      className={`h-10 w-10 rounded-full object-cover ${className}`}
    />
  );
}
