import React, { Component } from 'react';
import XLSX from 'xlsx';

class ExcelToJsonUploader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      excelData: [],
      jsonData: [],
      excelFile: null,
    };
  }

  handleFileChange = (e) => {
    const file = e.target.files[0];
    this.setState({ excelFile: file }, this.processExcel);
  };

  processExcel = () => {
    const { excelFile } = this.state;
    if (!excelFile) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const excelData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      this.setState({ excelData });
    };
    reader.readAsBinaryString(excelFile);
  };

  convertToJSON = () => {
    const { excelData } = this.state;
    const jsonData = excelData.map((row) => ({
      // Customize this based on your Excel structure
      property1: row['Column1'],
      property2: row['Column2'],
      // Add more properties as needed
    }));
    this.setState({ jsonData });
  };

  sendDataToBackend = () => {
    const { jsonData } = this.state;
    
    // Make an HTTP request to your backend server to send the JSON data
    fetch('your-backend-endpoint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jsonData),
    })
      .then((response) => response.json())
      .then((data) => {
        // Handle the response from the backend if needed
        console.log('Data sent to the backend:', data);
      })
      .catch((error) => {
        console.error('Error sending data to the backend:', error);
      });
  };

  render() {
    const { excelData, jsonData } = this.state;

    return (
      <div>
        <input type="file" onChange={this.handleFileChange} />
        <button onClick={this.processExcel}>Process Excel</button>
        <button onClick={this.convertToJSON}>Convert to JSON</button>
        <button onClick={this.sendDataToBackend}>Send Data to Backend</button>
        <div>
          <h2>Excel Data</h2>
          <pre>{JSON.stringify(excelData, null, 2)}</pre>
        </div>
        <div>
          <h2>JSON Data</h2>
          <pre>{JSON.stringify(jsonData, null, 2)}</pre>
        </div>
      </div>
    );
  }
}

export default ExcelToJsonUploader;