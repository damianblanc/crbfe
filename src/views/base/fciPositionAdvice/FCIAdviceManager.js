import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

import { CCard, CCardBody, CCardHeader, CCol, CRow, CButton, CPagination, CPaginationItem} from '@coreui/react'
import { cilFile, cilTrash, cilClipboard, cilNoteAdd, cilSync, cilTransfer } from '@coreui/icons';

import CIcon from '@coreui/icons-react'

import './FCIPositionAdvice.css';
import './Popup.css';

import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

import axios from 'axios';
import BASE_URL from './../../config.js';

class FCIPosition {
  constructor(id, fciSymbol, timestamp, overview, jsonPosition, updatedMarketPosition) {
    this.id = id;
    this.fciSymbol = fciSymbol;
    this.jsonPosition = jsonPosition;
    this.updatedMarketPosition = updatedMarketPosition;
    this.overview = overview;
    this.timestamp = timestamp;
  }
}

class FCIRegulationSymbolName {
  constructor(id, fciSymbol, fciName) {
    this.id = id;
    this.fciSymbol = fciSymbol;
    this.fciName = fciName;
  }
}

function FCIAdviceManager() {
  const [regulations, setRegulations] = useState([{FCIRegulationSymbolName}]);
  const [positions, setPositions] = useState([{FCIPosition}]);
  const [excelData, setExcelData] = useState([]);
  const [excelFile, setExcelFile] = useState(null);
  // const [responseData, setResponseData] = useState({FCIPosition});
  const [selectedFCISymbol, setSelectedFCISymbol] = useState('');

  /** FCI Regulations - Symbol and Name */
  useEffect(() => {
    const fetchRegulations = async () => {
      try {
        const responseData = await axios.get(BASE_URL + '/api/v1/fci/symbol-name');
        return responseData.data;
      } catch (error) {
        console.error('Error sending data to the backend:', error);
      }
    };

    const fetchPositions = async (fciSymbol) => {
      try {
        const responseData = await axios.get(BASE_URL + '/api/v1/fci/' + fciSymbol + '/position');
        return responseData.data;
      } catch (error) {
        console.error('Error sending data to the backend:', error);
      }
    };

    const setFetchedData = async () => {
      const tempLoadedRegulations = await fetchRegulations();
      const tempLoadedPositions = await fetchPositions(tempLoadedRegulations[0].fciSymbol);
      setRegulations(tempLoadedRegulations);
      setPositions(tempLoadedPositions);
      setSelectedFCISymbol(tempLoadedRegulations[0].fciSymbol);
    };
    setFetchedData();
  }, []); 

 /** Create a new Position */
  const createFCIPosition = () => {
    if(excelData.length > 0) {
      setFetchedData();
    };
  };

  const setFetchedData = async () => {
    const tempLoadedCreatedPosition = await fetchCreatedPosition();
    setPositions([tempLoadedCreatedPosition, ...positions]);
  };

  const fetchCreatedPosition = async () => {
    try {
      const body = "{\"position\":" + JSON.stringify(excelData, null, 1) + "}";
      const responseData = await axios.post(BASE_URL + '/api/v1/fci/' + selectedFCISymbol + '/position', body,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        });
      return responseData.data;
    } catch (error) {
      console.error('Error sending data to the backend:', error);
    }
  };

  /** FCI Positions bound to selected FCI Regulation */
  const selectFciSymbol = async (fciSymbol) => {
    const fetchPositions = async (fciSymbol) => {
      try {
        const responseData = await axios.get(BASE_URL + '/api/v1/fci/' + fciSymbol + '/position');
        return responseData.data;
      } catch (error) {
        console.error('Error sending data to the backend:', error);
      }
    };

    const fetchPositionWithFciSymbol = async (fciSymbol) => {
      if (fciSymbol !== undefined) {
        setSelectedFCISymbol(fciSymbol);
        try {
          const responseData = await axios.get(BASE_URL + '/api/v1/fci/' + fciSymbol + '/position');
          return responseData.data;
        } catch (error) {
          console.error('Error sending data to the backend:', error);
        }
      }
      const setFetchedData = async () => {
        const tempLoadedPositions = await fetchPositions(fciSymbol);
        setPositions(tempLoadedPositions);
      };
      setFetchedData();
  };
  
  const setFetchedData = async () => {
    const tempLoadedPositions = await fetchPositionWithFciSymbol(fciSymbol);
    setPositions(tempLoadedPositions);
  } 
  return setFetchedData;
}; 

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

  const downloadExcel = (fciSymbol, timestamp, jsonPosition) => {
    var json = JSON.parse(jsonPosition);
    const worksheet = XLSX.utils.json_to_sheet(json);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Position");
    let buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
    XLSX.write(workbook, { bookType: "xlsx", type: "binary" });
    XLSX.writeFile(workbook, "Position_" + fciSymbol + "_" + timestamp + ".xlsx");
  };

  const deletePosition = () => {

  }

  return (
    <div>
       <CRow>
          <CCol xs={12}>
            <CCard>
              <CCardHeader>
                <strong className="text-medium-emphasis small">Select & Upload Position</strong>
              </CCardHeader>
              <CCardBody>
              <table>
               <thead>
                  <tr className="text-medium-emphasis">
                    <td width="20%"><code>&lt;FCI Regulation Symbol&gt;</code></td>
                    <td width="80%">
                      <select className="text-medium-emphasis large" onChange={(e) => selectFciSymbol(e.target.value)}>
                        {regulations?.map((regulation) => 
                          <React.Fragment key={regulation.id}>
                          <option value={regulation.fciSymbol}>{regulation.fciSymbol} - {regulation.fciName}&nbsp;&nbsp;&nbsp;</option>
                          </React.Fragment>
                        )}
                      </select>
                    </td>
                  </tr>
                </thead>
                <tbody><tr>&nbsp;</tr></tbody>
               </table> 
              <table>
              <thead>
                  <tr className="text-medium-emphasis">
                    <th>Format</th>
                    <th>File</th>
                    <th>Position</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                <tr>
                  <td width="15%">Excel file (.xlsx format)</td>
                  <td width="60%"><input type="file" onChange={handleFileChange}></input></td>
                  <td> 
                    <CButton shape='rounded' size='sm' color='string' onClick={() => processExcel()}>
                      <CIcon icon={cilSync} size="xl"/>
                    </CButton>
                  </td>
                  <td>
                  <CButton shape='rounded' size='sm' color='string' onClick={() => createFCIPosition()}>
                      <CIcon icon={cilTransfer} size="xl"/>
                  </CButton>
                  </td>
                </tr>
                </tbody>
                </table>  
              </CCardBody>
            </CCard>
        </CCol>
      </CRow> 
      <br/>
      <div>
        <CRow>
        <CCol xs={12}>
          <CCard>
            <CCardHeader className="text-medium-emphasis small">
              <strong>FCI Regulation Positions</strong>
            </CCardHeader>
            <CCardBody>
              <p>
                <table>
                  <tr>
                    <td width="12%">Position Identifier</td>
                    <td>
                    <select className="text-medium-emphasis large">
                        {positions !== undefined && positions.map((fciPosition) => 
                          <React.Fragment key={fciPosition.id}>
                          <option value={fciPosition.id}>#{fciPosition.id} - {fciPosition.timestamp}&nbsp;&nbsp;&nbsp;</option>
                          </React.Fragment>
                        )}
                      </select>
                    </td>
                    <td>
                      <CPagination align="end" size="sm" className="text-medium-emphasis small">
                          <CPaginationItem disabled>Previous</CPaginationItem>
                          <CPaginationItem className="text-medium-emphasis small">1</CPaginationItem>
                          <CPaginationItem className="text-medium-emphasis small">2</CPaginationItem>
                          <CPaginationItem>3</CPaginationItem>
                          <CPaginationItem className="text-medium-emphasis small">Next</CPaginationItem>
                        </CPagination>
                    </td>
                  </tr>
                </table>
              </p>
              <table>
                <thead>
                  <tr className="text-medium-emphasis">
                    <th>#</th>
                    <th>FCI</th>
                    <th>Date</th>
                    <th>Overview</th>
                    <th>Position</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.prototype.toString.call(positions) === '[object Array]' && positions?.map((item) => 
                    <React.Fragment key={item.id}>
                    <tr>
                      <td width="5%">{item.id}</td>
                      <td width="5%">{item.fciSymbol}</td>
                      <td width="15%">{item.timestamp}</td>
                      <td width="30%">{item.overview}</td>
                      <td>
                        <>
                          <Popup trigger={
                              <CButton shape='rounded' size='sm' color='string' onClick={() => deletePosition(item.id)}>
                                    <CIcon icon={cilClipboard} size="xl"/>
                              </CButton>} position="left center" modal>
                          <CRow>
                            <CCol xs={12}>
                              <CCard>
                                <CCardHeader>
                                  <strong className="text-medium-emphasis small"><code>#{item.id} - Position Details</code></strong>
                                </CCardHeader>
                                <CCardBody>
                                <table>
                                  <thead>
                                    <tr/>
                                  </thead>
                                  <tbody>  
                                    <tr>
                                      <td>
                                      <CRow>
                                        <CCol xs={12}>
                                          <CCard>
                                          <CCardHeader>
                                            <strong className="text-medium-emphasis small">{item.fciSymbol} - {item.timestamp} - {item.overview}</strong>
                                          </CCardHeader>
                                          <CCardBody>
                                            {item.updatedMarketPosition}
                                            </CCardBody>
                                        </CCard>
                                        </CCol>
                                      </CRow> 
                                      </td>
                                    </tr>
                                  </tbody>
                                  </table>
                              </CCardBody>
                            </CCard>
                            </CCol>
                          </CRow> 
                          </Popup>
                        </>
                      </td>
                      <td>
                        <>
                          <CButton shape='rounded' size='sm' color='string' onClick={() => downloadExcel(item.fciSymbol, item.timestamp, item.updatedMarketPosition) }>
                                <CIcon icon={cilFile} size="xl"/>
                          </CButton>
                        </>
                      </td>
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

export default FCIAdviceManager;