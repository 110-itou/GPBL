import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { UserProvider } from './contexts/UserContext'
import UserSelection from './components/UserSelection'
import AdminDashboard from './components/AdminDashboard'
import VendorDashboard from './components/VendorDashboard'
import MapSelector from './components/MapSelector'
import DeliveryRegistration from './components/DeliveryRegistration'
import DeliveryList from './components/DeliveryList'
import DeliveryDetail from './components/DeliveryDetail'
import DeliveryEdit from './components/DeliveryEdit'
import LocationChange from './components/LocationChange'
import MasterManagement from './components/MasterManagement'

function App() {
  return (
    <UserProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<UserSelection />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/vendor" element={<VendorDashboard />} />
            <Route path="/map-selector" element={<MapSelector />} />
            <Route path="/delivery-registration" element={<DeliveryRegistration />} />
            <Route path="/delivery-list" element={<DeliveryList />} />
            <Route path="/delivery/:id" element={<DeliveryDetail />} />
            <Route path="/delivery/:id/edit" element={<DeliveryEdit />} />
            <Route path="/delivery/:id/location-change" element={<LocationChange />} />
            <Route path="/master-management" element={<MasterManagement />} />
          </Routes>
        </div>
      </Router>
    </UserProvider>
  )
}

export default App
