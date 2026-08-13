import React from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import CVPage from './shared/CVPage';
import './CVMinimalist.css';

const CVMinimalist = ({ data }) => {
    const renderSectionContent = (content) => {
        return <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked(content)) }} />;
    };

    const getDisplayUrl = (url) => {
        try {
            return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
        } catch {
            return url;
        }
    };

    return (
        <CVPage theme="minimalist" className="cv-minimalist">
            <div className="mini-header">
                {data.photo && (
                    <div className="cv-photo-container">
                        <img src={data.photo} alt="Profile" className="cv-photo" />
                    </div>
                )}
                <h1>{data.name || "Your Name"}</h1>
                {data.profession && <div className="mini-profession">{data.profession}</div>}

                <div className="mini-contact-row">
                    {data.email && <span>{data.email}</span>}
                    {data.phone && <span>{data.phone}</span>}
                    {data.city && <span>{data.city}, {data.province}</span>}
                    {data.link1 && (
                        <a href={data.link1} target="_blank" rel="noopener noreferrer">
                            {getDisplayUrl(data.link1)}
                        </a>
                    )}
                    {data.link2 && (
                        <a href={data.link2} target="_blank" rel="noopener noreferrer">
                            {getDisplayUrl(data.link2)}
                        </a>
                    )}
                </div>
            </div>

            <div className="mini-divider" />

            <div className="mini-content">
                {data.sections.map((sec, idx) => (
                    <section key={idx} className="mini-section cv-section">
                        <h2 className="section-title cv-section-title">{sec.title}</h2>
                        <div className="section-body cv-section-body">
                            {renderSectionContent(sec.content)}
                        </div>
                    </section>
                ))}
            </div>
        </CVPage>
    );
};

export default CVMinimalist;
