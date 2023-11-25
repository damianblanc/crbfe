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

import { NumericFormat } from 'react-number-format';
import { PatternFormat } from 'react-number-format';

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
  const [positionPercentages, setPositionPercentages] = useState([]);
  const [positionValueData, setPositionValueData] = useState({ values: [FCIValue]});  
  const [regulationValueData, setRegulationValueData] = useState({ values: [FCIValue]});
  const [queryRow, setQueryRow] = useState({ fci: '', position: ''});
  const [regulations, setRegulations] = useState([{FCIRegulationSymbolName}]);
  const [positions, setPositions] = useState([{FCIPositionIdCreatedOn}]);
  const [currentPositionData, setCurrentPositionData] = useState([{FCIPosition}]);
  const [reportTypes, setReportTypes] = useState([]);
  const [selectReportType, setSelectedReportType] = useState('');
  const [reportTypeData, setReportTypeData] = useState([]);
  const [currentPositionId, setCurrentPositionId] = useState('');
  const [currentFCISymbol, setCurrentFCISymbol] = useState('');
  const [positionOverview, setPositionOverview] = useState([]);

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

    const setFetchedData = async () => {
      const tempLoadedRegulations = await fetchRegulations();
      if (tempLoadedRegulations.size > 0) {
        const tempLoadedPositions = await fetchPositions(tempLoadedRegulations[0].fciSymbol);
        const tempLoadedPercentages = await fetchPercentages(tempLoadedRegulations[0].fciSymbol);
        const tempLoadedReportTypes = await fetchReportTypes();
        const tempLoadedPercentagesValued = await fetchFCIPositionPercentagesValued(tempLoadedRegulations[0].fciSymbol, tempLoadedPositions[0].id);
        setRegulations(tempLoadedRegulations);
        setPositions(tempLoadedPositions);
        setRegulationPercentages(tempLoadedPercentages);
        setCurrentFCISymbol(tempLoadedRegulations[0].fciSymbol);
        setReportTypes(tempLoadedReportTypes);
        setCurrentPositionId(tempLoadedPositions[0].id);
        setPositionPercentages(tempLoadedPercentagesValued);
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

  //   const getFCIPositionOverview = () => {
  //     fetch('http://localhost:8098/api/v1/calculate-bias/fci/' + selectedFCISymbol + '/position/' + currentPositionId + '/refresh/true', {
  //     method: 'GET',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //   })
  //     .then((response) => response.json())
  //     .then((data) => {
  //       console.log('Backend response:', data);
  //       setPositionOverview(data);
  //       console.log("positionOverview = " + positionOverview);
  //     })    
  //     .catch((error) => {
  //       console.error('Error sending data to the backend:', error);
  //     });
  // };

  // useEffect(() => {
  // const getFCIPositionOverview = async (link) => {
  //     try {
  //       const responseData = await axios.get('http://localhost:8098/api/v1/calculate-bias/fci/' + selectedFCISymbol + '/position/' + currentPositionId + '/refresh/true')
  //       setPositionOverview(responseData.data);
  //     } catch (error) {
  //       console.error('Error sending data to the backend:', error);
  //     }
  //   };
  // });
    
  //   const setFetchedPositionOverviewData = async () => {
  //     const tempLoadedPositionOverview = await reportPositionOverview(link);
  //     setPositionOverview(tempLoadedPositionOverview);
  //   };
  // }

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
      console.log("selectedFCISymbol = " + currentFCISymbol);
      const responseData = await axios.get('http://localhost:8098/api/v1/fci/' + currentFCISymbol + '/regulation-percentages')
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
                                <strong className="text-medium-emphasis small">FCI Regulation Composion - {currentFCISymbol}</strong>
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
                <CCol xs={20}>
                  <CCard>
                    <CCardHeader>
                      <table>
                        <tr>
                          <td width="12%">
                            <strong className="text-medium-emphasis small">Report & Analysis</strong>
                          </td>
                          <td>
                            <select className="text-medium-emphasis large" onChange={(e) => fetchFCIPositionPercentageValued(e.target.value)}>
                              {reportTypes?.map((reportType) => 
                                <React.Fragment key={reportType.id}>
                                <option value={reportType.link}>{reportType.name}&nbsp;&nbsp;&nbsp;</option>
                                </React.Fragment>
                              )}
                      </select>
                        </td>
                        <td>
                        {<Popup trigger={
                        <CButton shape='rounded' size='sm' color='string' onClick={() => listFCIRegulationPercentages()}>
                            <CIcon icon={cilFile} size="xl"/>
                        </CButton>} position="right center" modal lockScroll="false">
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
                                  <CCardHeader>Current Position Biases</CCardHeader>
                                  <CCardBody>
                                      <CCol xs={12}>
                                            <CChartBar
                                              data={{
                                                labels: positionPercentages?.map((p) => p.specieType),
                                                datasets: [
                                                  {
                                                    label: 'FCI Position Biases',
                                                    backgroundColor: '#f87979',
                                                    hoverBackgroundColor: "#f87969",
                                                    // hoverBorderColor: '#36A2EB',
                                                    // hoverBorderWidth: 5,
                                                    indexAxis: 'y',
                                                    // borderColor: "rgba(220, 220, 220, 1)",
                                                    // pointBackgroundColor: "rgba(220, 220, 220, 1)",
                                                    // pointBorderColor: "#fff",
                                                    data: positionPercentages?.map((p) => p.rpercentage),
                                                    // data : [10, 20, 30]
                                                  },
                                                ],
                                              }}
                                              labels="Percentages"
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
                      </tr>
                      </table>
                    </CCardHeader>
                    <CCardBody>
                    <CRow>
                    <CCol xs={3}>
                        <CCard className="mb-4">
                          <CCardHeader>Current Position - Distribution</CCardHeader>
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
                        <CCard className="mb-4">
                            <CCardHeader>FCI Position Overview - Total Position: $&nbsp; 
                            <NumericFormat displayType="text" value={positionPercentages.reduce((previousValue, p, index) => previousValue +  Number(p.valued) , 0).toFixed(2)} thousandSeparator="." decimalSeparator=','/>
                              </CCardHeader>
                            <CCardBody>
                                <table  className="text-medium-emphasis">
                                <thead>
                                    <tr className="text-medium-emphasis">
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
      </>
  )
}

export default FCIPositionBias
