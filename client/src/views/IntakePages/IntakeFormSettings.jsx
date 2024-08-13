import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CustomizeForm from './CustomizeForm';
import ManageQuestions from './ManageQuestions';
import DefaultSetup from './DefaultSetup';
import IntakeTemplates from './IntakeTemplates';

const IntakeFormSettings = () => {
  const [activeTab, setActiveTab] = useState('customize');
  const { clientId } = useParams(); // Get clientId from URL params


  const navigate = useNavigate();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'customize':
        return <CustomizeForm clientId={clientId} />; // Pass clientId
      case 'manageQuestions':
        return <ManageQuestions clientId={clientId} />; // Pass clientId
      case 'intakeTemplates':
        return <IntakeTemplates clientId={clientId} />; // Pass clientId
      case 'defaultSettings':
        return <DefaultSetup clientId={clientId} />; // Pass clientId
      default:
        return <CustomizeForm clientId={clientId} />; // Pass clientId
    }
  };

  return (
    <div className="flex">
      <div className="w-1/4 p-4">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded mb-4"
        >
          Back
        </button>
        <ul>
          <li
            className={`cursor-pointer p-2 ${activeTab === 'customize' ? 'bg-gray-200' : ''}`}
            onClick={() => setActiveTab('customize')}
          >
            Customize Form
          </li>
          <li
            className={`cursor-pointer p-2 ${activeTab === 'manageQuestions' ? 'bg-gray-200' : ''}`}
            onClick={() => setActiveTab('manageQuestions')}
          >
            Manage Questions
          </li>
          <li
            className={`cursor-pointer p-2 ${activeTab === 'intakeTemplates' ? 'bg-gray-200' : ''}`}
            onClick={() => setActiveTab('intakeTemplates')}
          >
            Intake Templates
          </li>
          <li
            className={`cursor-pointer p-2 ${activeTab === 'defaultSettings' ? 'bg-gray-200' : ''}`}
            onClick={() => setActiveTab('defaultSettings')}
          >
            Default Setup
          </li>
        </ul>
      </div>
      <div className="w-3/4 p-4">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default IntakeFormSettings;
