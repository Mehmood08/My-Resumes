import React from 'react';
import CVPage from './shared/CVPage';
import CVHeader from './shared/CVHeader';
import CVSections from './shared/CVSections';
import './CVEuropean.css';

const CVEuropean = ({ data }) => (
    <CVPage theme="european" className="cv-european" flush>
        <CVHeader variant="european-sidebar" data={data} />
        <main className="cv-main">
            <CVHeader variant="european-main" data={data} />
            <CVSections sections={data.sections} intro={data.intro} />
        </main>
    </CVPage>
);

export default CVEuropean;
