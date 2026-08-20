import React from 'react';
import CVPage from './shared/CVPage';
import CVHeader from './shared/CVHeader';
import CVSections from './shared/CVSections';
import './CVProfessional.css';

const CVProfessional = ({ data }) => (
    <CVPage theme="professional" className="cv-professional">
        <CVHeader variant="professional" data={data} />
        <div className="cv-main-content">
            <CVSections sections={data.sections} />
        </div>
    </CVPage>
);

export default CVProfessional;
