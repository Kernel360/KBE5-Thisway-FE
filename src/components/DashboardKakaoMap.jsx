import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { loadKakaoMapScript } from "@/utils/mapUtils";
import currentMinimalImg from "@/assets/Current Minimal.png";

const DashboardKakaoMap = ({ center, path = [], onCenterChanged = () => {} }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const latestRef = useRef({ center, path, onCenterChanged });
  latestRef.current = { center, path, onCenterChanged };
  const [status, setStatus] = useState("loading");
  const [attempt, setAttempt] = useState(0);

  const drawMarkers = () => {
    const map = mapInstanceRef.current;
    if (!map || !window.kakao?.maps?.CustomOverlay) return;
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    latestRef.current.path.forEach(point => {
      if (!Number.isFinite(point.lat) || !Number.isFinite(point.lng)) return;
      const markerDiv = document.createElement("div");
      Object.assign(markerDiv.style, {
        width: "40px", height: "42px", transform: `rotate(${Number.isFinite(point.angle) ? point.angle - 90 : -90}deg)`,
        transformOrigin: "50% 80%", display: "flex", alignItems: "center", justifyContent: "center",
      });
      const image = document.createElement("img");
      image.src = currentMinimalImg;
      image.alt = "차량 위치";
      image.draggable = false;
      Object.assign(image.style, { width: "40px", height: "42px", userSelect: "none", pointerEvents: "none" });
      markerDiv.appendChild(image);
      markersRef.current.push(new window.kakao.maps.CustomOverlay({
        map, position: new window.kakao.maps.LatLng(point.lat, point.lng), content: markerDiv, yAnchor: 1,
      }));
    });
  };

  useEffect(() => {
    if (mapInstanceRef.current && Number.isFinite(center.lat) && Number.isFinite(center.lng)) {
      mapInstanceRef.current.setCenter(new window.kakao.maps.LatLng(center.lat, center.lng));
    }
  }, [center]);

  useEffect(() => { drawMarkers(); }, [path]);

  useEffect(() => {
    let active = true;
    let map;
    let dragHandler;
    let resizeObserver;
    let resizeHandler;
    let readyTimer;
    let readyDeadline;
    let cancelReadiness;
    setStatus("loading");
    const initialize = async () => {
      try {
        await loadKakaoMapScript();
        if (!active) return;
        // The shared loader may resolve while an existing script is still loading.
        await new Promise((resolve, reject) => {
          cancelReadiness = resolve;
          readyDeadline = setTimeout(() => reject(new Error("map unavailable")), 5000);
          const checkReady = () => {
            if (!active || window.kakao?.maps?.Map) {
              clearTimeout(readyDeadline);
              resolve();
            } else readyTimer = setTimeout(checkReady, 50);
          };
          checkReady();
        });
        if (!active || !mapRef.current) return;
        const { kakao } = window;
        const currentCenter = latestRef.current.center;
        map = new kakao.maps.Map(mapRef.current, {
          center: new kakao.maps.LatLng(currentCenter.lat, currentCenter.lng), level: 3,
        });
        mapInstanceRef.current = map;
        drawMarkers();
        dragHandler = () => {
          const position = map.getCenter();
          latestRef.current.onCenterChanged({ lat: position.getLat(), lng: position.getLng() });
        };
        kakao.maps.event.addListener(map, "dragend", dragHandler);
        resizeHandler = () => {
          const current = map.getCenter();
          map.relayout();
          map.setCenter(current);
        };
        if (typeof ResizeObserver !== "undefined") {
          resizeObserver = new ResizeObserver(resizeHandler);
          resizeObserver.observe(mapRef.current);
        }
        window.addEventListener("resize", resizeHandler);
        setStatus("ready");
      } catch {
        clearTimeout(readyTimer);
        clearTimeout(readyDeadline);
        if (active) setStatus("error");
      }
    };
    initialize();
    return () => {
      active = false;
      clearTimeout(readyTimer);
      clearTimeout(readyDeadline);
      cancelReadiness?.();
      resizeObserver?.disconnect();
      if (resizeHandler) window.removeEventListener("resize", resizeHandler);
      if (map && dragHandler) window.kakao?.maps?.event.removeListener(map, "dragend", dragHandler);
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
      mapInstanceRef.current = null;
    };
  }, [attempt]);

  const retry = () => {
    // A failed script must be removed, otherwise the shared loader reuses it.
    if (!window.kakao?.maps?.Map) document.getElementById("kakao-map-sdk")?.remove();
    setAttempt(value => value + 1);
  };

  return <div style={{ position: "relative", width: "100%", height: "100%", minHeight: 0 }}>
    <div ref={mapRef} aria-label="차량 위치 지도" style={{ width: "100%", height: "100%", minHeight: 0 }} />
    {status !== "ready" && <div role={status === "error" ? "alert" : "status"} style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24, background: "#F3F6F8", textAlign: "center", color: "#475569" }}>
      {status === "error" ? <><strong>지도를 불러오지 못했습니다.</strong><span>차량 상태는 목록에서 계속 확인할 수 있습니다.</span><button type="button" onClick={retry} style={{ border: "1px solid #087F8C", borderRadius: 10, padding: "12px 16px", color: "#066773", background: "white", cursor: "pointer" }}>지도 다시 시도</button></> : "지도를 불러오는 중입니다."}
    </div>}
  </div>;
};

DashboardKakaoMap.propTypes = {
  center: PropTypes.shape({ lat: PropTypes.number.isRequired, lng: PropTypes.number.isRequired }).isRequired,
  path: PropTypes.arrayOf(PropTypes.shape({ lat: PropTypes.number.isRequired, lng: PropTypes.number.isRequired, angle: PropTypes.number })),
  onCenterChanged: PropTypes.func,
};

export default DashboardKakaoMap;
