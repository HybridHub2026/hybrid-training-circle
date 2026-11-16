import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { X, ZoomIn, ZoomOut } from "lucide-react";
import { Localized, T, translateText, useLanguage } from "@/i18n";

export function ProductImage({ image, name, width, height }: {
  image: string;
  name: string;
  width: number;
  height: number;
}) {
  const language = useLanguage();
  const [zoom, setZoom] = useState(1);
  const stage = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; left: number; top: number } | null>(null);

  useEffect(() => {
    if (stage.current) {
      stage.current.scrollLeft = (stage.current.scrollWidth - stage.current.clientWidth) / 2;
      stage.current.scrollTop = (stage.current.scrollHeight - stage.current.clientHeight) / 2;
    }
  }, [zoom]);

  function startPan(event: PointerEvent<HTMLDivElement>) {
    if (zoom === 1 || event.pointerType !== "mouse" || event.button !== 0) return;
    drag.current = { x: event.clientX, y: event.clientY, left: event.currentTarget.scrollLeft, top: event.currentTarget.scrollTop };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  }
  function pan(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    event.currentTarget.scrollLeft = drag.current.left - (event.clientX - drag.current.x);
    event.currentTarget.scrollTop = drag.current.top - (event.clientY - drag.current.y);
  }

  return <Dialog.Root onOpenChange={() => { setZoom(1); drag.current = null; }}>
    <Dialog.Trigger asChild>
      <button type="button" aria-label={`${translateText("Ver imagem ampliada", language)}: ${translateText(name, language)}`} className="group relative block w-full cursor-zoom-in overflow-hidden rounded-sm bg-card text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
        <Localized as="img" src={image} alt={name} loading="lazy" decoding="async" width={width} height={height} className="aspect-[4/3] w-full bg-black object-contain" />
        <span className="pointer-events-none absolute left-4 top-4 rounded-sm bg-primary px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary-foreground"><T>{"Em breve"}</T></span>
        <span aria-hidden="true" className="pointer-events-none absolute bottom-3 right-3 rounded-full border border-white/20 bg-black/80 p-2.5 text-white transition-colors group-hover:text-primary"><ZoomIn size={20} /></span>
      </button>
    </Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/90" />
      <Dialog.Content className="fixed left-1/2 top-1/2 z-[101] flex h-[100dvh] w-screen max-w-[1600px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden bg-black shadow-2xl outline-none md:h-[92dvh] md:w-[94vw] md:rounded-sm md:border md:border-border">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border py-2 pl-4 pr-2" style={{ paddingTop: "max(0.5rem, env(safe-area-inset-top))" }}>
          <div className="min-w-0">
            <Dialog.Title className="truncate text-sm font-semibold md:text-base"><T>{name}</T></Dialog.Title>
            <p className="mt-1 text-xs text-primary"><T>{"Disponível em breve"}</T></p>
          </div>
          <Dialog.Close asChild><Localized as="button" type="button" aria-label="Fechar imagem" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"><X size={24} /></Localized></Dialog.Close>
        </div>
        <div className="relative min-h-0 flex-1">
          <div ref={stage} tabIndex={0} role="region" aria-label={translateText("Imagem do produto ampliada", language)} onPointerDown={startPan} onPointerMove={pan} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }} className={`absolute inset-0 overflow-auto overscroll-contain focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-primary ${zoom > 1 ? "cursor-grab active:cursor-grabbing" : ""}`}>
            <div style={{ width: `${zoom * 100}%`, height: `${zoom * 100}%` }}>
              <Localized as="img" src={image} alt={name} width={width} height={height} draggable={false} className="block h-full w-full max-w-none select-none object-contain" />
            </div>
          </div>
        </div>
        <div className="shrink-0 border-t border-border px-4 py-2 text-center" style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}>
          <div className="flex items-center justify-center gap-4">
            <Localized as="button" type="button" aria-label="Reduzir imagem" disabled={zoom === 1} onClick={() => setZoom(value => Math.max(1, value - 1))} className="flex h-11 w-11 items-center justify-center rounded-sm border border-border hover:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-40"><ZoomOut size={20} /></Localized>
            <span role="status" aria-live="polite" className="w-14 text-sm tabular-nums">{zoom * 100}%</span>
            <Localized as="button" type="button" aria-label="Ampliar imagem" disabled={zoom === 3} onClick={() => setZoom(value => Math.min(3, value + 1))} className="flex h-11 w-11 items-center justify-center rounded-sm border border-border hover:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-40"><ZoomIn size={20} /></Localized>
          </div>
          <Dialog.Description className="mx-auto mt-2 max-w-xl text-xs leading-relaxed text-muted-foreground"><T>{"Usa + para ampliar e arrasta a imagem para ver os detalhes."}</T></Dialog.Description>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}
