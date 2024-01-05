import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

import { CCard, CCardBody, CCardHeader, CCol, CRow, CButton, CPagination, CPaginationItem} from '@coreui/react'
import { cilFile, cilTrash, cilClipboard, cilNoteAdd, cilSync, cilTransfer, cilListFilter } from '@coreui/icons';

import CIcon from '@coreui/icons-react'

import './FCIRegulationTable.css';
import './Popup.css';

import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

import axios from 'axios';

import { NumericFormat } from 'react-number-format';

class FCIPositionCompositionVO {
  constructor(id, specieGroup, specieType, specieName, specieSymbol, marketPrice, quantity, valued) {
    this.id = id;
    this.specieGroup = specieGroup;
    this.specieType = specieType;
    this.specieName = specieName;
    this.specieSymbol = specieSymbol;
    this.marketPrice = marketPrice;
    this.quantity = quantity;
    this.valued = valued;
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
  const [regulations, setRegulations] = useState([{FCIRegulationSymbolName}]);
  const [positions, setPositions] = useState([{id : '', fciSymbol: '', jsonPosition : '', updatedMarketPosition: '', overview: '', composition: [FCIPositionCompositionVO]}]);
  const [excelData, setExcelData] = useState([]);
  const [excelFile, setExcelFile] = useState(null);
  const [selectedFCISymbol, setSelectedFCISymbol] = useState('');
  const [visible, setVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPositions, setTotalPositions] = useState(0);
  const [searchFiltered, setSearchFiltered] = useState(false);
  const positionsPerPage = 5;
  
  const [searchCurrentPositionId, setSearchCurrentPositionId] = useState(1);
  const [searchCurrentFromDate, setSearchCurrentFromDate] = useState('');
  const [searchCurrentToDate, setSearchCurrentToDate] = useState('');

  const [validationError, setValidationError] = useState('');

  /** FCI Regulations - Symbol and Name */
  useEffect(() => {
    const fetchRegulations = async () => {
      try {
        const responseData = await axios.get('http://localhost:8098/api/v1/fci/symbol-name');
        return responseData.data;
      } catch (error) {
        console.error('Error sending data to the backend:', error);
      }
    };

    const fetchPositions = async (fciSymbol, pageNumber) => {
      try {
        const responseData = await axios.get('http://localhost:8098/api/v1/fci/' + fciSymbol + '/position/page/' + pageNumber + '/page_size/' + positionsPerPage);
        return responseData.data;
      } catch (error) {
        console.error('Error sending data to the backend:', error);
      }
    };

    const fetchTotalPositions = async (fciSymbol) => {
      try {
        const responseData = await axios.get('http://localhost:8098/api/v1/fci/' + fciSymbol + '/position');
        return responseData.data;
      } catch (error) {
        console.error('Error sending data to the backend:', error);
      }
    };

    const setFetchedData = async () => {
      const tempLoadedRegulations = await fetchRegulations();
      if (tempLoadedRegulations.length > 0) {
        const tempLoadedPositions = await fetchPositions(tempLoadedRegulations[0].fciSymbol, 0);
        const tempLoadedTotalPositions = await fetchTotalPositions(tempLoadedRegulations[0].fciSymbol);
        setRegulations(tempLoadedRegulations);
        setPositions(tempLoadedPositions);
        setSelectedFCISymbol(tempLoadedRegulations[0].fciSymbol);
        setTotalPositions(tempLoadedTotalPositions.length);
      }
    };
    setFetchedData();
  }, []); 

 /** Create a new Position */
  const createFCIPosition = () => {
    if(excelData.length > 0) {
      setFetchedData();
    };
  };

  const handlePageChange = async (pageNumber) => {
    setCurrentPage(pageNumber);
    let pPage = pageNumber - 1;
    console.log("url: http://localhost:8098/api/v1/fci/" + selectedFCISymbol + "/position/page/" + pPage + '/page_size/' + positionsPerPage);
    const fetchPositions = async (pageNumber) => {
      try {
        const responseData = await axios.get('http://localhost:8098/api/v1/fci/' + selectedFCISymbol + '/position/page/' + pPage + '/page_size/' + positionsPerPage);
        return responseData.data;
      } catch (error) {
        console.error('#1 - Error receiving specieTypeAssociation:', error);
      }
    };
    const tempLoadedPositions = await fetchPositions(pageNumber);
    setPositions(tempLoadedPositions);
  };

  const setFetchedData = async () => {
    const tempLoadedCreatedPosition = await fetchCreatedPosition();
    if (validationError === 0) {
      setPositions([tempLoadedCreatedPosition, ...positions]);
    }
  };

  const fetchCreatedPosition = async () => {
    try {
      const body = "{\"position\":" + JSON.stringify(excelData, null, 1) + "}";
      const response = await axios.post('http://localhost:8098/api/v1/fci/' + selectedFCISymbol + '/position', body,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        });
      return response.data;
    } catch (error) {
      console.error('Error sending data to the backend:', error);
      setValidationError(error.response.data.message);
    }
  };

