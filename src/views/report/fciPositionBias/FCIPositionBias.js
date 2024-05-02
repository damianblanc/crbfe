import React, { useState, useEffect, useRef } from 'react';
import { CCard, CCardBody, CCol, CCardHeader, CRow, CButton } from '@coreui/react'

import CIcon from '@coreui/icons-react'
import { cilAlignRight, cilBookmark, cilFile, cilMagnifyingGlass } from '@coreui/icons';

import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

import axios from 'axios';
import { isLoginTimestampValid } from '../../../utils/utils.js';
import { useNavigate } from 'react-router-dom';

import {
  CChart,
  CChartBar,
  CChartDoughnut,
  CChartLine,
  CChartPie,
  CChartPolarArea,
  CChartRadar,
} from '@coreui/react-chartjs'
import { DocsCallout } from 'src/components'

import { NumericFormat } from 'react-number-format';
import { PatternFormat } from 'react-number-format';

import { CToast, CToastBody, CToastHeader, CToaster } from '@coreui/react'

import './FCIRegulationTable.css';

class FCIPercentage {
    constructor(id, specieType, percentage) {
      this.id = id;
      this.specieType = specieType;
      this.percentage = percentage;
    }
}

class FCIValue {
    constructor(specieType, value) {
      this.specieType = specieType;
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

class FCIStatistic {
  constructor(adviceQuantity, reportQuantity) {
    this.adviceQuantity = adviceQuantity;
    this.reportQuantity = reportQuantity;
  }
}

function FCIPositionBias() {
  const [regulationPercentages, setRegulationPercentages] = useState([]);
  const [positionPercentages, setPositionPercentages] = useState([]);
  const [positionValueData, setPositionValueData] = useState({ values: [FCIValue]});  
  const [regulationValueData, setRegulationValueData] = useState({ values: [FCIValue]});
  const [queryRow, setQueryRow] = useState({ fci: '', position: ''});
  const [regulations, setRegulations] = useState([{FCIRegulationSymbolName}]);
  const [positions, setPositions] = useState([{FCIPositionIdCreatedOn}]);
  const [oldestPoition, setOldestPosition] = useState();
  const [searchFiltered, setSearchFiltered] = useState(false);
  const [currentPositionData, setCurrentPositionData] = useState([{FCIPosition}]);
  const [reportTypes, setReportTypes] = useState([]);
  const [selectReportType, setSelectedReportType] = useState('');
  const [reportTypeData, setReportTypeData] = useState([]);
  const [currentPositionId, setCurrentPositionId] = useState(0);
  const [currentFCISymbol, setCurrentFCISymbol] = useState('');
  const [positionOverview, setPositionOverview] = useState([]);
  const [statistics, setStatistics] = useState({FCIStatistic});
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const [toast, addToast] = useState(0)
  const toaster = useRef()
  const [showToast, setShowToast] = useState(false);
  const [searchFilteredPosition, setSearchFilteredPosition] = useState(false);
  const [searchCurrentPositionId, setSearchCurrentPositionId] = useState(1);
  const [selectedFCISymbol, setSelectedFCISymbol] = useState('');
  const positionsPerPage = 20;
  const [totalPositions, setTotalPositions] = useState(0);

  const [searchFromDate, setSearchFromDate] = useState('');
  const [searchToDate, setSearchToDate] = useState('');

  const [searchFromDateAfter, setSearchFromDateAfter] = useState('');
  const [searchToDateAfter, setSearchToDateAfter] = useState('');

  const [currentPositionIdInFilter, setCurrentPositionIdInFilter] = useState(0);

  // const minPositionId = Math.min(...positions.map(position => position.id));
  // const maxPositionId = Math.max(...positions.map(position => position.id));

  const [noPositions, setNoPositions] = useState(false);
  const [noPositionsDateFilter, setNoPositionsDateFilter] = useState(false);
  const [excelDataLoaded, setExcelDataLoaded] = useState(false);

  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
      const isValid = isLoginTimestampValid();
      if (!isValid) {
        navigate('/');
      }
    /** FCI Regulations - Symbol and Name */
    const fetchRegulations = async () => {
      try {
        const responseData = await axios.get('http://localhost:8098/api/v1/fci/regulations')
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

    /** FCI Component - Report Types */
    const fetchReportTypes = async () => {
      try {
        const responseData = await axios.get('http://localhost:8098/api/v1/component/report')
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

    /** FCI Report Quantity */
    const fetchFCIStaticticsQuantity = async () => {
      try {
        const responseData = await axios.get('http://localhost:8098/api/v1/statistic');
        return responseData.data;
      } catch (error) {
        console.error('Error sending data to the backend:', error);
      }
    };

    const fetchOldestPosition = async (fciSymbol) => {
      try {
        const responseData = await axios.get('http://localhost:8098/api/v1/fci/' + fciSymbol + '/position/oldest');
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
          const tempLoadedPositions = await fetchPositions(tempLoadedRegulations[0].fciSymbol);
          if (tempLoadedPositions && tempLoadedPositions.length == 0) {
            setErrorMessage("» FCI [" + tempLoadedRegulations[0].fciSymbol + "] has no positions informed");
            setShowToast(true);
            setPositions([]);
            setCurrentPositionId(0);
          } else {
            setPositions(tempLoadedPositions);
         } 
          const tempLoadedPercentages = await fetchPercentages(tempLoadedRegulations[0].fciSymbol);
          const tempLoadedReportTypes = await fetchReportTypes();
          let tempLoadedPercentagesValued = [];
          if (tempLoadedPositions && tempLoadedPositions.length > 0) {
            tempLoadedPercentagesValued = await fetchFCIPositionPercentagesValued(tempLoadedRegulations[0].fciSymbol, tempLoadedPositions[0].id);
            setCurrentPositionId(tempLoadedPositions[0].id);
          }
          const tempLoadedStatistics = await fetchFCIStaticticsQuantity();
          const tempLoadedOldestPostion = await fetchOldestPosition(tempLoadedRegulations[0].fciSymbol);
          setOldestPosition(tempLoadedOldestPostion)
          setRegulationPercentages(tempLoadedPercentages);
          setCurrentFCISymbol(tempLoadedRegulations[0].fciSymbol);
          setReportTypes(tempLoadedReportTypes);    
          setPositionPercentages(tempLoadedPercentagesValued);
          setStatistics(tempLoadedStatistics);
        }
      }
    };
    setFetchedData();
  }, []);   

  const processReportType = async (link) => {
    const reportTypeData = async (link) => {
      try {
        const responseData = await axios.get()
        return responseData.data;
      } catch (error) {
        console.error('Error sending data to the backend:', error);
      }
    };
    
    const setFetchedReportTypeData = async () => {
      const tempLoadedReportTypeData = await reportTypeData(link);
      setReportTypeData(tempLoadedReportTypeData);
    };
  }

  const selectPosition = async (positionId) => {
    if (positionId !== undefined) {
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
        const tempLoadedPercentagesValued = await fetchFCIPositionPercentagesValued(currentFCISymbol, positionId);
        setCurrentPositionId(Number(positionId));
        setPositionPercentages(tempLoadedPercentagesValued);
      }
      
      setFetchedData();
      updateFCIReportQuantity();
    }
  };

   /** FCI Positions bound to selected FCI Regulation */
   const selectFciSymbol = async (fciSymbol) => {
    setCurrentFCISymbol(fciSymbol);
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

    /** FCI Component - Report Types */
    const fetchReportTypes = async () => {
      try {
        const responseData = await axios.get('http://localhost:8098/api/v1/component/report')
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

    /** FCI Report Quantity */
    const fetchFCIStaticticsQuantity = async () => {
      try {
        const responseData = await axios.get('http://localhost:8098/api/v1/statistic');
        return responseData.data;
      } catch (error) {
        console.error('Error sending data to the backend:', error);
      }
    };

      const setFetchedData = async (fciSymbol) => {
        const tempLoadedPositions = await fetchPositions(fciSymbol);
        if (tempLoadedPositions && tempLoadedPositions.length == 0) {
          setErrorMessage("» FCI [" + fciSymbol + "] has no positions informed");
          setShowToast(true);
        } 
        const tempLoadedPercentages = await fetchPercentages(fciSymbol);
        const tempLoadedReportTypes = await fetchReportTypes();
        let tempLoadedPercentagesValued = [];
        if (tempLoadedPositions && tempLoadedPositions.length > 0) {
          tempLoadedPercentagesValued = await fetchFCIPositionPercentagesValued(fciSymbol, tempLoadedPositions[0].id);
          setCurrentPositionId(Number(tempLoadedPositions[0].id));
        }
        const tempLoadedStatistics = await fetchFCIStaticticsQuantity();
        
        setPositions(tempLoadedPositions);
        setRegulationPercentages(tempLoadedPercentages);
        setCurrentFCISymbol(fciSymbol);
        setReportTypes(tempLoadedReportTypes);    
        setPositionPercentages(tempLoadedPercentagesValued);
        updateFCIReportQuantity();
        setStatistics(tempLoadedStatistics);
      }
   setFetchedData(fciSymbol);
  };

  const getFCIPositionOverview = async (link) => {
    const reportPositionOverview = async (link) => {
      try {
        const responseData = await axios.get('http://localhost:8098/api/v1/calculate-bias/fci/' + currentFCISymbol + '/position/' + currentPositionId + '/refresh/true')
        return responseData.data;
      } catch (error) {
        console.error('Error sending data to the backend:', error);
      }
    };
  }

  useEffect(() => {
    const setFetchedPositionOverviewData = async () => {
      const reportPositionOverviewInner = async (link) => {
        try {
          const responseData = await axios.get('http://localhost:8098/api/v1/calculate-bias/fci/' + currentFCISymbol + '/position/' + currentPositionId + '/refresh/true')
          return responseData.data;
        } catch (error) {
          console.error('Error sending data to the backend:', error);
        }
      };

      const tempLoadedPositionOverview = await reportPositionOverviewInner("");
      setPositionOverview(tempLoadedPositionOverview);
    };  
  }, []);

    const fetchFCIPositionPercentageValued = async () => {
    fetch('http://localhost:8098/api/v1/calculate-bias/fci/' + currentFCISymbol + '/position/' + currentPositionId + '/percentage-valued/refresh/true', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((percentages) => {
        console.log('Backend response:', percentages);
        setPositionPercentages(percentages);
        console.log("responseData! = " + JSON.stringify(positionPercentages));
      })    
      .catch((error) => {
        console.error('Error sending data to the backend:', error);
      });
  };

  const listFCIRegulationPercentages = async () => {
    try {
      const responseData = await axios.get('http://localhost:8098/api/v1/fci/' + currentFCISymbol + '/regulation-percentages')
      setRegulationPercentages(responseData.data);
    } catch (error) {
      console.error('Error sending data to the backend:', error);
    }
  };

const updateFCIReportQuantity = async () => {
  let q = statistics.reportQuantity + 1;
  let st = new FCIStatistic(statistics.adviceQuantity, q);
  setStatistics(prevStatistics => ({
    ...prevStatistics,
    reportQuantity: q
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
    fromDate = oldestPoition.timestamp.split(" ")[0];
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
        const responseData = await axios.get('http://localhost:8098/api/v1/fci/' + currentFCISymbol + '/position/' + currentPositionIdInFilter + '/from/' + fromDate + '/to/' + toDate + '/page/' + pageNumber + '/page_size/' + positionsPerPage);
        return responseData.data;
    } catch (error) {
      console.error('Error sending data to the backend:', error);
    }
  }

  const fetchTotalFilteredPosition = async () => {
    try {
        const responseData = await axios.get('http://localhost:8098/api/v1/fci/' + currentFCISymbol + '/position/' + currentPositionIdInFilter + '/from/' + fromDate + '/to/' + toDate + '/page/0');
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
  }
  setSearchFiltered(true);
  setSearchFromDateAfter(searchFromDate);
  setSearchToDateAfter(searchToDate);
};

const handleInputChange = (event) => {
  const input = event.target.value;
  const numericInput = input.replace(/[^0-9]/g, "");
  const positiveInput = numericInput ? Math.abs(numericInput) : "";

  setInputValue(positiveInput);
  setCurrentPositionIdInFilter(positiveInput == ""? 0 : positiveInput);
};

const findPositionById = () => {
  if (currentPositionId > 0) {
    return positions.find(p => p.id === currentPositionId);
  }
}

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
        <>
       <CRow>
          <CCol xs={12}>
            <CCard>
              <CCardHeader>
                {<Popup trigger={
                  <CButton className="text-medium-emphasis small" shape='rounded' size='sm' color='string'>
                      <CIcon icon={cilBookmark} size="xl"/>
                  </CButton>} position="right" modal lockScroll="false" backgroundColor="rgba(75,192,192,0.4)"
                   contentStyle={{ width: "60%", height: "60%", overflow: "auto", position: 'absolute', top: '19%', left: '21%'}}>
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
                          <p className="text-medium-emphasis small">» The FCI Position Bias Page allows to view and analyze data related to FCI regulations and positions. Upon opening the Biases Page, it fetches and displays a list of FCI regulations and their corresponding positions. A FCI regulation and position can be selected to view detailed information such as position percentages and values.</p>
                          <p className="text-medium-emphasis small">» The Biases Page also provides a chart comparing the expected FCI regulation definition with the actual FCI regulation composition. Additionally, positions be filtered by date range to view position data for a specific time period.</p>
                          <p className="text-medium-emphasis small">» If there is an error with the data, the Biases Page displays a toast message with the error details. The Biases Page also updates the FCI report quantity each time a report is generated.</p>
                          <p className="text-medium-emphasis small">» A proportional overview comparing FCI regulation percentages with the current loaded position is a visual representation that highlights any biases or deviations between the expected FCI regulation definition and the actual FCI regulation composition. This overview displays the expected percentages of each specie type in the FCI regulation and compares them with the percentages of the same specie types in the current loaded position.</p>
                          <p className="text-medium-emphasis small">» To create this overview, the Biases Page first retrieves the expected percentages of each specie type in the FCI regulation from the backend API. It then retrieves the current loaded position data, which includes the percentages of each specie type in the position. The application calculates the differences between the expected and actual percentages for each specie type and displays them in a chart or table format.</p>
                          <p className="text-medium-emphasis small">» The proportional overview helps to identify any biases or deviations in the current loaded position compared to the expected FCI regulation definition. For example, if the expected percentage of a certain specie type in the FCI regulation is 10%, but the actual percentage in the current loaded position is 15%, this indicates a bias towards that specie type. By exposing these biases, the Biases Page enables to make informed decisions about adjusting the current loaded position to better align with the expected FCI regulation definition.</p>
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
               <table style={{ border: "none", backgroundColor: 'white' }}>
                  <thead>
                  <td width="2%" style={{ border: "none"}}></td>
                    <tr className="text-medium-emphasis small" style={{ border: "none", backgroundColor: 'white'}}>
                      <td width="18%" className="text-medium-emphasis large" style={{ border: "none"}}><code>&lt;FCI Regulation Symbol&gt;</code></td>
                      <td width="10%" style={{ border: "none"}}>
                        <select className="text-medium-emphasis large" onChange={(e) => selectFciSymbol(e.target.value)}>
                          {regulations && regulations?.map((regulation) => 
                            <React.Fragment key={regulation.id}>
                            <option value={regulation.fciSymbol}>{regulation.fciSymbol} - {regulation.fciName}&nbsp;&nbsp;&nbsp;</option>
                            </React.Fragment>
                          )}
                        </select>
                      </td>
                      <td width="2%" style={{ border: "none"}}/>
                      {positions && positions.length > 0? (
                      <td style={{ border: "none"}}>
                        {<Popup trigger={
                          <CButton className="text-medium-emphasis small" shape='rounded' size='sm' color='string' onClick={() => listFCIRegulationPercentages()}>
                              <CIcon icon={cilFile} size="xl"/>
                          </CButton>} position="right center" modal>
                          {<CRow>
                            <CCol xs={12}>
                              <CCard>
                                <CCardHeader>
                                  <strong className="text-medium-emphasis small">FCI Regulation Composion - {currentFCISymbol}</strong>
                                </CCardHeader>
                                <CCardBody>
                                <CRow>
                                <CCol xs={5}>
                                    <CCard className="mb-4">
                                      <CCardHeader className="text-medium-emphasis small">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FCI Regulation Distribution</CCardHeader>
                                      <CCardBody>
                                        <CChartPie
                                          data={{
                                            labels: regulationPercentages && regulationPercentages?.map((p) => p.specieTypeName),
                                            datasets: [
                                              {
                                                data: regulationPercentages && regulationPercentages?.map((p) => p.percentage),
                                                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#321fdb', '#3c4b64', '#e55353', '#f9b115', '#2eb85c', '#2982cc', '#212333'],
                                                hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#321fdb', '#3c4b64', '#e55353', '#f9b115', '#2eb85c', '#2982cc', '#212333'],
                                              },
                                            ],
                                          }}
                                        />
                                      </CCardBody>
                                    </CCard>
                                  </CCol>
                                  <CCol>
                                  <CCard className="mb-4">
                                      <CCardHeader className="text-medium-emphasis small">FCI Regulation Composition</CCardHeader>
                                      <CCardBody>
                                          <table className="text-medium-emphasis" style={{ overflow: "auto"}}>
                                          <thead>
                                              <tr className="text-medium-emphasis small">
                                                <th className="text-medium-emphasis small">Specie Type</th>
                                                <th className="text-medium-emphasis small">Percentage</th>
                                              </tr>  
                                            </thead>  
                                            <tbody>
                                              {regulationPercentages?.map((p) => 
                                              <React.Fragment key={p.id}>
                                                <tr className="text-medium-emphasis">
                                                  <td className="text-medium-emphasis small">{p.specieTypeName}</td>
                                                  <td className="text-medium-emphasis small">{p.percentage}</td>
                                                </tr>
                                              </React.Fragment> 
                                              )}                                       
                                            </tbody>
                                          </table>
                                      </CCardBody>
                                    </CCard>
                                  </CCol>

                                  {/* <CCol xs={7}>
                                      <CCard className="mb-4">
                                        <CCardHeader>Expected FCI Regulation Definition</CCardHeader>
                                        <CCardBody>
                                          <CChartBar
                                            data={{
                                              labels: regulationPercentages?.map((p) =>p.specieType),
                                              datasets: [
                                                {
                                                  label: 'FCI Regulation Composition',
                                                  backgroundColor: '#f87979',
                                                  data: regulationPercentages?.map((p) => p.percentage),
                                                },
                                              ],
                                            }}
                                            labels="Percentages"
                                          />
                                        </CCardBody>
                                      </CCard>
                                    </CCol> */}
                                </CRow>   
                              </CCardBody>
                              </CCard> 
                            </CCol>
                          </CRow>  }
                        </Popup>}
                      </td>
                      ) : <td></td>}
                    </tr>
                  </thead>
                  <table style={{ marginTop: "-10px" }}><tr><td>&nbsp;</td></tr></table>
                </table>
                <table>
                {positions && positions.length > 0? (
                  <tr>
                    <td className="text-medium-emphasis small" style={{ border: "none"}} width="18%">Position Identifier #</td>
                    <td width="1%" style={{ border: "none"}}/>
                    <td className="text-medium-emphasis small" style={{ border: "none"}} width="12%">
                      <input className="text-medium-emphasis small" style={{ width: "100%"}}
                      value={inputValue} onChange={handleInputChange}/>
                    </td>
                    <td width="10%" style={{ border: "none"}}/>
                    <td width="4%" className="text-medium-emphasis small" style={{ border: "none"}}>&nbsp;&nbsp;&nbsp;From</td>
                    <td width="2%" style={{ border: "none"}}></td>
                    <td width="5%" style={{ border: "none"}}>
                      <input 
                        type="date"
                        className="text-medium-emphasis small"
                        onChange={(e) => handleSearchDateFromChange(e.target.value)}
                        value={searchFromDate}
                        max={searchToDate}
                        //disabled={searchFilteredPosition || !noPositions}
                      />
                    </td>
                    <td width="2%" style={{ border: "none"}}></td>
                    <td width="2%" className="text-medium-emphasis small" style={{ border: "none"}}>To</td>
                    <td width="1%" style={{ border: "none"}}></td>
                    <td width="4%" style={{ border: "none"}}>
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
                    <td width="2%" style={{ border: "none"}}></td>
                    <td style={{ border: "none"}} width="2%">
                      <CButton shape='rounded' size='sm' color='string' onClick={() => searchPositionsByDate(0)} style={{ border: "none"}}>
                        <CIcon className="text-medium-emphasis small" icon={cilMagnifyingGlass} size="xl"/>
                      </CButton>
                    </td>
                    <td width="5%"></td>
                    <td className="text-medium-emphasis small" width="15%" style={{ border: "none"}}>
                      {positions && positions.length > 0? (
                          <code>&lt;FCI Position&gt;</code>
                        ) : null}
                    </td>
                    <td width="1%" style={{ border: "none"}}></td>
                    <td width="10%" style={{ border: "none"}}>
                      {positions && positions.length > 0? (
                        <select className="text-medium-emphasis large" 
                              onChange={(e) => selectPosition(e.target.value)}>
                          {positions !== undefined && positions.slice(0, 20).map((fciPosition) => 
                            <React.Fragment key={fciPosition.id}>
                            <option value={fciPosition.id}>#{fciPosition.id} - {fciPosition.timestamp}&nbsp;&nbsp;&nbsp;</option>
                            </React.Fragment>
                          )}
                        </select>
                      ) : null}
                      </td>
                      <td width="21%"></td>
                  </tr>
                  ) : null}
               </table>
              </CCardBody>
            </CCard>
         </CCol>
       </CRow>
    </>
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
              <strong>Position Distribution & Details</strong>
          </CCardHeader>
          <CCardBody>
              {regulationPercentages && regulationPercentages?.length > 0? (
                <CRow>
                <CCol xs={20}>
                  <CCard>
                    <CCardHeader>
                      <table>
                        <tr>
                          <td width="10%">
                            <strong className="text-medium-emphasis small">Report & Analysis</strong>
                          </td>
                          <td width="10%">
                            <select className="text-medium-emphasis large" onChange={(e) => fetchFCIPositionPercentageValued(e.target.value)}>
                              {reportTypes?.map((reportType) => 
                                <React.Fragment key={reportType.id}>
                                <option value={reportType.link}>{reportType.name}&nbsp;&nbsp;&nbsp;</option>
                                </React.Fragment>
                              )}
                           </select>
                         </td>
                          <td className="text-medium-emphasis small" width="15%">
                            <strong>
                              Position # {findPositionById() ? findPositionById().id + ' - ' + findPositionById().timestamp : ''}
                            </strong>
                          </td>
                          <td width="1%"></td>
                          <td className="text-medium-emphasis small" width="1%">
                          {<Popup trigger={
                          <CButton className="text-medium-emphasis small" shape='rounded' size='sm' color='string' onClick={() => listFCIRegulationPercentages()}>
                              <CIcon icon={cilFile} size="xl"/>
                          </CButton>} position="right center" modal lockScroll="true" backgroundColor="rgba(75,192,192,0.4)"
                          contentStyle={{ width: "50%", height: "80%", top: '8%', bottom: '5%', left: '5%', right: '10%'}}>
                          {
                            <CRow>
                            <CCol xs={12}>
                              <CCard>
                                <CCardHeader>
                                  <strong className="text-medium-emphasis small">FCI {currentFCISymbol} - Current Position Biases</strong>
                                </CCardHeader>
                                <CCardBody>
                                <CRow>
                                <CCol>
                                  <CCard className="mb-8">
                                    <CCardHeader className="text-medium-emphasis" >Current Position Biases</CCardHeader>
                                    <CCardBody>
                                        <CCol xs={12}>
                                              <CChart
                                                type="bar"
                                                data={{
                                                  labels: positionPercentages?.map((p) => p.specieType + ": " + p.percentage + "%"),
                                                  datasets: [
                                                    {
                                                      label: 'FCI Position Biases Percentage',
                                                      backgroundColor: 'grey', //'#352c2c',
                                                      data: positionPercentages?.map((p) => p.rpercentage),
                                                      type: "line",
                                                      borderColor: "grey",
                                                      fill: false,
                                                      order: 0,
                                                      borderWidth: 2,
                                                      pointBackgroundColor: "#352c2c",
                                                      lineTension: 0,
                                                    },
                                                    {
                                                      label: 'FCI Position Biases Percentage',
                                                      backgroundColor: '#3c4b64',
                                                      hoverBackgroundColor: 'rgba(255,99,132,0.4)',
                                                      hoverBorderColor: 'rgba(255,99,132,1)',
                                                      borderCapStyle: 'square',
                                                      borderColor: '#3c4b64',
                                                      borderWidth: 0,
                                                      borderDash: [0, 0],
                                                      borderDashOffset: 0,
                                                      order: 1,
                                                      data: positionPercentages?.map((p) => p.rpercentage),
                                                      // hoverBackgroundColor: "#f87995",
                                                      // hoverBorderColor: '#f87995',
                                                      // hoverBorderWidth: 1,
                                                      // indexAxis: 'x',
                                                      // fill: false,
                                                      // borderColor: "rgba(220, 220, 220, 1)",
                                                      // pointBackgroundColor: "rgba(220, 220, 220, 1)",
                                                      // pointBackgroundColor: "#352c2c",
                                                      // pointBorderColor: "#fff",
                                                      // borderJoinStyle: 'miter',
                                                      // borderCapStyle: 'butt',
                                                      // pointBorderWidth: 1,
                                                      // pointHoverRadius: 2,
                                                      // pointHoverBackgroundColor: 'rgba(75,192,192,1)',
                                                      // pointHoverBorderColor: 'rgba(220,220,220,1)',
                                                      // pointHoverBorderWidth: 2,
                                                      // pointRadius: 1,
                                                      // pointHitRadius: 2,
                                                      // lineTension: 0.1,
                                                      // backgroundColor: 'rgba(75,192,192,0.4)',
                                                      // borderColor: 'rgba(75,192,192,1)',
                                                      // borderCapStyle: 'butt',
                                                      //  borderDash: [50],
                                                      // borderDashOffset: 0.0,
                                                      // borderJoinStyle: 'miter',
                                                      // pointBorderColor: 'rgba(75,192,192,1)',
                                                      // pointBackgroundColor: '#0b0b0b',
                                                      // order: 1,
                                                      // data: positionPercentages?.map((p) => p.rpercentage),
                                                    }
                                                  ],
                                                }}
                                                labels="Percentages"
                                                options={{
                                                  aspectRatio: 1.5,
                                                  tooltips: {
                                                    enabled: true
                                                  }
                                                }}
                                              />
                                        </CCol>
                                    </CCardBody>
                                  </CCard>
                                </CCol>
                              </CRow>   
                              </CCardBody>
                            </CCard> 

                            {/* <CCard className="mb-4">
                              <CCardHeader>FCI Position Overview - Total Position $ {positionPercentages.reduce((acc, currentValue) => acc + currentValue)}</CCardHeader>
                              <CCardBody>
                                  <table  className="text-medium-emphasis">
                                  <thead>
                                      <tr className="text-medium-emphasis">
                                        <th>Specie Type</th>
                                        <th>Bias Percentage</th>
                                        <th>Bias Valued</th>
                                      </tr>  
                                    </thead>  
                                    <tbody>
                                      {positionPercentages !== undefined 
                                      && Object.prototype.toString.call(positionPercentages) === '[object Array]' 
                                      && positionPercentages.map((p) => 
                                        <React.Fragment key={p.fciSpecieTypeId}>
                                        <tr className="text-medium-emphasis">
                                          <td>{p.specieType}</td>
                                          <td>{p.rpercentage}%</td>
                                          <td>$ {p.rvalued}</td>
                                        </tr>
                                        </React.Fragment> 
                                      )}                                       
                                    </tbody>
                                  </table>
                              </CCardBody>
                            </CCard> */}

                            </CCol>

                            <CRow>&nbsp;</CRow>

                            {/* <CCol xs={6}>
                          <CCard className="mb-4">
                              <CCardHeader>FCI Position Overview - Total Position $ {positionPercentages.reduce((acc, currentValue) => acc + currentValue)}</CCardHeader>
                              <CCardBody>
                                  <table  className="text-medium-emphasis">
                                  <thead>
                                      <tr className="text-medium-emphasis">
                                        <th>Specie Type</th>
                                        <th>Bias Percentage</th>
                                        <th>Bias Valued</th>
                                      </tr>  
                                    </thead>  
                                    <tbody>
                                      {positionPercentages !== undefined 
                                      && Object.prototype.toString.call(positionPercentages) === '[object Array]' 
                                      && positionPercentages.map((p) => 
                                        <React.Fragment key={p.fciSpecieTypeId}>
                                        <tr className="text-medium-emphasis">
                                          <td>{p.specieType}</td>
                                          <td>{p.rpercentage}%</td>
                                          <td>$ {p.rvalued}</td>
                                        </tr>
                                        </React.Fragment> 
                                      )}                                       
                                    </tbody>
                                  </table>
                              </CCardBody>
                            </CCard>
                          </CCol> */}
                          </CRow>  }
                          </Popup>}
                          </td>
                          <td width="28%"></td>
                        </tr>
                      </table>
                    </CCardHeader>
                    <CCardBody>
                    <CRow>
                    <CCol xs={3}>
                        <CCard className="mb-4">
                          <CCardHeader className="text-medium-emphasis small">Current Position - Distribution</CCardHeader>
                          <CCardBody>
                            {<CChartPie
                              data={{
                                labels: positionPercentages?.map((p) => p.specieType),
                                datasets: [
                                  {
                                    data: positionPercentages?.map((p) => p.percentage),
                                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#321fdb', '#3c4b64', '#e55353', '#f9b115', '#2eb85c', '#2982cc', '#212333'],
                                    hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#321fdb', '#3c4b64', '#e55353', '#f9b115', '#2eb85c', '#2982cc', '#212333'],
                                  },
                                ],
                              }}

                            />}
                          </CCardBody>
                        </CCard>
                      </CCol>

                      <CCol>
                        <CCard className="mb-3">
                            <CCardHeader className="text-medium-emphasis small">FCI Position Overview - Total Position: $&nbsp; 
                            <NumericFormat displayType="text" value={Array.isArray(positionPercentages)? positionPercentages.reduce((previousValue, p, index) => previousValue +  Number(p.valued) , 0).toFixed(2) : 0} thousandSeparator="." decimalSeparator=','/>
                              </CCardHeader>
                            <CCardBody>
                                <table className="text-medium-emphasis small">
                                <thead>
                                    <tr className="text-medium-emphasis small">
                                      <th>Type</th>
                                      <th>Position</th>
                                      <th>Valued</th>
                                      <th>Bias</th>
                                      <th>Bias Valued</th>
                                      <th>FCI</th>  
                                      <th>FCI Valued</th>
                                    </tr>  
                                  </thead>  
                                  <tbody>
                                    {positionPercentages !== undefined 
                                    && Object.prototype.toString.call(positionPercentages) === '[object Array]' 
                                    && positionPercentages.map((p) => 
                                      <React.Fragment key={p.fciSpecieTypeId}>
                                      <tr className="text-medium-emphasis">
                                        <td>{p.specieType}</td>
                                        <td>{p.percentage}%</td>
                                        <td>
                                          $ <NumericFormat displayType="text" value={p.valued} thousandSeparator="." decimalSeparator=','/></td>
                                        <td>
                                          {p.rvalued < 0 ? (
                                            <div style={{ color: '#FF6384' }}>
                                            {p.rpercentage}%
                                            </div>) : (
                                              <div>{p.rpercentage}%</div>
                                          )}
                                        </td>
                                        <td>{p.rvalued < 0 ? (
                                            <div style={{ color: '#FF6384' }}>
                                              $ <NumericFormat displayType="text" value={p.rvalued} thousandSeparator="." decimalSeparator=','/>
                                            </div>) : (
                                              <div>
                                              $ <NumericFormat displayType="text" value={p.rvalued} thousandSeparator="." decimalSeparator=','/>
                                              </div>
                                            )}
                                        </td>
                                        <td>
                                          {p.fvalued < 0 ? (
                                            <div style={{ color: '#FF6384' }}>
                                            {p.fpercentage}%
                                            </div>) : (
                                              <div>{p.fpercentage}%</div>
                                          )}
                                        </td>
                                        <td>{p.fvalued < 0 ? (
                                            <div style={{ color: '#FF6384' }}>
                                              $ <NumericFormat displayType="text" value={p.fvalued} thousandSeparator="." decimalSeparator=','/>
                                            </div>) : (
                                              <div>
                                              $ <NumericFormat displayType="text" value={p.fvalued} thousandSeparator="." decimalSeparator=','/>
                                              </div>
                                            )}
                                        </td>
                                      </tr>
                                      </React.Fragment> 
                                    )}                                       
                                  </tbody>
                                </table>
                            </CCardBody>
                          </CCard>
                        </CCol>

                        {/* <CCol xs={3}>
                        <CCard className="mb-4">
                          <CCardHeader>Current Position Biases</CCardHeader>
                          <CCardBody>
                              <CCol xs={14}>
                                    <CChartBar
                                      data={{
                                        labels: positionPercentages?.map((p) => p.specieType),
                                        datasets: [
                                          {
                                            label: 'FCI Position Biases',
                                            backgroundColor: '#f87979',
                                            data: positionPercentages?.map((p) => p.rpercentage),
                                          },
                                        ],
                                      }}
                                      labels="Percentages"
                                    />
                              </CCol>
                          </CCardBody>
                        </CCard>
                      </CCol> */}

                    </CRow> 
                  </CCardBody>
                </CCard>
              </CCol>
              </CRow>   
              ) :  null}
        </CCardBody>
        </CCard>
        </CCol>
      </CRow>
      ) : null}
      </>
       ) : null}
       </>
  )
}

export default FCIPositionBias
