import React, { useState, useEffect } from "react";

interface BioreactorData {
  agitationSpeed: number;
  aerationRate: number;
  temperature: number;
  time: number;
}

const BioreactorDashboard: React.FC = () => {
  const [bioreactorData, setBioreactorData] = useState<BioreactorData[]>([]);

  useEffect(() => {
    // simulate data updates every 5 seconds
    const interval = setInterval(() => {
      setBioreactorData((prevState) => [
        ...prevState,
        {
          agitationSpeed: Math.random() * 10 + 100, // generate random agitation speed between 100 and 110 rpm
          aerationRate: Math.random() * 2 + 1, // generate random aeration rate between 1 and 3 lpm
          temperature: Math.random() * 50 + 25, // generate random temperature between 25°C and 75°C
          time: Date.now(),
        },
      ]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const latestData = bioreactorData[bioreactorData.length - 1];

  return (
    <div>
      <h1>Bioreactor Dashboard</h1>
      <h2>Process Parameters:</h2>
      <p>Agitation Speed: {latestData.agitationSpeed} rpm</p>
      <p>Aeration Rate: {latestData.aerationRate} lpm</p>
      <p>Temperature: {latestData.temperature}°C</p>
    </div>
  );
};
