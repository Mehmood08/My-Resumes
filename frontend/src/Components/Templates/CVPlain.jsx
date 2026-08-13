import React from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import CVPage from './shared/CVPage';
import './CVPlain.css';

const CVPlain = ({ markdown }) => {
    const html = DOMPurify.sanitize(marked(markdown || ''));

    return (
        <CVPage theme="plain" className="cv-plain">
            <div
                className="cv-plain-body cv-section-body"
                dangerouslySetInnerHTML={{ __html: html }}
            />
        </CVPage>
    );
};

export default CVPlain;
