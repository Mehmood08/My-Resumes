import React from 'react';
import CVPage from './shared/CVPage';
import CVHeader from './shared/CVHeader';
import CVSections from './shared/CVSections';
import './CVAcademic.css';

const CVAcademic = ({ data }) => (
    <CVPage theme="academic" className="cv-academic">
        <CVHeader variant="academic" data={data} />
        <CVSections
            sections={data.sections}
            entryProps={{
                sectionClassName: 'acad-section cv-section',
                titleClassName: 'acad-section-title',
                bodyClassName: 'acad-body cv-section-body',
                nestedBody: false,
            }}
        />
    </CVPage>
);

export default CVAcademic;
