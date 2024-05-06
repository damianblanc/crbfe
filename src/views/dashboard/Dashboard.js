import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

import './Dashboard.css';

import {
  CAvatar,
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CProgress,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CToast,
  CToastBody,
  CToastClose,
  CToastHeader,
  CToaster
} from '@coreui/react'

import { CChartLine } from '@coreui/react-chartjs'
import { getStyle, hexToRgba } from '@coreui/utils'
import CIcon from '@coreui/icons-react'
import {
  cibCcAmex,
  cibCcApplePay,
  cibCcMastercard,
  cibCcPaypal,
  cibCcStripe,
  cibCcVisa,
  cibGoogle,
  cibFacebook,
  cibLinkedin,
  cifBr,
  cifEs,
  cifFr,
  cifIn,
  cifPl,
  cifUs,
  cibTwitter,
  cilCloudDownload,
  cilPeople,
  cilUser,
  cilUserFemale,
} from '@coreui/icons'

import avatar1 from 'src/assets/images/avatars/1.jpg'
import avatar2 from 'src/assets/images/avatars/2.jpg'
import avatar3 from 'src/assets/images/avatars/3.jpg'
import avatar4 from 'src/assets/images/avatars/4.jpg'
import avatar5 from 'src/assets/images/avatars/5.jpg'
import avatar6 from 'src/assets/images/avatars/6.jpg'

import WidgetsBrand from '../widgets/WidgetsBrand'
import WidgetsDropdown from '../widgets/WidgetsDropdown'

