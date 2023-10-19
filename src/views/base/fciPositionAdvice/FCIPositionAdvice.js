import React, { useState } from 'react';
import * as XLSX from 'xlsx';

import { CCard, CCardBody, CCardHeader, CCol, CRow} from '@coreui/react'

import './FCIRegulationTable.css';

class Advice {
  constructor(id, specieName, operationAdvice, quantity, price) {
    this.id = id;
    this.specieName = specieName;
    this.operationAdvice = operationAdvice;
    this.quantity = quantity;
    this.price = price;
  }
}

function FCIPositionAdvice() {
  const [excelData, setExcelData] = useState([]);
  const [excelFile, setExcelFile] = useState(null);
  const [responseData, setResponseData] = useState([{ id: '', specieType: '', operationAdvices: [Advice] }]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setExcelFile(file);
  };

  const processExcel = () => {
    if (!excelFile) {
      return;
    }

  const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const excelData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      setExcelData(excelData);
    };
    reader.readAsBinaryString(excelFile);
  };

  const sendDataToBackend = () => {
    fetch('http://localhost:8098/api/v1/calculate-disarrangement/fci/bth58/advice/criteria/price_uniformly_distribution', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: "{\"position\":" + JSON.stringify(excelData, null, 1) + "}",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Backend response:', data);
        setResponseData(data);
        console.log("responseData = " + JSON.stringify(responseData));
      })    
      .catch((error) => {
        console.error('Error sending data to the backend:', error);
      });
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={processExcel}>Process Excel</button>
      <button onClick={sendDataToBackend}>Send Data to Backend</button>
      <br/>
      <div>
        <CRow>
        <CCol xs={12}>
          <CCard>
            <CCardHeader>
              <strong>FCI Regulation Position Advices</strong>
            </CCardHeader>
            <CCardBody>
              <p className="text-medium-emphasis small">
                Refers to a <code>&lt;FCI Regulation Position List&gt;</code> that advices operations based on positon detected biases
              </p>
              <table>
                <thead>
                  <tr>
                    <th>Specie</th>
                    {/* <tr>
                          <th>Name</th>
                          <th>Advice</th>
                          <th>Quantity</th>
                          <th>Price</th>
                        </tr> */}
                  </tr>
                </thead>
                <tbody>
                  {responseData.map((item) => 
                    <React.Fragment key={item.id}>
                    <tr>
                    <td>{item.specieType}</td>
                    <table>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Operation Advice</th>
                          <th>Quantity</th>
                          <th>Current Market Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {item.operationAdvices.map((advice) => 
                              <React.Fragment key={advice.id}>
                                <tr>
                                  <td>{advice.specieName}</td> 
                                  <td>{advice.operationAdvice}</td> 
                                  <td>{advice.quantity}</td> 
                                  <td>{advice.price}</td> 
                                </tr>
                              </React.Fragment> )}
                      </tbody>
                    </table>
                    </tr>
                    </React.Fragment>
                  )}
                </tbody>
              </table>
          </CCardBody>
         </CCard>
        </CCol>
       </CRow> 
      </div>   
    </div>
  );
}

export default FCIPositionAdvice;