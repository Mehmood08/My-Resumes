import React from 'react';
import CVPage from './shared/CVPage';
import { MarkdownHtml } from './shared/useMarkdownHtml';
import './CVPlain.css';

const CVPlain = ({ markdown }) => (
    <CVPage theme="plain" className="cv-plain">
        <MarkdownHtml content={markdown} className="cv-plain-body cv-section-body" />
    </CVPage>
);

export default CVPlain;
