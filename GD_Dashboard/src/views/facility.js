import React, { useState, useEffect, useMemo } from 'react';
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
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
} from '@coreui/react';

import CIcon from '@coreui/icons-react';
import { Tooltip } from '@mui/material';
import { cilPencil, cilTrash, cilArrowTop, cilArrowBottom } from '@coreui/icons';
import { useNavigate } from 'react-router-dom';
import './CSS/style.css'; // Import the CSS for animations
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
const Facility = () => {
    const [facilities, setFacilities] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [newFacility, setNewFacility] = useState({
        category: '',
        title: '',
        language: '',
        file_type: '',
        content: null,
    });
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [facilityToDelete, setFacilityToDelete] = useState(null); // Track which facility to delete
    const [animateRow, setAnimateRow] = useState(null); // Track which row to animate
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    useEffect(() => {

        fetchFacilities();
    }, []);
    const confirmDelete = (id) => {
        setFacilityToDelete(id); // Set the facility to delete
        setShowConfirmDelete(true); // Show the confirmation modal
    };
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore) {
                setPage((prev) => prev + 1); // Increment the page number
            }
        });

        const loadMoreRef = document.getElementById('load-more'); // Element to observe

        if (loadMoreRef) {
            observer.observe(loadMoreRef);
        }

        return () => {
            if (loadMoreRef) {
                observer.unobserve(loadMoreRef);
            }
        };
    }, [hasMore]);
    const fetchFacilities = () => {
        if (!hasMore) return; // Prevent fetching if there's no more data
        setLoading(true); // Set loading to true
        const token = localStorage.getItem('token');

        fetch(`http://localhost:3001/facilities?page=${page}`, { // Update to include page in the request
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
                if (data.length > 0) {
                    setFacilities((prev) => [...prev, ...data]); // Append new facilities to the list
                } else {
                    setHasMore(false); // No more facilities to fetch
                }
                setLoading(false); // Set loading to false
            })
            .catch((error) => {
                toast.error(`Error fetching facility list: ${error.message}`);
                console.error('Error fetching facility list:', error);
                setLoading(false); // Ensure loading is false on error
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
        const file = e.target.files[0];
        if (!file) return; // If no file selected, do nothing

        // File size validation (2MB limit)
        if (file.size > 30 * 1024 * 1024) { // 2MB limit
            toast.error('File size exceeds 30MB limit.');
            return;
        }

        // File type validation
        const file_type = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : '';
        if (!file_type) {
            toast.error('Unsupported file type. Please upload an image or video.');
            return;
        }

        setNewFacility({
            ...newFacility,
            content: file,
            file_type,
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewFacility({
            ...newFacility,
            [name]: value,
        });
    };

    const handleAddFacility = (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        // Validate input fields
        if (!newFacility.category || !newFacility.title || !newFacility.language || !newFacility.file_type) {
            toast.error('Please fill in all required fields.'); // Show error if fields are empty
            return; // Prevent form submission
        }
        setLoading(true);
        // Create a new FormData object
        const formData = new FormData();
        formData.append('category', newFacility.category);
        formData.append('title', newFacility.title);
        formData.append('language', newFacility.language);
        formData.append('file_type', newFacility.file_type);
        if (newFacility.content) {
            formData.append('content', newFacility.content); // Append the file
        }

        const url = editMode ? `http://localhost:3001/facilities/${newFacility.id}` : 'http://localhost:3001/facilities/add';
        const method = editMode ? 'PUT' : 'POST';

        fetch(url, {
            method,
            headers: {
                Authorization: token,
            },
            body: formData, // Send the FormData object as the request body
        })
            .then((response) => {
                if (response.status === 401 || response.status === 403) {
                    handleLogout();
                    throw new Error('Unauthorized access. Please log in again.');
                }
                if (!response.ok) {
                    throw new Error('Failed to save facility. Please check your input and try again.');
                }
                return response.json();
            })
            .then((data) => {
                if (data) {
                    toast.success('Facility saved successfully');
                    fetchFacilities(); // Re-fetch the facility list without a full page reload
                    setShowModal(false); // Close modal after saving
                }
            })
            .catch((error) => {
                toast.error(`Error adding facility: ${error.message}`);
                console.error('Error adding facility:', error);
                setLoading(false);
            });
    };

    const handleEdit = (facility) => {
        setNewFacility(facility);
        setShowModal(true);
        setEditMode(true);
    };

    const handleDelete = (id) => {
        const token = localStorage.getItem('token');

        fetch(`http://localhost:3001/facilities/${id}`, {
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
                    throw new Error('Failed to delete facility. Please try again later.');
                }
                return response.json();
            })
            .then(() => {
                // Filter out the deleted facility from the state
                setFacilities(facilities.filter((facility) => facility.id !== id));
                toast.success('Facility deleted successfully');
            })
            .catch((error) => {
                toast.error(`Error deleting facility: ${error.message}`);
                console.error('Error deleting facility:', error);
            });
    };

    const resetForm = () => {
        setNewFacility({
            category: '',
            title: '',
            language: '',
            file_type: '',
            content: null,
        });
        setEditMode(false);
    };

    const handleMoveUp = (index) => {
        if (index === 0 || !facilities || facilities.length === 0) {
            toast.warning('Cannot move the facility up.'); // Directly use toast
            return;
        }
        const newFacilities = [...facilities];
        [newFacilities[index - 1], newFacilities[index]] = [newFacilities[index], newFacilities[index - 1]];
        setFacilities(newFacilities);
        setAnimateRow(index - 1);
        setTimeout(() => setAnimateRow(null), 500);
        toast.info('Facility moved up successfully'); // Directly use toast
    };

    const handleMoveDown = (index) => {
        if (index === facilities.length - 1 || !facilities || facilities.length === 0) {
            toast.warning('Cannot move the facility down.'); // Directly use toast
            return;
        }
        const newFacilities = [...facilities];
        [newFacilities[index + 1], newFacilities[index]] = [newFacilities[index], newFacilities[index + 1]];
        setFacilities(newFacilities);
        setAnimateRow(index + 1);
        setTimeout(() => setAnimateRow(null), 500);
        toast.info('Facility moved down successfully'); // Directly use toast
    };

    return (
        <CCard>
            <CCardHeader>
                Hotel Facility List
                <CButton color="primary" className="float-end" onClick={() => setShowModal(!showModal)}>
                    {showModal ? 'Cancel' : 'Add Facility'}
                </CButton>
            </CCardHeader>

            <CCardBody>
                {loading ? ( // Show loading indicator
                    <div className="text-center">
                        <p>Loading...</p> {/* Or you can use a spinner component here */}
                    </div>
                ) : error ? ( // Check for error and show fallback UI
                    <div className="text-center">
                        <h5>{error}</h5> {/* Show the error message */}
                    </div>
                ) : (
                    <CTable striped hover>
                        <CTableHead>
                            <CTableRow>
                                <CTableHeaderCell>Order</CTableHeaderCell>
                                <CTableHeaderCell>Category</CTableHeaderCell>
                                <CTableHeaderCell>Title</CTableHeaderCell>
                                <CTableHeaderCell>Language</CTableHeaderCell>
                                <CTableHeaderCell>File Type</CTableHeaderCell>
                                <CTableHeaderCell>Content</CTableHeaderCell>
                                <CTableHeaderCell>Actions</CTableHeaderCell>
                                <CTableHeaderCell>Created at</CTableHeaderCell>
                                <CTableHeaderCell>Updated at</CTableHeaderCell>
                            </CTableRow>
                        </CTableHead>

                        <CTableBody>
                            <TransitionGroup component={null}>
                                {facilities.map((facility, index) => (
                                    <CSSTransition key={facility.id} timeout={300} classNames="facility">
                                        <CTableRow className={animateRow === index ? 'move-animation' : ''}>
                                            <CTableDataCell>{index + 1}</CTableDataCell>
                                            <CTableDataCell>{facility.category}</CTableDataCell>
                                            <CTableDataCell>{facility.title}</CTableDataCell>
                                            <CTableDataCell>{facility.language}</CTableDataCell>
                                            <CTableDataCell>{facility.file_type}</CTableDataCell>
                                            <CTableDataCell>
                                                {facility.file_type === 'image' ? (
                                                    <img src={`http://localhost:3001/uploads/${facility.content}`} alt={facility.title} style={{ width: '100px' }} />
                                                ) : facility.file_type === 'video' ? (
                                                    <video src={`http://localhost:3001/uploads/${facility.content}`} controls style={{ width: '100px' }} />
                                                ) : (
                                                    <span>Unsupported file type</span>
                                                )}
                                            </CTableDataCell>
                                            
                                            <CTableDataCell>
                                                <Tooltip title="Edit" arrow>
                                                    <CButton color="success" size="sm" className="m-1" onClick={() => handleEdit(facility)}>
                                                        <CIcon icon={cilPencil} />
                                                    </CButton>
                                                </Tooltip>
                                                <Tooltip title="Delete" arrow>
                                                    <CButton color="danger" size="sm" className="m-1" onClick={() => confirmDelete(facility.id)}>
                                                        <CIcon icon={cilTrash} />
                                                    </CButton>
                                                </Tooltip>
                                                <Tooltip title="Move Up" arrow>
                                                    <CButton color="dark" size="sm" className="m-1" onClick={() => handleMoveUp(index)}>
                                                        <CIcon icon={cilArrowTop} />
                                                    </CButton>
                                                </Tooltip>
                                                <Tooltip title="Move Down" arrow>
                                                    <CButton color="dark" size="sm" className="m-1" onClick={() => handleMoveDown(index)}>
                                                        <CIcon icon={cilArrowBottom} />
                                                    </CButton>
                                                </Tooltip>
                                            </CTableDataCell>
                                            <CTableDataCell>{new Date(facility.created_at).toLocaleString()}</CTableDataCell>
                                            <CTableDataCell>{new Date(facility.updated_at).toLocaleString()}</CTableDataCell>
                                        </CTableRow>
                                    </CSSTransition>
                                ))}
                            </TransitionGroup>
                        </CTableBody>
                    </CTable>
                )}
            </CCardBody>
            <ToastContainer position="top-right" autoClose={3000} />
            <CModal visible={showConfirmDelete} onClose={() => setShowConfirmDelete(false)}>
                <CModalHeader onClose={() => setShowConfirmDelete(false)}>
                    <CModalTitle>Confirm Deletion</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    Are you sure you want to delete this facility?
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setShowConfirmDelete(false)}>
                        Cancel
                    </CButton>
                    <CButton color="danger" onClick={() => {
                        handleDelete(facilityToDelete);
                        setShowConfirmDelete(false);
                    }}>
                        Delete
                    </CButton>
                </CModalFooter>
            </CModal>
            <CModal visible={showModal} onClose={() => setShowModal(false)}>
                <CModalHeader onClose={() => setShowModal(false)}>
                    <CModalTitle>{editMode ? 'Edit Facility' : 'Add Facility'}</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CForm>
                        <CFormInput
                            type="text"
                            name="category"
                            placeholder="Category"
                            value={newFacility.category || ''}
                            onChange={handleInputChange}
                            className="mb-3"
                        />
                        <CFormInput
                            type="text"
                            name="title"
                            placeholder="Title"
                            value={newFacility.title || ''}
                            onChange={handleInputChange}
                            className="mb-3"
                        />
                        <CFormInput
                            type="text"
                            name="language"
                            placeholder="Language"
                            value={newFacility.language || ''}
                            onChange={handleInputChange}
                            className="mb-3"
                        />
                        <CFormInput
                            type="file"
                            name="content"
                            accept="image/*,video/*"
                            onChange={handleFileChange}
                            className="mb-3"
                        />
                        <CFormInput
                            type="text"
                            name="file_type"
                            placeholder="File Type"
                            value={newFacility.file_type || ''}
                            readOnly
                            className="mb-3"
                        />
                    </CForm>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </CButton>
                    <CButton color="success" onClick={handleAddFacility}>
                        Save Facility
                    </CButton>
                </CModalFooter>
            </CModal>
        </CCard>
    );
}

export default Facility;