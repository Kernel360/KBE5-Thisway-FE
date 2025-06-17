import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { loadKakaoMapScript } from "@/utils/mapUtils";

const KakaoMap = ({ center, path = [] }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);

  useEffect(() => {
    loadKakaoMapScript()
      .then(() => {
        if (!mapRef.current) return;
        // Initialize map
        const { kakao } = window;
        const container = mapRef.current;
        const options = {
          center: new kakao.maps.LatLng(center.lat, center.lng),
          level: 3,
        };
        const map = new kakao.maps.Map(container, options);

        mapInstanceRef.current = map;

        // Clear previous markers
        markersRef.current.forEach((m) => m.setMap(null));
        markersRef.current = [];

        // Add center marker
        const marker = new kakao.maps.Marker({
          map,
          position: options.center,
        });
        markersRef.current.push(marker);

        // Draw polyline if path exists
        if (path.length > 1) {
          const linePath = path.map((p) => new kakao.maps.LatLng(p.lat, p.lng));
          polylineRef.current = new kakao.maps.Polyline({
            path: linePath,
            strokeWeight: 5,
            strokeColor: "#4960F9",
            strokeOpacity: 0.7,
            strokeStyle: "solid",
          });
          polylineRef.current.setMap(map);
        }
      })
      .catch((error) => {
        console.error("Failed to load Kakao Map script:", error);
      });

    return () => {
      // Cleanup markers and polyline
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
    };
  }, [center, path]);

  return (
    <div
      ref={mapRef}
      style={{ width: "100%", height: "100%", minHeight: "700px" }}
    />
  );
};

KakaoMap.propTypes = {
  center: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }).isRequired,
  path: PropTypes.arrayOf(
    PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired,
    }),
  ),
};

export default KakaoMap;
