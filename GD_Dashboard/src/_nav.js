import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilSpeedometer,
  cilRoom,
  cilTag,
  cilStar,
  cilEnvelopeOpen,
  cilBuilding,
  cilCommentSquare,
  cilHome,
  cilSettings,
  cilTv,
  cilApps,
  cilMediaPlay,
  cilGroup,
} from '@coreui/icons'
import { CNavItem } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Room List',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    badge: {
      color: 'info',
      text: 'NEW',
    },
  },
  {
    component: CNavItem,
    name: 'Welcome Page',
    to: '/welcomepage',
    icon: <CIcon icon={cilHome} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Apps',
    to: '/apps',
    icon: <CIcon icon={cilApps} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Facilities',
    to: '/facilities',
    icon: <CIcon icon={cilBuilding} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Message',
    to: '/messages',
    icon: <CIcon icon={cilEnvelopeOpen} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Channel',
    to: '/channel',
    icon: <CIcon icon={cilMediaPlay} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Group',
    to: '/group',
    icon: <CIcon icon={cilGroup} customClassName="nav-icon" />,
  },
]

export default _nav
