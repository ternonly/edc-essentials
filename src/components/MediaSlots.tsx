import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

type Asset = { id: string; slot: string; type: "image" | "video"; url: string };

const IMG_SLOTS = ["1", "2", "3", "4", "5", "6"];
const VID_SLOTS = ["v1", "v2"];

function youtubeEmbed(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/,
  );
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

export function MediaSlots({ productId }: { productId: string }) {
  const { isAdmin } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  async function load() {
    const { data } = await supabase
      .from("product_assets")
      .select("id,slot,type,url")
      .eq("product_id", productId);
    setAssets((data ?? []) as Asset[]);
  }
  useEffect(() => { load(); }, [productId]);

  function find(slot: string) {
    return assets.find((a) => a.slot === slot);
  }

  async function uploadFile(slot: string, type: "image" | "video", file: File) {
    setBusy(slot);
    try {
      const ext = file.name.split(".").pop() || "bin";
      const path = `${productId}/${slot}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("s72-product-assets")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("s72-product-assets").getPublicUrl(path);
      await supabase.from("product_assets").upsert(
        { product_id: productId, slot, type, url: pub.publicUrl },
        { onConflict: "product_id,slot" },
      );
      await load();
    } catch (e) {
      alert(`Upload failed: ${(e as Error).message}`);
    } finally {
      setBusy(null);
    }
  }

  async function setYoutube(slot: string) {
    const url = window.prompt("Paste a YouTube URL");
    if (!url) return;
    const embed = youtubeEmbed(url);
    if (!embed) { alert("Not a valid YouTube URL"); return; }
    setBusy(slot);
    await supabase.from("product_assets").upsert(
      { product_id: productId, slot, type: "video", url: embed },
      { onConflict: "product_id,slot" },
    );
    await load();
    setBusy(null);
  }

  async function clearSlot(slot: string) {
    if (!confirm("Remove this media?")) return;
    await supabase
      .from("product_assets")
      .delete()
      .eq("product_id", productId)
      .eq("slot", slot);
    await load();
  }

  return (
    <div className={`media-slots ${editMode ? "edit-mode" : ""}`}>
      {isAdmin && (
        <div className="media-slots__bar">
          <button
            type="button"
            className="s72-lang"
            onClick={() => setEditMode((v) => !v)}
          >
            {editMode ? "Done editing" : "Edit mode"}
          </button>
        </div>
      )}

      <h3 className="media-slots__title">Gallery</h3>
      <div className="gallery-grid">
        {IMG_SLOTS.map((slot) => {
          const a = find(slot);
          return (
            <div key={slot} className="gallery-slot">
              {a && <img src={a.url} alt={`${productId} ${slot}`} loading="lazy" />}
              {!a && editMode && <span className="slot-empty">Slot {slot}</span>}
              {editMode && (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    ref={(el) => { fileInputs.current[`i-${slot}`] = el; }}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadFile(slot, "image", f);
                      e.target.value = "";
                    }}
                  />
                  <button
                    type="button"
                    className="admin-upload-btn"
                    title="Upload image"
                    onClick={() => fileInputs.current[`i-${slot}`]?.click()}
                  >
                    {busy === slot ? "…" : "+"}
                  </button>
                  {a && (
                    <button type="button" className="admin-clear-btn" onClick={() => clearSlot(slot)}>
                      ✕
                    </button>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      <h3 className="media-slots__title" style={{ marginTop: 28 }}>Videos</h3>
      <div className="video-grid">
        {VID_SLOTS.map((slot) => {
          const a = find(slot);
          const isEmbed = a && /youtube\.com\/embed/.test(a.url);
          return (
            <div key={slot} className="video-slot">
              {a && isEmbed && (
                <iframe
                  src={a.url}
                  title={`${productId} ${slot}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              )}
              {a && !isEmbed && <video src={a.url} controls />}
              {!a && (
                <div className="video-placeholder">▶ {editMode ? "Upload or paste YouTube" : "Coming soon"}</div>
              )}
              {editMode && (
                <>
                  <input
                    type="file"
                    accept="video/*"
                    style={{ display: "none" }}
                    ref={(el) => { fileInputs.current[`v-${slot}`] = el; }}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadFile(slot, "video", f);
                      e.target.value = "";
                    }}
                  />
                  <div className="admin-video-actions">
                    <button
                      type="button"
                      className="admin-upload-btn"
                      title="Upload video"
                      onClick={() => fileInputs.current[`v-${slot}`]?.click()}
                    >
                      {busy === slot ? "…" : "+"}
                    </button>
                    <button
                      type="button"
                      className="admin-yt-btn"
                      title="Paste YouTube URL"
                      onClick={() => setYoutube(slot)}
                    >
                      YT
                    </button>
                    {a && (
                      <button type="button" className="admin-clear-btn" onClick={() => clearSlot(slot)}>
                        ✕
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
