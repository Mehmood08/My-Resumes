import React from 'react';
import CVPage from './shared/CVPage';
import CVHeader from './shared/CVHeader';
import CVSections from './shared/CVSections';
import './CVMinimalist.css';

const CVMinimalist = ({ data }) => (
    <CVPage theme="minimalist" className="cv-minimalist">
        <CVHeader variant="minimalist" data={data} />
        <div className="mini-divider" />
        <CVSections
            sections={data.sections}
            wrapperClassName="mini-content"
            entryProps={{
                sectionClassName: 'mini-section cv-section',
                titleClassName: 'section-title cv-section-title',
                bodyClassName: 'section-body cv-section-body',
            }}
        />
    </CVPage>
);

export default CVMinimalist;
