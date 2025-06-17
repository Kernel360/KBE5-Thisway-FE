export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\. /g, '-').replace('.', '');
};

export const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatDuration = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  let diff = Math.floor((endDate - startDate) / 1000); // 초 단위
  const hours = String(Math.floor(diff / 3600)).padStart(2, '0');
  diff %= 3600;
  const minutes = String(Math.floor(diff / 60)).padStart(2, '0');
  const seconds = String(diff % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}; 