import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import * as XLSX from 'xlsx';

import { CCard, CCardBody, CCardHeader, CCol, CRow, CButton, CPagination, CPaginationItem} from '@coreui/react'
import { cilSun, cilAlignRight, cilBookmark, cilFile, cilTrash, cilClipboard, cilNoteAdd, cilSync, cilTransfer, cilListFilter, cilArrowTop, cilOptions, cilMagnifyingGlass, cilCheckCircle, cilMoon } from '@coreui/icons';
import { CChartLine } from '@coreui/react-chartjs'

import CIcon from '@coreui/icons-react'

import './FCIRegulationPosition.css';

import './Popup.css';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

import api from './../../config.js';

import { NumericFormat } from 'react-number-format';

import { isLoginTimestampValid } from '../../../utils/utils.js';
import { useNavigate } from 'react-router-dom';
// import { useLocation } from 'react-router-dom';
// import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';

import { CDropdown, CDropdownMenu, CDropdownItem, CDropdownToggle,CWidgetStatsA } from '@coreui/react'

import { CToast, CToastBody, CToastHeader, CToaster } from '@coreui/react'
import { getStyle } from '@coreui/utils'


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

function FCIRegulationPosition (prevLocation) {
  const [regulations, setRegulations] = useState([{FCIRegulationSymbolName}]);
  const [positions, setPositions] = useState([{id : '', fciSymbol: '', jsonPosition : '', updatedMarketPosition: '', overview: '', composition: [FCIPositionCompositionVO]}]);
  const [oldestPosition, setOldestPosition] = useState();
  const [comboPositions, setComboPositions] = useState([{id : '', fciSymbol: '', jsonPosition : '', updatedMarketPosition: '', overview: '', composition: [FCIPositionCompositionVO]}]);
  const [excelData, setExcelData] = useState([]);
  const [excelFile, setExcelFile] = useState(null);
  const [selectedFCISymbol, setSelectedFCISymbol] = useState('');
  const [visible, setVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPositions, setTotalPositions] = useState(0);
  const [searchFiltered, setSearchFiltered] = useState(false);
  const [searchFilteredPosition, setSearchFilteredPosition] = useState(false);
  const positionsPerPage = 5;
  
  const [searchCurrentPositionId, setSearchCurrentPositionId] = useState(1);

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

  const [searchFromDate, setSearchFromDate] = useState('');
  const [searchToDate, setSearchToDate] = useState('');

  const [searchFromDateAfter, setSearchFromDateAfter] = useState('');
  const [searchToDateAfter, setSearchToDateAfter] = useState('');

  const [currentPositionIdInFilter, setCurrentPositionIdInFilter] = useState(0);

  const minPositionId = Math.min(...positions.map(position => position.id));
  const maxPositionId = Math.max(...positions.map(position => position.id));

  const [noPositions, setNoPositions] = useState(false);
  const [noPositionsDateFilter, setNoPositionsDateFilter] = useState(false);
  const [excelDataLoaded, setExcelDataLoaded] = useState(false);
  const fileInputRef = useRef(null);
  const [prevPath, setPrevPath] = useState('');

  const selectRef = useRef(null);

  const location = useLocation();

  useEffect(() => {
    const urlParam = new URLSearchParams(location.search).get('url');
    if (urlParam) {
      api.defaults.baseURL = urlParam;
    }
  }, [location]);

  /** FCI Regulations - Symbol and Name */
  useEffect(() => {
    const isValid = isLoginTimestampValid();
    if (!isValid) {
      navigate('/');
    }

    const currentPage = document.location.pathname;
    localStorage.setItem('currentPage', currentPage);
    const previousPage = localStorage.getItem("previousPage");
    if (currentPage !== previousPage) {
        localStorage.setItem('previousPage', currentPage);
        window.location.reload();
    }
    
    const fetchRegulations = async () => {
      try {
        const responseData = await api.get('/api/v1/fci/regulations');
        return responseData.data;
      } catch (error) {
        console.error('Error sending data to the backend:', error);
      }
    };

    const fetchPositions = async (fciSymbol, pageNumber) => {
      try {
        const responseData = await api.get('/api/v1/fci/' + fciSymbol + '/position/page/' + pageNumber + '/page_size/' + positionsPerPage);
        return responseData.data;
      } catch (error) {
        console.error('Error sending data to the backend:', error);
      }
    };

    const fetchTotalPositions = async (fciSymbol) => {
      try {
        const responseData = await api.get('/api/v1/fci/' + fciSymbol + '/position');
        return responseData.data;
      } catch (error) {
        console.error('Error sending data to the backend:', error);
      }
    };

    const fetchPositionsPerMonth = async (fciSymbol) => {
      try {
        const responseData = await api.get('/api/v1/summarize/positions-per-month/fci/' + fciSymbol);
        return responseData.data;
      } catch (error) {
        console.error('Error sending data to the backend:', error);
      }
    };

    const fetchOldestPosition = async (fciSymbol) => {
      try {
        const responseData = await api.get('/api/v1/fci/' + fciSymbol + '/position/oldest');
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
          const tempLoadedOldestPostion = await fetchOldestPosition(tempLoadedRegulations[0].fciSymbol);
          setRegulations(tempLoadedRegulations);
          setPositions(tempLoadedPositions);
          setNoPositions(tempLoadedTotalPositions.length > 0);
          setOldestPosition(tempLoadedOldestPostion)
          setComboPositions(tempLoadedPositions);
          setSelectedFCISymbol(tempLoadedRegulations[0].fciSymbol);
          setTotalPositions(tempLoadedTotalPositions.length);
          setPositionsPerMonth(tempLoadedPositionsPerMonth);
          let totalPositions = tempLoadedPositionsPerMonth.reduce((accumulator, currentValue) => accumulator + currentValue.quantity, 0);
          setPositionQuantity(totalPositions);
          setPosPerMonthGrowth((tempLoadedPositionsPerMonth.at(0).quantity / totalPositions) * 100);
          setSearchFilteredPosition(false);
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
    const fetchPositions = async (pageNumber) => {
      try {
        const responseData = searchFiltered? 
        (await api.get('/api/v1/fci/' + selectedFCISymbol + '/position/' + currentPositionIdInFilter + '/from/' + searchFromDateAfter + '/to/' + searchToDateAfter + '/page/' + pPage + '/page_size/' + positionsPerPage)) 
        : (await api.get('/api/v1/fci/' + selectedFCISymbol + '/position/page/' + pPage + '/page_size/' + positionsPerPage));
        return responseData.data;
      } catch (error) {
        console.error('#1 - Error receiving specieTypeAssociation:', error);
      }
    };
    const tempLoadedPositions = await fetchPositions(pageNumber);
    setPositions(tempLoadedPositions);
    setComboPositions(tempLoadedPositions);
  };

  const setFetchedData = async () => {
    const fetchPositionsPerMonth = async () => {
      try {
        const responseData = await api.get('/api/v1/summarize/positions-per-month/fci/' + selectedFCISymbol);
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
      const response = await api.post('/api/v1/fci/' + selectedFCISymbol + '/position', body,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        });
      setShowToast(false);
      return response.data;
    } catch (error) {
      setErrorMessage(error.response.data.message);
      setShowToast(true);
      showToastMessage(error.response.data.message);
    }
  };

  const deletePosition = async (fciPositionId) => {
    const fetchPositionsPerMonth = async () => {
      try {
        const responseData = await api.get('/api/v1/summarize/positions-per-month/fci/' + selectedFCISymbol);
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
      const response = await api.delete('/api/v1/fci/' + selectedFCISymbol + '/position/' + fciPositionId);
      return response.data;
    } catch (error) {
      console.error('Error sending data to the backend:', error);
      setValidationError(error.response.data.message);
    }
  };

  /** FCI Positions bound to selected FCI Regulation */
  const selectFciSymbol = async (fciSymbol) => {
    setPositions([]);
    setComboPositions([]);
    setValidationError('');
    setExcelFile(null);
    setSelectedFCISymbol(fciSymbol);
    setPositionIdentifier('');
    setTotalPositions(0);
    setSearchFilteredPosition(false);
    setExcelDataLoaded(false);
    fileInputRef.current.value = "";
   
    const fetchPositionsPerPage = async () => {
      try {
        const responseData = await api.get('/api/v1/fci/' + fciSymbol + '/position/page/' + 0 + '/page_size/' + positionsPerPage);
        return responseData.data;
      } catch (error) {
        console.error('Error sending data to the backend:', error);
        setValidationError(error.response.data.message);
      }
    }

    const fetchPositionsPerMonth = async (fciSymbol) => {
      try {
        const responseData = await api.get('/api/v1/summarize/positions-per-month/fci/' + fciSymbol);
        return responseData.data;
      } catch (error) {
        console.error('Error sending data to the backend:', error);
      }
    };

     const fetchTotalPositions = async (fciSymbol) => {
      try {
        const responseData = await api.get('/api/v1/fci/' + fciSymbol + '/position');
        return responseData.data;
      } catch (error) {
        console.error('Error sending data to the backend:', error);
      }
    };

    const fetchOldestPosition = async (fciSymbol) => {
      try {
        const responseData = await api.get('/api/v1/fci/' + fciSymbol + '/position/oldest');
        return responseData.data;
      } catch (error) {
        console.error('Error sending data to the backend:', error);
      }
    };

    const setFetchedData = async (fciPositionId) => {
      const tempLoadedPositionsPerPage = await fetchPositionsPerPage(fciPositionId);
      const tempLoadedPositionsPerMonth = await fetchPositionsPerMonth(fciSymbol);
      const tempLoadedTotalPositions = await fetchTotalPositions(fciSymbol);
      setPositionsPerMonth(tempLoadedPositionsPerMonth);
      if (tempLoadedPositionsPerPage && tempLoadedPositionsPerPage.length == 0) {
        setErrorMessage("» FCI [" + fciSymbol + "] has no positions informed");
        setShowToast(true);
      }  
      const tempLoadedOldestPostion = await fetchOldestPosition(fciSymbol);
      let totalPositions = tempLoadedPositionsPerMonth.reduce((accumulator, currentValue) => accumulator + currentValue.quantity, 0);
      setPositionQuantity(totalPositions);
      setPositions(tempLoadedPositionsPerPage);
      setOldestPosition(tempLoadedOldestPostion);
      setTotalPositions(tempLoadedTotalPositions.length);
      setNoPositions(tempLoadedTotalPositions.length > 0);
      setRegulationSymbol(fciSymbol);
    }
   setFetchedData();
  }  

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setExcelFile(file);
    setExcelDataLoaded(false);
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
    setExcelDataLoaded(true);
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
    api.get('/api/v1/fci/' + fciSymbol + '/position/' + positionId + '/refresh', {
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
  }

  const filterPositionListTable = () => {
    if (currentPositionIdInFilter) {
      const filteredPositions = positions.filter(position => position.id.toString() === currentPositionIdInFilter);
      setPositions(filteredPositions);
      setSearchFilteredPosition(true);
    } else {
      setPositions(comboPositions);
      setSearchFilteredPosition(false);
      setCurrentPositionIdInFilter(0);
    }
  }

  const filterPositionListSearch = async () => {
    const fetchFilteredPosition = async () => {
      try {
        if (searchCurrentPositionId !== "") {
          const responseData = await api.get('/api/v1/fci/' + selectedFCISymbol + '/position/' + searchCurrentPositionId + '/filtered');
          return responseData.data;
        } else {
          const responseData = await api.get('/api/v1/fci/' + selectedFCISymbol + '/position/page/' + 0 + '/page_size/' + positionsPerPage);
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

  const handleSearchDateFromChange = (fromDate) => {
    setSearchFromDate(fromDate);
  };

  const handleSearchDateToChange = (toDate) => {
    setSearchToDate(toDate);
  };
  
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const selectedFCISymbol = regulations.find(regulation => regulation.fciSymbol === regulationSymbol);
    if (selectedFCISymbol) {
      setSelectedFCISymbol(selectedFCISymbol.fciSymbol);
      selectFciSymbol(selectedFCISymbol.fciSymbol);
    }
  }, [regulationSymbol, regulations]);

  const searchPositionsByDate = async (pageNumber) => {
    if (searchFilteredPosition) return;
    let fromDate;
    let toDate;
    if (searchFromDate == "") {
      fromDate = oldestPosition.timestamp.split(" ")[0];
      setSearchFromDate(fromDate);
    } else {
      fromDate = searchFromDate;
    }
    if (searchToDate == "") {
      let todayDate = new Date().toISOString().split('T')[0];
      setSearchToDate(todayDate);
      toDate = todayDate;
    } else {
      toDate = searchToDate;
    }

    const fetchFilteredPosition = async (pageNumber) => {
      try {
          const responseData = await api.get('/api/v1/fci/' + selectedFCISymbol + '/position/' + currentPositionIdInFilter + '/from/' + fromDate + '/to/' + toDate + '/page/' + pageNumber + '/page_size/' + positionsPerPage);
          return responseData.data;
      } catch (error) {
        console.error('Error sending data to the backend:', error);
      }
    }

    const fetchTotalFilteredPosition = async () => {
      try {
          const responseData = await api.get('/api/v1/fci/' + selectedFCISymbol + '/position/' + currentPositionIdInFilter + '/from/' + fromDate + '/to/' + toDate + '/page/0');
          return responseData.data;
      } catch (error) {
        console.error('Error sending data to the backend:', error);
      }
    }
    const tempLoadedPositions = await fetchFilteredPosition(pageNumber);
    const tempLoadedTotalPositions = await fetchTotalFilteredPosition();
    setPositions(tempLoadedPositions);
    setTotalPositions(tempLoadedTotalPositions.length);
    if (tempLoadedTotalPositions && tempLoadedTotalPositions.length == 0) {
      setNoPositionsDateFilter(false);
    }
    setSearchFiltered(true);
    setSearchFromDateAfter(searchFromDate);
    setSearchToDateAfter(searchToDate);
  };

  const isValidPositionId = (value, positions) => {
    return /^[0-9]+$/.test(value);
  }

  const isPositionInTable = (value, positions) => {
    const positionId = Number(value);
    return positions.some(position => position.id.toString() === value);
  }

  const setPositionsForDropdown = () => {
    setPositions(comboPositions);
  };

  const timeOfDay = (timestamp) => {
    const date = new Date(timestamp);
    const hour = date.getHours();

    if (hour < 12) {
      return "Morning";
    } else if (hour < 18) {
      return "Afternoon";
    } else if (hour < 20) {
      return "Evening";
    } else {
      return "Night";
    }
  }

  const splitOverview = (overview) => {
      return overview.split('Totals');
  }

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    setRegulationSymbol(inputValue);
  
    const selectOptions = Array.from(selectRef.current.options);
    for (let i = 0; i < selectOptions.length; i++) {
      if (selectOptions[i].value.includes(inputValue)) {
        selectRef.current.value = selectOptions[i].value;
        setRegulationSymbol(selectOptions[i].value);
        break;
      }
    }
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
            {/* <small>A second ago</small> */}
          </CToastHeader>
          <CToastBody>{errorMessage}</CToastBody>
        </CToast>
      </CToaster>
      : null}
      {regulations.length > 0? (
       <CRow>
          <CCol xs={12}>
            <CCard>
              <CCardHeader>
              {<Popup trigger={
                  <CButton className="text-medium-emphasis small" shape='rounded' size='sm' color='string'>
                      <CIcon icon={cilBookmark} size="xl"/>
                  </CButton>} position="right" modal lockScroll="false" backgroundColor="rgba(75,192,192,0.4)"
                   contentStyle={{ width: "60%", height: "55%", overflow: "auto", position: 'absolute', top: '19%', left: '21%'}}>
                  {
                    <CRow>
                    <CCol xs={12}>
                      <CCard>
                        <CCardHeader>
                          <strong className="text-medium-emphasis small">FCI Regulation & Position Biases</strong>
                        </CCardHeader>
                        <CCardBody>
                        <CRow>
                          <CCol>
                          <p className="text-medium-emphasis small">» The FCI Position Page is a user-friendly tool designed to help users manage and analyze FCI regulation positions.</p>
                          <p className="text-medium-emphasis small">» With this FCI Position Page, a FCI regulation can be selected and view its corresponding positions, including position percentages and values.</p>
                          <p className="text-medium-emphasis small">» The Position Page also provides an overview of each specie type valued summarized price, as well as a detailed popup that shows each specie in position with its market price valued.</p>
                          <p className="text-medium-emphasis small">» FCI Positions can be filtered by date range and view position data for a specific time period.</p> 
                          <p className="text-medium-emphasis small">» The FCI Position Page also allows to create and upload new positions using an Excel file, and refresh or delete existing positions.</p> 
                          <p className="text-medium-emphasis small">» With its intuitive interface and powerful features, the FCI Regulation Position FCI Position Page is an essential tool for anyone working with FCI regulations.</p>
                          </CCol>
                        </CRow>
                      </CCardBody>
                      </CCard>
                      </CCol>
                      </CRow>}
                      </Popup>}
                <strong className="text-medium-emphasis small">Select & Upload Position</strong>
              </CCardHeader>
              <CCardBody>
              <table>
                <tbody>
                <tr>
                  <td style={{ border: "none"}}>
                    <table className='table-head-1' style={{ border: "none"}}>
                      <tbody>
                      <tr style={{ border: "none"}}>
                        <td width="30%" style={{ border: "none"}}><code>&lt;FCI Regulation Symbol&gt;</code></td>
                        <td width="35%" style={{ border: "none"}}>
                          <select className="text-medium-emphasis small"
                            onChange={(e) => selectFciSymbol(e.target.value)} style={{width: "100%"}}
                            value={regulationSymbol} ref={selectRef}>
                              {regulations?.map((regulation, index) => 
                                <React.Fragment key={regulation.id || index} >
                                <option
                                 value={regulation.fciSymbol}>{regulation.fciSymbol} - {regulation.fciName}&nbsp;&nbsp;&nbsp;</option>
                                </React.Fragment>
                              )}
                          </select>
                        </td>
                        <td width="6%" style={{ border: "none"}}></td>
                        <td className="text-medium-emphasis small" style={{ border: "none"}} width="10%">Symbol</td>
                        <td width="16%" className="text-medium-emphasis small" style={{ border: "none"}}>
                          <input id="regulationSymbol" type="text" className="text-medium-emphasis small" style={{ width:"80%", height: "22px" }}
                              onChange={(e) => handleInputChange(e)}
                              value={regulationSymbol}/>
                        </td>
                        <td width="10%" style={{ border: "none"}}></td>
                      </tr>
                      </tbody>
                    </table>
                    
                    <table className="text-medium-emphasis small" width="70%" style={{ border: "none"}}>
                      <tbody>
                      <tr className="text-medium-emphasis" style={{ border: "none"}}>
                        <td width="70%" style={{ border: "none"}}>
                          <table className='table-head' style={{ border: "none"}}>
                              <thead>
                                <tr>
                                  <th>Format</th>
                                  <th>File</th>
                                  <th>Position</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td width="20%" style={{ border: "none"}}>Excel file (.xlsx format)</td>
                                  <td width="50%" style={{ border: "none"}}><input className="text-medium-emphasis small" type="file" onChange={handleFileChange} ref={fileInputRef} style={{ border: "none"}}></input></td>
                                  <td> 
                                    <CButton className="text-medium-emphasis small" shape='rounded' size='sm' color='string' style={{ border: "none"}} onClick={() => processExcel()}>
                                      <CIcon icon={cilSync} size="xl"/>
                                      {excelDataLoaded? ( 
                                        <>
                                        &nbsp;&nbsp;
                                        <CIcon icon={cilCheckCircle} className="text-medium-emphasis small" size="xl"  style={{ backgroundColor: "lightblue" }}/>
                                        </>
                                      ) : null}
                                    </CButton>
                                  </td>
                                  <td>
                                  <CButton className="text-medium-emphasis small" shape='rounded' size='sm' color='string' onClick={() => createFCIPosition()} style={{ border: "none"}}>
                                      <CIcon icon={cilTransfer} size="xl"/>
                                  </CButton>
                                  </td>
                                </tr>
                              </tbody>
                          </table>
                        </td>
                        <td width="2%" style={{ border: "none"}}/>
                      </tr>
                      </tbody>
                    </table>
                  </td>
                  <td width="28%" style={{ border: "none"}}>
                    <CCol sm={12} mb={6} style={{ width: "100%"}}>
                      <CWidgetStatsA
                        className="mb-6"
                        color="secondary"
                        style={{ height: '138px'}}
                        value={
                          <>
                            {positionQuantity}{' '}
                            <span className="fs-6 fw-small">
                              ({posPerMonthGrowth > 0? posPerMonthGrowth.toFixed(2) : 0} <CIcon icon={cilArrowTop}/>)
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
                                  backgroundColor: 'grey',
                                  borderColor: 'grey',
                                  pointBackgroundColor: 'white',
                                  data: positionsPerMonth?.map((e) => e.quantity),
                                },
                              ],
                            }}
                            options={{
                              plugins: {
                                legend: {
                                  display: false,
                                },
                                tooltip: {
                                  backgroundColor: 'blue', 
                                  bodyColor: 'blue', 
                                  titleColor: 'white', 
                                  titleFont: {
                                    size: 6,
                                  },
                                  bodyFont: {
                                    size: 4,
                                  },
                                  callbacks: {
                                    title: (context) => context ? `${context[0].label}` : '',
                                    // label: (context) => '',
                                  },
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
                                  min: -100,
                                  max: 100,
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
                </tbody>
              </table> 
            </CCardBody>
          </CCard>
        </CCol>
      </CRow> 
      ) : null}
      <br/>
      <div>
      {regulations.length? (
        <CRow>
        <CCol xs={12}>
          <CCard>
            <CCardHeader className="text-medium-emphasis small  d-flex align-items-center" style={{ padding: '0.5rem 1rem', lineHeight: '3rem' }}>
              &nbsp;&nbsp;&nbsp;<CIcon icon={cilAlignRight} size="xl"/>&nbsp;&nbsp;&nbsp;
              <strong>FCI Regulation Positions</strong>
            </CCardHeader>
            <CCardBody>
                <table>
                  <tbody>
                  <tr>
                    <td className="text-medium-emphasis small" width="15%">Position Identifier #</td>
                    <td className="text-medium-emphasis large" width="8%">
                         <select className="text-medium-emphasis large" id="positionIdentifier"
                            onChange={(e) => setCurrentPositionIdInFilter(e.target.value)}
                            style={{width: "100%"}} disabled={!noPositions || noPositionsDateFilter}>
                            <option/>
                            {positions?.map((position) => 
                              <React.Fragment key={position.id}>
                                <option value={position.id}>{position.id}</option>
                              </React.Fragment>
                            )}
                          </select>
                    </td>
                    <td width="1%"/>
                    <td>
                      <CButton shape='rounded' size='sm' color='string' onClick={() => filterPositionListTable()}
                        disabled={!noPositions} style={{ border: "none"}}>
                            <CIcon className="text-medium-emphasis small" icon={cilListFilter} size="xl"/>
                      </CButton>
                    </td>
                    <td width="3%"/>
                    <td width="5%" className="text-medium-emphasis small">From</td>
                    <td width="12%">
                      <input 
                        type="date"
                        className="text-medium-emphasis small"
                        onChange={(e) => handleSearchDateFromChange(e.target.value)}
                        value={searchFromDate}
                        max={searchToDate}
                        disabled={searchFilteredPosition || !noPositions}
                      />
                    </td>
                    <td width="2%"></td>
                    <td width="3%" className="text-medium-emphasis small">To</td>
                    <td width="10%">
                      <input
                        type="date"
                        className="text-medium-emphasis small"
                        onChange={(e) => handleSearchDateToChange(e.target.value)}
                        value={searchToDate}
                        min={searchFromDate}
                        max={today}
                        disabled={searchFilteredPosition || !noPositions}
                      />
                    </td>
                    <td width="2%"></td>
                    <td>
                      <CButton shape='rounded' size='sm' color='string' onClick={() => searchPositionsByDate(0)}
                        disabled={searchFilteredPosition || !noPositions} style={{ border: "none"}}>
                            <CIcon className="text-medium-emphasis small" icon={cilMagnifyingGlass} size="xl"/>
                      </CButton>
                    </td>
                    <td width="5%"></td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                        {totalPositions > 0? (  
                          <CPagination valign="end" align="end" size="sm" 
                          activepage = {currentPage}
                          pages = {Math.floor(totalPositions / positionsPerPage)}>
                            {currentPage === 1 || searchFilteredPosition === true? (
                              <CPaginationItem disabled>«</CPaginationItem> ) 
                            : (<CPaginationItem onClick={() => handlePageChange(currentPage - 1)}>«</CPaginationItem>)}
                          
                            <CPaginationItem style={{ background : currentPage === 1? 'lightgrey' : 'lightcyan' }}
                                onClick={() => handlePageChange(currentPage)}>{currentPage}</CPaginationItem>
                            {currentPage === Math.ceil(totalPositions / positionsPerPage)? (
                            <CPaginationItem style={{ backgroundColor: 'lightgrey' }}>{Math.ceil(totalPositions / positionsPerPage)}</CPaginationItem>
                            ) :
                            (<CPaginationItem style={{ backgroundColor: 'lightcyan' }}>{Math.ceil(totalPositions / positionsPerPage)}</CPaginationItem>)}
                            
                            <CPaginationItem style={{ backgroundColor: 'lightblue' }} >{totalPositions < positionsPerPage? positions.length : totalPositions}</CPaginationItem>

                            {totalPositions === 0 || currentPage === Math.ceil(totalPositions / positionsPerPage) || searchFilteredPosition === true? (
                              <CPaginationItem disabled>»</CPaginationItem>) 
                            : (<CPaginationItem className={"custom-pagination-item"} onClick={() => handlePageChange(currentPage + 1)}>»</CPaginationItem>)}
                          </CPagination>)
                        : null}
                      </div>
                   </td>
                  </tr>
                  </tbody>
                </table>
                <table><tbody><tr><td style={{ width:"80%", height: "10px" }}></td></tr></tbody></table>
                <table className="text-medium-emphasis small">
                  <thead>
                    <tr className="text-medium-emphasis">
                      <th>#</th>
                      <th>Position</th>
                      <th>FCI</th>
                      <th>Overview</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.prototype.toString.call(positions) === '[object Array]' && positions?.map((item, index) => 
                      item !== 'undefined'? (
                        <React.Fragment key={`${item.id}-${item.fciSymbol}`}>
                      <tr>
                        {item.id? (
                        <td width="3%" style={{ color: index % 2 != 0 ? 'green' : '#000080' }}>{item.id}</td>) : (null)}
                        <td width="6%">
                          <>
                            <Popup 
                              position="right" visible={visible}
                              trigger={
                                <CButton shape='rounded' size='sm' color='string' >
                                      <CIcon icon={cilClipboard} size="xl"/>
                                </CButton>}
                                contentStyle={{ width: "60%", height: "auto", overflow: "auto", position: 'absolute', top: '18%', left: '21%'}}>
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
                                              <span className="small" style={{ color: index % 2 != 0 ? 'green' : '#000080' }}>{item.fciSymbol} - {item.timestamp} - {splitOverview(item.overview)[0]}<br/>Totals{splitOverview(item.overview)[1]}</span>
                                            </CCardHeader>
                                            <CCardBody>
                                              <table >
                                                <thead>
                                                  <tr className="text-medium-emphasis small">
                                                    <th className="text-medium-emphasis small">Specie Group</th>
                                                    <th className="text-medium-emphasis small">Specie Type</th>
                                                    <th className="text-medium-emphasis small">Symbol</th>
                                                    <th className="text-medium-emphasis small">Market Price</th>
                                                    <th className="text-medium-emphasis small">Quantity</th>
                                                    <th className="text-medium-emphasis small">Valued</th>
                                                  </tr>
                                                </thead>
                                                <tbody>
                                                  {Object.prototype.toString.call(item.composition) === '[object Array]' && item.composition?.map((specie, index) => 
                                                  <React.Fragment key={specie.id || index}>
                                                      <tr>
                                                        <td className="small" style={{ color: index % 2 != 0 ? 'green' : '#000080' }}>{specie.specieGroup}</td>
                                                        <td className="small" style={{ color: index % 2 != 0 ? 'green' : '#000080' }}>{specie.specieType}</td>
                                                        <td className="small" style={{ color: index % 2 != 0 ? 'green' : '#000080' }}>{specie.specieSymbol}</td>
                                                        <td className="small" style={{ color: index % 2 != 0 ? 'green' : '#000080' }}>
                                                          <div>
                                                            $ <NumericFormat displayType="text" value={Number(specie.marketPrice).toFixed(2)} thousandSeparator="." decimalSeparator=','/>
                                                          </div>
                                                        </td>
                                                        <td className="small" style={{ color: index % 2 != 0 ? 'green' : '#000080' }}>{specie.quantity}</td>
                                                        <td className="small" style={{ color: index % 2 != 0 ? 'green' : '#000080' }}>
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
                        <td width="5%" style={{ color: index % 2 != 0 ? 'green' : '#000080' }}>{item.fciSymbol}</td>
                        <td width="40%" style={{ color: index % 2 != 0 ? 'green' : '#000080' }}>{splitOverview(item.overview)[0]}<br/>Totals{splitOverview(item.overview)[1]}</td>
                        <td width="16%" style={{ color: index % 2 != 0 ? 'green' : '#000080' }}><><td style={{ textAlign:"center"}}>{item.timestamp}</td><td style={{ textAlign: "center"}}>{timeOfDay(item.timestamp)}&nbsp;<CIcon icon={timeOfDay(item.timestamp) === 'Night'? cilMoon : cilSun} size="l"/></td></></td>
                        <td width="12%">
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
    <br/>
    </>
  );
}

export default FCIRegulationPosition;