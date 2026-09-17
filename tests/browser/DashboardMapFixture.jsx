import React from 'react';

export default function DashboardMapFixture({ center, path = [] }) {
  return <div>
    <output data-testid="dashboard-map-center">{center.lat},{center.lng}</output>
    <output data-testid="dashboard-map-points">{path.length}</output>
  </div>;
}
