// IntakeFormSettings.jsx
import React, { useState } from 'react';
import CustomizeForm from './CustomizeForm';
import ManageQuestions from './ManageQuestions';
import DefaultSetup from './DefaultSetup';
import InitialHighlights from './InitialHighlights';
import IntakeTemplates from './IntakeTemplates';
const IntakeFormSettings = () => {
  const [activeTab, setActiveTab] = useState('customize');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'customize':
        return <CustomizeForm />;
      case 'manageQuestions':
        return <ManageQuestions />;
      case 'defaultSettings':
        return <DefaultSetup />;
    case 'intakeTemplates':
        return <IntakeTemplates />;
      default:
        return <CustomizeForm />;
    }
  };

  return (
    <div className="flex">
      <div className="w-1/4 p-4">
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
            className={`cursor-pointer p-2 ${activeTab === 'defaultSettings' ? 'bg-gray-200' : ''}`}
            onClick={() => setActiveTab('defaultSettings')}
          >
            Default Setup
          </li>
          <li
            className={`cursor-pointer p-2 ${activeTab === 'intakeTemplates' ? 'bg-gray-200' : ''}`}
            onClick={() => setActiveTab('intakeTemplates')}
          >
            Intake Templates
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
