import React, { useState } from 'react';
import './CarRegistrationPage.css';

// 공식 로고 컴포넌트
const OfficialLogo = () => (
  <svg width="20" height="20" viewBox="0 0 100 100" style={{ marginRight: '6px' }}>
    <polygon 
      points="50,10 90,80 10,80" 
      fill="#4285f4"
      stroke="none"
    />
    <circle cx="25" cy="85" r="8" fill="#1a73e8" />
    <circle cx="75" cy="85" r="8" fill="#1a73e8" />
    <circle cx="25" cy="85" r="12" fill="none" stroke="white" strokeWidth="3" />
    <circle cx="75" cy="85" r="12" fill="none" stroke="white" strokeWidth="3" />
  </svg>
);

const CarRegistrationPage = () => {
  const [manufacturer, setManufacturer] = useState('');
  const [year, setYear] = useState('');
  const [modelName, setModelName] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [color, setColor] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Handle form submission logic here
    const carData = {
      manufacturer,
      year: parseInt(year, 10), // Assuming year should be a number
      modelName,
      vehicleNumber,
      color,
    };

    try {
      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(carData),
      });

      if (response.ok) {
        // Handle success (e.g., show success message, clear form, navigate)
        console.log('차량 등록 성공:', carData);
        alert('차량 등록이 완료되었습니다.');
        // Optionally clear the form
        setManufacturer('');
        setYear('');
        setModelName('');
        setVehicleNumber('');
        setColor('');
      } else {
        // Handle errors (e.g., show error message)
        const errorData = await response.json();
        console.error('차량 등록 실패:', response.status, errorData);
        alert(`차량 등록 실패: ${errorData.message || '알 수 없는 오류 발생'}`);
      }
    } catch (error) {
      console.error('네트워크 오류:', error);
      alert('네트워크 오류로 인해 차량 등록에 실패했습니다.');
    }
  };

  const handleCancel = () => {
    // Handle cancel logic here, e.g., navigate back
    console.log('취소 버튼 클릭');
    // Example: navigate back to the previous page or home
    // window.history.back();
  };

  return (
    <div className="car-registration-container">
      <h1>
        <OfficialLogo />
        차량 등록
      </h1>
      <p>새로운 차량 정보를 등록해주세요</p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="manufacturer">제조사 *</label>
          <input
            type="text"
            id="manufacturer"
            value={manufacturer}
            onChange={(e) => setManufacturer(e.target.value)}
            placeholder="현대, 기아, BMW 등"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="year">연식 *</label>
          <input
            type="number"
            id="year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="2024"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="modelName">모델명 *</label>
          <input
            type="text"
            id="modelName"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            placeholder="아반떼, 소나타, X3 등"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="vehicleNumber">차량번호 *</label>
          <input
            type="text"
            id="vehicleNumber"
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value)}
            placeholder="12가 3456"
            required
          />
          <small>올바른 차량번호 형식으로 입력해주세요</small>
        </div>

        <div className="form-group">
          <label htmlFor="color">색상 *</label>
          <input
            type="text"
            id="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder="흰색, 검정색, 은색 등"
            required
          />
        </div>

        <div className="form-buttons">
          <button type="button" onClick={handleCancel}>취소</button>
          <button type="submit">등록하기</button>
        </div>

        <div className="required-info">
          <p>* 표시된 항목은 필수 입력 사항입니다</p>
        </div>
      </form>
    </div>
  );
};

export default CarRegistrationPage;
