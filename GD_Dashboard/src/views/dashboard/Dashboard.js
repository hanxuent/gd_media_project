import React, { useState, useEffect } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CButton,
  CForm,
  CFormInput,
  CFormCheck,
  CAlert,
  CToast,
  CToastBody,
  CToastHeader,
  CToaster,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react';
import { cilPencil, cilTrash } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { useNavigate } from 'react-router-dom';

const RoomList = () => {
  const [rooms, setRooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');  // search 
  const [selectedRooms, setSelectedRooms] = useState([]);  //select room
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [newRoom, setNewRoom] = useState({
    room_number: '',
    device_ip: '',
    mac_address: '',
    j_version: '',
    active_status: false,
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [toast, addToast] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    fetch('http://localhost:3001/rooms', {
      headers: {
        Authorization: token,
      },
    })
      .then((response) => {
        if (response.status === 401 || response.status === 403) {
          handleLogout();
          throw new Error('Unauthorized');
        }
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => setRooms(data))
      .catch((error) => console.error('Error fetching room list:', error));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    addToast(createToast('Your session has timed out. Please log in again.', 'danger'));
    setTimeout(() => {
      navigate('/login');
    }, 3000); // Redirect after 3 seconds to allow the user to see the toast message
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewRoom({
      ...newRoom,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleAddRoom = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const url = editMode ? `http://localhost:3001/rooms/${newRoom.id}` : 'http://localhost:3001/rooms/add';
    const method = editMode ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      body: JSON.stringify(newRoom),
    })
      .then((response) => {
        if (response.status === 401 || response.status === 403) {
          handleLogout();
          throw new Error('Unauthorized');
        }
        if (response.status === 409) {
          setErrorMessage('Room number already exists.');
          addToast(createToast('Room number already exists', 'danger'));
          return;
        }
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        if (data) {
          const updatedRooms = editMode
            ? rooms.map((room) => (room.id === newRoom.id ? { ...room, ...newRoom } : room))
            : [...rooms, data.room];
          setRooms(updatedRooms);
          setNewRoom({
            room_number: '',
            device_ip: '',
            mac_address: '',
            j_version: '',
            active_status: false,
          });
          setShowModal(false);
          setEditMode(false);
          addToast(createToast('Room saved successfully', 'success'));
        }
      })
      .catch((error) => console.error('Error adding room:', error));
  };

  const handleEdit = (room) => {
    setNewRoom(room);
    setShowModal(true);
    setEditMode(true);
  };

  const handleDelete = (id) => {
    const token = localStorage.getItem('token');

    fetch(`http://localhost:3001/rooms/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: token,
      },
    })
      .then((response) => {
        if (response.status === 401 || response.status === 403) {
          handleLogout();
          throw new Error('Unauthorized');
        }
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        setRooms(rooms.filter((room) => room.id !== id));
        addToast(createToast('Room deleted successfully', 'success'));
      })
      .catch((error) => console.error('Error deleting room:', error));
  };

  const createToast = (message, color) => (
    <CToast autohide={true} delay={3000} color={color}>
      <CToastHeader closeButton>{message}</CToastHeader>
      <CToastBody>{message}</CToastBody>
    </CToast>
  );

  const handleSelectRoom = (roomId) => {  // handle selection 
    setSelectedRooms((prevSelected) =>
      prevSelected.includes(roomId)
        ? prevSelected.filter((id) => id !== roomId)
        : [...prevSelected, roomId]
    );
  };

  const filteredRooms = rooms.filter((room) =>
    room.room_number.toString().includes(searchTerm)  
  );

  return (
    <CCard>
      <CCardHeader>
        Hotel Room List
        <CButton color="warning" className="float-end" onClick={() => setShowModal(!showModal)}>
          {showModal ? 'Cancel' : 'Add Room'}
        </CButton>
      </CCardHeader>
      <CCardBody>
      <CFormInput
          type="text"
          placeholder="Search by Room Number"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}  
          className="mb-3"
        />
        <CTable striped hover>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell></CTableHeaderCell>  {/* New column for checkboxes */}
              <CTableHeaderCell>Room Number</CTableHeaderCell>
              <CTableHeaderCell>IP Address</CTableHeaderCell>
              <CTableHeaderCell>MAC Address</CTableHeaderCell>
              <CTableHeaderCell>Active</CTableHeaderCell>
              <CTableHeaderCell>Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredRooms.map((room, index) => (
              <CTableRow
                key={index}
                className={selectedRooms.includes(room.id) ? 'table-info' : ''} 
              >
                <CTableDataCell>
                  <CFormCheck
                    type="checkbox"
                    checked={selectedRooms.includes(room.id)}  
                    onChange={() => handleSelectRoom(room.id)}  
                  />
                </CTableDataCell>
                <CTableDataCell>{room.room_number}</CTableDataCell>
                <CTableDataCell>{room.device_ip}</CTableDataCell>
                <CTableDataCell>{room.mac_address}</CTableDataCell>
                <CTableDataCell>{room.active_status ? 'Yes' : 'No'}</CTableDataCell>
                <CTableDataCell>
                  <CButton color="info" size="sm" onClick={() => handleEdit(room)}>
                    <CIcon icon={cilPencil} />
                  </CButton>{' '}
                  <CButton color="danger" size="sm" onClick={() => handleDelete(room.id)}>
                    <CIcon icon={cilTrash} />
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </CCardBody>
      <CToaster position="top-right">{toast}</CToaster>

      <CModal visible={showModal} onClose={() => setShowModal(false)}>
        <CModalHeader onClose={() => setShowModal(false)}>
          <CModalTitle>{editMode ? 'Edit Room' : 'Add Room'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput
              type="text"
              name="room_number"
              placeholder="Room Number"
              value={newRoom.room_number}
              onChange={handleInputChange}
              className="mb-3"
            />
            <CFormInput
              type="text"
              name="device_ip"
              placeholder="IP Address"
              value={newRoom.device_ip}
              onChange={handleInputChange}
              className="mb-3"
            />
            <CFormInput
              type="text"
              name="mac_address"
              placeholder="MAC Address"
              value={newRoom.mac_address}
              onChange={handleInputChange}
              className="mb-3"
            />
            <CFormInput
              type="text"
              name="j_version"
              placeholder="J Version"
              value={newRoom.j_version}
              onChange={handleInputChange}
              className="mb-3"
            />
            <CFormCheck
              type="checkbox"
              name="active_status"
              label="Active"
              checked={newRoom.active_status}
              onChange={handleInputChange}
              className="mb-3"
            />
            {errorMessage && <CAlert color="danger">{errorMessage}</CAlert>}
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </CButton>
          <CButton color="success" onClick={handleAddRoom}>
            Save Room
          </CButton>
        </CModalFooter>
      </CModal>
    </CCard>
  );
};

export default RoomList;
