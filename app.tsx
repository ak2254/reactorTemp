import React from 'react';
import { Line } from 'react-chartjs-2';

interface DashboardProps {
  temperature: number[];
  pH: number[];
  dissolvedOxygen: number[];
  agitationRate: number[];
  biomass: number[];
  productivity: number[];
  feedRate: number[];
  pressure: number[];
  flowRate: number[];
}

const BioreactorDashboard: React.FC<DashboardProps> = ({ temperature, pH, dissolvedOxygen, agitationRate, biomass, productivity, feedRate, pressure, flowRate }) => {
  const data = {
    labels: ['Time 1', 'Time 2', 'Time 3', 'Time 4', 'Time 5', 'Time 6', 'Time 7', 'Time 8', 'Time 9', 'Time 10'],
    datasets: [
      {
        label: 'Temperature (°C)',
        data: temperature,
        fill: false,
        borderColor: 'red',
        tension: 0.1,
      },
      {
        label: 'pH',
        data: pH,
        fill: false,
        borderColor: 'blue',
        tension: 0.1,
      },
      {
        label: 'Dissolved Oxygen (mg/L)',
        data: dissolvedOxygen,
        fill: false,
        borderColor: 'green',
        tension: 0.1,
      },
      {
        label: 'Agitation Rate (rpm)',
        data: agitationRate,
        fill: false,
        borderColor: 'purple',
        tension: 0.1,
      },
      {
        label: 'Biomass (g/L)',
        data: biomass,
        fill: false,
        borderColor: 'orange',
        tension: 0.1,
      },
      {
        label: 'Productivity (g/L/hr)',
        data: productivity,
        fill: false,
        borderColor: 'pink',
        tension: 0.1,
      },
      {
        label: 'Feed Rate (mL/min)',
        data: feedRate,
        fill: false,
        borderColor: 'brown',
        tension: 0.1,
      },
      {
        label: 'Pressure (psi)',
        data: pressure,
        fill: false,
        borderColor: 'gray',
        tension: 0.1,
      },
      {
        label: 'Flow Rate (L/min)',
        data: flowRate,
        fill: false,
        borderColor: 'teal',
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="bioreactor-dashboard">
      <h2>Bioreactor Monitoring Dashboard</h2>
      <Line data={data} />
    </div>
  );
};

export default BioreactorDashboard;
