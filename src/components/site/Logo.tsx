import logoAsset from "@/assets/hybrid-hub-logo.png";

export function Logo({ src, className = "", size = 40 }: { src?: string; className?: string; size?: number }) {
  return (
    <img
      src={src ?? logoAsset}
      alt="Hybrid Hub"
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={`shrink-0 rounded-full object-cover ${className}`}
    />
  );
}
