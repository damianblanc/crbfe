import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import * as XLSX from 'xlsx';

import { CCard, CCardBody, CCardHeader, CCol, CRow, CButton} from '@coreui/react'
import { cilAlignRight, cilBookmark, cilClipboard, cilListFilter, cilMagnifyingGlass } from '@coreui/icons';
import CIcon from '@coreui/icons-react'

import api from './../../config.js';

import { NumericFormat } from 'react-number-format';

import Popup from 'reactjs-popup';

import 'reactjs-popup/dist/index.css';
import './FCIPositionAdvice.css';

import { isLoginTimestampValid } from '../../../utils/utils.js';
import { useNavigate } from 'react-router-dom';
import { CToast, CToastBody, CToastHeader, CToaster } from '@coreui/react'

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
  const [errorMessage, setErrorMessage] = useState('');
  const [toast, addToast] = useState(0)
  const toaster = useRef()
  const [showToast, setShowToast] = useState(false);

  const [searchFiltered, setSearchFiltered] = useState(false);
  const [oldestPosition, setOldestPosition] = useState();
  const [searchFilteredPosition, setSearchFilteredPosition] = useState(false);
  const [searchCurrentPositionId, setSearchCurrentPositionId] = useState(1);
  const [selectedFCISymbol, setSelectedFCISymbol] = useState('');
  const positionsPerPage = 5;
  const [totalPositions, setTotalPositions] = useState(0);

  const [searchFromDate, setSearchFromDate] = useState('');
  const [searchToDate, setSearchToDate] = useState('');

  const [searchFromDateAfter, setSearchFromDateAfter] = useState('');
  const [searchToDateAfter, setSearchToDateAfter] = useState('');

  const [currentPositionIdInFilter, setCurrentPositionIdInFilter] = useState(0);

  const [noPositions, setNoPositions] = useState(false);
  const [noPositionsDateFilter, setNoPositionsDateFilter] = useState(false);

  const [inputValue, setInputValue] = useState("");

  const location = useLocation();

  useEffect(() => {
    const urlParam = new URLSearchParams(location.search).get('url');
    if (urlParam) {
      api.defaults.baseURL = urlParam;
    }
  }, [location]);

  useEffect(() => {
    const isValid = isLoginTimestampValid();
    if (!isValid) {
      localStorage.removeItem("loginTimestamp");
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      navigate('/');
    }

    const currentPage = document.location.pathname;
    localStorage.setItem('currentPage', currentPage);
    const previousPage = localStorage.getItem("previousPage");
    if (currentPage !== previousPage) {
        localStorage.setItem('previousPage', currentPage);
        window.location.reload();
    }

    /** FCI Regulations - Symbol and Name */
    const fetchRegulations = async () => {
      try {
        const responseData = await api.get('/api/v1/fci/regulations')
        return responseData.data;
      } catch (error) {
        console.error('Error sending data to the backend:', error);
      }
    };

    /** FCI Positions - Id and CreatedOn */
    const fetchPositions = async (fciSymbol) => {
      try {
        const responseData = await api.get('/api/v1/fci/' + fciSymbol + '/position/id-created-on')
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

     /** FCI Regulation Percentages - First Element */
    const fetchPercentages = async (fciSymbol) => {
      try {
        const responseData = await api.get('/api/v1/fci/' + fciSymbol + '/regulation-percentages')
        return responseData.data;
      } catch (error) {
        console.error('Error sending data to the backend:', error);
      }
    };

    /** FCI Position - Advices */
    const fetchAdvices = async (fciSymbol, positionId) => {
      try {
        const responseData = await api.get('/api/v1/calculate-bias/fci/' + fciSymbol + '/position/' + positionId + '/advice/criteria/price_uniformly_distribution')
        return responseData.data;
      } catch (error) {
        console.error('Error sending data to the backend:', error);
      }
    };

    const fetchFlatAdvices = async (fciSymbol, positionId) => {
      try {
        const responseData = await api.get('/api/v1/calculate-bias/fci/' + fciSymbol + '/position/' + positionId + '/advice/criteria/price_uniformly_distribution/flat')
        return responseData.data;
      } catch (error) {
        console.error('Error sending data to the backend:', error);
      }
    };

    /** FCI Position Overview */
    const fetchFCIPositionPercentagesValued = async (fciSymbol, positionId) => {
      try {
        const responseData = await api.get('/api/v1/calculate-bias/fci/' + fciSymbol + '/position/' + positionId + '/percentage-valued/refresh/true');
        return responseData.data;
      } catch (error) {
        console.error('Error sending data to the backend:', error);
      }
    };

    /** FCI Advice Quantity */
    const fetchFCIStaticticsQuantity = async () => {
      try {
        const responseData = await api.get('/api/v1/statistic');
        return responseData.data;
      } catch (error) {
        console.error('Error sending data to the backend:', error);
      }
    };

    const setFetchedData = async () => {
      const tempLoadedRegulations = await fetchRegulations();
      setSelectedFCISymbol(tempLoadedRegulations[0].fciSymbol);
      setRegulations(tempLoadedRegulations);
      if (!tempLoadedRegulations || tempLoadedRegulations.length == 0) {
        setErrorMessage("» There are no FCI Regulations defined, please access regulation management");
        setShowToast(true);
      } else {
        if (tempLoadedRegulations && tempLoadedRegulations.length > 0) {
          const tempLoadedPositions = await fetchPositions(tempLoadedRegulations[0].fciSymbol);
          if (tempLoadedPositions.length == 0) {
            setErrorMessage("» FCI [" + tempLoadedRegulations[0].fciSymbol + "] has no positions informed");
            setShowToast(true);
          } else {
            let tempLoadedAdvices = [];
            let tempLoadedFlatAdvices = [];
            let tempLoadedPercentagesValued = [];
            if (tempLoadedPositions && tempLoadedPositions.length > 0) {
              tempLoadedAdvices = await fetchAdvices(tempLoadedRegulations[0].fciSymbol, tempLoadedPositions[0].id);
              tempLoadedFlatAdvices = await fetchFlatAdvices(tempLoadedRegulations[0].fciSymbol, tempLoadedPositions[0].id);
              tempLoadedPercentagesValued = await fetchFCIPositionPercentagesValued(tempLoadedRegulations[0].fciSymbol, tempLoadedPositions[0].id);
              setCurrentPositionId(tempLoadedPositions[0].id);
              const tempLoadedStatistics = await fetchFCIStaticticsQuantity();
              setPositionPercentages(tempLoadedPercentagesValued);
              setStatistics(tempLoadedStatistics);
              updateFCIAdviceQuantity();
              const tempLoadedOldestPosition = await fetchOldestPosition(tempLoadedRegulations[0].fciSymbol);
              setOldestPosition(tempLoadedOldestPosition);
              const tempLoadedPercentages = await fetchPercentages(tempLoadedRegulations[0].fciSymbol);
              setCurrentFCISymbol(tempLoadedRegulations[0].fciSymbol);
              setRegulationPercentages(tempLoadedPercentages);
              setAdvices(tempLoadedAdvices);
              setFlatAdvices(tempLoadedFlatAdvices);
            }
          }
          setPositions(tempLoadedPositions);
        } else {
          setPositions([]);
        }
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

  const selectPosition = (positionId) => {
    if (positionId !== undefined) {
      /** FCI Position - Advices */
      const fetchAdvices = async (fciSymbol, positionId) => {
        try {
          const responseData = await api.get('/api/v1/calculate-bias/fci/' + fciSymbol + '/position/' + positionId + '/advice/criteria/price_uniformly_distribution')
          return responseData.data;
        } catch (error) {
          console.error('Error sending data to the backend:', error);
        }
      };

      const setFetchedData = async () => {
        const tempLoadedAdvices = await fetchAdvices(currentFCISymbol, positionId);
        setCurrentPositionId(positionId);
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
      const responseData = await api.put('/api/v1/statistic/update/advice-quantity', body,
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

  /** FCI Positions bound to selected FCI Regulation */
  const selectFciSymbol = async (fciSymbol) => {
    const fetchPositions = async (fciSymbol) => {
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

    const fetchPositionWithFciSymbol = async (fciSymbol) => {
      try {
        const responseData = await api.get('/api/v1/fci/' + fciSymbol + '/position');
        return responseData.data;
      } catch (error) {
        console.error('Error sending data to the backend:', error);
      }
    };

      /** FCI Regulation Percentages - First Element */
      const fetchPercentages = async (fciSymbol) => {
        try {
          const responseData = await api.get('/api/v1/fci/' + fciSymbol + '/regulation-percentages')
          return responseData.data;
        } catch (error) {
          console.error('Error sending data to the backend:', error);
        }
      };
  
      /** FCI Position - Advices */
      const fetchAdvices = async (fciSymbol, positionId) => {
        try {
          const responseData = await api.get('/api/v1/calculate-bias/fci/' + fciSymbol + '/position/' + positionId + '/advice/criteria/price_uniformly_distribution')
          return responseData.data;
        } catch (error) {
          console.error('Error sending data to the backend:', error);
        }
      };
  
      const fetchFlatAdvices = async (fciSymbol, positionId) => {
        try {
          const responseData = await api.get('/api/v1/calculate-bias/fci/' + fciSymbol + '/position/' + positionId + '/advice/criteria/price_uniformly_distribution/flat')
          return responseData.data;
        } catch (error) {
          console.error('Error sending data to the backend:', error);
        }
      };
  
      /** FCI Position Overview */
      const fetchFCIPositionPercentagesValued = async (fciSymbol, positionId) => {
        try {
          const responseData = await api.get('/api/v1/calculate-bias/fci/' + fciSymbol + '/position/' + positionId + '/percentage-valued/refresh/true');
          return responseData.data;
        } catch (error) {
          console.error('Error sending data to the backend:', error);
        }
      };
  
      /** FCI Advice Quantity */
      const fetchFCIStaticticsQuantity = async () => {
        try {
          const responseData = await api.get('/api/v1/statistic');
          return responseData.data;
        } catch (error) {
          console.error('Error sending data to the backend:', error);
        }
      };

      const setFetchedData = async (fciSymbol) => {
        setCurrentFCISymbol(fciSymbol);
        setSelectedFCISymbol(fciSymbol);
        const tempLoadedPositions = await fetchPositions(fciSymbol);
        const tempLoadedOldestPostion = await fetchOldestPosition(fciSymbol);
        const tempLoadedPercentages = await fetchPercentages(fciSymbol);
        let tempLoadedAdvices = [];
        let tempLoadedFlatAdvices = [];
        let tempLoadedPercentagesValued = [];
        if (tempLoadedPositions && tempLoadedPositions.length == 0) {
          setErrorMessage("» FCI [" + fciSymbol + "] has no positions informed");
          setShowToast(true);
        } else {
          tempLoadedAdvices = await fetchAdvices(fciSymbol, tempLoadedPositions[0].id);
          tempLoadedFlatAdvices = await fetchFlatAdvices(fciSymbol, tempLoadedPositions[0].id);
          tempLoadedPercentagesValued = await fetchFCIPositionPercentagesValued(fciSymbol, tempLoadedPositions[0].id);
          setCurrentPositionId(tempLoadedPositions[0].id);
        }
        const tempLoadedStatistics = await fetchFCIStaticticsQuantity();

        setPositions(tempLoadedPositions);
        setOldestPosition(tempLoadedOldestPostion);
        setRegulationPercentages(tempLoadedPercentages);
        setAdvices(tempLoadedAdvices);
        setFlatAdvices(tempLoadedFlatAdvices);
        setPositionPercentages(tempLoadedPercentagesValued);
        setStatistics(tempLoadedStatistics);
      }
   setFetchedData(fciSymbol);
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
  
  const today = new Date().toISOString().split('T')[0];

  const filterPositionListTable = () => {
    if (currentPositionIdInFilter) {
      const filteredPositions = positions.filter(position => position.id.toString() === currentPositionIdInFilter);
      setPositions(filteredPositions);
      setSearchFilteredPosition(true);
    } else {
      setPositions(positions);
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
  
  const handleSearchDateFromChange = (fromDate) => {
    setSearchFromDate(fromDate);
  };
  
  const handleSearchDateToChange = (toDate) => {
    setSearchToDate(toDate);
  };
  
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
    setTotalPositions(tempLoadedTotalPositions && tempLoadedTotalPositions.length);
    if (tempLoadedTotalPositions && tempLoadedTotalPositions.length == 0) {
      setNoPositionsDateFilter(false);
      if (currentPositionIdInFilter) {
        setErrorMessage("» There are no positions with this position identifier between indicated dates");
        setShowToast(true);
      } else {
        setErrorMessage("» There are no positions between indicated dates");
        setShowToast(true);
      }
    }
    setSearchFiltered(true);
    setSearchFromDateAfter(searchFromDate);
    setSearchToDateAfter(searchToDate);
    const biggestPosition = getBiggestPosition(tempLoadedPositions);
    selectPosition(biggestPosition.id);
  };

  const getBiggestPosition = (loadedPositions) => {
    const biggestPosition = loadedPositions.reduce((max, position) => {
      return position.id > max.id ? position : max;
    }, { id: -Infinity });
    return biggestPosition;
  }
  

  const handleInputChange = (event) => {
    const input = event.target.value;
    const numericInput = input.replace(/[^0-9]/g, "");
    const positiveInput = numericInput ? Math.abs(numericInput) : "";
  
    setInputValue(positiveInput);
    setCurrentPositionIdInFilter(positiveInput == ""? 0 : positiveInput);
  };  

  return (
    <>
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
            <div className="fw-bold me-auto">Position Bias Error Message</div>
          </CToastHeader>
          <CToastBody>{errorMessage}</CToastBody>
        </CToast>
      </CToaster>
      : null}
    {regulations && regulations.length > 0? (
        <CRow>
        <CCol xs={12}>
            <CCard>
              <CCardHeader>
              {<Popup trigger={
                  <CButton className="text-medium-emphasis small" shape='rounded' size='sm' color='string'>
                      <CIcon icon={cilBookmark} size="xl"/>
                  </CButton>} position="right" modal lockScroll="false" backgroundColor="rgba(75,192,192,0.4)"
                   contentStyle={{ width: "60%", height: "41%", overflow: "auto", position: 'absolute', top: '19%', left: '21%'}}>
                  {
                    <CRow>
                    <CCol xs={12}>
                      <CCard>
                        <CCardHeader>
                          <strong className="text-medium-emphasis small">FCI Regulation Position Advices</strong>
                        </CCardHeader>
                        <CCardBody>
                        <CRow>
                          <CCol>
                          <p className="text-medium-emphasis small">» The FCI Position Advice Page allows to view and analyze data related to FCI positions in order to access recomendations on how to operate contained species.</p> 
                          <p className="text-medium-emphasis small">» Upon opening the Biases Page, it fetches and displays a list of FCI regulations and their corresponding positions.</p>
                          <p className="text-medium-emphasis small">» The advices table provides information about how to operate on current loaded position.</p>
                          <p className="text-medium-emphasis small">» Export the table data to an Excel file is provided in order to get current advice information.</p>
                          <p className="text-medium-emphasis small">» If there is an error with the data, the Advices Page displays a toast message with the error details. The Biases Page also updates the FCI report quantity each time a report is generated.</p>
                          </CCol>
                        </CRow>
                      </CCardBody>
                      </CCard>
                      </CCol>
                      </CRow>}
                      </Popup>}
                <strong className="text-medium-emphasis small">Select FCI Regulation & Position</strong>
              </CCardHeader>
              <CCardBody>
                <table className="no-border" width={"100%"}>
                  <thead className="no-border">
                    <tr className="text-medium-emphasis">
                      <td width="15%" className="text-medium-emphasis" style={{ border: "none"}}><code>&lt;FCI Regulation Symbol&gt;</code></td>
                      <td style={{ width: '30%', border: "none", marginRight: '15%'}}>
                        <select className="text-medium-emphasis large" onChange={(e) => selectFciSymbol(e.target.value)}>
                          {regulations?.map((regulation, index) => 
                            <React.Fragment key={regulation.id || index}>
                            <option value={regulation.fciSymbol}>{regulation.fciSymbol} - {regulation.fciName}&nbsp;&nbsp;&nbsp;</option>
                            </React.Fragment>
                          )}
                        </select>
                      </td>
                      {/* <td width="55%" style={{ border: "none"}}/> */}
                    </tr>
                  </thead>
                </table>
                {/* <table style={{marginTop: "-10px", border: "none"}}><tbody><tr style={{ border: "none"}}><td style={{ border: "none"}}/></tr></tbody></table> */}
                {/* {positions && positions.length > 0? ( */}
                  <table style={{ width: '100%', marginTop: '10px', border: 'none'}}>
                  <tbody>
                  <tr>
                    <td className="text-medium-emphasis small" style={{ width: "15%", border: "none"}}>Position Identifier #</td>
                    {/* <td width="1%" style={{ border: "none"}}/> */}
                    <td width="8%" className="text-medium-emphasis small" style={{ border: "none"}}>
                      <input className="text-medium-emphasis small" style={{ width: "100%"}}
                      value={inputValue} onChange={handleInputChange}/>
                    </td>
                    <td width="10%" style={{ border: "none"}}/>
                    {/* <td width="2%" className="text-medium-emphasis small" style={{ border: "none"}}>&nbsp;&nbsp;&nbsp;From</td> */}
                    {/* <td width="2%" style={{ border: "none"}}></td> */}
                    <td width="2%" style={{ border: "none"}}>
                    From
                      <input 
                        type="date"
                        className="text-medium-emphasis small"
                        onChange={(e) => handleSearchDateFromChange(e.target.value)}
                        value={searchFromDate}
                        max={searchToDate}
                        //disabled={searchFilteredPosition || !noPositions}
                      />
                    </td>
                    {/* <td width="2%" style={{ border: "none"}}></td> */}
                    {/* <td width="1%" className="text-medium-emphasis small" style={{ border: "none"}}></td> */}
                    {/* <td width="1%" style={{ border: "none"}}></td> */}
                    <td width="2%" style={{ border: "none"}}>
                    To
                      <input
                        type="date"
                        className="text-medium-emphasis small"
                        onChange={(e) => handleSearchDateToChange(e.target.value)}
                        value={searchToDate}
                        min={searchFromDate}
                        max={today}
                      //  disabled={searchFilteredPosition || !noPositions}
                      />
                    </td>
                    {/* <td width="2%" style={{ border: "none"}}></td> */}
                    <td style={{ border: "none"}} width="1%">
                      <CButton shape='rounded' size='sm' color='string' onClick={() => searchPositionsByDate(0)} style={{ border: "none"}}
                       disabled={positions.length === 0}>
                        <CIcon className="text-medium-emphasis small" icon={cilMagnifyingGlass} size="xl"/>
                      </CButton>
                    </td>
                    {/* <td style={{ width:'5%', border: "none"}}/> */}
                    {/* <td className="text-medium-emphasis small" width="5%" style={{ border: "none"}}> */}
                    <td className="text-medium-emphasis small" width="5%" style={{ border: "none"}}>
                      {/* {positions && positions.length > 0? ( */}
                          <code>&lt;FCI Position&gt;</code>
                        {/* ) : null} */}
                    </td>
                    {/* <td width="1%" style={{ border: "none"}}></td> */}
                    <td width="8%" style={{ border: "none"}}>
                      {positions && positions.length > 0? (
                        <select className="text-medium-emphasis large" 
                              onChange={(e) => selectPosition(e.target.value)}>
                          {positions !== undefined && positions.slice(0, 20).map((fciPosition, index) => 
                            <React.Fragment key={fciPosition.id || index}>
                            <option value={fciPosition.id}>#{fciPosition.id} - {fciPosition.timestamp}&nbsp;&nbsp;&nbsp;</option>
                            </React.Fragment>
                          )}
                        </select>
                      ) : (<div className='text-medium-emphasis small'>No positions</div>)}
                      </td>
                      <td style={{ width:'1%', border: "none"}}></td>
                  </tr>
                  </tbody>
                  </table>
                   {/* ) : null} */}
             </CCardBody>
            </CCard>
        </CCol>
    </CRow>
    ) : null}
    {positions && positions.length > 0? (
      <>
    <br/>
    {regulations && regulations.length > 0? (
    <CRow>
        <CCol xs={12}>
          <CCard>
            <CCardHeader className="text-medium-emphasis small  d-flex align-items-center" style={{ padding: '0.5rem 1rem', lineHeight: '3rem' }}>
              &nbsp;&nbsp;&nbsp;<CIcon icon={cilAlignRight} size="xl"/>&nbsp;&nbsp;&nbsp;
              <strong>FCI Regulation Position Advices</strong>
            </CCardHeader>
            <CCardBody>
              <p className="text-medium-emphasis small">
                Refers to a <code>&lt;FCI Regulation Position List&gt;</code> that advices operations based on positon detected biases
                <CButton className="text-medium-emphasis small" shape='rounded' size='sm' color='string' onClick={() => downloadExcel(advices) } 
                  disabled={advices && advices.length === 0}>
                      <CIcon icon={cilClipboard} size="xl"/>
                </CButton>
              </p>
              <table className="text-medium-emphasis small">
                <thead>
                  <tr>
                    <th>Specie Group</th>
                    <th>Specie Type</th>
                  </tr>
                </thead>
                <tbody>
                  {advices && advices.map((item, index) => 
                    <React.Fragment key={item.id || index}>
                    <tr>
                      <td style={{ width: "12%"}}><b>{item.specieTypeGroup}</b></td>
                      <td style={{ width: "15%"}}><b>{item.specieType}</b></td>
                      <td style={{ width: "73%"}}>
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
                              {item.operationAdvices.map((advice, index) => 
                                    <React.Fragment key={advice.id || index}>
                                      <tr>
                                        <td style={{ color: advice.operationAdvice === 'BUY' ? 'green' : '#000080' }}>{advice.specieName}</td> 
                                        <td style={{ color: advice.operationAdvice === 'BUY' ? 'green' : '#000080' }}><b>{advice.operationAdvice}</b></td>
                                        <td style={{ color: advice.operationAdvice === 'BUY' ? 'green' : '#000080' }}><b>{Math.floor(advice.quantity)}</b></td> 
                                        <td style={{ color: advice.operationAdvice === 'BUY' ? 'green' : '#000080' }}>
                                          {(typeof advice.quantity === 'number')? (
                                          <div>
                                              <NumericFormat displayType="text" value={advice.quantity.toFixed(2)} decimalSeparator=','/>
                                          </div>
                                          ) : null}
                                        </td> 
                                        <td style={{ color: advice.operationAdvice === 'BUY' ? 'green' : '#000080' }}>
                                        {(typeof advice.price === 'number')? (
                                          <div>
                                              $ <NumericFormat displayType="text" value={advice.price.toFixed(2)} thousandSeparator="." decimalSeparator=','/>
                                          </div>
                                          ) : null}
                                        </td> 
                                        <td>
                                          {(typeof advice.value === 'number')? (
                                          <div style={{ color: advice.operationAdvice === 'BUY' ? 'green' : '#000080' }}>
                                              $ <NumericFormat displayType="text" value={advice.value.toFixed(2)} thousandSeparator="." decimalSeparator=','/>
                                          </div>
                                          ) : null}
                                        </td> 
                                      </tr>
                                    </React.Fragment> )}
                            </tbody>
                          </table>
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
       ) : null}
       </>
       ) : null}
       <br/>
    </>
  );
}

export default FCIPositionAdvice;