  /** FCI Positions bound to selected FCI Regulation */
  const selectFciSymbol = async (fciSymbol) => {
    setValidationError('');
    const fetchPositionWithFciSymbol = async (fciSymbol) => {
      if (fciSymbol !== undefined) {
        setSelectedFCISymbol(fciSymbol);
        try {
          const responseData = await axios.get('http://localhost:8098/api/v1/fci/' + fciSymbol + '/position');
          return responseData.data;
        } catch (error) {
          console.error('Error sending data to the backend:', error);
        }
      }
  };
  
  const setFetchedData = async () => {
    const tempLoadedPositions = await fetchPositionWithFciSymbol(fciSymbol);
    setPositions(tempLoadedPositions);
  } 
  return setFetchedData;
}; 

  // const selectFciSymbol = (symbol) => {
  //   if (symbol !== undefined) {
  //     setSelectedFCISymbol(symbol);
  //     fetch('http://localhost:8098/api/v1/fci/' + symbol + '/position')
  //       .then((response) => response.json())
  //       .then((json) => setPositions(json));
  //   }
  // };

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
        const newState = positions.map(obj => {
          if (obj.id === positionId) {
            return {...obj, overview: d.overview, updatedMarketPosition: d.updatedMarketPosition};
          }
          return obj;
        });
        setPositions(newState);
      })    
      .catch((error) => {
        console.error('Error sending data to the backend:', error);
      });
  };

  const describePosition = (composition) => {
    // const fetchPosition = async () => {
    //   try {
    //     const responseData = await axios.get('http://localhost:8098/api/v1/fci/' + fciSymbol + '/position/' + positionId);
    //     return responseData.data;
    //   } catch (error) {
    //     console.error('Error sending data to the backend:', error);
    //   }
    // }
    setVisible(!visible);
}

  const handleSearchPositionIdChange = (positionId) => {
    setSearchCurrentPositionId(positionId);
    setSearchFiltered(!searchFiltered);
    console.log("searchCurrentPositionId = " + searchCurrentPositionId);
  }

  const handleSearchDateFromChange = (fromDate) => {
    setSearchCurrentFromDate(fromDate);
  }

  const handleSearchDateToChange = (fromDate) => {
    setSearchCurrentToDate(fromDate);
  }

  const filterPositionList = async () => {
    const fetchFilteredPosition = async () => {
      try {
        if (searchCurrentPositionId !== "") {
          const responseData = await axios.get('http://localhost:8098/api/v1/fci/' + selectedFCISymbol + '/position/' + searchCurrentPositionId + '/filtered');
          return responseData.data;
        } else {
          const responseData = await axios.get('http://localhost:8098/api/v1/fci/' + selectedFCISymbol + '/position/page/' + 0 + '/page_size/' + positionsPerPage);
          return responseData.data;
        }
      } catch (error) {
        console.error('Error sending data to the backend:', error);
      }
    }
    const tempLoadedPositions = await fetchFilteredPosition();
    setPositions(tempLoadedPositions);
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
                    <td width="20%"><code>&lt;FCI Regulation Symbol&gt;</code></td>
                    <td width="80%">
                      <select className="text-medium-emphasis large" onChange={(e) => selectFciSymbol(e.target.value)}>
                        {/* <option value="">&nbsp;&nbsp;&nbsp;</option> */}
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

      {(validationError) !== '' ? 
            <CCard>
              <CCardHeader>
                <strong className="text-medium-emphasis small">There are some errors in uploaded Position</strong>
              </CCardHeader>
              <CCardBody>
                  <div className="validation-errors">
                    <code>&#187;&nbsp;{validationError}</code>
                  </div>
              </CCardBody>
            </CCard>
        : null}

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
                {totalPositions > 0? (
                  <tr>
                    <td width="12%">Position Identifier #</td>
                    <td width="20%">
                    {/* <select className="text-medium-emphasis large">
                        {positions !== undefined && positions.map((fciPosition) => 
                          <React.Fragment key={fciPosition.id}>
                          <option value={fciPosition.id}>#{fciPosition.id} - {fciPosition.timestamp}&nbsp;&nbsp;&nbsp;</option>
                          </React.Fragment>
                        )}
                      </select> */}
                       <input type="number" min="1"
                          style={{width: "100%"}}
                          onChange={(e) => handleSearchPositionIdChange(e.target.value)}/>
                    </td>
                    <td>
                      <CButton shape='rounded' size='sm' color='string' onClick={() => filterPositionList()}>
                            <CIcon icon={cilListFilter} size="xl"/>
                      </CButton>
                    </td>
                    {/* <td width="5%"></td>
                    <td width="20%">Date From</td>
                    <td>
                      <input type="text" className="text-medium-emphasis small"
                          onChange={(e) => handleSearchDateFromChange(e.target.value)}/>
                    </td>
                    <td width="5%"></td>
                    <td width="20%">Date To</td>
                    <td width="10%"> */}
                      {/* <CDateRangePicker startDate="2022/08/03" endDate="2022/08/17" label="Date range" locale="en-US" /> */}
                    {/* </td> */}
                      {/* <input type="text" className="text-medium-emphasis small"
                          onChange={(e) => handleSearchDateToChange(e.target.value)}/> */}
                  
                    <td>
                    <CPagination align="end" size="sm" className="text-medium-emphasis small"
                    activePage = {currentPage}
                    pages = {Math.floor(totalPositions / positionsPerPage)}
                    onActivePageChange={handlePageChange}>
                      {currentPage === 1? (
                        <CPaginationItem disabled>«</CPaginationItem> ) 
                      : (<CPaginationItem onClick={() => handlePageChange(currentPage - 1)}>«</CPaginationItem>)}
                     
                      <CPaginationItem active className="text-medium-emphasis small" onClick={() => handlePageChange(currentPage)}>{currentPage}</CPaginationItem>
                     
                      {currentPage === Math.ceil(totalPositions / positionsPerPage) || searchFiltered ? (
                        <CPaginationItem disabled>»</CPaginationItem>) 
                      : (<CPaginationItem className="text-medium-emphasis small" onClick={() => handlePageChange(currentPage + 1)}>»</CPaginationItem>)}
                    </CPagination>
                </td>
                  </tr>
                  ) : null}
                </table>
              </p>
              <table>
                <thead>
                  <tr className="text-medium-emphasis">
                    <th>#</th>
                    <th>Position</th>
                    <th>FCI</th>
                    <th>Date</th>
                    <th>Overview</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.prototype.toString.call(positions) === '[object Array]' && positions?.map((item) => 
                    item !== 'undefined'? (
                    <React.Fragment key={item.fciSymbol}>
                    <tr>
                      {item.id? (<td width="5%">{item.id}</td>) : (null)}
                      <td>
                        <>
                          <Popup 
                            position="left center" visible={visible}
                            trigger={
                              <CButton shape='rounded' size='sm' color='string' onClick={() => describePosition(item.composition)}>
                                    <CIcon icon={cilClipboard} size="xl"/>
                              </CButton>}>
                          <CRow>
                            <CCol xs={12}>
                              <CCard>
                                <CCardHeader>
                                  <strong className="text-medium-emphasis small"><code>#{item.id} - Position</code></strong>
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
                                            <table>
                                              <thead>
                                                <tr>
                                                  <th>Specie Group</th>
                                                  <th>Specie Type</th>
                                                  <th>Specie Name</th>
                                                  <th>Symbol</th>
                                                  <th>Market Price</th>
                                                  <th>Quantity</th>
                                                  <th>Valued</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {Object.prototype.toString.call(item.composition) === '[object Array]' && item.composition?.map((specie) => 
                                                <React.Fragment key={specie.id}>
                                                    <tr>
                                                      <td>{specie.specieGroup}</td>
                                                      <td>{specie.specieType}</td>
                                                      <td>{specie.specieName}</td>
                                                      <td>{specie.specieSymbol}</td>
                                                      <td>
                                                        <div>
                                                          $ <NumericFormat displayType="text" value={Number(specie.marketPrice).toFixed(2)} thousandSeparator="." decimalSeparator=','/>
                                                        </div>
                                                      </td>
                                                      <td>{specie.quantity}</td>
                                                      <td>
                                                        <div>
                                                          $ <NumericFormat displayType="text" value={Number(specie.valued).toFixed(2)} thousandSeparator="." decimalSeparator=','/>
                                                        </div>
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
                      <td width="5%">{item.fciSymbol}</td>
                      <td width="15%">{item.timestamp}</td>
                      <td width="30%">{item.overview}</td>
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
                    ) : null
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