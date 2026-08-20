import React from 'react';
import CVPage from './shared/CVPage';
import CVHeader from './shared/CVHeader';
import CVSections from './shared/CVSections';
import { AMERICA_CONTACT_ORDER } from './shared/cvUtils';
import './CVAmerica.css';

const CVAmerica = ({ data }) => (
    <CVPage theme="america" className="cv-america">
        <CVHeader
            variant="centered"
            data={data}
            includeZip
            contactOrder={AMERICA_CONTACT_ORDER}
            itemTag="span"
        />
        <CVSections sections={data.sections} intro={data.intro} />
    </CVPage>
);

export default CVAmerica;
