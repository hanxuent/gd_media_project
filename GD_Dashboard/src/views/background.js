import React, { useState } from 'react';
import { CCard, CCardBody, CCardHeader, CButton, CForm, CFormInput, CToaster, CToast, CToastBody, CToastHeader } from '@coreui/react';

const BackgroundSettings = () => {
    const [logos, setLogos] = useState([]);
    const [images, setImages] = useState([]);
    const [videos, setVideos] = useState([]);
    const [category, setCategory] = useState('facility');
    const [toast, addToast] = useState([]);

    const handleFileChange = (e, setFiles) => {
        setFiles(Array.from(e.target.files));
    };

    const handleUpload = (e) => {
        e.preventDefault();

        const formData = new FormData();
        
        logos.forEach((logo, index) => formData.append(`logos[${index}]`, logo));
        images.forEach((image, index) => formData.append(`images[${index}]`, image));
        videos.forEach((video, index) => formData.append(`videos[${index}]`, video));

        formData.append('category', category);

        fetch('http://localhost:3001/upload-background', {
            method: 'POST',
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                addToast(createToast('Files uploaded successfully', 'success'));
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
            <CCardHeader>Upload Logos, Images, and Videos</CCardHeader>
            <CCardBody>
                <CForm onSubmit={handleUpload}>
                    {/* Logos Upload */}
                    <CFormInput
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleFileChange(e, setLogos)}
                        className="mb-3"
                    />
                    
                    {/* Images Upload */}
                    <CFormInput
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleFileChange(e, setImages)}
                        className="mb-3"
                    />

                    {/* Videos Upload */}
                    <CFormInput
                        type="file"
                        accept="video/*"
                        multiple
                        onChange={(e) => handleFileChange(e, setVideos)}
                        className="mb-3"
                    />

                    {/* Dropdown for selecting category */}
                    <select
                        onChange={(e) => setCategory(e.target.value)}
                        className="mb-3 form-select"
                    >
                        <option value="facility">Facility</option>
                        <option value="message">Message</option>
                        <option value="livetv">Live TV</option>
                    </select>

                    <CButton type="submit" color="primary">Upload Files</CButton>
                </CForm>
            </CCardBody>
            <CToaster position="top-right">{toast}</CToaster>
        </CCard>
    );
};

export default BackgroundSettings;
