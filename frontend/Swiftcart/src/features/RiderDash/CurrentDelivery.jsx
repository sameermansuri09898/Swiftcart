import React, { useEffect, useState, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapPin,
  Phone,
  Home as HomeIcon,
  PackageCheck,
  CheckCircle2,
  Navigation,
  Loader2,
  AlertCircle,
  Bike,
} from "lucide-react";

// Fix Leaflet Default Marker Icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom Marker HTML Generator
const createCustomMarker = (htmlContent, size = [40, 40]) => {
  return L.divIcon({
    className: "custom-leaflet-marker",
    html: htmlContent,
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1] / 2],
  });
};

// Rider Bike Icon with Direction Heading
const createRiderIcon = (heading = 0) => {
  return createCustomMarker(`
    <div class="relative flex items-center justify-center w-10 h-10 bg-brand-500 rounded-full shadow-lg border-2 border-white">
      <div style="transform: rotate(${heading}deg)" class="transition-transform duration-300">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1 .4-1 1v7c0 .6.4 1 1 1h1"/>
          <circle cx="7.5" cy="17.5" r="2.5"/>
          <circle cx="17.5" cy="17.5" r="2.5"/>
        </svg>
      </div>
      <span class="absolute -top-1 -right-1 flex h-3 w-3">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
      </span>
    </div>
  `);
};

// Destination Pin Icon
const destinationIcon = createCustomMarker(`
  <div class="flex items-center justify-center w-9 h-9 bg-rose-500 rounded-full shadow-lg border-2 border-white text-white">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 8 0 0 1 16 0Z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  </div>
`);

// Haversine Distance Calculator (in KM)
const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return "0.0";
  const R = 6371; // Radius of Earth in KM
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
};

