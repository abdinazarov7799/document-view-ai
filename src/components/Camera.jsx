import React, { useRef } from 'react';

const Camera = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoRef.current.srcObject = stream;
        } catch (err) {
            console.error("Kamera ochishda xatolik: ", err);
        }
    };

    const captureImage = () => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        const src = cv.imread(canvas);
        const dst = new cv.Mat();
        cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY); // Tasvirni oq-qora qilamiz

        cv.imshow(canvas, dst); // O‘zgartirilgan tasvirni ko‘rsatish

        src.delete();
        dst.delete();
    };

    return (
        <div>
            <video ref={videoRef} autoPlay style={{ width: '100%' }}></video>
            <canvas ref={canvasRef} style={{ display: 'none' }} width="640" height="480"></canvas>
            <button onClick={startCamera}>Kamerani yoqish</button>
            <button onClick={captureImage}>Suratga olish</button>
        </div>
    );
};

export default Camera