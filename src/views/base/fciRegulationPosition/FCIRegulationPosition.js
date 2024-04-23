import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';

import { CCard, CCardBody, CCardHeader, CCol, CRow, CButton, CPagination, CPaginationItem} from '@coreui/react'
import { cilFile, cilTrash, cilClipboard, cilNoteAdd, cilSync, cilTransfer, cilListFilter, cilArrowTop, cilOptions } from '@coreui/icons';
import { CChartLine } from '@coreui/react-chartjs'

import CIcon from '@coreui/icons-react'

import './FCIRegulationTable.css';
import './Popup.css';

import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

import axios from 'axios';

import { NumericFormat } from 'react-number-format';

import { isLoginTimestampValid } from '../../../utils/utils.js';
import { useNavigate } from 'react-router-dom';

import {
  CDropdown,
  CDropdownMenu,
  CDropdownItem,
  CDropdownToggle,
  CWidgetStatsA
} from '@coreui/react'

import { CToast, CToastBody, CToastHeader, CToaster } from '@coreui/react'

import { getStyle } from '@coreui/utils'

import PropTypes from 'prop-types';

class FCIPositionCompositionVO {
  constructor(id, specieGroup, specieType, specieSymbol, marketPrice, quantity, valued) {
    this.id = id;
    this.specieGroup = specieGroup;
    this.specieType = specieType;
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
  const [positionIdentifier, setPositionIdentifier] = useState('');
  const [regulationSymbol, setRegulationSymbol] = useState('');

  const [positionsPerMonth, setPositionsPerMonth] = useState([]);
  const [posPerMonthGrowth, setPosPerMonthGrowth] = useState(0);
  const [positionQuantity, setPositionQuantity] = useState(0);
  const navigate = useNavigate();

  const [errorMessage, setErrorMessage] = useState('');
  const [toast, addToast] = useState(0)
  const toaster = useRef()
  const [showToast, setShowToast] = useState(false);

  /** FCI Regulations - Symbol and Name */
  useEffect(() => {
    const isValid = isLoginTimestampValid();
    if (!isValid) {
      navigate('/');
    }

    const fetchRegulations = async () => {
      try {
        const responseData = await axios.get('http://localhost:8098/api/v1/fci/regulations');
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

    const fetchPositionsPerMonth = async (fciSymbol) => {
      try {
        const responseData = await axios.get('http://localhost:8098/api/v1/summarize/positions-per-month/fci/' + fciSymbol);
        return responseData.data;
      } catch (error) {
        console.error('Error sending data to the backend:', error);
      }
    };

    const setFetchedData = async () => {
      const tempLoadedRegulations = await fetchRegulations();
      setRegulations(tempLoadedRegulations);
      if (!tempLoadedRegulations || tempLoadedRegulations.length == 0) {
        setErrorMessage("» There are no FCI Regulations defined, please access regulation management");
        setShowToast(true);
      } else {
        if (tempLoadedRegulations && tempLoadedRegulations.length > 0) {
          const tempLoadedPositions = await fetchPositions(tempLoadedRegulations[0].fciSymbol, 0);
          if (tempLoadedPositions && tempLoadedPositions.length == 0) {
            setErrorMessage("» FCI [" + tempLoadedRegulations[0].fciSymbol + "] has no positions informed");
            setShowToast(true);
          }  
          const tempLoadedTotalPositions = await fetchTotalPositions(tempLoadedRegulations[0].fciSymbol);
          const tempLoadedPositionsPerMonth = await fetchPositionsPerMonth(tempLoadedRegulations[0].fciSymbol);
          setRegulations(tempLoadedRegulations);
          setPositions(tempLoadedPositions);
          setSelectedFCISymbol(tempLoadedRegulations[0].fciSymbol);
          setTotalPositions(tempLoadedTotalPositions.length);
          setPositionsPerMonth(tempLoadedPositionsPerMonth);
          let totalPositions = tempLoadedPositionsPerMonth.reduce((accumulator, currentValue) => accumulator + currentValue.quantity, 0);
          setPositionQuantity(totalPositions);
          setPosPerMonthGrowth((tempLoadedPositionsPerMonth.at(0).quantity / totalPositions) * 100);
        }
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
    const fetchPositionsPerMonth = async () => {
      try {
        const responseData = await axios.get('http://localhost:8098/api/v1/summarize/positions-per-month/fci/' + selectedFCISymbol);
        return responseData.data;
      } catch (error) {
        console.error('Error sending data to the backend:', error);
      }
    };

    const tempLoadedCreatedPosition = await fetchCreatedPosition();
    if (tempLoadedCreatedPosition !== undefined && (validationError === false || validationError === "" || validationError.length === 0)) {
      setPositions([tempLoadedCreatedPosition, ...positions]);
      const tempLoadedPositionsPerMonth = await fetchPositionsPerMonth();
      setPositionsPerMonth(tempLoadedPositionsPerMonth);
      let totalPositions = tempLoadedPositionsPerMonth.reduce((accumulator, currentValue) => accumulator + currentValue.quantity, 0);
      setPositionQuantity(totalPositions);
    } else {
      setValidationError(validationError);
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
      setShowToast(false);
      return response.data;
    } catch (error) {
      // console.error('Error sending data to the backend:', error);
      setErrorMessage(error.response.data.message);
      setShowToast(true);
      console.log("showToast = ", showToast);
      showToastMessage(error.response.data.message);
    }
  };

  const deletePosition = async (fciPositionId) => {
    const fetchPositionsPerMonth = async () => {
      try {
        const responseData = await axios.get('http://localhost:8098/api/v1/summarize/positions-per-month/fci/' + selectedFCISymbol);
        return responseData.data;
      } catch (error) {
        console.error('Error sending data to the backend:', error);
      }
    };

    const tempDeletedPositionId = await fetchDeletedPosition(fciPositionId);
    if (tempDeletedPositionId === fciPositionId) {
      let filteredArray = positions.filter(item => item.id !== fciPositionId)
      setPositions(filteredArray);
      const tempLoadedPositionsPerMonth = await fetchPositionsPerMonth();
      setPositionsPerMonth(tempLoadedPositionsPerMonth);
      let totalPositions = tempLoadedPositionsPerMonth.reduce((accumulator, currentValue) => accumulator + currentValue.quantity, 0);
      setPositionQuantity(totalPositions);
    }
  };

  const fetchDeletedPosition = async (fciPositionId) => {
    try {
      const response = await axios.delete('http://localhost:8098/api/v1/fci/' + selectedFCISymbol + '/position/' + fciPositionId);
      return response.data;
    } catch (error) {
      console.error('Error sending data to the backend:', error);
      setValidationError(error.response.data.message);
    }
  };

  /** FCI Positions bound to selected FCI Regulation */
  const selectFciSymbol = async (fciSymbol) => {
    setPositions([]);
    setValidationError('');
    setExcelFile(null);
    setSelectedFCISymbol(fciSymbol);
    setPositionIdentifier('');
   
    const fetchPositionsPerPage = async () => {
      try {
        const responseData = await axios.get('http://localhost:8098/api/v1/fci/' + fciSymbol + '/position/page/' + 0 + '/page_size/' + positionsPerPage);
        return responseData.data;
      } catch (error) {
        console.error('Error sending data to the backend:', error);
        setValidationError(error.response.data.message);
      }
    }

    const fetchPositionsPerMonth = async (fciSymbol) => {
      try {
        const responseData = await axios.get('http://localhost:8098/api/v1/summarize/positions-per-month/fci/' + fciSymbol);
        return responseData.data;
      } catch (error) {
        console.error('Error sending data to the backend:', error);
      }
    };

    const setFetchedData = async (fciPositionId) => {
      const tempLoadedPositionsPerPage = await fetchPositionsPerPage(fciPositionId);
      const tempLoadedPositionsPerMonth = await fetchPositionsPerMonth(fciSymbol);
      setPositionsPerMonth(tempLoadedPositionsPerMonth);
      if (tempLoadedPositionsPerPage && tempLoadedPositionsPerPage.length == 0) {
        setErrorMessage("» FCI [" + fciSymbol + "] has no positions informed");
        setShowToast(true);
      }  
      let totalPositions = tempLoadedPositionsPerMonth.reduce((accumulator, currentValue) => accumulator + currentValue.quantity, 0);
      setPositionQuantity(totalPositions);
      setPositions(tempLoadedPositionsPerPage);
    }
   setFetchedData();
  }  

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

  const handleSearchPositionIdChange = (positionId) => {
    setPositionIdentifier(positionId);
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

  const showToastMessage = (message) => {
    setErrorMessage(message)
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 10000);
  }

  const toggleToast = () => {
    setShowToast(!showToast);
  };
  
  return (
    <>
    <div>
      {showToast === true?
      <CToaster classname='p-3' placement='top-end' push={toast} ref={toaster}>
        <CToast show={true} animation={true} autohide={true} 
              fade={true} visible={true} onClose={toggleToast}>
          <CToastHeader closeButton>
            <svg
              className="rounded me-2"
              width="20"
              height="20"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="xMidYMid slice"
              focusable="false"
              role="img"
            >
            <rect width="100%" height="100%" fill="#FF0000"></rect>
            </svg>
            <div className="fw-bold me-auto">Position Error Message</div>
            <small>A second ago</small>
          </CToastHeader>
          <CToastBody>{errorMessage}</CToastBody>
        </CToast>
      </CToaster>
      : null}
       <CRow>
          <CCol xs={12}>
            <CCard>
              <CCardHeader>
                <strong className="text-medium-emphasis small">Select & Upload Position</strong>
              </CCardHeader>
              <CCardBody>
              <table>
                <tr>
                  <td>
                    <table className='table-head-1'>
                      <tr>
                        <td width="30%"><code>&lt;FCI Regulation Symbol&gt;</code></td>
                        <td width="35%">
                          <select className="text-medium-emphasis large" 
                            onChange={(e) => selectFciSymbol(e.target.value)} style={{width: "100%"}}>
                              {regulations?.map((regulation) => 
                                <React.Fragment key={regulation.id}>
                                <option value={regulation.fciSymbol}>{regulation.fciSymbol} - {regulation.fciName}&nbsp;&nbsp;&nbsp;</option>
                                </React.Fragment>
                              )}
                          </select>
                        </td>
                        <td width="3%"></td>
                        <td  className="text-medium-emphasis small" width="10%">Symbol</td>
                        <td width="12%">
                          <input id="regulationSymbol" type="text" className="text-medium-emphasis small"
                              style={{width: "100%"}}
                              onChange={(e) => handleSearchPositionIdChange(e.target.value)} //TODO: Change FCI Symbol
                              value={regulationSymbol}/>
                        </td>
                        <td>
                          <CButton shape='rounded' size='sm' color='string' onClick={() => selectFciSymbol()}>
                                <CIcon icon={cilListFilter} size="xl"/>
                          </CButton>
                        </td>
                      </tr>
                    </table>
                    
                    <table  className="text-medium-emphasis small" width="70%">
                      <tr className="text-medium-emphasis">
                        <td width="70%" >
                          <table className='table-head'>
                            <td width="5%"/>
                              <thead>
                                <th>Format</th>
                                <th>File</th>
                                <th>Position</th>
                                <th>Actions</th>
                              </thead>
                              <tbody>
                                <tr>
                                  <td width="20%">Excel file (.xlsx format)</td>
                                  <td width="50%"><input className="text-medium-emphasis small" type="file" onChange={handleFileChange}></input></td>
                                  <td> 
                                    <CButton className="text-medium-emphasis small" shape='rounded' size='sm' color='string' onClick={() => processExcel()}>
                                      <CIcon icon={cilSync} size="xl"/>
                                    </CButton>
                                  </td>
                                  <td>
                                  <CButton className="text-medium-emphasis small" shape='rounded' size='sm' color='string' onClick={() => createFCIPosition()}>
                                      <CIcon icon={cilTransfer} size="xl"/>
                                  </CButton>
                                  </td>
                                </tr>
                              </tbody>
                          </table>
                        </td>
                        <td width="2%"/>
                      </tr>
                    </table>
                  </td>
                  <td width="28%">
                    <CCol sm={12} mb={6}>
                      <CWidgetStatsA
                        className="mb-6"
                        color="secondary"
                        style={{ height: '138px'}}
                        value={
                          <>
                            {positionQuantity}{' '}
                            <span className="fs-6 fw-small">
                              ({posPerMonthGrowth}% <CIcon icon={cilArrowTop} />)
                            </span>
                          </>
                        }
                        title="Positions"
                        chart={
                          <CChartLine
                            className="st-0 sx-0"
                            style={{ height: '70px'}}
                            data={{
                              labels: positionsPerMonth?.reverse().map((e) => e.month),
                              datasets: [
                                {
                                  label: 'Positions per Month',
                                  backgroundColor: '#3A3B3C',
                                  borderColor: '#3A3B3C',
                                  pointBackgroundColor: getStyle('--cui-info'),
                                  data: positionsPerMonth?.map((e) => e.quantity),
                                },
                              ],
                            }}
                            options={{
                              plugins: {
                                legend: {
                                  display: false,
                                },
                              },
                              maintainAspectRatio: false,
                              scales: {
                                x: {
                                  grid: {
                                    display: false,
                                    drawBorder: false,
                                  },
                                  ticks: {
                                    display: false,
                                  },
                                },
                                y: {
                                  min: -200,
                                  max: 200,
                                  display: false,
                                  grid: {
                                    display: false,
                                  },
                                  ticks: {
                                    display: false,
                                  },
                                },
                              },
                              elements: {
                                line: {
                                  borderWidth: 1,
                                },
                                point: {
                                  radius: 4,
                                  hitRadius: 10,
                                  hoverRadius: 10,
                                },
                              },
                            }}
                          />
                        }
                      />
                    </CCol>
                  </td>
                </tr>
              </table> 
            </CCardBody>
          </CCard>
        </CCol>
      </CRow> 
      <br/>

      {(validationError !== '') ? 
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

      <div>
      {regulations? (
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
                       <input id="positionIdentifier" type="number" min="1"
                          style={{width: "100%"}}
                          onChange={(e) => handleSearchPositionIdChange(e.target.value)}
                          value={positionIdentifier}/>
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
                     
                      <CPaginationItem active className="text-medium-emphasis small" 
                          onClick={() => handlePageChange(currentPage)}>{currentPage}</CPaginationItem>
                     
                      {currentPage === Math.ceil(totalPositions / positionsPerPage) || searchFiltered ? (
                        <CPaginationItem disabled>»</CPaginationItem>) 
                      : (<CPaginationItem className="text-medium-emphasis small" onClick={() => handlePageChange(currentPage + 1)}>»</CPaginationItem>)}
                    </CPagination>
                </td>
                  </tr>
                  ) : null}
                </table>
              </p>
              <table className="text-medium-emphasis small">
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
            
                              <CButton shape='rounded' size='sm' color='string' >
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
                                                  {/* <th>Specie Name</th> */}
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
                                                      {/* <td>{specie.specieName}</td> */}
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
                          <CButton shape='rounded' size='sm' color='string' onClick={() => deletePosition(item.id)}>
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
      ) : null}
      </div>   
    </div>
    </>
  );
}

export default FCIRegulationPosition;