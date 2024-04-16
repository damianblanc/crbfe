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
        to: '/base/fciRegulationManager',
      },
      {
        component: CNavItem,
        name: 'FCI Regulation Position',
        to: '/base/fciRegulationPosition',
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
          to: '/report/FCIPositionBias',
        },
        {
          component: CNavItem,
          name: 'FCI Position Advices',
          to: '/base/fciPositionAdvice',
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
        to: '/base/configuration',
      },
      {
        component: CNavItem,
        name: 'FCI Specie Type Manager',
        to: '/base/configuration/specie',
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
