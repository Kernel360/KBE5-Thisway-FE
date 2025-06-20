import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { loadKakaoMapScript } from "@/utils/mapUtils";
import currentMinimalImg from "@/assets/Current Minimal.png";

const DashboardKakaoMap = ({ center, path = [] }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    loadKakaoMapScript()
      .then(() => {
        if (!mapRef.current) return;
        const { kakao } = window;
        const container = mapRef.current;
        const options = {
          center: new kakao.maps.LatLng(center.lat, center.lng),
          level: 3,
        };
        const map = new kakao.maps.Map(container, options);
        mapInstanceRef.current = map;

        // 기존 마커 제거
        markersRef.current.forEach((m) => m.setMap && m.setMap(null));
        markersRef.current = [];

        // path 배열의 각 위치에 마커 추가 (angle이 있으면 회전)
        path.forEach((p) => {
          if (typeof p.lat !== 'number' || typeof p.lng !== 'number') return;
          // 기본 각도 -90도 적용
          const displayAngle = (typeof p.angle === 'number' && !isNaN(p.angle)) ? (p.angle - 90) : -90;
          const markerDiv = document.createElement('div');
          markerDiv.style.width = '40px';
          markerDiv.style.height = '42px';
          markerDiv.style.transform = `rotate(${displayAngle}deg)`;
          markerDiv.style.transformOrigin = '50% 80%';
          markerDiv.style.display = 'flex';
          markerDiv.style.alignItems = 'center';
          markerDiv.style.justifyContent = 'center';
          markerDiv.innerHTML = `<img src="${currentMinimalImg}" style="width:40px;height:42px;user-select:none;pointer-events:none;" draggable="false" />`;
          const overlay = new kakao.maps.CustomOverlay({
            map,
            position: new kakao.maps.LatLng(p.lat, p.lng),
            content: markerDiv,
            yAnchor: 1,
          });
          markersRef.current.push(overlay);
        });
      })
      .catch((error) => {
        console.error("Failed to load Kakao Map script:", error);
      });

    return () => {
      markersRef.current.forEach((m) => m.setMap && m.setMap(null));
      markersRef.current = [];
    };
  }, [center, path]);

  return (
    <div
      ref={mapRef}
      style={{ width: "100%", height: "100%", minHeight: "700px" }}
    />
  );
};

DashboardKakaoMap.propTypes = {
  center: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }).isRequired,
  path: PropTypes.arrayOf(
    PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired,
      angle: PropTypes.number,
    }),
  ),
};

export default DashboardKakaoMap; 