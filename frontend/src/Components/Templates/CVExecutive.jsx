import React from 'react';
import CVPage from './shared/CVPage';
import CVHeader from './shared/CVHeader';
import CVSections from './shared/CVSections';
import './CVExecutive.css';

const CVExecutive = ({ data }) => (
    <CVPage theme="executive" className="cv-executive">
        <CVHeader variant="executive" data={data} />
        <CVSections
            sections={data.sections}
            wrapperClassName="exec-content"
            entryProps={{
                sectionClassName: 'exec-section cv-section',
                titleClassName: 'exec-section-title',
                bodyClassName: 'exec-section-body cv-section-body',
                nestedBody: false,
            }}
        />
    </CVPage>
);

export default CVExecutive;
