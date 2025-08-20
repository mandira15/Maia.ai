# Maia.ai
# AI-Powered To-Do List Assistant for Pregnant Women

## 📌 Overview
This project is an **AI-driven healthcare assistant** designed to generate **personalized pregnancy to-do lists** based on medical reports, sonography images, or text inputs. It is built with inclusivity in mind, supporting both **urban and rural women**:

* **Urban areas** → Women can access the platform directly to upload reports/images and instantly view AI-generated to-do lists.
* **Rural/low-connectivity areas** → Women can send updates, medical details, or images via **SMS**. The system processes the data and responds with a **to-do list or guidance over SMS**. (Pull-based model: women send updates, then receive replies.)

This ensures that even in areas with poor internet access, women receive timely, AI-powered healthcare support.
## 🚀 Features
* 📄 **Report/Image Upload (Urban)**: Upload sonography reports or medical images and receive tailored pregnancy tasks.
* ✉️ **SMS-based AI Assistant (Rural)**: Send health updates or reports via SMS, get AI-generated to-do list back via SMS.
* 🔄 **Pull-based guidance**: No reminders are pushed; women initiate by sending updates.
* 🌍 **Accessibility-first**: Works in both urban (platform-based) and rural (SMS-based) contexts.
* 🤖 **AI-driven analysis**: Uses ML to extract insights from text, PDFs, or medical images.
## 🛠️ Tech Stack
* **Backend**: Python (FastAPI )
* **AI/ML**: PyTorch  for medical image and text analysis
* **Database**: MongoDB
* **SMS Integration**: Vonage APIs
* **Frontend (Urban Users)**: React.js 
* **Deployment**: Azure
## ⚙️ How It Works
1. **Urban Users (Platform)**
   * Upload sonography images or reports → AI model processes data → Displays personalized to-do list on dashboard.
2. **Rural Users (SMS)**
   * Send report details/images via SMS → Backend processes → AI model generates to-do list → Sends response via SMS.
## 📌 Use Cases
* **Rural healthcare access**: Guidance even without internet.
* **Urban lifestyle support**: Easy upload & instant AI-generated tasks.
* **Reducing maternity deaths**: Proactive steps based on health data.
## 🚧 Current Progress
* ✅ Core idea and workflow designed
* 🚧 Model training in progress
* 🚧 SMS integration setup ongoing
* 🚧 Frontend prototype under development
## 🤝 Contribution
We welcome contributions! Feel free to fork, open issues, or suggest improvements.
To bridge the **digital healthcare gap** for pregnant women by leveraging **AI + SMS**, making **critical maternal care accessible everywhere**, regardless of internet connectivity
