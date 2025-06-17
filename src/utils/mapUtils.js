export const loadKakaoMapScript = () => {
  return new Promise((resolve, reject) => {
    if (window.kakao && window.kakao.maps) {
      resolve();
      return;
    }
    const scriptId = "kakao-map-sdk";
    if (document.getElementById(scriptId)) {
      // 이미 추가된 경우
      resolve();
      return;
    }
    const kakaoMapKey = import.meta.env.VITE_KAKAO_MAP_KEY;
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `http://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoMapKey}&libraries=services&autoload=false`;

    const timeout = setTimeout(() => {
      reject(new Error("Kakao Maps API 로드 타임아웃"));
    }, 5000);

    script.onload = () => {
      window.kakao.maps.load(resolve);
    };

    script.onerror = (e) => {
      reject(e);
    };
    document.head.appendChild(script);
  });
};

function waitForKakaoMapsService(timeout = 2000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    function check() {
      if (
        window.kakao &&
        window.kakao.maps &&
        window.kakao.maps.services &&
        window.kakao.maps.services.Geocoder
      ) {
        resolve();
      } else if (Date.now() - start > timeout) {
        reject(new Error("카카오맵 서비스 로딩 타임아웃"));
      } else {
        setTimeout(check, 50);
      }
    }
    check();
  });
}

export const getAddressFromCoords = async (latitude, longitude) => {
  try {
    await loadKakaoMapScript();
    await waitForKakaoMapsService();
    return new Promise((resolve, reject) => {
      const geocoder = new window.kakao.maps.services.Geocoder();
      const coords = new window.kakao.maps.LatLng(latitude, longitude);
      geocoder.coord2Address(
        coords.getLng(),
        coords.getLat(),
        (result, status) => {
          if (status === window.kakao.maps.services.Status.OK) {
            const address = result[0];
            if (address.road_address) {
              resolve(address.road_address.address_name);
            } else {
              resolve(address.address.address_name);
            }
          } else {
            reject(new Error("주소를 찾을 수 없습니다."));
          }
        },
      );
    });
  } catch (error) {
    console.error("카카오 맵 API 로드 실패:", error);
    throw error;
  }
};
