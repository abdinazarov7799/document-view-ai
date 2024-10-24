import React, { useRef, useState, useEffect } from 'react';
import cv from 'opencv.js'; // OpenCV.js ni import qilamiz

const Camera = () => {
    const videoRef = useRef(null);
    const [devices, setDevices] = useState([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);

    // Kameralar ro'yxatini olish
    useEffect(() => {
        navigator.mediaDevices.enumerateDevices().then((deviceInfos) => {
            const videoDevices = deviceInfos.filter(device => device.kind === 'videoinput');
            setDevices(videoDevices);
            const backCamera = videoDevices.find(device => device.label.toLowerCase().includes('back')) || videoDevices[0];
            setSelectedDeviceId(backCamera.deviceId); // Default orqa kamera
        });
    }, []);

    // Kamerani ishga tushirish
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
        const dataUrl = canvas.toDataURL();
        setCapturedImage(dataUrl);

        // OpenCV bilan tasvirni qayta ishlash
        const src = cv.imread(canvas);
        const dst = new cv.Mat();
        cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY, 0); // Oq-qora rangga o‘tkazish
        const contours = new cv.MatVector();
        const hierarchy = new cv.Mat();
        cv.findContours(dst, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

        // Avtomatik aniqlash va qirqish
        if (contours.size() > 0) {
            const rect = cv.boundingRect(contours.get(0));
            cv.rectangle(dst, rect, [255, 0, 0, 255], 2); // Qirqilgan joyni ko‘rsatish
        }

        cv.imshow(canvas, dst); // Yangilangan tasvirni ko‘rsatish

        src.delete();
        dst.delete();
        contours.delete();
        hierarchy.delete();
    };

    return (
        <div>
            <video ref={videoRef} autoPlay style={{ width: '100%' }}></video>
            <select onChange={(e) => setSelectedDeviceId(e.target.value)}>
                {devices.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>{device.label}</option>
                ))}
            </select>
            <button onClick={startCamera}>Kamerani yoqish</button>
            <button onClick={captureImage}>Suratga olish va qirqish</button>
            {capturedImage && (
                <div>
                    <h3>Olingan rasm:</h3>
                    <img src={capturedImage} alt="Olingan rasm" style={{ width: '100%' }} />
                </div>
            )}
        </div>
    );
};

export default Camera;
