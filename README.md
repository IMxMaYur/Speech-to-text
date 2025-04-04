# Speech to Text Conversion of Original Video File

This mini project allows users to upload an original video file and convert its spoken content into written text using OpenAI's Whisper model. The system also provides optional language translation and PDF export of the transcript.

---

## ✅ Features

- **Upload Video File** (`.mp4`, `.mkv`, `.mov`)
- **Convert Speech to Text** using Whisper (open-source, offline)
- **Multilingual Translation** (Hindi, Marathi, Spanish, French)
- **Export Transcript** as a downloadable professional PDF
- **Live Transcription Mode** (optional bonus feature)
- **Handles Multi-language Speech** using Whisper's multilingual model
- 100% **Free**, Offline, and works on personal laptop with moderate specs

---

## 📁 Folder Structure

speech_to_text_project/ ├── app.py                        # Streamlit main app ├── requirements.txt              # Required packages ├── README.md                     # Project documentation ├── utils/ │   ├── transcriber.py            # (Optional) for modular transcription logic │   ├── translator.py             # Translation utility │   └── pdf_exporter.py           # PDF generation logic └── assets/ └── sample_video.mp4          # (Optional) test file

---

## ⚙️ How to Run the Project

1. **Clone the repo or unzip folder**
2. **Install dependencies**:

```bash
pip install -r requirements.txt

3. Run the app:



streamlit run app.py

4. Use the Web UI:

Upload video

Transcribe audio

Translate (optional)

Download PDF report





---

🧠 Tech Stack

Streamlit – UI interface

OpenAI Whisper – Speech recognition

Googletrans – Translation

MoviePy – Audio extraction from video

FPDF – PDF generation



---

⚡ Tested On

Laptop: Acer Aspire 7

Specs: Intel i5 12th Gen 12450H, GTX 1650, 16GB RAM, 500GB SSD

OS: Windows 11 / Linux

Performance: Smooth with Whisper Base/Medium model



---

❓ Bonus Feature Idea

Live Transcription Button: Capture live audio from mic and transcribe in real time.

Language Auto-Detection: Handles mixed-language phrases smoothly.



---

📄 Output Format

Original Transcript in UI

Translated Text in selected language

Professional PDF with all the above included



---

License

This project is for educational purposes and uses only open-source tools. No external paid APIs are used.


---

Made with passion by Mayur Giri (AI & DS)

---

Let me know if you'd like a professional **project report (DOC/PDF)** or **presentation (PPT)** as well.

