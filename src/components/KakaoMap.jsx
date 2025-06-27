import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { loadKakaoMapScript } from "@/utils/mapUtils";

const KakaoMap = ({ center, path = [], markerImage, extraMarkers = [] }) => {
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

        // Add center marker (with custom image if provided)
        let markerOptions = {
          map,
          position: options.center,
        };
        if (markerImage && markerImage.url) {
          markerOptions.image = new kakao.maps.MarkerImage(
            markerImage.url,
            new kakao.maps.Size(markerImage.size?.width || 48, markerImage.size?.height || 48)
          );
        }
        const marker = new kakao.maps.Marker(markerOptions);
        markersRef.current.push(marker);

        // Draw extra markers
        if (extraMarkers && Array.isArray(extraMarkers)) {
          extraMarkers.forEach((m) => {
            const markerOpt = {
              map,
              position: new kakao.maps.LatLng(m.lat, m.lng),
            };
            if (m.image) {
              markerOpt.image = new kakao.maps.MarkerImage(
                m.image,
                new kakao.maps.Size(m.imageSize?.width || 48, m.imageSize?.height || 48)
              );
            }
            const extraMarker = new kakao.maps.Marker(markerOpt);
            markersRef.current.push(extraMarker);
          });
        }

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
  }, [center, path, markerImage, extraMarkers]);

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
  markerImage: PropTypes.shape({
    url: PropTypes.string,
    size: PropTypes.shape({ width: PropTypes.number, height: PropTypes.number })
  }),
  extraMarkers: PropTypes.arrayOf(
    PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired,
      image: PropTypes.string,
      imageSize: PropTypes.shape({ width: PropTypes.number, height: PropTypes.number })
    })
  )
};

export default KakaoMap;
