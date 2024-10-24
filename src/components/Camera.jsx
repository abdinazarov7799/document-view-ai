import React, { useRef, useState, useEffect } from 'react';
import Tesseract from 'tesseract.js'; // Tesseract.js ni import qilamiz

const Camera = () => {
    const videoRef = useRef(null);
    const [devices, setDevices] = useState([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [ocrResult, setOcrResult] = useState(''); // OCR natijasi uchun

    useEffect(() => {
        // Kameralar ro'yxatini olish
        navigator.mediaDevices.enumerateDevices().then((deviceInfos) => {
            const videoDevices = deviceInfos.filter(device => device.kind === 'videoinput');
            setDevices(videoDevices);
            const backCamera = videoDevices.find(device => device.label.toLowerCase().includes('back')) || videoDevices[0];
            setSelectedDeviceId(backCamera.deviceId); // Default orqa kamera
        });
    }, []);

    useEffect(() => {
        if (selectedDeviceId) {
            startCamera();
        }
    }, [selectedDeviceId]);

    const startCamera = async () => {
        if (selectedDeviceId) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { deviceId: { exact: selectedDeviceId } }
                });
                videoRef.current.srcObject = stream;
            } catch (err) {
                console.error("Kamera ochishda xatolik: ", err);
            }
        }
    };

    const captureImage = () => {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL(); // Surat olish
        setCapturedImage(dataUrl); // Rasmni ko‘rsatish uchun saqlaymiz

        // OCR matnni tanib olish
        Tesseract.recognize(dataUrl, 'eng')
            .then(({ data: { text } }) => {
                setOcrResult(text); // OCR natijasini saqlaymiz
            })
            .catch(err => {
                console.error("OCR xatosi: ", err);
            });
    };

    return (
        <div>
            <video ref={videoRef} autoPlay style={{ width: '100%' }}></video>
            <button onClick={startCamera}>Kamerani yoqish</button>
            <button onClick={captureImage}>Suratga olish</button>
            <select onChange={(e) => setSelectedDeviceId(e.target.value)}>
                {devices.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>{device.label}</option>
                ))}
            </select>

            {/* Olingan rasmni ko‘rsatish */}
            {capturedImage && (
                <div>
                    <h3>Olingan rasm:</h3>
                    <img src={capturedImage} alt="Olingan rasm" style={{ width: '100%' }} />
                </div>
            )}

            {/* OCR natijasini ko‘rsatish */}
            {ocrResult && (
                <div>
                    <h3>OCR natijasi:</h3>
                    <p>{ocrResult}</p>
                </div>
            )}
        </div>
    );
};

export default Camera;
