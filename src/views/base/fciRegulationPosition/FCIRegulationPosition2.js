import React, { Component } from 'react';
import * as XLSX from 'xlsx';

class ExcelToJsonConverter extends Component {
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

  convertToExcel = () => {
    const { jsonData } = this.state;
    const worksheet = XLSX.utils.json_to_sheet(jsonData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet 1');
    XLSX.writeFile(workbook, 'converted.xlsx');
  };

  handleJsonChange = (e) => {
    const jsonData = JSON.parse(e.target.value);
    // const jsonData = e.target.value;
    this.setState({ jsonData });
  };

  render() {
    const { excelData, jsonData } = this.state;

    return (
      <div>
        <input type="file" onChange={this.handleFileChange} />
        <div>
          <h2>Excel Data</h2>
          <pre>{JSON.stringify(excelData, null, 2)}</pre>
        </div>
        <div>
          <h2>JSON Data</h2>
          <textarea
          // value={jsonData}
            value={JSON.stringify(jsonData, null, 2)}
            onChange={this.handleJsonChange}
          />
        </div>
        <button onClick={this.convertToExcel}>Convert to Excel</button>
      </div>
    );
  }
}

export default ExcelToJsonConverter;