import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

import { CCard, CCardBody, CCardHeader, CCol, CRow} from '@coreui/react'

import axios from 'axios';

import { NumericFormat } from 'react-number-format';

import './FCIRegulationTable.css';

class Advice {
  constructor(id, specieName, operationAdvice, quantity, price, value) {
    this.id = id;
    this.specieName = specieName;
    this.operationAdvice = operationAdvice;
    this.quantity = quantity;
    this.price = price;
    this.value = value;
  }
}

class FCIRegulationSymbolName {
  constructor(id, fciSymbol, fciName) {
    this.id = id;
    this.fciSymbol = fciSymbol;
    this.fciName = fciName;
  }
}

class FCIPositionIdCreatedOn {
  constructor(id, fciCreatedOn) {
    this.id = id;
    this.fciCreatedOn = fciCreatedOn;
  }
}

function FCIPositionAdvice() {
  const [excelData, setExcelData] = useState([]);
  const [excelFile, setExcelFile] = useState(null);
  const [responseData, setResponseData] = useState([{ id: '', specieTypeGroup: '', specieType: '', operationAdvices: [Advice] }]);
  const [regulations, setRegulations] = useState([{FCIRegulationSymbolName}]);
  const [positions, setPositions] = useState([{FCIPositionIdCreatedOn}]);
  const [currentFCISymbol, setCurrentFCISymbol] = useState('');
  const [regulationPercentages, setRegulationPercentages] = useState([]);
  const [advices, setAdvices] = useState([]);
  const [currentPositionId, setCurrentPositionId] = useState('');
  const [positionPercentages, setPositionPercentages] = useState([]);

  useEffect(() => {
    /** FCI Regulations - Symbol and Name */
    const fetchRegulations = async () => {
      try {
        const responseData = await axios.get('http://localhost:8098/api/v1/fci/symbol-name')
        return responseData.data;
      } catch (error) {
        console.error('Error sending data to the backend:', error);
      }
    };

    /** FCI Positions - Id and CreatedOn */
    const fetchPositions = async (fciSymbol) => {
      try {
        const responseData = await axios.get('http://localhost:8098/api/v1/fci/' + fciSymbol + '/position/id-created-on')
        return responseData.data;
      } catch (error) {
        console.error('Error sending data to the backend:', error);
      }
    };

     /** FCI Regulation Percentages - First Element */
    const fetchPercentages = async (fciSymbol) => {
      try {
        const responseData = await axios.get('http://localhost:8098/api/v1/fci/' + fciSymbol + '/regulation-percentages')
        return responseData.data;
      } catch (error) {
        console.error('Error sending data to the backend:', error);
      }
    };

    /** FCI Position - Advices */
    const fetchAdvices = async (fciSymbol, positionId) => {
      try {
        const responseData = await axios.get('http://localhost:8098/api/v1/calculate-bias/fci/' + fciSymbol + '/position/' + positionId + '/advice/criteria/price_uniformly_distribution')
        return responseData.data;
      } catch (error) {
        console.error('Error sending data to the backend:', error);
      }
    };

    /** FCI Position Overview */
    const fetchFCIPositionPercentagesValued = async (fciSymbol, positionId) => {
      try {
        const responseData = await axios.get('http://localhost:8098/api/v1/calculate-bias/fci/' + fciSymbol + '/position/' + positionId + '/percentage-valued/refresh/true');
        return responseData.data;
      } catch (error) {
        console.error('Error sending data to the backend:', error);
      }
    };

    const setFetchedData = async () => {
      const tempLoadedRegulations = await fetchRegulations();
      if (tempLoadedRegulations.length > 0) {
        const tempLoadedPositions = await fetchPositions(tempLoadedRegulations[0].fciSymbol);
        const tempLoadedPercentages = await fetchPercentages(tempLoadedRegulations[0].fciSymbol);
        setCurrentFCISymbol(tempLoadedRegulations[0].fciSymbol);
        let tempLoadedAdvices = [];
        let tempLoadedPercentagesValued = [];
        if (tempLoadedPositions.length > 0) {
          tempLoadedAdvices = await fetchAdvices(tempLoadedRegulations[0].fciSymbol, tempLoadedPositions[0].id);
          tempLoadedPercentagesValued = await fetchFCIPositionPercentagesValued(tempLoadedRegulations[0].fciSymbol, tempLoadedPositions[0].id);
          setCurrentPositionId(tempLoadedPositions[0].id);
        }
        setRegulations(tempLoadedRegulations);
        setPositions(tempLoadedPositions);
        setRegulationPercentages(tempLoadedPercentages);
        setAdvices(tempLoadedAdvices);
        setPositionPercentages(tempLoadedPercentagesValued);
      }
    };
    setFetchedData();
  }, []); 
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

  const selectPosition = (position) => {
    if (position !== undefined) {
      // setSelectedFCISymbol(position);
      // fetch('http://localhost:8098/api/v1/fci/' + symbol + '/position')
      //   .then((response) => response.json())
      //   .then((json) => setFciPositions(json));
    }
  };

  return (
    // <div>
    //   <input type="file" onChange={handleFileChange} />
    //   <button onClick={processExcel}>Process Excel</button>
    //   <button onClick={sendDataToBackend}>Send Data to Backend</button>
    //   <br/>
    //   <div>
    <>
        <CRow>
        <CCol xs={12}>
            <CCard>
              <CCardHeader>
                <strong className="text-medium-emphasis small">Select FCI Regulation & Position</strong>
              </CCardHeader>
              <CCardBody>
                <table>
                    <thead>
                        <tr className="text-medium-emphasis">
                          <td width="17%"><code>&lt;FCI Regulation Symbol&gt;</code></td>
                          <td width="25%">
                            <select className="text-medium-emphasis large" onChange={(e) => setCurrentFCISymbol(e.target.value)}>
                              {regulations?.map((regulation) => 
                                <React.Fragment key={regulation.id}>
                                <option value={regulation.fciSymbol}>{regulation.fciSymbol} - {regulation.fciName}&nbsp;&nbsp;&nbsp;</option>
                                </React.Fragment>
                              )}
                            </select>
                          </td>
                          <td width="11%"><code>&lt;FCI Position&gt;</code></td>
                          <td width="25%">
                            <select className="text-medium-emphasis large" onChange={(e) => selectPosition(e.target.value)}>
                              {positions !== undefined && positions.map((fciPosition) => 
                                <React.Fragment key={fciPosition.id}>
                                <option value={fciPosition.id}>#{fciPosition.id} - {fciPosition.timestamp}&nbsp;&nbsp;&nbsp;</option>
                                </React.Fragment>
                              )}
                            </select>
                          </td>
                        </tr>
                    </thead>
                </table>
             </CCardBody>
            </CCard>
        </CCol>
    </CRow>
    <br/>
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
                    <th>Specie Group</th>
                    <th>Specie Type</th>
                    {/* <tr>
                          <th>Name</th>
                          <th>Advice</th>
                          <th>Quantity</th>
                          <th>Price</th>
                        </tr> */}
                  </tr>
                </thead>
                <tbody>
                  {advices.map((item) => 
                    <React.Fragment key={item.id}>
                    <tr>
                    <td width={"3%"}>{item.specieTypeGroup}</td>
                    <td>{item.specieType}</td>
                    <table>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Operation Advice</th>
                          <th>Relative Quantity</th>
                          <th>Absolute Quantity</th>
                          <th>Market Price</th>
                          <th>Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {item.operationAdvices.map((advice) => 
                              <React.Fragment key={advice.id}>
                                <tr>
                                  <td>{advice.specieName}</td> 
                                  <td>{advice.operationAdvice}</td> 
                                  <td>{Math.floor(advice.quantity)}</td> 
                                  <td>
                                    {(typeof advice.quantity === 'number')? (
                                    <div>
                                        <NumericFormat displayType="text" value={parseFloat(advice.quantity.toFixed(2))} decimalSeparator=','/>
                                    </div>
                                    ) : null}
                                  </td> 
                                  <td>
                                  {(typeof advice.price === 'number')? (
                                    <div>
                                        $ <NumericFormat displayType="text" value={parseFloat(advice.price.toPrecision(2))} thousandSeparator="." decimalSeparator=','/>
                                    </div>
                                    ) : null}
                                  </td> 
                                  <td>
                                    {(typeof advice.value === 'number')? (
                                    <div>
                                        $ <NumericFormat displayType="text" value={parseFloat(advice.value.toPrecision(2))} thousandSeparator="." decimalSeparator=','/>
                                    </div>
                                    ) : null}
                                  </td> 
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
    </>
  );
}

export default FCIPositionAdvice;