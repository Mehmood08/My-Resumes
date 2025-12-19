import React from 'react';
import { marked } from 'marked';
import './CVAmerica.css';

const CVAmerica = ({ data }) => {
    const renderSectionContent = (content) => {
        return <div dangerouslySetInnerHTML={{ __html: marked(content) }} />;
    };

    return (
        <div className="cv-america">
            <header className="cv-header">
                <h1>{data.name || "Your Name"}</h1>
                <div className="contact-info">
                    {data.email && <span>{data.email}</span>}
                    {data.email && data.phone && <span className="dot"></span>}
                    {data.phone && <span>{data.phone}</span>}
                </div>
            </header>

            {data.intro && (
                <div className="cv-intro" style={{ marginBottom: '15px' }}>
                    <div dangerouslySetInnerHTML={{ __html: marked(data.intro) }} />
                </div>
            )}

            {data.sections.map((sec, idx) => (
                <section key={idx} className="cv-section">
                    <h2 className="section-title">{sec.title}</h2>
                    <div className="section-content">
                        {renderSectionContent(sec.content)}
                    </div>
                </section>
            ))}
        </div>
    );
};

export default CVAmerica;
