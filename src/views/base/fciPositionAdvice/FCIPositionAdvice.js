import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

import { CCard, CCardBody, CCardHeader, CCol, CRow, CButton} from '@coreui/react'
import { cilFile, cilTrash, cilClipboard, cilNoteAdd, cilSync, cilTransfer, cilListFilter, cilArrowTop, cilOptions } from '@coreui/icons';
import CIcon from '@coreui/icons-react'

import axios from 'axios';

import { NumericFormat } from 'react-number-format';

import './FCIRegulationTable.css';

import { isLoginTimestampValid } from '../../../utils/utils.js';
import { useNavigate } from 'react-router-dom';

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

class FCIStatistic {
  constructor(adviceQuantity, reportQuantity) {
    this.adviceQuantity = adviceQuantity;
    this.reportQuantity = reportQuantity;
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
  const [flatAdvices, setFlatAdvices] = useState([]);
  const [currentPositionId, setCurrentPositionId] = useState('');
  const [positionPercentages, setPositionPercentages] = useState([]);
  const [statistics, setStatistics] = useState({FCIStatistic});
  const navigate = useNavigate();

  useEffect(() => {
    const isValid = isLoginTimestampValid();
    if (!isValid) {
      localStorage.removeItem("loginTimestamp");
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      navigate('/');
    }

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

    const fetchFlatAdvices = async (fciSymbol, positionId) => {
      try {
        const responseData = await axios.get('http://localhost:8098/api/v1/calculate-bias/fci/' + fciSymbol + '/position/' + positionId + '/advice/criteria/price_uniformly_distribution/flat')
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

    /** FCI Advice Quantity */
    const fetchFCIStaticticsQuantity = async () => {
      try {
        const responseData = await axios.get('http://localhost:8098/api/v1/statistic');
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
        let tempLoadedFlatAdvices = [];
        let tempLoadedPercentagesValued = [];
        if (tempLoadedPositions.length > 0) {
          tempLoadedAdvices = await fetchAdvices(tempLoadedRegulations[0].fciSymbol, tempLoadedPositions[0].id);
          tempLoadedFlatAdvices = await fetchFlatAdvices(tempLoadedRegulations[0].fciSymbol, tempLoadedPositions[0].id);
          tempLoadedPercentagesValued = await fetchFCIPositionPercentagesValued(tempLoadedRegulations[0].fciSymbol, tempLoadedPositions[0].id);
          setCurrentPositionId(tempLoadedPositions[0].id);
        }
        const tempLoadedStatistics = await fetchFCIStaticticsQuantity();

        setRegulations(tempLoadedRegulations);
        setPositions(tempLoadedPositions);
        setRegulationPercentages(tempLoadedPercentages);
        setAdvices(tempLoadedAdvices);
        setFlatAdvices(tempLoadedFlatAdvices);
        setPositionPercentages(tempLoadedPercentagesValued);
        setStatistics(tempLoadedStatistics);
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

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(flatAdvices);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Position");
    let buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
    XLSX.write(workbook, { bookType: "xlsx", type: "binary" });
    XLSX.writeFile(workbook, "Advice_Position_" + currentFCISymbol + "_" + currentPositionId + "_" + calculateCurrentTimeStamp() + ".xlsx");
  };

  const calculateCurrentTimeStamp = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}_${hours}:${minutes}:${seconds}`;
  };

  const selectPosition = (position) => {
    if (position !== undefined) {
      /** FCI Position - Advices */
      const fetchAdvices = async (fciSymbol, positionId) => {
        try {
          const responseData = await axios.get('http://localhost:8098/api/v1/calculate-bias/fci/' + fciSymbol + '/position/' + positionId + '/advice/criteria/price_uniformly_distribution')
          return responseData.data;
        } catch (error) {
          console.error('Error sending data to the backend:', error);
        }
      };

      const setFetchedData = async () => {
        const tempLoadedAdvices = await fetchAdvices(currentFCISymbol, position);
        setCurrentPositionId(position);
        setAdvices(tempLoadedAdvices);
      }

      setFetchedData();
      updateFCIAdviceQuantity();
    }
  };

  const updateFCIAdviceQuantity = async () => {
    let q = statistics.adviceQuantity + 1;
    let st = new FCIStatistic(q, statistics.adviceQuantity);
    setStatistics(prevStatistics => ({
      ...prevStatistics,
      adviceQuantity: q
    }));
    const body = JSON.stringify(st);
    try {
      const responseData = await axios.put('http://localhost:8098/api/v1/statistic/update', body,
      {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      return responseData.data;
    } catch (error) {
      console.error('Error sending data to the backend:', error);
    } 
  }

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
                <CButton shape='rounded' size='sm' color='string' onClick={() => downloadExcel(advices) }>
                      <CIcon icon={cilClipboard} size="xl"/>
                </CButton>
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