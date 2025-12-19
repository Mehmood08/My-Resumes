import React from 'react';
import { marked } from 'marked';
import './CVGulf.css';

const CVGulf = ({ data }) => {
    const renderSectionContent = (content) => {
        return <div dangerouslySetInnerHTML={{ __html: marked(content) }} />;
    };

    return (
        <div className="cv-gulf">
            <header className="cv-header">
                <h1>{data.name || "Your Name"}</h1>
                <div className="contact-info">
                    {data.email && <span>{data.email}</span>}
                    {data.phone && <span>{data.phone}</span>}
                </div>
            </header>
            <div className="cv-body">
                {data.intro && (
                    <div className="cv-intro" style={{ marginBottom: '20px', fontSize: '14px' }}>
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
        </div>
    );
};

export default CVGulf;
