import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import BusCard from "./BusCard";
import axiosInstance from "../context/axiosInstance";

const BrowseBuses = () => {
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Add state for loading indicator

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleOriginChange = (event) => {
    setOrigin(event.target.value);
  };

  const handleDestinationChange = (event) => {
    setDestination(event.target.value);
  };

  const fetchBuses = async (event) => {
    event.preventDefault();
    let response;
    try {
      response = await axiosInstance.post("/api/buses", {
        source: origin,
        destination: destination,
        date: selectedDate,
      });
    } catch (err) {
      console.log("something went wrong in fetching");
    }

    console.log(response);
    const buses = response.data.availableBuses;
    setIsLoading(false);
    navigate("/browseBusCards", { state: { bus: buses } });
  };

  const getOccupancyPercentage = (bus) => {
    const occupancy = (bus.currentOccupancy / bus.totalSeats) * 100;
    if (occupancy <= 60) {
      return "green";
    } else if (occupancy <= 90) {
      return "yellow";
    } else {
      return "red";
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          width: "600px",
          padding: "20px",
          backgroundColor: "#fff",
          borderRadius: "5px",
          boxShadow: "0 0 10px rgba(0, 0, 0, 0.15)",
        }}
      >
        <h1 style={{ textAlign: "center" }}>Browse Buses</h1>
        <form style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <label style={{ width: "50px" }}>Origin:</label>
            <input
              type="text"
              value={origin}
              onChange={handleOriginChange}
              style={{ flexGrow: 0.9 }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <label style={{ width: "50px" }}>Destination:</label>
            <input
              type="text"
              value={destination}
              onChange={handleDestinationChange}
              style={{ flexGrow: 0.9 }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              dateFormat="DD-MM-YYYY"
              inline
            />
          </div>
        </form>
        <button onClick={fetchBuses}>Search</button>
      </div>
    </div>
  );
};

export default BrowseBuses;
