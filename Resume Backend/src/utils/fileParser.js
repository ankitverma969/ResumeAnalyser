import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import fs from 'fs';

export const parseResume = async (filePath, mimetype) => {
  try {
    if (mimetype === 'application/pdf') {
      return await parsePDF(filePath);
    } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return await parseDOCX(filePath);
    } else {
      throw new Error('Unsupported file format');
    }
  } catch (error) {
    console.error('File parsing error:', error);
    throw new Error('Failed to parse resume file');
  }
};

const parsePDF = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text;
};

const parseDOCX = async (filePath) => {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value;
};
