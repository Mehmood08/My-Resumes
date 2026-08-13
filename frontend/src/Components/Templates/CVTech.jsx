import React from 'react';
import CVPage from './shared/CVPage';
import CVHeader from './shared/CVHeader';
import CVSections from './shared/CVSections';
import './CVTech.css';

const CVTech = ({ data }) => (
    <CVPage theme="tech" className="cv-tech" flush>
        <CVHeader variant="tech" data={data} />
        <CVSections
            sections={data.sections}
            wrapperClassName="tech-grid"
            entryProps={{
                sectionClassName: 'tech-module cv-section',
                titleClassName: 'module-header',
                bodyClassName: 'module-body cv-section-body',
                titleAs: 'div',
                titlePrefix: '// ',
                nestedBody: false,
            }}
        />
    </CVPage>
);

export default CVTech;
