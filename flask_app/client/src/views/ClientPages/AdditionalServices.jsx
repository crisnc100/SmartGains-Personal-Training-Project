import React from 'react';
import { NavLink, Outlet, useParams, useNavigate } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';

const AdditionalServices = () => {
    const { clientId } = useParams(); // This captures the client ID from the URL

    // Use this clientId to fetch data or perform other operations related to the client
    console.log("Service requested for client ID:", clientId);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 pb-80">
            <div className="flex flex-col space-y-4 w-full max-w-md"> {/* Adjusted width for medium-size screens */}
                <h1 className="text-3xl font-semibold text-gray-800 mb-6 text-center">Additional Services</h1>
                <NavLink
                    to='intake-form'
                    className="inline-flex items-center justify-center px-6 py-3 border border-green-600 text-green-600 hover:bg-green-600 hover:text-white font-medium rounded-md w-full"
                    data-tooltip-id="shortFormTooltip"
                    data-tooltip-content="Dynamic intake form adaptable to client needs: Start with general health and fitness background, suitable for new clients. Optional detailed assessments available for comprehensive, personalized planning."
                    data-tooltip-place="bottom"
                >
                    Exercise Intake Form
                </NavLink>
                
                <NavLink
                    to='nutrition-profile'
                    className="inline-flex items-center justify-center px-6 py-3 border border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white font-medium rounded-md w-full"
                    data-tooltip-id="nutritionProfileTooltip"
                    data-tooltip-content="Detailed dietary habits, preferences, and nutritional goals, ideal for creating personalized nutrition plans."
                    data-tooltip-place="bottom"
                >
                    Nutrition Profile
                </NavLink>
                <NavLink
                    to='generator'
                    className="inline-flex items-center justify-center px-6 py-3 border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-medium rounded-md w-full"
                    data-tooltip-id="generatorTooltip"
                    data-tooltip-content="Generate a 3-day workout plan quickly using predefined prompts tailored to the client's level."
                    data-tooltip-place="bottom"
                >
                    Skip to Generator
                </NavLink>
                {/* Create <Tooltip /> elements and set the id prop */}
                <Tooltip style={{ width: '300px', fontSize: '12px' }} id="quickAddTooltip" />
                <Tooltip style={{ width: '300px', fontSize: '12px' }} id="shortFormTooltip" />
                <Tooltip style={{ width: '300px', fontSize: '12px' }} id="generatorTooltip" />
                <Tooltip style={{ width: '300px', fontSize: '12px' }} id="nutritionProfileTooltip" />

            </div>

        </div>
    );
}

export default AdditionalServices;
