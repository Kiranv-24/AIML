import React, { useState } from "react";
import "./App.css";
import { cropData, fertilizerData } from "./Data";

function App() {
  // State for form inputs
  const [cropInputs, setCropInputs] = useState({
    nitrogen: "",
    phosphorus: "",
    potassium: "",
    temperature: "",
    humidity: "",
    ph: "",
    rainfall: ""
  });

  const [fertilizerInputs, setFertilizerInputs] = useState({
    soilType: "select",
    cropType: "select",
    moisture: "",
    nitrogen: "",
    phosphorus: "",
    potassium: "",
    temperature: "",
    humidity: ""
  });

  const [activeTab, setActiveTab] = useState("crop"); // 'crop' or 'fertilizer'
  const [prediction, setPrediction] = useState("");

  // Define soil types and crop types
  const soilTypes = ['Sandy', 'Loamy', 'Black', 'Red', 'Clayey'];
  const cropTypes = ['Maize', 'Sugarcane', 'Cotton', 'Tobacco', 'Paddy', 'Barley', 
                    'Wheat', 'Millets', 'Oil seeds', 'Pulses', 'Ground Nuts'];

  // Form field definitions for fertilizer recommendation
  const fertilizerFormFields = [
    { name: 'nitrogen', label: 'Nitrogen (N)', type: 'number' },
    { name: 'phosphorus', label: 'Phosphorus (P)', type: 'number' },
    { name: 'potassium', label: 'Potassium (K)', type: 'number' },
    { name: 'temperature', label: 'Temperature (°C)', type: 'number' },
    { name: 'humidity', label: 'Humidity (%)', type: 'number' },
    { name: 'moisture', label: 'Moisture', type: 'number' }
  ];

  // Handle input changes for crop recommendation
  const handleCropInputChange = (e) => {
    const { name, value } = e.target;
    setCropInputs(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle input changes for fertilizer recommendation
  const handleFertilizerInputChange = (e) => {
    const { name, value } = e.target;
    setFertilizerInputs(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submissions
  const handleCropSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:5001/predict/crop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          features: Object.values(cropInputs).map(Number)
        }),
      });
      const data = await response.json();
      setPrediction(data.prediction);
    } catch (error) {
      console.error('Error:', error);
      setPrediction('Error making prediction');
    }
  };

  const handleFertilizerSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:5001/predict/fertilizer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          features: Object.values(fertilizerInputs).map(Number)
        }),
      });
      const data = await response.json();
      setPrediction(data.prediction);
    } catch (error) {
      console.error('Error:', error);
      setPrediction('Error making prediction');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Agricultural Recommendation System</h1>
        
        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button 
            className={activeTab === "crop" ? "active" : ""} 
            onClick={() => setActiveTab("crop")}
          >
            Crop Recommendation
          </button>
          <button 
            className={activeTab === "fertilizer" ? "active" : ""} 
            onClick={() => setActiveTab("fertilizer")}
          >
            Fertilizer Recommendation
          </button>
        </div>

        {/* Crop Recommendation Form */}
        {activeTab === "crop" && (
          <div className="form-container">
            <h2>Crop Recommendation</h2>
            <form onSubmit={handleCropSubmit}>
              {Object.entries(cropInputs).map(([key, value]) => (
                <div className="input-group" key={key}>
                  <label>{key.charAt(0).toUpperCase() + key.slice(1)}:</label>
                  <input
                    type="number"
                    name={key}
                    value={value}
                    onChange={handleCropInputChange}
                    required
                  />
                </div>
              ))}
              <button type="submit" className="submit-btn">Get Crop Recommendation</button>
            </form>
          </div>
        )}

        {/* Fertilizer Recommendation Form */}
        {activeTab === "fertilizer" && (
          <div className="form-container">
            <h2>Fertilizer Recommendation</h2>
            <form onSubmit={handleFertilizerSubmit}>
              <div className="input-group">
                <label>Soil Type:</label>
                <select
                  name="soilType"
                  value={fertilizerInputs.soilType}
                  onChange={handleFertilizerInputChange}
                  required
                  className="select-input"
                >
                  <option value="select">Select Soil Type</option>
                  {soilTypes.map((soil) => (
                    <option key={soil} value={soil}>
                      {soil}
                    </option>
                  ))}
                </select>
              </div>

              {/* Crop Type Dropdown */}
              <div className="input-group">
                <label>Crop Type:</label>
                <select
                  name="cropType"
                  value={fertilizerInputs.cropType}
                  onChange={handleFertilizerInputChange}
                  required
                  className="select-input"
                >
                  <option value="select">Select Crop Type</option>
                  {cropTypes.map((crop) => (
                    <option key={crop} value={crop}>
                      {crop}
                    </option>
                  ))}
                </select>
              </div>

              {/* Other Fertilizer Input Fields */}
              {fertilizerFormFields.map((field) => (
                <div className="input-group" key={field.name}>
                  <label>{field.label}:</label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={fertilizerInputs[field.name]}
                    onChange={handleFertilizerInputChange}
                    required
                  />
                </div>
              ))}
              <button type="submit" className="submit-btn">Get Fertilizer Recommendation</button>
            </form>
          </div>
        )}

        {/* Prediction Result */}
        {prediction && (
          <div className="prediction-result">
            <div className="result-card">
              {activeTab === "crop" && cropData[prediction] && (
                <>
                  <h2>{cropData[prediction].title}</h2>
                  <div className="result-content">
                    <img 
                      src={cropData[prediction].imageUrl} 
                      alt={cropData[prediction].title}
                      className="result-image"
                    />
                    <div className="result-details">
                      <h3>Recommended Crop Details:</h3>
                      <p>{cropData[prediction].description}</p>
                    </div>
                  </div>
                </>
              )}

              {activeTab === "fertilizer" && fertilizerData[prediction] && (
                <>
                  <h2>{fertilizerData[prediction].title}</h2>
                  <div className="result-content">
                    <img 
                      src={fertilizerData[prediction].imageUrl} 
                      alt={fertilizerData[prediction].title}
                      className="result-image"
                    />
                    <div className="result-details">
                      <h3>Recommended Fertilizer Details:</h3>
                      <p>{fertilizerData[prediction].description}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
