import React, { useRef, useState, useEffect } from 'react';

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
            if (videoDevices.length > 0) {
                setSelectedDeviceId(videoDevices[0].deviceId); // Default camera
            }
        });
    }, []);

    // Kamerani ishga tushirish
    useEffect(() => {
        if (selectedDeviceId) {
            startCamera();
        }
    }, [selectedDeviceId]);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined }
            });
            videoRef.current.srcObject = stream;
        } catch (err) {
            console.error("Kamera ochishda xatolik: ", err);
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
        const src = window.cv.imread(canvas);
        const dst = new window.cv.Mat();
        window.cv.cvtColor(src, dst, window.cv.COLOR_RGBA2GRAY, 0);
        const contours = new window.cv.MatVector();
        const hierarchy = new window.cv.Mat();
        window.cv.findContours(dst, contours, hierarchy, window.cv.RETR_EXTERNAL, window.cv.CHAIN_APPROX_SIMPLE);

        if (contours.size() > 0) {
            const rect = window.cv.boundingRect(contours.get(0));
            window.cv.rectangle(dst, rect, [255, 0, 0, 255], 2); // Qirqilgan joyni ko'rsatish
        }

        window.cv.imshow(canvas, dst);

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
                    <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Camera ${device.deviceId}`}
                    </option>
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
