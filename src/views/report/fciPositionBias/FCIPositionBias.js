import React, { useState, useEffect } from 'react';
import { CCard, CCardBody, CCol, CCardHeader, CRow, CButton } from '@coreui/react'

import CIcon from '@coreui/icons-react'
import { cilFile, cilTrash, cilPaperPlane, cilMediaSkipBackward } from '@coreui/icons';

import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

import {
  CChartBar,
  CChartDoughnut,
  CChartLine,
  CChartPie,
  CChartPolarArea,
  CChartRadar,
} from '@coreui/react-chartjs'
import { DocsCallout } from 'src/components'

class FCIPercentage {
    constructor(specieType, percentage) {
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

function FCIPositionBias() {
    const [positionPercentageData, setPositionPercentageData] = useState({ percentages: [FCIPercentage]});
    const [positionValueData, setPositionValueData] = useState({ values: [FCIValue]});
    const [regulationPercentageData, setRegulationPercentageData] = useState({ percentages: [FCIPercentage]});
    const [regulationValueData, setRegulationValueData] = useState({ values: [FCIValue]});
    const [queryRow, setQueryRow] = useState({ fci: '', position: ''});
    const [currentPositionData, setCurrentPositionData] = useState({ id: '', fciSymbol: '', createdOn: '', overview: '', jsonPosition: '', position: '' });

    // http://localhost:8098/api/v1/calculate-bias/fci/BTH58/position/1/regulation-valued
    // http://localhost:8098/api/v1/calculate-bias/fci/BTH58/position/1/regulation-percentages
    // http://localhost:8098/api/v1/calculate-bias/fci/BTH58/position/1/valued
    // http://localhost:8098/api/v1/calculate-bias/fci/BTH58/position/1/percentages

    const getFCIPositionPercentages = (fciSymbol, positionId) => {
    fetch('http://localhost:8098/api/v1/calculate-bias/fci/' + fciSymbol + '/position/' + positionId + '/percentages', {
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

  const getFCIPositionValued = (fciSymbol, positionId) => {
    fetch('http://localhost:8098/api/v1/calculate-bias/fci/' + fciSymbol + '/position/' + positionId + '/valued', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Backend response:', data);
        setPositionValueData(data);
        console.log("responseData! = " + JSON.stringify(positionValueData));
      })    
      .catch((error) => {
        console.error('Error sending data to the backend:', error);
      });
  };

  const getFCIRegulationPercentages = (fciSymbol, positionId) => {
    fetch('http://localhost:8098/api/v1/calculate-bias/fci/' + fciSymbol + '/position/' + positionId + '/regulation-percentages', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Backend response:', data);
        setRegulationPercentageData(data);
        console.log("response Regulation Data! = " + JSON.stringify(regulationPercentageData));
      })    
      .catch((error) => {
        console.error('Error sending data to the backend:', error);
      });
  };

  const getFCIRegulationValued = (fciSymbol, positionId) => {
    fetch('http://localhost:8098/api/v1/calculate-bias/fci/' + fciSymbol + '/position/' + positionId + '/regulation-valued', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Backend response:', data);
        setRegulationValueData(data);
        console.log("responseData! = " + JSON.stringify(regulationValueData));
      })    
      .catch((error) => {
        console.error('Error sending data to the backend:', error);
      });
  };

  const getFCICurrentPositionData = (fciSymbol, positionId) => {
    fetch('http://localhost:8098/api/v1/fci/' + fciSymbol + '/position/' + positionId, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Backend response:', data);
        setCurrentPositionData(data);
        console.log("responseData! = " + JSON.stringify(currentPositionData));
      })    
      .catch((error) => {
        console.error('Error sending data to the backend:', error);
      });
  };


// const FCIPositionBias = () => {
const random = () => Math.round(Math.random() * 100)

  return (
    <>
    <CRow>
      <CCol xs={12}>
            <CCard>
              <CCardHeader>
                <strong className="text-medium-emphasis small">Position Analisys and Reporting</strong>
              </CCardHeader>
              <CCardBody>
              <table>
              <thead>
                  <tr>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                <tr>
                  <td>
                  <input
                    type="text"
                    placeholder="FCI"
                    onChange={(e) => setQueryRow({ ...queryRow, fci: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Position"
                    onChange={(e) => setQueryRow({ ...queryRow, position: e.target.value })}
                  />
                  <CButton shape='rounded' size='sm' color='string' onClick={() => getFCIPositionPercentages(queryRow.fci, queryRow.position)}>
                      <CIcon icon={cilPaperPlane} size="xl"/>
                  </CButton>
                  <CButton shape='rounded' size='sm' color='string' onClick={() => getFCIRegulationPercentages(queryRow.fci, queryRow.position)}>
                      <CIcon icon={cilPaperPlane} size="xl"/>
                  </CButton>
                  <CButton shape='rounded' size='sm' color='string' onClick={() => getFCICurrentPositionData(queryRow.fci, queryRow.position)}>
                      <CIcon icon={cilPaperPlane} size="xl"/>
                  </CButton>
                  </td>
                </tr>
                </tbody>
                </table>  
              </CCardBody>
            </CCard>
        </CCol>
    </CRow>


    <CRow>
        <CCol xs={12}>
          <CCard>
            <CCardHeader className="text-medium-emphasis small">
              <strong>FCI Regulation Positions</strong>
            </CCardHeader>
            <CCardBody>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>FCI</th>
                    <th>Date</th>
                    <th>Overview</th>
                    <th>Position</th>
                  </tr>
                </thead>
                <tbody>
                    <tr>
                      <td width="5%">{currentPositionData.id}</td>
                      <td width="10%">{queryRow.fci}</td>
                      <td width="21%">{currentPositionData.createdOn}</td>
                      <td width="52 %">{currentPositionData.overview}</td>
                      <td>
                        <>
                          <Popup trigger={<button>Position Details</button>} position="left center" modal>
                          <CRow>
                            <CCol xs={12}>
                              <CCard>
                                <CCardHeader>
                                  <strong className="text-medium-emphasis small"><code>#{currentPositionData.id} - Position Details</code></strong>
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
                                            <strong className="text-medium-emphasis small">{currentPositionData.fciSymbol} - {currentPositionData.timestamp} - {currentPositionData.overview}</strong>
                                          </CCardHeader>
                                          <CCardBody>
                                            {currentPositionData.jsonPosition}
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
                      </td>
                    </tr>
                </tbody>
              </table>
          </CCardBody>
         </CCard>
        </CCol>
       </CRow> 


{/* { console.log(positionPercentageData.percentages.map((p) => p.specieType).join())}
{ console.log(positionPercentageData.percentages.map((p) => p.percentage).join()) } */}
  
  <CRow>
      <CCol xs={12}>
        <CCard>
          <CCardHeader>
            <strong className="text-medium-emphasis small">FCI Regulation Composion and Current FCI Position comparison</strong>
          </CCardHeader>
          <CCardBody>
          <CRow>
     

          <CCol xs={3}>
              <CCard className="mb-4">
                <CCardHeader>Expected FCI Regulation Definition</CCardHeader>
                <CCardBody>
                  <CChartBar
                    data={{
                      labels: regulationPercentageData.percentages.map((p) =>p.specieType),
                      datasets: [
                        {
                          label: 'FCI Regulation Composition',
                          backgroundColor: '#f87979',
                          data: regulationPercentageData.percentages.map((p) => p.percentage),
                        },
                      ],
                    }}
                    labels="Percentages"
                  />
                </CCardBody>
              </CCard>
            </CCol>

            <CCol xs={3}>
          <CCard className="mb-4">
            <CCardHeader>Expected FCI Regulation Definition</CCardHeader>
            <CCardBody>
              <CChartPie
                data={{
                  labels: regulationPercentageData.percentages.map((p) => p.specieType),
                  datasets: [
                    {
                      data: regulationPercentageData.percentages.map((p) => p.percentage),
                      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                      hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                    },
                  ],
                }}
              />
            </CCardBody>
          </CCard>
        </CCol>

        <CCol xs={3}>
          <CCard className="mb-4">
            <CCardHeader>Current FCI Position Bias</CCardHeader>
            <CCardBody>
              <CChartDoughnut
                data={{
                  labels: positionPercentageData.percentages.map((p) => p.specieType),
                  datasets: [
                    {
                      backgroundColor: ['#41B883', '#E46651', '#00D8FF', '#DD1B16'],
                      data: positionPercentageData.percentages.map((p) => p.percentage),
                    },
                  ],
                }}
              />
            </CCardBody>
          </CCard>
        </CCol>

            <CCol xs={3}>
              <CCard className="mb-4">
                <CCardHeader>Current FCI Position</CCardHeader>
                <CCardBody>
                  <CChartBar
                    data={{
                      labels: positionPercentageData.percentages.map((p) => p.specieType),
                      datasets: [
                        {
                          label: 'Positon Percentage Composition',
                          backgroundColor: '#36A2EB',
                          data: positionPercentageData.percentages.map((p) => p.percentage),
                        },
                      ],
                    }}
                    labels="Percentages"
                  />
                </CCardBody>
              </CCard>
            </CCol>
            </CRow>
            </CCardBody>
        </CCard>
      </CCol>


        {/* <CCol xs={6}>
          <CCard className="mb-4">
            <CCardHeader>Line Chart</CCardHeader>
            <CCardBody>
              <CChartLine
                data={{
                  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
                  datasets: [
                    {
                      label: 'My First dataset',
                      backgroundColor: 'rgba(220, 220, 220, 0.2)',
                      borderColor: 'rgba(220, 220, 220, 1)',
                      pointBackgroundColor: 'rgba(220, 220, 220, 1)',
                      pointBorderColor: '#fff',
                      data: [random(), random(), random(), random(), random(), random(), random()],
                    },
                    {
                      label: 'My Second dataset',
                      backgroundColor: 'rgba(151, 187, 205, 0.2)',
                      borderColor: 'rgba(151, 187, 205, 1)',
                      pointBackgroundColor: 'rgba(151, 187, 205, 1)',
                      pointBorderColor: '#fff',
                      data: [random(), random(), random(), random(), random(), random(), random()],
                    },
                  ],
                }}
              />
            </CCardBody>
          </CCard>
        </CCol> */}

       

       
       
      {/*  <CCol xs={6}>
          <CCard className="mb-4">
            <CCardHeader>Polar Area Chart</CCardHeader>
            <CCardBody>
              <CChartPolarArea
                data={{
                  labels: ['Red', 'Green', 'Yellow'],
                  datasets: [
                    {
                      data: [30, 30, 40],
                      backgroundColor: ['#FF6384', '#4BC0C0', '#FFCE56', '#E7E9ED', '#36A2EB'],
                    },
                  ],
                }}
              />
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xs={6}>
          <CCard className="mb-4">
            <CCardHeader>Current FCI Position Bias</CCardHeader>
            <CCardBody>
              <CChartRadar
                data={{
                  labels: [
                    'Equity',
                    'Bond',
                    'Cedears',
                    'Derivados',
                    'Cash',
                  ],
                  datasets: [
                    {
                      label: 'Equity',
                      backgroundColor: 'rgba(220, 220, 220, 0.2)',
                      borderColor: 'rgba(220, 220, 220, 1)',
                      pointBackgroundColor: 'rgba(220, 220, 220, 1)',
                      pointBorderColor: '#fff',
                      pointHighlightFill: '#fff',
                      pointHighlightStroke: 'rgba(220, 220, 220, 1)',
                      data: [14.9909],
                    },
                    {
                      label: 'Bond',
                      backgroundColor: 'rgba(151, 187, 205, 0.2)',
                      borderColor: 'rgba(151, 187, 205, 1)',
                      pointBackgroundColor: 'rgba(151, 187, 205, 1)',
                      pointBorderColor: '#fff',
                      pointHighlightFill: '#fff',
                      pointHighlightStroke: 'rgba(151, 187, 205, 1)',
                      data: [17.7550],
                    },
                    {
                      label: 'Cedears',
                      backgroundColor: 'rgba(111, 127, 195, 1)',
                      borderColor: 'rgba(111, 127, 195, 1)',
                      pointBackgroundColor: 'rgba(151, 187, 205, 1)',
                      pointBorderColor: '#fff',
                      pointHighlightFill: '#fff',
                      pointHighlightStroke: 'rgba(151, 187, 205, 1)',
                      data: [23.7550],
                    },
                    {
                      label: 'Derivados',
                      backgroundColor: 'rgba(65, 96, 115, 3)',
                      borderColor: 'rgba(65, 96, 115, 3)',
                      pointBackgroundColor: 'rgba(151, 187, 205, 1)',
                      pointBorderColor: '#fff',
                      pointHighlightFill: '#fff',
                      pointHighlightStroke: 'rgba(151, 187, 205, 1)',
                      data: [23.7550],
                    },
                    {
                      label: 'Cash',
                      backgroundColor: 'rgba(121, 167, 215, 0.6)',
                      borderColor: 'rgba(121, 167, 215, 2)',
                      pointBackgroundColor: 'rgba(151, 187, 205, 1)',
                      pointBorderColor: '#fff',
                      pointHighlightFill: '#fff',
                      pointHighlightStroke: 'rgba(151, 187, 205, 1)',
                      data: [44.2540],
                    },
                  ],
                }}
              />
            </CCardBody>
          </CCard>
        </CCol> */}
      </CRow>
      </>
  )
}

export default FCIPositionBias
