import React, { useRef, useState, useEffect } from 'react';
import Tesseract from 'tesseract.js'; // OCR uchun

const Camera = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [devices, setDevices] = useState([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);

    useEffect(() => {
        // Kameralar ro'yxatini olish
        navigator.mediaDevices.enumerateDevices().then((deviceInfos) => {
            const videoDevices = deviceInfos.filter(device => device.kind === 'videoinput');
            setDevices(videoDevices);
            const backCamera = videoDevices.find(device => device.label.toLowerCase().includes('back')) || videoDevices[0];
            setSelectedDeviceId(backCamera.deviceId); // Default orqa kamera
        });

        const waitForOpenCV = setInterval(() => {
            if (window.cv) {
                console.log('OpenCV yuklandi');
                clearInterval(waitForOpenCV);
            }
        }, 100);

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
                setCapturedImage(null); // Videoni qaytarish
            } catch (err) {
                console.error("Kamera ochishda xatolik: ", err);
            }
        }
    };

    const captureImage = () => {
        const canvas = canvasRef.current;
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL(); // Tasvir olish
        setCapturedImage(dataUrl); // Suratni video o'rniga qo'yish

        // OCR orqali matnni o'qish
        Tesseract.recognize(dataUrl, 'eng').then(({ data: { text } }) => {
            console.log("OCR natija:", text);
        });
    };

    return (
        <div>
            {capturedImage ? (
                <img src={capturedImage} alt="Olingan surat" style={{ width: '100%' }} />
            ) : (
                <video ref={videoRef} autoPlay style={{ width: '100%' }}></video>
            )}
            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
            <button onClick={startCamera}>Kamerani yoqish</button>
            <button onClick={captureImage}>Suratga olish</button>
            <select onChange={(e) => setSelectedDeviceId(e.target.value)}>
                {devices.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>{device.label}</option>
                ))}
            </select>
        </div>
    );
};

export default Camera;
