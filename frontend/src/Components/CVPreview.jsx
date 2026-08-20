import React, { useMemo } from 'react';
import "./CVPreview.css";
import "./Templates/shared/cv-base.css";
import { parseCV } from '../utils/parseCV';

// Templates
import CVGulf from './Templates/CVGulf';
import CVEuropean from './Templates/CVEuropean';
import CVAmerica from './Templates/CVAmerica';
import CVProfessional from './Templates/CVProfessional';
import CVCreative from './Templates/CVCreative';
import CVMinimalist from './Templates/CVMinimalist';
import CVExecutive from './Templates/CVExecutive';
import CVAcademic from './Templates/CVAcademic';
import CVTech from './Templates/CVTech';
import CVService from './Templates/CVService';
import CVPlain from './Templates/CVPlain';

const CVPreview = ({ markdown, format }) => {
    const parsedData = useMemo(() => parseCV(markdown), [markdown]);

    const renderTemplate = () => {
        switch (format) {
            case 'Gulf': return <CVGulf data={parsedData} />;
            case 'European': return <CVEuropean data={parsedData} />;
            case 'America': return <CVAmerica data={parsedData} />;
            case 'Professional': return <CVProfessional data={parsedData} />;
            case 'Creative': return <CVCreative data={parsedData} />;
            case 'Minimalist': return <CVMinimalist data={parsedData} />;
            case 'Executive': return <CVExecutive data={parsedData} />;
            case 'Academic': return <CVAcademic data={parsedData} />;
            case 'Tech': return <CVTech data={parsedData} />;
            case 'Service': return <CVService data={parsedData} />;
            case 'Plain':
                return <CVPlain markdown={markdown} />;
            default:
                return <CVPlain markdown={markdown} />;
        }
    };

    return (
        <div className="cv-preview">
            {renderTemplate()}
        </div>
    );
};

export default CVPreview;
