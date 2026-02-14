import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Recognition from './models/Recognition.js';

dotenv.config();

const recognitions = [
  {
    name: 'Startup India',
    logo: '/src/assets/company images/startupindia.png',
    description: 'Recognized by the Government of India\'s flagship program for startups',
    order: 1,
    externalLink: 'https://www.startupindia.gov.in/',
    isActive: true
  },
  {
    name: 'iStart Rajasthan',
    logo: '/src/assets/company images/istartrajasthan.png',
    description: 'Supported by the Government of Rajasthan\'s startup initiative',
    order: 2,
    externalLink: 'https://istart.rajasthan.gov.in/',
    isActive: true
  },
  {
    name: 'Wadhwani Foundation',
    logo: '/src/assets/company images/Wadhwani Foundation.png',
    description: 'Supported by the Wadhwani Foundation for entrepreneurship development',
    order: 3,
    externalLink: 'https://www.wadhwanifoundation.org/',
    isActive: true
  },
  {
    name: 'DPIIT',
    logo: '/src/assets/company images/DPIIT.png',
    description: 'Recognized by the Department for Promotion of Industry and Internal Trade',
    order: 4,
    externalLink: 'https://www.dpiit.gov.in/',
    isActive: true
  },
  {
    name: 'MSME',
    logo: '/src/assets/company images/MSME.png',
    description: 'Registered with the Ministry of Micro, Small and Medium Enterprises',
    order: 5,
    externalLink: 'https://msme.gov.in/',
    isActive: true
  },
  {
    name: 'NITI Aayog',
    logo: '/src/assets/company images/NITI Aayog.png',
    description: 'Recognized by India\'s premier policy think tank',
    order: 6,
    externalLink: 'https://www.niti.gov.in/',
    isActive: true
  },
  {
    name: 'Make in India',
    logo: '/src/assets/company images/Make in India.png',
    description: 'Part of the Make in India initiative',
    order: 7,
    externalLink: 'https://www.makeinindia.com/',
    isActive: true
  },
  {
    name: 'Digital India',
    logo: '/src/assets/company images/Digital India.png',
    description: 'Supporting the Digital India vision',
    order: 8,
    externalLink: 'https://www.digitalindia.gov.in/',
    isActive: true
  }
];

const seedRecognitions = async () => {
  try {
    await connectDB();
    
    console.log('🗑️  Clearing existing recognitions...');
    await Recognition.deleteMany({});

    console.log('📝 Creating recognitions...');
    const createdRecognitions = await Recognition.insertMany(recognitions);

    console.log(`✅ Successfully created ${createdRecognitions.length} recognitions`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding recognitions:', error);
    process.exit(1);
  }
};

seedRecognitions();
