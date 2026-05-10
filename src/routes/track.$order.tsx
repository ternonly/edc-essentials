import { createFileRoute, Link, useServerFn } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getMapsApiKey } from "@/lib/maps.functions";

type TEvent = {
  id: string;
  status: string;
  location: string;
  lat: number | null;
  lng: number | null;
  note: string;
  occurred_at: string;
};

export const Route = createFileRoute("/track/$order")({
  head: ({ params }) => ({ meta: [{ title: `Tracking #${params.order} — Survival72™` }] }),
  component: TrackOrder,
});

function TrackOrder() {
  const { order } = Route.useParams();
  const [orderRow, setOrderRow] = useState<{ id: string; status: string } | null>(null);
  const [events, setEvents] = useState<TEvent[]>([]);
  const [notFound, setNotFound] = useState(false);
  const fetchKey = useServerFn(getMapsApiKey);
  const [mapsKey, setMapsKey] = useState<string>("");
  const mapRef = useRef<HTMLDivElement | null>(null);

  // Load order + events
  useEffect(() => {
    (async () => {
      const { data: o } = await supabase
        .from("orders")
        .select("id,status")
        .eq("order_number", order)
        .maybeSingle();
      if (!o) { setNotFound(true); return; }
      setOrderRow(o);
      const { data: ev } = await supabase
        .from("tracking_events")
        .select("id,status,location,lat,lng,note,occurred_at")
        .eq("order_id", o.id)
        .order("occurred_at", { ascending: true });
      setEvents((ev as TEvent[]) ?? []);

      // Realtime
      const ch = supabase
        .channel(`track-${o.id}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "tracking_events", filter: `order_id=eq.${o.id}` }, (payload) => {
          if (payload.eventType === "INSERT") setEvents((cur) => [...cur, payload.new as TEvent]);
        })
        .subscribe();
      return () => { supabase.removeChannel(ch); };
    })();
  }, [order]);

  // Load Maps key
  useEffect(() => { fetchKey().then((r) => setMapsKey(r.key)); }, [fetchKey]);

  // Inject Google Maps script and render
  useEffect(() => {
    if (!mapsKey || !mapRef.current || events.length === 0) return;
    const pts = events.filter((e) => e.lat != null && e.lng != null);
    if (pts.length === 0) return;

    function render() {
      const g = (window as any).google;
      if (!g?.maps || !mapRef.current) return;
      const last = pts[pts.length - 1];
      const map = new g.maps.Map(mapRef.current, {
        center: { lat: last.lat!, lng: last.lng! },
        zoom: 5,
        styles: [{ featureType: "poi", stylers: [{ visibility: "off" }] }],
      });
      const path = pts.map((p) => ({ lat: p.lat!, lng: p.lng! }));
      new g.maps.Polyline({ path, geodesic: true, strokeColor: "#C9A96E", strokeOpacity: 0.9, strokeWeight: 3, map });
      pts.forEach((e, i) => {
        const m = new g.maps.Marker({
          position: { lat: e.lat!, lng: e.lng! },
          map,
          label: i === pts.length - 1 ? "📍" : `${i + 1}`,
          title: `${e.status} — ${e.location}`,
        });
        if (i === pts.length - 1) {
          m.setAnimation(g.maps.Animation.BOUNCE);
          setTimeout(() => m.setAnimation(null), 2200);
        }
      });
    }

    if ((window as any).google?.maps) { render(); return; }
    const id = "gmaps-js";
    if (document.getElementById(id)) { (window as any).__gmapsCb = render; return; }
    (window as any).__gmapsCb = render;
    const s = document.createElement("script");
    s.id = id;
    s.src = `https://maps.googleapis.com/maps/api/js?key=${mapsKey}&callback=__gmapsCb`;
    s.async = true;
    document.body.appendChild(s);
  }, [mapsKey, events]);

  if (notFound) {
    return (
      <div style={{ maxWidth: 540, margin: "0 auto", padding: "100px 24px", textAlign: "center" }}>
        <h1 style={{ fontSize: 28 }}>Order not found</h1>
        <p style={{ color: "#666" }}>We could not find an order with number <strong>#{order}</strong>.</p>
        <p><Link to="/track" style={{ color: "#C9A96E" }}>← Try another number</Link></p>
      </div>
    );
  }

  const hasCoords = events.some((e) => e.lat != null && e.lng != null);

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: "60px 24px" }}>
      <span className="s72-kicker" style={{ color: "#C9A96E" }}>Tracking</span>
      <h1 style={{ fontSize: "clamp(26px,3vw,36px)", margin: "8px 0 8px" }}>Order #{order}</h1>
      <p style={{ color: "#666", marginBottom: 32 }}>
        Status: <strong style={{ color: "#111" }}>{orderRow?.status ?? "—"}</strong>
      </p>

      <div style={{ display: "grid", gridTemplateColumns: hasCoords ? "1fr 1fr" : "1fr", gap: 32 }}>
        {hasCoords && (
          <div>
            <div ref={mapRef} style={{ width: "100%", aspectRatio: "1/1", background: "#f4f4f4", borderRadius: 8, border: "1px solid #eee" }} />
            {!mapsKey && <p style={{ color: "#a33", fontSize: 13, marginTop: 8 }}>Map unavailable.</p>}
          </div>
        )}

        <ol style={{ listStyle: "none", padding: 0, margin: 0, position: "relative" }}>
          {events.length === 0 && <li style={{ color: "#666" }}>No events yet. We will update this page as your order progresses.</li>}
          {events.map((e, i) => {
            const isLast = i === events.length - 1;
            return (
              <li key={e.id} style={{ display: "grid", gridTemplateColumns: "30px 1fr", gap: 14, paddingBottom: 24, position: "relative" }}>
                <div style={{ position: "relative" }}>
                  <span style={{ display: "block", width: 14, height: 14, borderRadius: "50%", background: isLast ? "#C9A96E" : "#111", marginTop: 4, boxShadow: isLast ? "0 0 0 6px rgba(201,169,110,.2)" : "none" }} />
                  {i < events.length - 1 && <span style={{ position: "absolute", left: 6, top: 22, bottom: -10, width: 2, background: "#ddd" }} />}
                </div>
                <div>
                  <div style={{ fontWeight: 600, letterSpacing: ".3px" }}>{e.status}</div>
                  <div style={{ color: "#666", fontSize: 14 }}>{e.location}</div>
                  {e.note && <div style={{ color: "#888", fontSize: 13, marginTop: 4 }}>{e.note}</div>}
                  <div style={{ color: "#aaa", fontSize: 12, marginTop: 4 }}>{new Date(e.occurred_at).toLocaleString()}</div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <p style={{ marginTop: 40, fontSize: 13 }}>
        <Link to="/track" style={{ color: "#C9A96E" }}>← Track another order</Link>
      </p>
    </div>
  );
}
