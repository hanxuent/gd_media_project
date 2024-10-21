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
    CToaster,
    CToast,
    CToastBody,
    CToastHeader,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
} from '@coreui/react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Activity = () => {
    const [activities, setActivities] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [newActivity, setNewActivity] = useState({
        title: '',
        section: '',
        logo: null,
        image: null,
        video: null,
        additionalText: '',
        start_date: new Date(),
        end_date: new Date(),
    });
    
    const [toast, addToast] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');

        fetch('http://localhost:3001/activity', {
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
                console.log(data);
                setActivities(data);
            })
            .catch((error) => console.error('Error fetching activity list:', error));
    }, []);

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setNewActivity({
            ...newActivity,
            [name]: files[0], // Only support single file for each type
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewActivity({
            ...newActivity,
            [name]: value,
        });
    };

    const handleStartDateChange = (date) => {
        setNewActivity({
            ...newActivity,
            start_date: date,
        });
    };

    const handleEndDateChange = (date) => {
        setNewActivity({
            ...newActivity,
            end_date: date,
        });
    };

    const handleAddActivity = (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        const formData = new FormData();
        formData.append('title', newActivity.title);
        formData.append('section', newActivity.section);
        formData.append('logo', newActivity.logo);
        formData.append('image', newActivity.image);
        formData.append('video', newActivity.video);
        formData.append('additional_text', newActivity.additionalText);
        formData.append('start_date', newActivity.start_date.toISOString());
        formData.append('end_date', newActivity.end_date.toISOString());

        fetch('http://localhost:3001/activity/add', {
            method: 'POST',
            headers: {
                Authorization: token,
            },
            body: formData,
        })
        
            .then((response) => response.json())
            .then((data) => {
                setActivities([...activities, data.activity]); // Append the new activity to the list
                setShowModal(false);
                addToast(createToast('Activity added successfully', 'success'));
            })
            .catch((error) => console.error('Error uploading files:', error));
    };

    const createToast = (message, color) => (
        <CToast autohide={true} delay={3000} color={color}>
            <CToastHeader closeButton>{message}</CToastHeader>
            <CToastBody>{message}</CToastBody>
        </CToast>
    );

    return (
        <CCard>
            <CCardHeader>
                <h5>Activity Management</h5>
                <CButton color="primary" onClick={() => setShowModal(true)}>
                    Add New Activity
                </CButton>
            </CCardHeader>
            <CCardBody>
                <CTable>
                    <CTableHead>
                        <CTableRow>
                            <CTableHeaderCell>Title</CTableHeaderCell>
                            <CTableHeaderCell>Section</CTableHeaderCell>
                            <CTableHeaderCell>Logo</CTableHeaderCell>
                            <CTableHeaderCell>Image</CTableHeaderCell>
                            <CTableHeaderCell>Video</CTableHeaderCell>
                            <CTableHeaderCell>Additional Text</CTableHeaderCell>
                            <CTableHeaderCell>Start Date</CTableHeaderCell>
                            <CTableHeaderCell>End Date</CTableHeaderCell>
                        </CTableRow>
                    </CTableHead>
                    <CTableBody>
                        {activities.map((activity) => (
                            <CTableRow key={activity.id}>
                                <CTableDataCell>{activity.title}</CTableDataCell>
                                <CTableDataCell>{activity.section}</CTableDataCell>
                                <CTableDataCell>{activity.logo}</CTableDataCell>
                                <CTableDataCell>{activity.image}</CTableDataCell>
                                <CTableDataCell>{activity.video}</CTableDataCell>
                                <CTableDataCell>{activity.additional_text}</CTableDataCell>
                                <CTableDataCell>{new Date(activity.start_date).toLocaleString()}</CTableDataCell>
                                <CTableDataCell>{new Date(activity.end_date).toLocaleString()}</CTableDataCell>
                            </CTableRow>
                        ))}
                    </CTableBody>
                </CTable>
            </CCardBody>

            <CToaster position="top-right">{toast}</CToaster>

            <CModal visible={showModal} onClose={() => setShowModal(false)}>
                <CModalHeader onClose={() => setShowModal(false)}>
                    <CModalTitle>Add New Activity</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CForm onSubmit={handleAddActivity}>
                        <CFormInput
                            label="Title"
                            name="title"
                            value={newActivity.title}
                            onChange={handleInputChange}
                            required
                        />
                        <CFormInput
                            label="Section"
                            name="section"
                            value={newActivity.section}
                            onChange={handleInputChange}
                            required
                        />
                        <CFormInput
                            label="Upload Logo"
                            type="file"
                            name="logo"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        <CFormInput
                            label="Upload Image"
                            type="file"
                            name="image"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        <CFormInput
                            label="Upload Video"
                            type="file"
                            name="video"
                            accept="video/*"
                            onChange={handleFileChange}
                        />
                        <CFormInput
                            label="Additional Text"
                            name="additionalText"
                            value={newActivity.additionalText}
                            onChange={handleInputChange}
                            required
                        />
                        <div>
                            <label>Start Date</label>
                            <DatePicker
                                selected={newActivity.start_date}
                                onChange={handleStartDateChange}
                                showTimeSelect
                                dateFormat="Pp"
                            />
                        </div>
                        <div>
                            <label>End Date</label>
                            <DatePicker
                                selected={newActivity.end_date}
                                onChange={handleEndDateChange}
                                showTimeSelect
                                dateFormat="Pp"
                            />
                        </div>
                        <CButton type="submit" color="primary">Save Activity</CButton>
                    </CForm>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </CButton>
                </CModalFooter>
            </CModal>
        </CCard>
    );
};

export default Activity;
