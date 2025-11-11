
import fs from 'fs';
import Papa from 'papaparse';
import axios from 'axios';

async function upload() {
  const csvData = fs.readFileSync('./attached_assets/MOCK_DATA.csv', 'utf8');

  const result = Papa.parse(csvData, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });

  const data = {
    name: 'Fake Company Data',
    type: 'csv',
    data: result.data,
  };

  try {
    await axios.post('http://localhost:5000/api/datasets', data, {
      withCredentials: true,
    });
    console.log('Dataset uploaded successfully');
  } catch (error) {
    console.error('Failed to upload dataset:', error);
  }
}

upload();
