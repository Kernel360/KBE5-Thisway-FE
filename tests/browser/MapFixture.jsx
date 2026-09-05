import React from 'react';
export default function MapFixture({ path = [] }) {
  return <div data-testid="map-point-count">{path.length}</div>;
}
