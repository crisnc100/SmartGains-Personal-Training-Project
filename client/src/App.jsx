import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './views/TrainerPages/HomePage/HomePage';
import LoginPage from './views/TrainerPages/LoginPage/LoginPage';
import NewTrainer from './views/TrainerPages/RegisterPage/NewTrainer';
import CreateProfile from './views/TrainerPages/CreateProfile/CreateProfile';
import Dashboard from './views/TrainerPages/Dashboard/Dashboard';
import React, { useState } from 'react';
import ProfileContent from './views/TrainerPages/ProfileContent/ProfileContent';
import AllClients from './views/ClientPages/AllClients';
import AddClient from './views/ClientPages/AddClient';
import AdditionalServices from './views/ClientPages/AdditionalServices';
import NutritionProfile from './views/IntakePages/NutritionProfile';
import IntakeForm from './views/IntakePages/IntakeForm';
import MedicalHistory from './views/IntakePages/MedicalHistory';
import IntakeOptions from './views/IntakePages/IntakeOptions';
import FlexibilityAssessment from './views/IntakePages/FlexibilityAssessment';
import DemoPrompt from './views/ClientPages/DemoPrompt';
import AssessmentChoice from './views/IntakePages/AssessmentChoice';
import BeginnerAssessment from './views/IntakePages/BeginnerAssessment';
import AdvancedAssessment from './views/IntakePages/AdvancedAssessment';
import InitialHighlights from './views/IntakePages/InitialHighlights';
import CurrentClient from './views/ClientPages/CurrentClient/CurrentClient';
import EditProfile from './views/TrainerPages/EditProfile/EditProfile';
import TrainerSettings from './views/TrainerPages/TrainerSettings/TrainerSettings';
import ViewQuickPlan from './views/ClientPages/ViewQuickPlan';
import ViewCustomPlan from './views/ClientPages/ViewCustomPlan';
import RecentQuickPlan from './views/ClientPages/RecentQuickPlan';
import CustomPrompt from './views/ClientPages/CustomPrompt';
import RecentCustomPlan from './views/ClientPages/RecentCustomPlan';
import { UserProvider } from './contexts/UserContext';



function App() {


  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/login_page' element={<LoginPage />} />
          <Route path='/new_trainer' element={<NewTrainer />} />
          <Route path='/new_trainer/:trainerId/success/create-profile' element={<CreateProfile />} />
          <Route path='/trainer_dashboard' element={<Dashboard />}>
            <Route index element={<ProfileContent />} /> {/* Nested route */}
            <Route path='edit-profile' element={<EditProfile />} />
            <Route path='settings' element={<TrainerSettings />} />
            <Route path='all_clients' element={<AllClients />} />
            <Route path='all_clients/:clientId/current-client' element={<CurrentClient />} />
            <Route path='all_clients/:clientId/current-client/assessment-choice' element={<AssessmentChoice />} />
            <Route path='all_clients/:clientId/current-client/quick-plan/:planId' element={<ViewQuickPlan />} />
            <Route path='all_clients/:clientId/current-client/create-quick-plan' element={<DemoPrompt />} />
            <Route path='all_clients/:clientId/current-client/create-quick-plan/success' element={<RecentQuickPlan />} />
            <Route path='all_clients/:clientId/current-client/custom-plan/:planId' element={<ViewCustomPlan />} />
            <Route path='all_clients/:clientId/current-client/create-custom-plan' element={<CustomPrompt />} />
            <Route path='all_clients/:clientId/current-client/create-custom-plan/success' element={<RecentCustomPlan />} />
            <Route path='add_client' element={<AddClient />} />
            <Route path='add_client/:clientId/additional-services' element={<AdditionalServices />} />
            <Route path='add_client/:clientId/additional-services/intake-form' element={<IntakeForm />} />
            <Route path='add_client/:clientId/additional-services/generator' element={<DemoPrompt />} />
            <Route path='add_client/:clientId/additional-services/nutrition-profile' element={<NutritionProfile />} />
            <Route path='add_client/:clientId/additional-services/intake-form/medical-history' element={<MedicalHistory />} />
            <Route path='add_client/:clientId/additional-services/intake-form/intake-options' element={<IntakeOptions />} />
            <Route path='add_client/:clientId/additional-services/intake-form/flexibility-assessment' element={<FlexibilityAssessment />} />
            <Route path='add_client/:clientId/additional-services/intake-form/choose-prompt' element={<DemoPrompt />} />
            <Route path='add_client/:clientId/additional-services/intake-form/choose-prompt/success' element={<RecentQuickPlan />} />
            <Route path='add_client/:clientId/additional-services/intake-form/assessment-choice' element={<AssessmentChoice />} />
            <Route path='add_client/:clientId/additional-services/intake-form/assessment-choice/beginner' element={<BeginnerAssessment />} />
            <Route path='add_client/:clientId/additional-services/intake-form/assessment-choice/advanced' element={<AdvancedAssessment />} />
            <Route path='add_client/:clientId/additional-services/intake-form/client-highlights' element={<InitialHighlights />} />
          </Route>
        </Routes>
      </BrowserRouter>

    </>
  )
}

export default App
