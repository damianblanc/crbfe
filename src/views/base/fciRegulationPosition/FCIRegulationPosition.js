import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

import { CCard, CCardBody, CCardHeader, CCol, CRow, CButton} from '@coreui/react'
import { cilFile, cilTrash, cilClipboard, cilNoteAdd, cilSync, cilTransfer } from '@coreui/icons';

import CIcon from '@coreui/icons-react'

import './FCIRegulationTable.css';
import './Popup.css';

import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

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

function FCIRegulationPosition() {
  const [fcireg, setFcireg] = useState([{FCIRegulationSymbolName}]);
  const [data, setData] = useState([{FCIPosition}]);
  const [excelData, setExcelData] = useState([]);
  const [excelFile, setExcelFile] = useState(null);
  const [responseData, setResponseData] = useState({FCIPosition});
  let [selectedFCISymbol, setSelectedFCISymbol] = useState('');

  /** FCI Regulations - Symbol and Name */
  useEffect(() => {
    fetch('http://localhost:8098/api/v1/fci/symbol-name')
      .then((response) => response.json())
      .then((json) => setFcireg(json))
      .then((json) => {
        console.log("fcireg", fcireg);
        console.log("fcireg[0].fcisymbol", fcireg[0].fciSymbol);
        // console.log("Json = ", json);
        // var d = JSON.stringify(json);
        // console.log("d = ", d);
      })
      // .then((response) => console.log("fcireg[0].fciSymbol2 = ", fcireg[0].fciSymbol))
      // .then(response => selectFciSymbol(fcireg[0].fciSymbol))
  }, []);

  // useEffect(() => {
  //   selectFciSymbol(fcireg.at(0).fciSymbol)
  //   },[]);

  /** FCI Positions bound to selected FCI Regulation */
  const selectFciSymbol = (symbol) => {
    if (symbol !== undefined) {
      setSelectedFCISymbol(symbol);
      fetch('http://localhost:8098/api/v1/fci/' + symbol + '/position')
        .then((response) => response.json())
        .then((json) => setData(json));
    }
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

  const createFCIPosition = () => {
    if(excelData.length > 0) {
    console.log("position: " + JSON.stringify(excelData, null, 1))
    fetch('http://localhost:8098/api/v1/fci/' + selectedFCISymbol + '/position', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: "{\"position\":" + JSON.stringify(excelData, null, 1) + "}",
    })
      .then((response) => response.json())
      .then((responseData) => {
          setData([ ...data, responseData]);
        console.log("responseData! = " + JSON.stringify(responseData));
      })    
      .catch((error) => {
        console.error('Error sending data to the backend:', error);
      });
    }
  };

  const deletePosition = () => {

  }

  const refreshPosition = (fciSymbol, positionId) => {
    fetch('http://localhost:8098/api/v1/fci/' + fciSymbol + '/position/' + positionId + '/refresh', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((responseData) => {
        var d = JSON.parse(JSON.stringify(responseData));
        const newState = data.map(obj => {
          if (obj.id === positionId) {
            return {...obj, overview: d.overview, updatedMarketPosition: d.updatedMarketPosition};
          }
          return obj;
        });
        setData(newState);
      })    
      .catch((error) => {
        console.error('Error sending data to the backend:', error);
      });
  };

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
                    <td width="16%"><code>&lt;FCI Regulation Symbol&gt;</code></td>
                    <td width="80%">
                      <select className="text-medium-emphasis large" onChange={(e) => selectFciSymbol(e.target.value)}>
                        {fcireg?.map((fcireg) => 
                          <React.Fragment key={fcireg.id}>
                          <option value={fcireg.fciSymbol}>{fcireg.fciSymbol} - {fcireg.fciName}&nbsp;&nbsp;&nbsp;</option>
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
              <p className="text-medium-emphasis small">
                 <code>&lt;FCI Regulation Position List&gt;</code>
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
                  {data?.map((item) => 
                    <React.Fragment key={item.id}>
                    <tr>
                      <td width="5%">{item.id}</td>
                      <td width="5%">{item.fciSymbol}</td>
                      <td width="15%">{item.timestamp}</td>
                      <td width="30%">{item.overview}</td>
                      <td>
                        <>
                          <Popup trigger={
                              <CButton shape='rounded' size='sm' color='string' onClick={() => deletePosition()}>
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
                          <CButton shape='rounded' size='sm' color='string' onClick={() => refreshPosition(item.fciSymbol, item.id) }>
                                <CIcon icon={cilNoteAdd} size="xl"/>
                          </CButton>
                        </>
                      </td>
                      <td>
                        <>
                          <CButton shape='rounded' size='sm' color='string' onClick={() => deletePosition()}>
                                <CIcon icon={cilTrash} size="xl"/>
                          </CButton>
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

export default FCIRegulationPosition;