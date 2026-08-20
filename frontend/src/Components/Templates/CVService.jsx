import React from 'react';
import CVPage from './shared/CVPage';
import CVHeader from './shared/CVHeader';
import CVSections from './shared/CVSections';
import './CVService.css';

const CVService = ({ data }) => (
    <CVPage theme="service" className="cv-service">
        <CVHeader variant="service" data={data} />
        <CVSections
            sections={data.sections}
            wrapperClassName="service-content"
            entryProps={{
                sectionClassName: 'service-section cv-section',
                titleClassName: 'service-section-title',
                bodyClassName: 'service-section-body cv-section-body',
                nestedBody: false,
            }}
        />
    </CVPage>
);

export default CVService;
