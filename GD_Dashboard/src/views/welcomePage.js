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
    CFormSelect,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CNav,
    CNavItem,
    CNavLink,
} from '@coreui/react';

import CIcon from '@coreui/icons-react';
import { Tooltip } from '@mui/material';
import { cilPencil, cilTrash, cilArrowTop, cilArrowBottom } from '@coreui/icons';
import { useNavigate } from 'react-router-dom';
import './CSS/style.css'; // Import CSS for animations
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const sections = [
    { label: 'Welcome Section', value: 'welcome' },
    { label: 'Home Section', value: 'home' },
    { label: 'Facility Section', value: 'facility' },
    { label: 'Live TV Section', value: 'live_tv' },
    { label: 'Message Section', value: 'message' },
];

const Activity = () => {
    const [activity, setActivity] = useState([]);
    const [activeSection, setActiveSection] = useState('welcome');
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [newActivity, setNewActivity] = useState({
        title: '',
        section: '',
        logo: null,
        image: null,
        video: null,
        additionalText: '',
    });
    const [errorMessage, setErrorMessage] = useState('');
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [activityToDelete, setActivityToDelete] = useState(null);
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        setActivity([]); // Clear previous data before fetching new data
        setPage(1);      // Reset pagination to start from the first page
        setHasMore(true);
        fetchActivity();
    }, [activeSection]);

    const fetchActivity = () => {
        if (!hasMore) return;
        setLoading(true);
        const token = localStorage.getItem('token');
    
        fetch(`http://localhost:3001/activity?section=${activeSection}&page=${page}`, {
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
                // Check for duplicates
                const existingIds = new Set(activity.map(item => item.id));
                const newActivities = data.filter(item => !existingIds.has(item.id));
                
                if (newActivities.length > 0) {
                    setActivity((prev) => [...prev, ...newActivities]);
                } else {
                    setHasMore(false);
                }
                setLoading(false);
            })
            .catch((error) => {
                toast.error(`Error fetching activity list: ${error.message}`);
                setLoading(false);
            });
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        toast.error('Your session has timed out. Please log in again.');
        setTimeout(() => {
            navigate('/login');
        }, 3000);
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        const file = files[0];
        if (file && file.size <= 30 * 1024 * 1024) {
            setNewActivity((prev) => ({
                ...prev,
                [name]: file,
            }));
        } else {
            toast.error('File size exceeds 30MB limit.');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewActivity({
            ...newActivity,
            [name]: value,
        });
    };

    const handleAddActivity = (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        if (!newActivity.title || !newActivity.section || !newActivity.image) {
            toast.error('Please fill in all required fields.');
            return;
        }
        setLoading(true);

        const formData = new FormData();
        formData.append('title', newActivity.title);
        formData.append('section', newActivity.section);
        formData.append('additional_text', newActivity.additionalText);
        if (newActivity.logo) formData.append('logo', newActivity.logo);
        if (newActivity.image) formData.append('image', newActivity.image);
        if (newActivity.video) formData.append('video', newActivity.video);

        const url = editMode ? `http://localhost:3001/activity/${newActivity.id}` : 'http://localhost:3001/activity/add';
        const method = editMode ? 'PUT' : 'POST';

        fetch(url, {
            method,
            headers: {
                Authorization: token,
            },
            body: formData,
        })
            .then((response) => {
                if (response.status === 401 || response.status === 403) {
                    handleLogout();
                    throw new Error('Unauthorized access. Please log in again.');
                }
                if (!response.ok) {
                    throw new Error('Failed to save activity. Please check your input and try again.');
                }
                return response.json();
            })
            .then(() => {
                toast.success('Activity saved successfully');
                fetchActivity();
                setShowModal(false);
                setLoading(false);
            })
            .catch((error) => {
                toast.error(`Error adding activity: ${error.message}`);
                setLoading(false);
            });
    };

    const confirmDelete = (id) => {
        setActivityToDelete(id);
        setShowConfirmDelete(true);
    };

    const handleDelete = () => {
        const token = localStorage.getItem('token');
        fetch(`http://localhost:3001/activity/${activityToDelete}`, {
            method: 'DELETE',
            headers: {
                Authorization: token,
            },
        })
            .then((response) => {
                if (response.status === 401 || response.status === 403) {
                    handleLogout();
                    throw new Error('Unauthorized access. Please log in again.');
                }
                if (!response.ok) {
                    throw new Error('Failed to delete activity. Please try again later.');
                }
                setActivity(activity.filter((item) => item.id !== activityToDelete));
                toast.success('Activity deleted successfully');
                setShowConfirmDelete(false);
            })
            .catch((error) => {
                toast.error(`Error deleting activity: ${error.message}`);
            });
    };

    const resetForm = () => {
        setNewActivity({
            title: '',
            section: '',
            logo: null,
            image: null,
            video: null,
            additionalText: '',
        });
        setEditMode(false);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleMoveUp = (id) => {
        // Find the index of the activity by its ID
        const index = activity.findIndex(item => item.id === id);
    
        // Ensure index is valid
        if (index <= 0 || !activity || activity.length <= 1) {
            toast.warning('Cannot move the activity up.');
            return;
        }
    
        // Create a new copy of the activities array
        const newActivity = [...activity];
    
        // Swap the current item with the one above it
        [newActivity[index - 1], newActivity[index]] = [newActivity[index], newActivity[index - 1]];
    
        // Update the activity state with the new array
        setActivity(newActivity);
        toast.info('Activity moved up successfully');
    };

    const handleMoveDown = (id) => {
        // Find the index of the activity by its ID
        const index = activity.findIndex(item => item.id === id);
    
        // Ensure index is valid and that it's not already the last item
        if (index === -1 || index >= activity.length - 1) {
            toast.warning('Cannot move the activity down.');
            return;
        }
    
        // Create a new copy of the activities array
        const newActivity = [...activity];
    
        // Swap the current item with the one below it
        [newActivity[index], newActivity[index + 1]] = [newActivity[index + 1], newActivity[index]];
    
        // Update the activity state with the new array
        setActivity(newActivity);
        toast.info('Activity moved down successfully');
    };

    return (
        <CCard>
            <CCardHeader>
                Activity Management
                <CButton color="primary" className="float-end" onClick={() => setShowModal(!showModal)}>
                    {showModal ? 'Cancel' : 'Upload New Activity'}
                </CButton>
            </CCardHeader>

            <CNav variant="tabs" className="mb-3">
                {sections.map(({ label, value }) => (
                    <CNavItem key={value}>
                        <CNavLink active={activeSection === value} onClick={() => setActiveSection(value)}>
                            {label}
                        </CNavLink>
                    </CNavItem>
                ))}
            </CNav>

            <CCardBody>
                {/* Search Bar Input */}
                <CFormInput
                    type="text"
                    placeholder="Search by title"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="mb-3"    
                />
                
                {/* Data Table */}
                <CTable>
                    <CTableHead>
                        <CTableRow>
                            <CTableHeaderCell>Title</CTableHeaderCell>
                            <CTableHeaderCell>Logo</CTableHeaderCell>
                            <CTableHeaderCell>Image</CTableHeaderCell>
                            <CTableHeaderCell>Video</CTableHeaderCell>
                            <CTableHeaderCell>Additional Text</CTableHeaderCell>
                            <CTableHeaderCell>Actions</CTableHeaderCell>
                        </CTableRow>
                    </CTableHead>

                    <CTableBody>
                        {activity
                            .filter((item) => 
                                item.section === activeSection &&
                                item.title.toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .map((item, index) => (
                                <CTableRow key={item.id}>
                                    <CTableDataCell>{item.title}</CTableDataCell>
                                    <CTableDataCell>{item.logo && <img src={item.logo} alt="Logo" width="50" />}</CTableDataCell>
                                    <CTableDataCell>{item.image && <img src={item.image} alt="Image" width="50" />}</CTableDataCell>
                                    <CTableDataCell>
                                        {item.video && (
                                            <video width="50" controls>
                                                <source src={item.video} />
                                            </video>
                                        )}
                                    </CTableDataCell>
                                    <CTableDataCell>{item.additional_text}</CTableDataCell>
                                    <CTableDataCell>
                                        <Tooltip title="Edit" arrow>
                                            <CButton color="success" size='sm' className="m-1" onClick={() => handleEdit(item)}>
                                                <CIcon icon={cilPencil} />
                                            </CButton>
                                        </Tooltip>

                                        <Tooltip title="Delete" arrow>
                                            <CButton color="danger" size='sm' className="m-1" onClick={() => confirmDelete(item.id)}>
                                                <CIcon icon={cilTrash} />
                                            </CButton>
                                        </Tooltip>

                                        <Tooltip title="Move Up" arrow>
                                            <CButton 
                                                color="dark" 
                                                size="sm" 
                                                className="m-1" 
                                                onClick={() => handleMoveUp(item.id)}
                                                disabled={index === 0} // Disable button if at the top
                                            >
                                                <CIcon icon={cilArrowTop} />
                                            </CButton>
                                        </Tooltip>

                                        <Tooltip title="Move Down" arrow>
                                            <CButton 
                                                color="dark" 
                                                size="sm" 
                                                className="m-1" 
                                                onClick={() => handleMoveDown(item.id)}
                                                disabled={index === activity.length - 1} // Disable button if at the bottom
                                            >
                                                <CIcon icon={cilArrowBottom} />
                                            </CButton>
                                        </Tooltip>
                                    </CTableDataCell>
                                </CTableRow>
                            ))}
                    </CTableBody>

                </CTable>
            </CCardBody>

            {/* Add/Edit Activity Modal */}
            <CModal visible={showModal} onClose={() => setShowModal(false)}>
                <CModalHeader>
                    <CModalTitle>{editMode ? 'Edit Activity' : 'Add New Activity'}</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CForm>
                        <CFormInput
                            type="text"
                            label="Title"
                            name="title"
                            value={newActivity.title}
                            onChange={handleInputChange}
                            required
                        />
                        <CFormSelect
                            label="Section"
                            name="section"
                            value={newActivity.section}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Select Section</option>
                            {sections.map((section) => (
                                <option key={section.value} value={section.value}>
                                    {section.label}
                                </option>
                            ))}
                        </CFormSelect>
                        <CFormInput
                            type="file"
                            label="Logo"
                            name="logo"
                            onChange={handleFileChange}
                        />
                        <CFormInput
                            type="file"
                            label="Image"
                            name="image"
                            onChange={handleFileChange}
                            required
                        />
                        <CFormInput
                            type="file"
                            label="Video"
                            name="video"
                            onChange={handleFileChange}
                        />
                        <CFormInput
                            type="text"
                            label="Additional Text"
                            name="additionalText"
                            value={newActivity.additionalText}
                            onChange={handleInputChange}
                        />
                    </CForm>
                </CModalBody>
                <CModalFooter>
                    <CButton color="primary" onClick={handleAddActivity}>
                        Save
                    </CButton>
                    <CButton color="secondary" onClick={resetForm}>
                        Cancel
                    </CButton>
                </CModalFooter>
            </CModal>

            {/* Confirm Delete Modal */}
            <CModal visible={showConfirmDelete} onClose={() => setShowConfirmDelete(false)}>
                <CModalHeader>
                    <CModalTitle>Confirm Deletion</CModalTitle>
                </CModalHeader>
                <CModalBody>Are you sure you want to delete this activity?</CModalBody>
                <CModalFooter>
                    <CButton color="danger" onClick={handleDelete}>
                        Delete
                    </CButton>
                    <CButton color="secondary" onClick={() => setShowConfirmDelete(false)}>
                        Cancel
                    </CButton>
                </CModalFooter>
            </CModal>

            <ToastContainer />
        </CCard>
    );
};

export default Activity;
