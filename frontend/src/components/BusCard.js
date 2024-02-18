import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const BusCard = () => {
  const location = useLocation();
  const buses = location.state.bus;

  console.log(buses);
    // Process buses and calculate occupancy colors
    const processedBuses = buses.map((bus) => ({
      ...bus,
      occupancyColor: getOccupancyColor(bus.currentOccupancy / bus.totalSeats * 100),
    }));

    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px' }}>
        {processedBuses.map((bus) => (
          <div key={bus._id} >
            <h2 style={{ color: bus.occupancyColor }}>{bus.name}</h2>
            <p>Total Seats: {bus.totalSeats}</p>
            <p>Available Seats: {bus.totalSeats-bus.currentOccupancy}</p>
          </div>
        ))}
      </div>
    );
  };

// Helper function for color selection based on occupancy percentage
const getOccupancyColor = (occupancyPercentage) => {
  if (occupancyPercentage <= 60) {
    return "green";
  } else if (occupancyPercentage <= 90) {
    return "yellow";
  } else {
    return "red";
  }
};

export default BusCard;
