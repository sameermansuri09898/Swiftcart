import React, { useEffect, useState, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  X,
  Bike,
  Navigation,
  AlertCircle,
  Loader2,
  Activity,
  CheckCircle2,
} from "lucide-react";

// Static Demo Avatar for Delivery Partner
const DEMO_DRIVER_AVATAR =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";

// Fix Leaflet Default Icon Assets in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom Leaflet Marker Helper
const createCustomMarker = (htmlContent, size = [42, 42]) => {
  return L.divIcon({
    className: "custom-leaflet-marker",
    html: htmlContent,
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1] / 2],
    popupAnchor: [0, -size[1] / 2],
  });
};

// Delivery Partner Marker with Heading Rotation
const createRiderIcon = (heading = 0) => {
  return createCustomMarker(`
    <div class="relative flex items-center justify-center w-11 h-11 bg-emerald-600 rounded-full shadow-xl border-2 border-white">
      <div style="transform: rotate(${heading}deg)" class="transition-transform duration-500 flex items-center justify-center">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
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

// Customer Destination Marker
const destinationIcon = createCustomMarker(`
  <div class="flex items-center justify-center w-10 h-10 bg-rose-600 rounded-full shadow-lg border-2 border-white text-white">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 8 0 0 1 16 0Z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  </div>
`);

// Status Pipeline List matching backend STATUS_CHOICES
const STATUS_STEPS = [
  { id: "assigned", label: "Assigned", key: "assigned" },
  { id: "picked", label: "Picked Up", key: "picked" },
  { id: "on_the_way", label: "On The Way", key: "on_the_way" },
  { id: "delivered", label: "Delivered", key: "delivered" },
];

export default function TrackOrderModal({
  orderId,
  token,
  onClose,
  host = "127.0.0.1:8000",
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const destinationMarkerRef = useRef(null);
  const routePolylineRef = useRef(null);
  const socketRef = useRef(null);

  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const [orderState, setOrderState] = useState({
    status: "assigned",
    destination: null, // { latitude, longitude }
    rider: null,       // { latitude, longitude, heading }
  });

  // Calculate current active step index matching backend STATUS_CHOICES
  const getCurrentStepIndex = useCallback(() => {
    if (!orderState.status) return 0;
    const statusStr = String(orderState.status).toLowerCase().trim();

    if (
      statusStr === "delivered" ||
      statusStr.includes("deliver") ||
      statusStr.includes("complet")
    ) {
      return 3; // Step 4: Delivered
    }
    if (
      statusStr === "on_the_way" ||
      statusStr.includes("way") ||
      statusStr.includes("out") ||
      statusStr.includes("transit")
    ) {
      return 2; // Step 3: On The Way
    }
    if (
      statusStr === "picked" ||
      statusStr.includes("pick") ||
      statusStr.includes("accept")
    ) {
      return 1; // Step 2: Picked Up
    }

    return 0; // Step 1: Assigned
  }, [orderState.status]);

  const currentStep = getCurrentStepIndex();

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([28.6139, 77.2090], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);
    mapInstanceRef.current = map;

    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Recenter Map Bounds
  const updateMapBounds = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const bounds = [];
    if (destinationMarkerRef.current) bounds.push(destinationMarkerRef.current.getLatLng());
    if (driverMarkerRef.current) bounds.push(driverMarkerRef.current.getLatLng());

    if (bounds.length === 2) {
      map.fitBounds(L.latLngBounds(bounds), { padding: [50, 50], maxZoom: 16 });
    } else if (bounds.length === 1) {
      map.setView(bounds[0], 15);
    }
  }, []);

  // Route Polyline Updater
  const updatePolyline = useCallback((riderLat, riderLng, destLat, destLng) => {
    const map = mapInstanceRef.current;
    if (!map || !riderLat || !destLat) return;

    const latLngs = [
      [riderLat, riderLng],
      [destLat, destLng],
    ];

    if (routePolylineRef.current) {
      routePolylineRef.current.setLatLngs(latLngs);
    } else {
      routePolylineRef.current = L.polyline(latLngs, {
        color: "#10b981",
        weight: 4,
        dashArray: "8, 10",
      }).addTo(map);
    }
  }, []);

  // WebSocket Integration
  useEffect(() => {
    if (!orderId) return;

    const jwtToken =
      token ||
      localStorage.getItem("access_token") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token") ||
      "";

    if (!jwtToken) {
      setErrorMsg("Authentication token missing. Please log in.");
      setIsLoading(false);
      return;
    }

    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const wsUrl = `${protocol}://${host}/ws/order/track/${orderId}/?token=${encodeURIComponent(
      jwtToken
    )}`;

    let reconnectTimer = null;

    const connectWebSocket = () => {
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        setIsConnected(true);
        setErrorMsg(null);
        setIsLoading(false);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const map = mapInstanceRef.current;

          // Event 1: Initial payload on connection
          if (data.type === "initial_location") {
            const { destination, rider, status } = data;

            setOrderState((prev) => ({
              ...prev,
              status: status || prev.status,
              destination: destination || prev.destination,
              rider: rider || prev.rider,
            }));

            if (destination?.latitude && destination?.longitude && map) {
              const destLatLng = [destination.latitude, destination.longitude];
              if (!destinationMarkerRef.current) {
                destinationMarkerRef.current = L.marker(destLatLng, { icon: destinationIcon })
                  .addTo(map)
                  .bindPopup("<b>Delivery Address</b>");
              } else {
                destinationMarkerRef.current.setLatLng(destLatLng);
              }
            }

            if (rider?.latitude && rider?.longitude && map) {
              const riderLatLng = [rider.latitude, rider.longitude];
              if (!driverMarkerRef.current) {
                driverMarkerRef.current = L.marker(riderLatLng, {
                  icon: createRiderIcon(rider.heading || 0),
                }).addTo(map);
              } else {
                driverMarkerRef.current.setLatLng(riderLatLng);
              }

              if (destination?.latitude) {
                updatePolyline(
                  rider.latitude,
                  rider.longitude,
                  destination.latitude,
                  destination.longitude
                );
              }
            }

            setTimeout(updateMapBounds, 300);
          }

          // Event 2: Live location update packet
          if (data.type === "live_location" || data.type === "location_update") {
            const { latitude, longitude, status, heading } = data;

            setOrderState((prev) => ({
              ...prev,
              status: status || prev.status,
              rider: { latitude, longitude, heading },
            }));

            if (map && latitude && longitude) {
              const newPos = [latitude, longitude];

              if (!driverMarkerRef.current) {
                driverMarkerRef.current = L.marker(newPos, {
                  icon: createRiderIcon(heading || 0),
                }).addTo(map);
              } else {
                driverMarkerRef.current.setLatLng(newPos);
                driverMarkerRef.current.setIcon(createRiderIcon(heading || 0));
              }

              setOrderState((latest) => {
                if (latest.destination?.latitude) {
                  updatePolyline(
                    latitude,
                    longitude,
                    latest.destination.latitude,
                    latest.destination.longitude
                  );
                }
                return latest;
              });
            }
          }
        } catch (e) {
          console.error("WS Parse Error:", e);
        }
      };

      socket.onerror = (e) => {
        console.error("WS Error:", e);
      };

      socket.onclose = (e) => {
        setIsConnected(false);
        setIsLoading(false);

        if (e.code === 4001 || e.code === 4003) {
          setErrorMsg("Authentication failed or session expired.");
          return;
        }

        reconnectTimer = setTimeout(connectWebSocket, 3000);
      };
    };

    connectWebSocket();

    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (socketRef.current) socketRef.current.close();
    };
  }, [orderId, token, host, updateMapBounds, updatePolyline]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="bg-white w-full max-w-2xl rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[85vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
              <Bike size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-base">
                  Track Order #{orderId}
                </h3>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isConnected ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-emerald-500 animate-ping" : "bg-amber-500"}`} />
                  {isConnected ? "LIVE" : "CONNECTING"}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Live Status: <span className="font-bold text-emerald-600">{STATUS_STEPS[currentStep]?.label || orderState.status}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto flex-1 space-y-4 p-4 sm:p-5">
          
          {errorMsg && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle size={16} className="text-amber-600 shrink-0" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          {/* Stepper Progress Bar */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div className="grid grid-cols-4 gap-2 relative">
              {STATUS_STEPS.map((step, idx) => {
                const isCompleted = idx <= currentStep;
                const isCurrent = idx === currentStep;

                return (
                  <div key={step.id} className="flex flex-col items-center text-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                        isCompleted
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                          : "bg-slate-200 text-slate-400"
                      } ${isCurrent ? "ring-4 ring-emerald-100 scale-105" : ""}`}
                    >
                      {isCompleted ? <CheckCircle2 size={14} /> : idx + 1}
                    </div>
                    <span
                      className={`text-[10px] font-bold mt-2 line-clamp-1 ${
                        isCompleted ? "text-slate-900" : "text-slate-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Map Container */}
          <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
            <div ref={mapContainerRef} className="w-full h-full z-0" />

            {isLoading && (
              <div className="absolute inset-0 bg-slate-100/80 backdrop-blur-xs flex items-center justify-center gap-2 z-20">
                <Loader2 className="animate-spin text-emerald-600" size={24} />
                <span className="text-xs font-semibold text-slate-600">Connecting Map...</span>
              </div>
            )}

            <button
              onClick={updateMapBounds}
              className="absolute bottom-3 left-3 z-10 bg-white text-slate-700 p-2 rounded-xl shadow-md border border-slate-200 text-xs font-bold flex items-center gap-1 active:scale-95 transition-transform"
            >
              <Navigation size={14} className="text-emerald-600" />
              <span>Center</span>
            </button>
          </div>

          {/* Live GPS Coordinates & Status Card */}
          <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-3">
              <img
                src={DEMO_DRIVER_AVATAR}
                alt="Delivery Partner"
                className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-400 shrink-0 bg-slate-800"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm text-slate-100">Delivery Partner</h4>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Active
                  </span>
                </div>

                <p className="text-xs text-slate-400 font-medium mt-1 flex items-center gap-1">
                  <Activity size={12} className="text-emerald-400 animate-pulse" />
                  {orderState.rider ? (
                    <span>
                      GPS: {orderState.rider.latitude.toFixed(4)}, {orderState.rider.longitude.toFixed(4)}
                    </span>
                  ) : (
                    <span>Waiting for live GPS signal...</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end shrink-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Status</span>
              <span className="text-xs font-extrabold text-emerald-400 mt-0.5">
                {STATUS_STEPS[currentStep]?.label || orderState.status}
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}