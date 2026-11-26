import { cleanup,fireEvent,render,screen,waitFor } from "@testing-library/react";
import { afterEach,beforeEach,expect,it,vi } from "vitest";
import { ApplicationImageField } from "@/components/site/ApplicationImageField";
import { partnerCopy } from "@/i18n/partners";
const c=partnerCopy("pt");
const bitmap=()=>({width:800,height:600,close:vi.fn()}) as unknown as ImageBitmap;
beforeEach(()=>{
  vi.stubGlobal("createImageBitmap",vi.fn(async()=>bitmap()));
  vi.spyOn(HTMLCanvasElement.prototype,"getContext").mockReturnValue({drawImage:vi.fn()} as unknown as CanvasRenderingContext2D);
  vi.spyOn(HTMLCanvasElement.prototype,"toBlob").mockImplementation(callback=>callback(new Blob(["webp-data"],{type:"image/webp"})));
});
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.unstubAllGlobals();});
it("allows an optional photo preview and removes it before submission",async()=>{
  const changed=vi.fn(),busy=vi.fn();
  render(<ApplicationImageField copy={c} type="coach" onChange={changed} onBusy={busy}/>);
  const input=screen.getByLabelText(c.imageCoach);expect(input).not.toBeRequired();
  fireEvent.change(input,{target:{files:[new File(["source"],"photo.jpg",{type:"image/jpeg"})]}});
  await waitFor(()=>expect(screen.getByAltText(c.imagePreview)).toBeVisible());
  expect(changed).toHaveBeenLastCalledWith({contentType:"image/webp",data:btoa("webp-data")});
  expect(busy).toHaveBeenLastCalledWith(false);
  fireEvent.click(screen.getByRole("button",{name:c.imageRemove}));
  expect(screen.queryByAltText(c.imagePreview)).not.toBeInTheDocument();expect(changed).toHaveBeenLastCalledWith(null);
});
it("rejects large or unsupported files without uploading",()=>{
  render(<ApplicationImageField copy={c} type="community" onChange={vi.fn()} onBusy={vi.fn()}/>);
  const input=screen.getByLabelText(c.imageCommunity);
  for(const file of [new File(["<svg/>"],"logo.svg",{type:"image/svg+xml"}),new File([new Uint8Array(5*1024*1024+1)],"photo.png",{type:"image/png"})]){
    fireEvent.change(input,{target:{files:[file]}});expect(screen.getByRole("alert")).toHaveTextContent(c.imageError);
  }
  expect(createImageBitmap).not.toHaveBeenCalled();
});
it("does not restore an older selection after a replacement is rejected",async()=>{
  let resolve!:(value:ImageBitmap)=>void;
  vi.mocked(createImageBitmap).mockImplementationOnce(()=>new Promise<ImageBitmap>(done=>{resolve=done;}));
  const changed=vi.fn(),busy=vi.fn();
  render(<ApplicationImageField copy={c} type="coach" onChange={changed} onBusy={busy}/>);
  const input=screen.getByLabelText(c.imageCoach);
  fireEvent.change(input,{target:{files:[new File(["old"],"photo.jpg",{type:"image/jpeg"})]}});
  fireEvent.change(input,{target:{files:[new File(["gif"],"logo.gif",{type:"image/gif"})]}});
  expect(busy).toHaveBeenLastCalledWith(false);const oldBitmap=bitmap();resolve(oldBitmap);
  await waitFor(()=>expect(oldBitmap.close).toHaveBeenCalled());
  expect(screen.getByRole("alert")).toHaveTextContent(c.imageError);
  expect(screen.queryByAltText(c.imagePreview)).not.toBeInTheDocument();expect(changed).toHaveBeenLastCalledWith(null);
});
