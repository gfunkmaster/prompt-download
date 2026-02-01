import Tesseract from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number;
}

export const recognizeText = async (imagePath: string | File): Promise<OCRResult> => {
  try {
    const worker = await Tesseract.createWorker('eng');
    
    // Core recognition
    const ret = await worker.recognize(imagePath);
    console.log('OCR Output:', ret.data.text);
    
    await worker.terminate();

    return {
      text: ret.data.text,
      confidence: ret.data.confidence
    };
  } catch (error) {
    console.error("OCR Error:", error);
    throw new Error("Failed to extract text.");
  }
};
