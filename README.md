# 🧠 PromptScanner

**The ultimate tool for AI Prompt Hoarders.**  
Extract, Organize, and Reuse AI prompts from screenshots, photos, and social media feeds.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-Production_Ready-green.svg)

## 🚀 What is this?

**PromptScanner** is a Progressive Web App (PWA) designed to solve a modern problem: finding a great AI prompt (on X/Twitter, YouTube, or Reddit), taking a screenshot, and then... forgetting it exists.

Instead of a cluttered camera roll, PromptScanner turns those screenshots into a searchable, tagged library of text prompts ready for Midjourney, ChatGPT, or Claude.

### ✨ Key Features

* **📸 Instant OCR**: Reads text from images instantly using `Tesseract.js` (running locally in your browser for privacy).
* **🧹 Magic Polish**: Automatically removes timestamps, "Show more" buttons, and social media clutter to leave just the clean prompt.
* **🏷️ Smart Tags**: Auto-detects and tags prompts like `#Midjourney`, `#ChatGPT`, `#Code`, or `#Recipe`.
* **📱 Installable PWA**: Add to your mobile Home Screen and use it like a native app.
* **📄 Pro Exports**: Export your scanned library as a professional PDF.
* **🔒 100% Private**: All data is stored in your browser's `Local Storage`. No images are uploaded to any server.

---

## 🛠️ Tech Stack

Built with the **Architect-Maxima** protocol.

* **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
* **Language**: TypeScript
* **Styling**: Vanilla CSS Variables (Glassmorphism Design System)
* **OCR Engine**: [Tesseract.js](https://tesseract.projectnaptha.com/)
* **PDF Generation**: `jspdf`
* **PWA**: `next-pwa`

---

## 🏁 Getting Started

### Prerequisites

* Node.js 18+
* npm

### Installation

1. Clone the repo:

    ```bash
    git clone https://github.com/gfunkmaster/prompt-download.git
    cd prompt-download
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Run the development server:

    ```bash
    npm run dev
    ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📱 How to Install (Mobile)

Since this is a PWA, you can install it on iOS/Android:

1. Navigate to the deployed URL (or valid https localhost).
2. Tap **Share** (iOS) or **Menu** (Android).
3. Select **"Add to Home Screen"**.
4. Launch it from your icon for a full-screen native experience.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
