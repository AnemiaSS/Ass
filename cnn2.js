let model;
let selectedImageFile;



// โหลดโมเดล
async function loadModel() {
    try {
        model = await tf.loadLayersModel('https://abc123.ngrok.io/model/model.json');
        console.log("Model loaded successfully!");
    } catch (error) {
        console.error("Error loading the model:", error);
    }
}

loadModel();


// จัดการเมื่อกดปุ่ม "Choose Image"
document.getElementById('chooseImageButton').addEventListener('click', () => {
    document.getElementById('imageInput').click(); // เปิด input file
});

// เมื่อผู้ใช้เลือกภาพ
document.getElementById('imageInput').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        selectedImageFile = file;
        previewImage(file); // แสดงภาพพรีวิว
        document.getElementById('predictButton').disabled = false; // เปิดใช้งานปุ่ม Predict
    } else {
        document.getElementById('imagePreview').innerHTML = "<p>No image selected</p>";
        document.getElementById('predictButton').disabled = true; // ปิดใช้งานปุ่ม Predict
    }
});


// ฟังก์ชันพรีวิวภาพ
function previewImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const previewContainer = document.getElementById('imagePreview');
        previewContainer.innerHTML = ''; // ลบเนื้อหาเก่าในพรีวิว
        const img = document.createElement('img');
        img.src = e.target.result;
        img.alt = "Selected Image";
        img.style.maxWidth = '100%';
        img.style.maxHeight = '300px';
        previewContainer.appendChild(img); // เพิ่มภาพพรีวิว
    };
    reader.readAsDataURL(file);
}

// เมื่อกดปุ่ม "Predict"
document.getElementById('predictButton').addEventListener('click', async () => {
    if (!selectedImageFile) {
        alert('กรุณาเลือกภาพก่อน');
        return;
    }

    try {
        const image = await loadImage(selectedImageFile);

        const tensor = tf.browser.fromPixels(image)
            .resizeBilinear([224, 224]) // ปรับขนาดภาพ
            .toFloat()
            .expandDims();

        const prediction = await model.predict(tensor).data();
        const predictedClass = prediction.indexOf(Math.max(...prediction));
        const accuracy = Math.max(...prediction);

        let resultMessage;
        let bloodValue;

        if (predictedClass === 0) {
            resultMessage = "คุณมีความเสี่ยงต่อการเป็นภาวะโลหิตจาง";
            bloodValue = (12.4 - (accuracy * (12.4 - 9.0))).toFixed(1);
        } else if (predictedClass === 1) {
            resultMessage = "คุณไม่มีความเสี่ยงต่อการเป็นภาวะโลหิตจาง";
            bloodValue = (12.5 + (accuracy * (16.0 - 12.5))).toFixed(1);
        }

        document.getElementById('result').innerHTML = 
            `<strong>ผลการวิเคราะห์</strong><br>${resultMessage}<br>ค่าเลือดของท่านคือ ${bloodValue} g/dL`;
    } catch (error) {
        console.error("Error during prediction:", error);
        document.getElementById('result').innerHTML = "<p>เกิดข้อผิดพลาดในการวิเคราะห์</p>";
    }
});

// ฟังก์ชันเพื่อโหลดไฟล์ภาพ
function loadImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}