import React, { useState, useEffect } from 'react';
import { CCard, CCardBody, CCol, CCardHeader, CRow, CButton } from '@coreui/react'

import CIcon from '@coreui/icons-react'
import { cilFile, cilTrash, cilPaperPlane, cilMediaSkipBackward } from '@coreui/icons';

import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

import axios from 'axios';

import {
  CChartBar,
  CChartDoughnut,
  CChartLine,
  CChartPie,
  CChartPolarArea,
  CChartRadar,
} from '@coreui/react-chartjs'
import { DocsCallout } from 'src/components'

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

function FCIPositionBias() {
  //const [regulationPercentageData, setRegulationPercentageData] = useState({percentages: [FCIPercentage]});
  const [regulationPercentages, setRegulationPercentages] = useState([]);
  // const [positionPercentageData, setPositionPercentageData] = useState({ percentages: [FCIPercentage]});
  const [positionPercentageData, setPositionPercentageData] = useState([]);
  const [positionValueData, setPositionValueData] = useState({ values: [FCIValue]});
  
  const [regulationValueData, setRegulationValueData] = useState({ values: [FCIValue]});
  const [queryRow, setQueryRow] = useState({ fci: '', position: ''});
  const [regulations, setRegulations] = useState([{FCIRegulationSymbolName}]);
  const [positions, setPositions] = useState([{FCIPositionIdCreatedOn}]);
  const [currentPositionData, setCurrentPositionData] = useState([{FCIPosition}]);
  const [selectedFCISymbol, setSelectedFCISymbol] = useState('');
  const [reportTypes, setReportTypes] = useState([]);
  const [selectReportType, setSelectedReportType] = useState('');
  const [reportTypeData, setReportTypeData] = useState([]);

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

    /** FCI Component - Report Types */
    const fetchReportTypes = async () => {
      try {
        const responseData = await axios.get('http://localhost:8098/api/v1/fci/component/report')
        return responseData.data;
      } catch (error) {
        console.error('Error sending data to the backend:', error);
      }
    };

    const setFetchedData = async () => {
      const tempLoadedRegulations = await fetchRegulations();
      const tempLoadedPositions = await fetchPositions(tempLoadedRegulations[0].fciSymbol);
      const tempLoadedPercentages = await fetchPercentages(tempLoadedRegulations[0].fciSymbol);
      const tempLoadedReportTypes = await fetchReportTypes();
      setRegulations(tempLoadedRegulations);
      setPositions(tempLoadedPositions);
      setRegulationPercentages(tempLoadedPercentages);
      setSelectedFCISymbol(tempLoadedRegulations[0].fciSymbol);
      setReportTypes(tempLoadedReportTypes);
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

  // const setCurrentSelectedFCISymbol = (fciSymbol) => {
  //   setSelectedFCISymbol(fciSymbol);
  //   console.log("fciSymbol = " + fciSymbol);
  //   console.log("selectedFCISymbol = " + selectedFCISymbol);
  // }

  const selectPosition = (position) => {
    if (position !== undefined) {
      // setSelectedFCISymbol(position);
      // fetch('http://localhost:8098/api/v1/fci/' + symbol + '/position')
      //   .then((response) => response.json())
      //   .then((json) => setFciPositions(json));
    }
  };

    // http://localhost:8098/api/v1/calculate-bias/fci/BTH58/position/1/regulation-valued
    // http://localhost:8098/api/v1/calculate-bias/fci/BTH58/position/1/regulation-percentages
    // http://localhost:8098/api/v1/calculate-bias/fci/BTH58/position/1/valued
    // http://localhost:8098/api/v1/calculate-bias/fci/BTH58/position/1/percentages

    const getFCIPositionPercentages = (fciSymbol, positionId) => {
    fetch('http://localhost:8098/api/v1/calculate-bias/fci/' + fciSymbol + '/position/' + positionId + '/percentages/refresh/true', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Backend response:', data);
        setPositionPercentageData(data);
        console.log("responseData! = " + JSON.stringify(positionPercentageData));
      })    
      .catch((error) => {
        console.error('Error sending data to the backend:', error);
      });
  };

  // const getFCIPositionValued = (fciSymbol, positionId) => {
  //   fetch('http://localhost:8098/api/v1/calculate-bias/fci/' + fciSymbol + '/position/' + positionId + '/valued', {
  //     method: 'GET',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //   })
  //     .then((response) => response.json())
  //     .then((data) => {
  //       console.log('Backend response:', data);
  //       setPositionValueData(data);
  //       console.log("responseData! = " + JSON.stringify(positionValueData));
  //     })    
  //     .catch((error) => {
  //       console.error('Error sending data to the backend:', error);
  //     });
  // };

  const listFCIRegulationPercentages = async () => {
    console.log("I'm into getFCIRegulationPercentages");
    try {
      console.log("selectedFCISymbol = " + selectedFCISymbol);
      const responseData = await axios.get('http://localhost:8098/api/v1/fci/' + selectedFCISymbol + '/regulation-percentages')
      setRegulationPercentages(responseData.data);
      console.log("responseData.data = " + responseData.data);
      console.log("regulationPercentageData = " + regulationPercentages);
    } catch (error) {
      console.error('Error sending data to the backend:', error);
    }
  };

  // const getFCIRegulationValued = (fciSymbol, positionId) => {
  //   fetch('http://localhost:8098/api/v1/calculate-bias/fci/' + fciSymbol + '/position/' + positionId + '/regulation-valued', {
  //     method: 'GET',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //   })
  //     .then((response) => response.json())
  //     .then((data) => {
  //       console.log('Backend response:', data);
  //       setRegulationValueData(data);
  //       console.log("responseData! = " + JSON.stringify(regulationValueData));
  //     })    
  //     .catch((error) => {
  //       console.error('Error sending data to the backend:', error);
  //     });
  // };

  // const getFCICurrentPositionData = (fciSymbol, positionId) => {
  //   fetch('http://localhost:8098/api/v1/fci/' + fciSymbol + '/position/' + positionId, {
  //     method: 'GET',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //   })
  //     .then((response) => response.json())
  //     .then((data) => {
  //       console.log('Backend response:', data);
  //       setCurrentPositionData(data);
  //       console.log("responseData! = " + JSON.stringify(currentPositionData));
  //     })    
  //     .catch((error) => {
  //       console.error('Error sending data to the backend:', error);
  //     });
  // };


// const FCIPositionBias = () => {
//const random = () => Math.round(Math.random() * 100)

  return (
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
                      <select className="text-medium-emphasis large" onChange={(e) => setSelectedFCISymbol(e.target.value)}>
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
                    <td width="12%"><code>&lt;FCI Composition&gt;</code></td>
                    <td>
                      {<Popup trigger={
                        <CButton shape='rounded' size='sm' color='string' onClick={() => listFCIRegulationPercentages()}>
                            <CIcon icon={cilFile} size="xl"/>
                        </CButton>} position="right center" modal>
                        {<CRow>
                          <CCol xs={12}>
                            <CCard>
                              <CCardHeader>
                                <strong className="text-medium-emphasis small">FCI Regulation Composion - {selectedFCISymbol}</strong>
                              </CCardHeader>
                              <CCardBody>
                              <CRow>
                              <CCol xs={5}>
                                  <CCard className="mb-4">
                                    <CCardHeader>Expected FCI Regulation Definition</CCardHeader>
                                    <CCardBody>
                                      <CChartPie
                                        data={{
                                          labels: regulationPercentages?.map((p) => p.specieType),
                                          datasets: [
                                            {
                                              data: regulationPercentages?.map((p) => p.percentage),
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
                                    <CCardHeader>FCI Regulation Composition</CCardHeader>
                                    <CCardBody>
                                        <table  className="text-medium-emphasis">
                                        <thead>
                                            <tr className="text-medium-emphasis">
                                              <th>Specie Type</th>
                                              <th>Percentage</th>
                                            </tr>  
                                          </thead>  
                                          <tbody>
                                            {regulationPercentages?.map((p) => 
                                             <React.Fragment key={p.id}>
                                              <tr className="text-medium-emphasis">
                                                <td>{p.specieType}</td>
                                                <td>{p.percentage}</td>
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
            <strong className="text-medium-emphasis small">Position Distribution & Details</strong>
          </CCardHeader>
          <CCardBody>
              {regulationPercentages?.length > 0 ? (
                <CRow>
                <CCol xs={12}>
                  <CCard>
                    <CCardHeader>
                      <table>
                        <tr>
                          <td width="12%">
                            <strong className="text-medium-emphasis small">Report & Analysis</strong>
                          </td>
                          <td>
                            <select className="text-medium-emphasis large" onChange={(e) => processReportType(e.target.value)}>
                              {reportTypes?.map((reportType) => 
                                <React.Fragment key={reportType.id}>
                                <option value={reportType.link}>{reportType.name}&nbsp;&nbsp;&nbsp;</option>
                                </React.Fragment>
                              )}
                      </select>
                        </td>
                      </tr>
                      </table>
                    </CCardHeader>
                    <CCardBody>
                    <CRow>
                    <CCol xs={3}>
                        <CCard className="mb-4">
                          <CCardHeader>Expected FCI Regulation Definition</CCardHeader>
                          <CCardBody>
                            {<CChartPie
                              data={{
                                labels: regulationPercentages?.map((p) => p.specieType),
                                datasets: [
                                  {
                                    data: regulationPercentages?.map((p) => p.percentage),
                                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#321fdb', '#3c4b64', '#e55353', '#f9b115', '#2eb85c', '#2982cc', '#212333'],
                                              hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#321fdb', '#3c4b64', '#e55353', '#f9b115', '#2eb85c', '#2982cc', '#212333'],
                                  },
                                ],
                              }}
                            />}
                          </CCardBody>
                        </CCard>
                      </CCol>
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
      </>
  )
}

export default FCIPositionBias
