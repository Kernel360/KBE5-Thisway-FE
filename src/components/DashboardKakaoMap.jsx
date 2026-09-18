import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { loadKakaoMapScript } from "@/utils/mapUtils";
import currentMinimalImg from "@/assets/Current Minimal.png";

const DashboardKakaoMap = ({ center, path = [], onCenterChanged }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (mapInstanceRef.current) {
      const newCenter = new window.kakao.maps.LatLng(center.lat, center.lng);
      mapInstanceRef.current.setCenter(newCenter);
    }
  }, [center]);

  useEffect(() => {
    if (mapInstanceRef.current) {
      markersRef.current.forEach(overlay => overlay.setMap(null));
      markersRef.current = [];

      path.forEach((p) => {
        if (typeof p.lat !== 'number' || typeof p.lng !== 'number') return;
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
        const overlay = new window.kakao.maps.CustomOverlay({
          map: mapInstanceRef.current,
          position: new window.kakao.maps.LatLng(p.lat, p.lng),
          content: markerDiv,
          yAnchor: 1,
        });
        markersRef.current.push(overlay);
      });
    }
  }, [path]);

  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      loadKakaoMapScript()
        .then(() => {
          const { kakao } = window;
          if (!mapRef.current) return;
          const container = mapRef.current;
          const options = {
            center: new kakao.maps.LatLng(center.lat, center.lng),
            level: 3,
          };
          const map = new kakao.maps.Map(container, options);
          mapInstanceRef.current = map;

          kakao.maps.event.addListener(map, 'dragend', () => {
            const latlng = map.getCenter();
            onCenterChanged({ lat: latlng.getLat(), lng: latlng.getLng() });
          });
          
          // 초기 path 렌더링을 위해 이 부분을 호출
          const initialPath = path;
          markersRef.current.forEach(overlay => overlay.setMap(null));
          markersRef.current = [];

          initialPath.forEach((p) => {
            if (typeof p.lat !== 'number' || typeof p.lng !== 'number') return;
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
              map: map,
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
    }

    return () => {
      if (mapInstanceRef.current && window.kakao && window.kakao.maps) {
         window.kakao.maps.event.removeListener(mapInstanceRef.current, 'dragend');
      }
    };
  }, []); // 초기 1회만 실행

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
  onCenterChanged: PropTypes.func,
};

DashboardKakaoMap.defaultProps = {
  onCenterChanged: () => {},
};

export default DashboardKakaoMap; 