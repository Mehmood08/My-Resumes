import React from 'react';
import CVPage from './shared/CVPage';
import CVHeader from './shared/CVHeader';
import CVSections from './shared/CVSections';
import './CVGulf.css';

const CVGulf = ({ data }) => (
    <CVPage theme="gulf" className="cv-gulf" flush>
        <CVHeader variant="centered" data={data} itemTag="div" />
        <div className="cv-body">
            <CVSections sections={data.sections} intro={data.intro} />
        </div>
    </CVPage>
);

export default CVGulf;
