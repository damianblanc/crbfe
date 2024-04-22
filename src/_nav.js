import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilBatteryFull,
  cilBell,
  cilCalculator,
  cilChartPie,
  cilCursor,
  cilDescription,
  cilDrop,
  cilNotes,
  cilPencil,
  cilPuzzle,
  cilSpeedometer,
  cilStar,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'FCI Regulation',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'FCI Operations',
  },
  {
    component: CNavGroup,
    name: 'Process Actions',
    to: '/base',
    icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'FCI Regulation Management',
        to: '/base/regulation-management',
      },
      {
        component: CNavItem,
        name: 'FCI Regulation Position',
        to: '/base/position-management',
      },
  ]},
  {
    component: CNavGroup,
    name: 'Reports & Analisys',
    to: '/report',
    icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
    items: [
        {
          component: CNavItem,
          name: 'FCI Position Bias',
          to: '/report/report-management',
        },
        {
          component: CNavItem,
          name: 'FCI Position Advices',
          to: '/base/advice-management',
        },
      ],
  },
  {
    component: CNavGroup,
    name: 'Configuration',
    to: '/base',
    icon: <CIcon icon={cilStar} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'FCI Group Manager',
        to: '/base/configuration/groups-management',
      },
      {
        component: CNavItem,
        name: 'FCI Specie Type Manager',
        to: '/base/configuration/species-management',
      }
    ],
  },
  // {
  //   component: CNavItem,
  //   name: 'Docs',
  //   href: 'https://coreui.io/react/docs/templates/installation/',
  //   icon: <CIcon icon={cilDescription} customClassName="nav-icon" />,
  // },
]

export default _nav