export default function CurrentDelivery({
  orderData,
  token,
  host = "127.0.0.1:8000",
  onStatusUpdated,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const riderMarkerRef = useRef(null);
  const destMarkerRef = useRef(null);
  const routePolylineRef = useRef(null);
  const socketRef = useRef(null);
  const watchIdRef = useRef(null);
  const lastSentTimeRef = useRef(0);

  const [isConnected, setIsConnected] = useState(false);
  const [gpsActive, setGpsActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const activeOrder = orderData || {
    orderId: "KSE00D7BD1",
    status: "assigned",
    items: 4,
    amount: 340,
    customer: {
      name: "Rahul Sharma",
      phone: "+919876543210",
      address: "102, Rajpur Road, Dehradun, Uttarakhand",
      latitude: 30.3255,
      longitude: 78.0432,
    },
  };

  const [currentStatus, setCurrentStatus] = useState(activeOrder.status || "assigned");
  const [riderCoords, setRiderCoords] = useState(null);
  const [metrics, setMetrics] = useState({ distanceKm: "0.0", etaMins: "0" });

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([30.3165, 78.0322], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);
    mapInstanceRef.current = map;

    setTimeout(() => map.invalidateSize(), 200);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Destination Pin & Map Bounds
  const updateMapBounds = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const bounds = [];
    if (riderMarkerRef.current) bounds.push(riderMarkerRef.current.getLatLng());
    if (destMarkerRef.current) bounds.push(destMarkerRef.current.getLatLng());

    if (bounds.length === 2) {
      map.fitBounds(L.latLngBounds(bounds), { padding: [40, 40], maxZoom: 16 });
    } else if (bounds.length === 1) {
      map.setView(bounds[0], 15);
    }
  }, []);

  // 2. Setup WebSocket Connection
  useEffect(() => {
    const orderId = activeOrder.orderId;
    if (!orderId) return;

    const jwtToken =
      token ||
      localStorage.getItem("access_token") ||
      localStorage.getItem("accessToken") ||
      "";

    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const wsUrl = `${protocol}://${host}/ws/order/track/${orderId}/?token=${encodeURIComponent(
      jwtToken
    )}`;

    let reconnectTimer = null;

    const connectWS = () => {
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        setIsConnected(true);
        setErrorMsg(null);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const map = mapInstanceRef.current;

          if (data.type === "initial_location") {
            if (data.status) setCurrentStatus(data.status);

            // Set Customer Destination Pin
            if (data.destination?.latitude && map) {
              const destPos = [data.destination.latitude, data.destination.longitude];
              if (!destMarkerRef.current) {
                destMarkerRef.current = L.marker(destPos, { icon: destinationIcon })
                  .addTo(map)
                  .bindPopup("Customer Address");
              } else {
                destMarkerRef.current.setLatLng(destPos);
              }
            }
            setTimeout(updateMapBounds, 300);
          }
        } catch (e) {
          console.error("WS Parse Error:", e);
        }
      };

      socket.onerror = () => setErrorMsg("WebSocket Connection Error.");
      socket.onclose = (e) => {
        setIsConnected(false);
        if (e.code !== 4001 && e.code !== 4003) {
          reconnectTimer = setTimeout(connectWS, 3000);
        }
      };
    };

    connectWS();

    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (socketRef.current) socketRef.current.close();
    };
  }, [activeOrder.orderId, host, token, updateMapBounds]);

  // 3. Real-time GPS Tracker (Streams every 2 seconds over WS)
  useEffect(() => {
    if (!navigator.geolocation) {
      setErrorMsg("Geolocation is not supported by your browser/device.");
      return;
    }

    const handlePosition = (position) => {
      setGpsActive(true);
      const { latitude, longitude, heading } = position.coords;
      const now = Date.now();

      setRiderCoords({ latitude, longitude });

      // Calculate Metrics
      if (activeOrder.customer?.latitude) {
        const dist = calculateDistanceKm(
          latitude,
          longitude,
          activeOrder.customer.latitude,
          activeOrder.customer.longitude
        );
        const eta = Math.ceil((dist / 25) * 60); // Assuming 25 km/h average speed
        setMetrics({ distanceKm: dist, etaMins: eta > 0 ? eta : 1 });
      }

      // Update Map Rider Marker & Polyline
      const map = mapInstanceRef.current;
      if (map) {
        const riderPos = [latitude, longitude];

        if (!riderMarkerRef.current) {
          riderMarkerRef.current = L.marker(riderPos, {
            icon: createRiderIcon(heading || 0),
          }).addTo(map);
        } else {
          riderMarkerRef.current.setLatLng(riderPos);
          riderMarkerRef.current.setIcon(createRiderIcon(heading || 0));
        }

        // Draw/Update Polyline
        if (activeOrder.customer?.latitude) {
          const destPos = [activeOrder.customer.latitude, activeOrder.customer.longitude];
          
          if (!destMarkerRef.current) {
            destMarkerRef.current = L.marker(destPos, { icon: destinationIcon }).addTo(map);
          }

          if (routePolylineRef.current) {
            routePolylineRef.current.setLatLngs([riderPos, destPos]);
          } else {
            routePolylineRef.current = L.polyline([riderPos, destPos], {
              color: "#7238f5",
              weight: 4,
              dashArray: "6, 8",
            }).addTo(map);
          }
        }
      }

      // Throttle WebSocket send: Send packet every 2000ms (2 Seconds)
      if (now - lastSentTimeRef.current >= 2000) {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.send(
            JSON.stringify({
              latitude,
              longitude,
              status: currentStatus,
              heading: heading || 0,
            })
          );
          lastSentTimeRef.current = now;
        }
      }
    };

    const handleError = (err) => {
      setGpsActive(false);
      setErrorMsg(`GPS Error: ${err.message}`);
    };

    // Watch position with high accuracy
    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePosition,
      handleError,
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 1000 }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [currentStatus, activeOrder.customer]);

  // 4. Handle Order Status Update Progression
  const handleStatusProgress = () => {
    let nextStatus = "assigned";
    if (currentStatus === "assigned") nextStatus = "picked";
    else if (currentStatus === "picked") nextStatus = "on_the_way";
    else if (currentStatus === "on_the_way") nextStatus = "delivered";

    setCurrentStatus(nextStatus);

    // Send Status Update over WebSocket
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN && riderCoords) {
      socketRef.current.send(
        JSON.stringify({
          latitude: riderCoords.latitude,
          longitude: riderCoords.longitude,
          status: nextStatus,
        })
      );
    }

    if (onStatusUpdated) onStatusUpdated(activeOrder.orderId, nextStatus);
  };

  const getButtonText = () => {
    switch (currentStatus) {
      case "assigned":
        return "Mark Order as Picked Up";
      case "picked":
        return "Start Delivery (On The Way)";
      case "on_the_way":
        return "Arrived & Delivered";
      case "delivered":
        return "Order Completed";
      default:
        return "Update Status";
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-card border border-black/[0.04] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4">
        <h2 className="font-display font-bold text-[15px] text-ink-900">
          Current Delivery
        </h2>
        <div className="flex items-center gap-2">
          <span
            className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${
              isConnected
                ? "text-emerald-600 bg-emerald-50"
                : "text-amber-600 bg-amber-50"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isConnected ? "bg-emerald-500 animate-ping" : "bg-amber-500"
              }`}
            />
            {isConnected ? "Live Sync" : "Connecting"}
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="mx-4 mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[11px] flex items-center gap-1.5">
          <AlertCircle size={14} className="shrink-0 text-amber-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid md:grid-cols-[1.4fr_1fr] gap-0 mt-3">
        {/* Real-time Interactive Leaflet Map */}
        <div className="relative h-60 md:h-auto mx-4 mb-4 md:mb-0 rounded-xl overflow-hidden border border-slate-200 shadow-inner">
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {!gpsActive && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center gap-2 z-10">
              <Loader2 className="animate-spin text-brand-500" size={20} />
              <span className="text-xs font-semibold text-slate-600">
                Fetching GPS Location...
              </span>
            </div>
          )}

          {/* Top Floating Badge */}
          <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg shadow-card text-[11px] font-medium text-ink-900/70 flex items-center gap-1.5 border border-slate-100">
            <MapPin size={13} className="text-brand-500" />
            Customer Location · {metrics.distanceKm} km · {metrics.etaMins} mins
          </div>

          {/* Center Recenter Button */}
          <button
            onClick={updateMapBounds}
            className="absolute bottom-14 right-3 z-10 bg-white/95 p-2 rounded-lg shadow-md border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all active:scale-95"
            title="Recenter"
          >
            <Navigation size={14} className="text-brand-500" />
          </button>

          {/* Bottom Floating Order Badge */}
          <div className="absolute bottom-3 left-3 right-3 z-10 bg-white/95 backdrop-blur rounded-lg shadow-card px-3 py-2 flex items-center justify-between border border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-100 flex items-center justify-center">
                <PackageCheck size={14} className="text-brand-600" />
              </div>
              <div className="leading-tight">
                <p className="text-[11.5px] font-semibold text-ink-900">
                  {activeOrder.orderId}
                </p>
                <p className="text-[10.5px] text-ink-900/40">
                  Items: {activeOrder.items} · ₹{activeOrder.amount}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-brand-50 text-brand-600 border border-brand-100">
              {currentStatus.replace(/_/g, " ")}
            </span>
          </div>
        </div>

        {/* Customer Information & Actions */}
        <div className="px-5 pb-5 md:pl-0 md:pr-5 flex flex-col justify-between">
          <div>
            <p className="text-[11px] font-semibold text-ink-900/40 uppercase tracking-wide">
              Customer
            </p>
            <div className="flex items-center justify-between mt-1.5">
              <p className="font-display font-bold text-ink-900 text-[15px]">
                {activeOrder.customer?.name}
              </p>
              {activeOrder.customer?.phone && (
                <a
                  href={`tel:${activeOrder.customer.phone}`}
                  className="w-8 h-8 rounded-full bg-brand-500 hover:bg-brand-600 transition-colors flex items-center justify-center shrink-0 shadow-sm"
                >
                  <Phone size={14} className="text-white" />
                </a>
              )}
            </div>
            <p className="text-[12.5px] text-ink-900/50 mt-0.5">
              {activeOrder.customer?.phone}
            </p>

            <div className="flex items-start gap-2 mt-4">
              <HomeIcon size={14} className="text-ink-900/40 mt-0.5 shrink-0" />
              <div>
                <p className="text-[11px] font-semibold text-ink-900/40 uppercase tracking-wide">
                  Delivery Address
                </p>
                <p className="text-[12.5px] text-ink-900/70 mt-0.5 leading-snug">
                  {activeOrder.customer?.address}
                </p>
              </div>
            </div>
          </div>

          {/* Single Action Status Button */}
          <button
            onClick={handleStatusProgress}
            disabled={currentStatus === "delivered"}
            className={`mt-5 w-full transition-all text-white text-[13px] font-semibold rounded-xl py-2.5 flex items-center justify-center gap-2 shadow-md ${
              currentStatus === "delivered"
                ? "bg-emerald-600 cursor-not-allowed opacity-90"
                : "bg-brand-500 hover:bg-brand-600 active:scale-[0.98]"
            }`}
          >
            <CheckCircle2 size={16} />
            {getButtonText()}
          </button>
        </div>
      </div>
    </div>
  );
}