const Dashboard = () => {
  const random = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)
  const [toast, addToast] = useState(0)
  const toaster = useRef()

  const [regulationQuantity, setRegulationQuantity] = useState(0);
  const [positionQuantity, setPositionQuantity] = useState(0);
  const [reportsQuantity, setReportsQuantity] = useState(0);
  const [advicesQuantity, setAdvicesQuantity] = useState(0);

  const [regulationsPerMonth, setRegulationsPerMonth] = useState([]);
  const [positionsPerMonth, setPositionsPerMonth] = useState([]);
  const [reportsPerMonth, setReportsPerMonth] = useState([]);
  const [advicesPerMonth, setAdvicesPerMonth] = useState([]);

  const [firstMonthValue, setFirstMonthValue] = useState("");
  const [lastMonthValue, setLastMonthValue] = useState("");
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const currentPage = document.location.pathname;
    localStorage.setItem('currentPage', currentPage);
    const previousPage = localStorage.getItem("previousPage");
    if (currentPage !== previousPage) {
        localStorage.setItem('previousPage', currentPage);
        window.location.reload();
    }

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
        const responseData = await axios.get('http://localhost:8098/api/v1/summarize/reports-per-month');
        return responseData.data;
      } catch (error) {
        console.error('Error sending data to the backend:', error);
      }
    };

    const fetchAdvicesPerMonth = async () => {
      try {
        const responseData = await axios.get('http://localhost:8098/api/v1/summarize/advices-per-month');
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
      setFirstMonthValue(tempLoadedPositionsPerMonth.length > 0 ? tempLoadedPositionsPerMonth[0].month : "");
      setLastMonthValue(tempLoadedPositionsPerMonth.length > 0 ? tempLoadedPositionsPerMonth[tempLoadedPositionsPerMonth.length - 1].month : "");
    };
    setFetchedData();
  }, []); 

  const errorToast = () => {
    const errorToast = (
      <CToast title="Error Message">
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
            <rect width="100%" height="100%" fill="#007aff"></rect>
          </svg>
          <strong className="me-auto">Error Message</strong>
          <small>7 min ago</small>
        </CToastHeader>
        <CToastBody/>
      </CToast>
    )
    return (
      <>
        <CButton onClick={() => addToast(errorToast)}>Send a toast</CButton>
        <CToaster ref={toaster} push={toast} placement="top-end" />
      </>
    )
  }

  return (
    <>
      <WidgetsDropdown />
      <CCard className="mb-4">
        <CCardBody>
          <CRow>
            <CCol sm={8}>
              <div id="traffic" style={{ color:"grey"}}>
                <b>Distribution Over a Year - [ Regulations - Positions - Reports - Advices ]</b>
              </div>
              <div style={{ color:"grey"}}>{lastMonthValue} {currentYear - 1} - {firstMonthValue} {currentYear}</div>
            </CCol>
            <CCol sm={4} className="d-none d-md-block">
              <CButton color="primary" className="float-end">
                <CIcon icon={cilCloudDownload} />
              </CButton>
              <CButtonGroup className="float-end me-3">
                {['Day', 'Month', 'Year'].map((value) => (
                  <CButton
                    color="outline-secondary"
                    key={value}
                    className="mx-0"
                    active={value === 'Month'}
                  >
                    {value}
                  </CButton>
                ))}
              </CButtonGroup>
            </CCol>
          </CRow>
          <CChartLine
            style={{ height: '250px', marginTop: '40px', backgroundColor: 'white' }}
            data={{
              labels: regulationsPerMonth?.reverse().map((e) => e.month),
              datasets: [
                {
                  label: 'Regulations',
                  backgroundColor: hexToRgba(getStyle('--cui-primary'), 80),
                  borderColor: getStyle('--cui-info'),
                  pointHoverBackgroundColor: getStyle('--cui-info'),
                  borderWidth: 3,
                  data: regulationsPerMonth?.map((e) => e.quantity),
                },
                {
                  label: 'Positions',
                  backgroundColor: hexToRgba(getStyle('--cui-success'), 80),
                  borderColor: getStyle('--cui-success'),
                  pointHoverBackgroundColor: getStyle('--cui-success'),
                  borderWidth: 3,
                  data: positionsPerMonth?.reverse().map((e) => e.quantity)
                },
                {
                  label: 'Reports',
                  backgroundColor: hexToRgba(getStyle('--cui-warning'), 80),
                  borderColor: getStyle('--cui-warning'),
                  pointHoverBackgroundColor: getStyle('--cui-danger'),
                  borderWidth: 3,
                  data: reportsPerMonth?.reverse().map((e) => e.quantity),
                },
                {
                  label: 'Advices',
                  backgroundColor: hexToRgba(getStyle('--cui-danger'), 100),
                  borderColor: getStyle('--cui-danger'),
                  pointHoverBackgroundColor: getStyle('--cui-danger'),
                  borderWidth: 3,
                  data: advicesPerMonth?.reverse().map((e) => e.quantity),
                },
              ],
            }}
            options={{
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  mode: 'index',
                  intersect: false,
                  backgroundColor: 'rgba(0, 0, 0)', 
                  titleColor: 'white', 
                  bodyColor: 'white', 
                  titleFont: {
                    size: 12, 
                  },
                  bodyFont: {
                    size: 6,
                  },
                  callbacks: {
                    title: (context) => {
                      const month = context[0].label;
                      return month; 
                    },
                    label: (context) => {
                      const dataset = context.dataset;
                      const quantity = dataset.data[context.dataIndex];
                      const label = dataset.label;
                      return `${label}: ${quantity}`;
                    },
                  },
                },
              },
              scales: {
                x: {
                  grid: {
                    drawOnChartArea: true,
                  },
                },
                y: {
                  ticks: {
                    beginAtZero: true,
                    maxTicksLimit: 5,
                    stepSize: Math.ceil(250 / 5),
                    max: 250,
                  },
                },
              },
              elements: {
                line: {
                  tension: 0.4,
                },
                point: {
                  radius: 5,
                  hitRadius: 10,
                  hoverRadius: 10,
                  hoverBorderWidth: 6,
                },
              },
            }}
          />
        </CCardBody>
      </CCard>
    </>
  )
}

export default Dashboard
