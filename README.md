# Thisway-BE (렌트카 및 쉐어링카 관제를 위한 차량 관제 서비스 개발 프론트)

<p align="center"> 
  <img width="584" height="389" alt="image" src="https://github.com/user-attachments/assets/f53a27c8-1f97-4484-a2a8-7adda024b40a" />
</p>
<img width="2559" height="1440" alt="image" src="https://github.com/user-attachments/assets/f5c0619b-e7a2-470b-96c0-8676a9441ed9" />



## 1. 프로젝트 개요

**Thisway**는 차량 운행 데이터를 기반으로 한 서비스 프로젝트입니다. 실시간으로 차량의 운행 기록(Trip Log)을 수집, 처리, 분석하여 사용자 및 관리자에게 유의미한 정보를 제공하는 것을 목표로 합니다.

본 프로젝트는 최신 기술 스택을 활용하여 대용량 트래픽 처리, 데이터의 정합성, 그리고 안정적인 서비스 운영을 지향합니다. 

## 2. 주요 기능

- **회원 및 인증/인가 (Member & Security)**
  - JWT 기반의 토큰 인증 시스템
  - Spring Security를 활용한 역할(Role) 기반 접근 제어 (사용자, 기업, 관리자)

<img width="1077" height="1049" alt="image" src="https://github.com/user-attachments/assets/3cf6cd2f-0e9f-4c2e-a4f9-5a479f4cb068" />
<img width="2560" height="1440" alt="image" src="https://github.com/user-attachments/assets/0dea5212-50d7-4f71-bd73-920fbd456557" />



- **차량 관리 (Vehicle)**
  - 사용자의 차량 등록, 조회, 수정, 삭제 (CRUD)
    
<img width="2559" height="1440" alt="image" src="https://github.com/user-attachments/assets/2802e16d-97f9-4802-b487-c6e28c53ff3b" />

  - 차량으로부터 운행 데이터(시동 켜짐/꺼짐, 위치 등)를 RabbitMQ를 통해 비동기적으로 수신
    
<img width="2558" height="1440" alt="image" src="https://github.com/user-attachments/assets/973fdb1a-7e92-4e16-9b55-e7689e7eed45" />


- **운행 기록 관리 (Trip Log)**
  - 수신된 데이터를 가공하여 운행 기록(Trip Log)으로 저장
    
<img width="2560" height="1440" alt="image" src="https://github.com/user-attachments/assets/9d9aea95-fd1b-45aa-b20b-afd193a2c0c7" />

  - 운행 기록 조회 및 상세 정보 제공
    
<img width="2559" height="1440" alt="image" src="https://github.com/user-attachments/assets/4ac6a91a-c479-4c85-ae4f-99bce15dd076" />


- **통계 (Statistics)**
  - Spring Batch를 활용하여 일별/월별 운행 데이터 통계 처리
  - 사용자별, 차량별 운행 거리, 시간 등 다양한 통계 데이터 제공
    
<img width="2560" height="1440" alt="image" src="https://github.com/user-attachments/assets/09b25259-5f52-43f8-8a98-b59baf3acb89" />


- **실시간 모니터링 (Monitoring)**
  - Prometheus, Grafana를 이용한 실시간 애플리케이션 및 인프라 모니터링

## 3. 기술 스택

<!-- 스타일 통일: for-the-badge / flat-square 등 한 가지만 쓰세요 -->
<!-- 색상은 simpleicons.org 기준 hex를 자주 사용합니다 -->

## 💻 Frontend Tech Stack

<!-- 한 가지 스타일만 사용: for-the-badge / flat-square 등 -->
<!-- simpleicons.org 에 없는 로고는 logo 생략하거나 대체 아이콘 사용 -->

<p align="left">
  <!-- Framework & Build -->
  <img src="https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Vite-4.5.2-646CFF?style=for-the-badge&logo=vite&logoColor=white" />

  <!-- Routing -->
  <img src="https://img.shields.io/badge/React%20Router-6.23.0-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white" />

  <!-- State -->
  <img src="https://img.shields.io/badge/Zustand-5.0.5-000000?style=for-the-badge&logo=react&logoColor=white" />

  <!-- Styling -->
  <img src="https://img.shields.io/badge/MUI-5.15.14-007FFF?style=for-the-badge&logo=mui&logoColor=white" />
  <img src="https://img.shields.io/badge/Emotion-11.11.0-DB7093?style=for-the-badge&logo=emotion&logoColor=white" />
  <img src="https://img.shields.io/badge/styled--components-5.3.11-DB7093?style=for-the-badge&logo=styledcomponents&logoColor=white" />

  <!-- Data Fetching -->
  <img src="https://img.shields.io/badge/Axios-1.6.8-5A29E4?style=for-the-badge&logo=axios&logoColor=white" />

  <!-- Data Visualization -->
  <img src="https://img.shields.io/badge/Recharts-2.15.4-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/MUI%20X--Charts-8.5.3-007FFF?style=for-the-badge&logo=mui&logoColor=white" />

  <!-- Utilities -->
  <img src="https://img.shields.io/badge/React%20Daum%20Postcode-3.2.0-0052CC?style=for-the-badge&logo=react&logoColor=white" />
</p>

<details>
<summary>📋 상세 표로 보기 (접기/펼치기)</summary>

| Category             | Technology                      | Version   | Description                 |
|----------------------|----------------------------------|-----------|-----------------------------|
| **Framework & Library** | React                           | ^18.2.0   | 메인 UI 라이브러리          |
| **Build Tool**       | Vite                            | ^4.5.2    | 모던 프론트엔드 개발/빌드 도구 |
| **Routing**          | React Router                    | ^6.23.0   | 클라이언트 사이드 라우팅     |
| **State Management** | Zustand                         | ^5.0.5    | 가볍고 간편한 상태 관리       |
| **Styling**          | MUI, Emotion, Styled Components | ^5.15.14, ^11.11.0, ^5.3.11 | UI 컴포넌트 & 스타일링 |
| **Data Fetching**    | Axios                           | ^1.6.8    | HTTP API 통신               |
| **Data Visualization** | Recharts, MUI X-Charts          | ^2.15.4, ^8.5.3 | 데이터 시각화 차트 라이브러리 |
| **Utilities**        | React Daum Postcode             | ^3.2.0    | 다음 주소 검색 서비스 연동    |

</details>

---


## 4. 아키텍처

**인프라**

<img width="1118" height="703" alt="image" src="https://github.com/user-attachments/assets/31514f46-4b51-4028-b11c-13df8da3e621" />



**ERD**

<img width="1195" height="807" alt="image" src="https://github.com/user-attachments/assets/1fd08442-69ee-4dbe-8ba3-f6d73ca0f569" />
