import React, { useState, useEffect } from 'react'
import {
  CRow,
  CCol,
  CDropdown,
  CDropdownMenu,
  CDropdownItem,
  CDropdownToggle,
  CWidgetStatsA,
} from '@coreui/react'
import { getStyle } from '@coreui/utils'
import { CChartBar, CChartLine } from '@coreui/react-chartjs'
import CIcon from '@coreui/icons-react'
import { cilArrowBottom, cilArrowTop, cilOptions } from '@coreui/icons'

import axios from 'axios';


const WidgetsDropdown = () => {
  const [regulationQuantity, setRegulationQuantity] = useState(0);
  const [positionQuantity, setPositionQuantity] = useState(0);
  const [reportsQuantity, setReportsQuantity] = useState(0);
  const [advicesQuantity, setAdvicesQuantity] = useState(0);

  const [regulationsPerMonth, setRegulationsPerMonth] = useState([]);
  const [positionsPerMonth, setPositionsPerMonth] = useState([]);
  const [reportsPerMonth, setReportsPerMonth] = useState([]);
  const [advicesPerMonth, setAdvicesPerMonth] = useState([]);
  
  const [regPerMonthGrowth, setRegPerMonthGrowth] = useState(0);
  const [posPerMonthGrowth, setPosPerMonthGrowth] = useState(0);
  const [repPerMonthGrowth, setRepPerMonthGrowth] = useState(0);
  const [advPerMonthGrowth, setAdvPerMonthGrowth] = useState(0);

  useEffect(() => {
    const fetchSummarization = async () => {
      try {
        const responseData = await axios.get('http://localhost:8098/api/v1/summarize');
        return responseData.data;
      } catch (error) {
        console.error('Error sending data to the backend:', error);
      }
    };

    const fetchRegulationsPerMonth = async () => {
      try {
        const responseData = await axios.get('http://localhost:8098/api/v1/summarize/regulations-per-month');
        return responseData.data;
      } catch (error) {
        console.error('Error sending data to the backend:', error);
      }
    };

    const fetchPositionsPerMonth = async () => {
      try {
        const responseData = await axios.get('http://localhost:8098/api/v1/summarize/positions-per-month');
        return responseData.data;
      } catch (error) {
        console.error('Error sending data to the backend:', error);
      }
    };

    const fetchReportsPerMonth = async () => {
      try {
        const responseData = await axios.get('http://localhost:8098/api/v1/summarize/positions-per-month');
        return responseData.data;
      } catch (error) {
        console.error('Error sending data to the backend:', error);
      }
    };

    const fetchAdvicesPerMonth = async () => {
      try {
        const responseData = await axios.get('http://localhost:8098/api/v1/summarize/positions-per-month');
        return responseData.data;
      } catch (error) {
        console.error('Error sending data to the backend:', error);
      }
    };

    const setFetchedData = async () => {
      const tempLoadedSummarization = await fetchSummarization();
      
      const tempLoadedRegulationsPerMonth = await fetchRegulationsPerMonth();
      const tempLoadedPositionsPerMonth = await fetchPositionsPerMonth();
      const tempLoadedReportsPerMonth = await fetchReportsPerMonth();
      const tempLoadedAdvicesPerMonth = await fetchAdvicesPerMonth();
      
      setRegulationQuantity(tempLoadedSummarization.fciRegulationQuantity);
      setPositionQuantity(tempLoadedSummarization.fciPositionQuantity);
      setReportsQuantity(tempLoadedSummarization.fciReportsQuantity);
      setAdvicesQuantity(tempLoadedSummarization.fciAdvicesQuantity);
      
      setRegulationsPerMonth(tempLoadedRegulationsPerMonth);
      setPositionsPerMonth(tempLoadedPositionsPerMonth);
      setReportsPerMonth(tempLoadedReportsPerMonth);
      setAdvicesPerMonth(tempLoadedAdvicesPerMonth);
      
      setRegPerMonthGrowth((tempLoadedRegulationsPerMonth.at(0).quantity / tempLoadedSummarization.fciRegulationQuantity) * 100);
      setPosPerMonthGrowth((tempLoadedPositionsPerMonth.at(0).quantity / tempLoadedSummarization.fciPositionQuantity) * 100);
      setRepPerMonthGrowth((tempLoadedReportsPerMonth.at(0).quantity / tempLoadedSummarization.fciReportsQuantity) * 100);
      setAdvPerMonthGrowth((tempLoadedAdvicesPerMonth.at(0).quantity / tempLoadedSummarization.fciAdvicesQuantity) * 100);
    };
    setFetchedData();
  }, []); 

  // const posPerMonthPercentageGrowth = () => {
  //   return (positionsPerMonth.at(0).quantity / positionQuantity) * 100;
  // }

  return (
    <CRow>
      <CCol sm={6} lg={3}>
        <CWidgetStatsA
          className="mb-4"
          color="primary"
          value={
            <>
              {regulationQuantity}{' '}
              <span className="fs-6 fw-normal">
                ({ Math.round(regPerMonthGrowth)}% <CIcon icon={cilArrowTop} />)
              </span>
            </>
          }
          title="Regulations"
          action={
            <CDropdown alignment="end">
              <CDropdownToggle color="transparent" caret={false} className="p-0">
                <CIcon icon={cilOptions} className="text-high-emphasis-inverse" />
              </CDropdownToggle>
              {/* <CDropdownMenu>
                <CDropdownItem>Action</CDropdownItem>
                <CDropdownItem>Another action</CDropdownItem>
                <CDropdownItem>Something else here...</CDropdownItem>
                <CDropdownItem disabled>Disabled action</CDropdownItem>
              </CDropdownMenu> */}
            </CDropdown>
          }
          chart={
            <CChartBar
              className="mt-3 mx-3"
              style={{ height: '70px' }}
              data={{
                labels: regulationsPerMonth?.reverse().map((e) => e.month),
                datasets: [
                  {
                    label: 'Regulations per Month',
                    backgroundColor: 'white',
                    borderColor: 'rgba(255,255,255,.55)',
                    pointBackgroundColor: getStyle('--cui-info'),
                    data: regulationsPerMonth?.map((e) => e.quantity),
                    barPercentage: 0.6,
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
                    min: -9,
                    max: 39,
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
                    hoverRadius: 4,
                  },
                },
              }}
            />
          }
        />
      </CCol>
      <CCol sm={6} lg={3}>
        <CWidgetStatsA
          className="mb-4"
          color="info"
          value={
            <>
              {positionQuantity}{' '}
              <span className="fs-6 fw-normal">
                ({posPerMonthGrowth}% <CIcon icon={cilArrowTop} />)
              </span>
            </>
          }
          title="Positions"
          action={
            <CDropdown alignment="end">
              <CDropdownToggle color="transparent" caret={false} className="p-0">
                <CIcon icon={cilOptions} className="text-high-emphasis-inverse" />
              </CDropdownToggle>
              {/* <CDropdownMenu>
                <CDropdownItem>Action</CDropdownItem>
                <CDropdownItem>Another action</CDropdownItem>
                <CDropdownItem>Something else here...</CDropdownItem>
                <CDropdownItem disabled>Disabled action</CDropdownItem>
              </CDropdownMenu> */}
            </CDropdown>
          }
          chart={
            <CChartLine
              className="mt-3 mx-3"
              style={{ height: '70px' }}
              data={{
                labels: positionsPerMonth?.reverse().map((e) => e.month),
                datasets: [
                  {
                    label: 'Positions per Month',
                    backgroundColor: 'blue',
                    borderColor: 'rgba(255,255,255,.55)',
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
                    min: -9,
                    max: 39,
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
                    hoverRadius: 4,
                  },
                },
              }}
            />
          }
        />
      </CCol>
      <CCol sm={6} lg={3}>
        <CWidgetStatsA
          className="mb-4"
          color="warning"
          value={
            <>
              {reportsQuantity}{' '}
              <span className="fs-6 fw-normal">
                ({ Math.round(repPerMonthGrowth)}% <CIcon icon={cilArrowTop} />)
              </span>
            </>
          }
          title="Reports"
          action={
            <CDropdown alignment="end">
              <CDropdownToggle color="transparent" caret={false} className="p-0">
                <CIcon icon={cilOptions} className="text-high-emphasis-inverse" />
              </CDropdownToggle>
              {/* <CDropdownMenu>
                <CDropdownItem>Action</CDropdownItem>
                <CDropdownItem>Another action</CDropdownItem>
                <CDropdownItem>Something else here...</CDropdownItem>
                <CDropdownItem disabled>Disabled action</CDropdownItem>
              </CDropdownMenu> */}
            </CDropdown>
          }
          chart={
            <CChartLine
              className="mt-3"
              style={{ height: '70px' }}
              data={{
                labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
                datasets: [
                  {
                    label: 'My First dataset',
                    backgroundColor: 'rgba(255,255,255,.2)',
                    borderColor: 'rgba(255,255,255,.55)',
                    data: [78, 81, 80, 45, 34, 12, 40],
                    fill: true,
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
                    display: false,
                  },
                  y: {
                    display: false,
                  },
                },
                elements: {
                  line: {
                    borderWidth: 2,
                    tension: 0.4,
                  },
                  point: {
                    radius: 0,
                    hitRadius: 10,
                    hoverRadius: 4,
                  },
                },
              }}
            />
          }
        />
      </CCol>
      <CCol sm={6} lg={3}>
        <CWidgetStatsA
          className="mb-4"
          color="danger"
          value={
            <>
              {advicesQuantity}{' '}
              <span className="fs-6 fw-normal">
                ({ Math.round(advPerMonthGrowth)}% <CIcon icon={cilArrowTop} />)
              </span>
            </>
          }
          title="Advices"
          action={
            <CDropdown alignment="end">
              <CDropdownToggle color="transparent" caret={false} className="p-0">
                <CIcon icon={cilOptions} className="text-high-emphasis-inverse" />
              </CDropdownToggle>
              {/* <CDropdownMenu>
                <CDropdownItem>Action</CDropdownItem>
                <CDropdownItem>Another action</CDropdownItem>
                <CDropdownItem>Something else here...</CDropdownItem>
                <CDropdownItem disabled>Disabled action</CDropdownItem>
              </CDropdownMenu> */}
            </CDropdown>
          }
          chart={
            <CChartBar
              className="mt-3 mx-3"
              style={{ height: '70px' }}
              data={{
                labels: [
                  'January',
                  'February',
                  'March',
                  'April',
                  'May',
                  'June',
                  'July',
                  'August',
                  'September',
                  'October',
                  'November',
                  'December',
                  'January',
                  'February',
                  'March',
                  'April',
                ],
                datasets: [
                  {
                    label: 'My First dataset',
                    backgroundColor: 'rgba(255,255,255,.2)',
                    borderColor: 'rgba(255,255,255,.55)',
                    data: [78, 81, 80, 45, 34, 12, 40, 85, 65, 23, 12, 98, 34, 84, 67, 82],
                    barPercentage: 0.6,
                  },
                ],
              }}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  x: {
                    grid: {
                      display: false,
                      drawTicks: false,
                    },
                    ticks: {
                      display: false,
                    },
                  },
                  y: {
                    grid: {
                      display: false,
                      drawBorder: false,
                      drawTicks: false,
                    },
                    ticks: {
                      display: false,
                    },
                  },
                },
              }}
            />
          }
        />
      </CCol>
    </CRow>
  )
}

export default WidgetsDropdown
