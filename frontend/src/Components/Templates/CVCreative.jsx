import React from 'react';
import CVPage from './shared/CVPage';
import CVHeader from './shared/CVHeader';
import CVSections from './shared/CVSections';
import './CVCreative.css';

const CVCreative = ({ data }) => (
    <CVPage theme="creative" className="cv-creative" flush>
        <CVHeader variant="creative-banner" data={data} />
        <div className="creative-layout">
            <CVHeader variant="creative-sidebar" data={data} />
            <main className="creative-main">
                <CVSections sections={data.sections} />
            </main>
        </div>
    </CVPage>
);

export default CVCreative;
