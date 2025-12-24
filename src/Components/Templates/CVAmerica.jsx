import React from 'react';
import { marked } from 'marked';
import { LuMail, LuPhone, LuMapPin, LuLink } from "react-icons/lu";
import './CVAmerica.css';

const CVAmerica = ({ data }) => {
    const renderSectionContent = (content) => {
        return <div dangerouslySetInnerHTML={{ __html: marked(content) }} />;
    };

    // Helper to extract domain from URL for display
    const getDisplayUrl = (url) => {
        try {
            return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
        } catch {
            return url;
        }
    };

    return (
        <div className="cv-america">
            <header className="cv-header">
                <h1>{data.name || "Your Name"}</h1>
                <p className="cv-profession">{data.profession}</p>
                <div className="contact-info">
                    {data.city && (
                        <span className="contact-item">
                            <LuMapPin size={14} />
                            {data.city}, {data.province} {data.zip}
                        </span>
                    )}
                    {data.email && (
                        <span className="contact-item">
                            <LuMail size={14} />
                            {data.email}
                        </span>
                    )}
                    {data.phone && (
                        <span className="contact-item">
                            <LuPhone size={14} />
                            {data.phone}
                        </span>
                    )}
                    {data.link1 && (
                        <a href={data.link1} target="_blank" rel="noopener noreferrer" className="contact-item contact-link">
                            <LuLink size={14} />
                            {getDisplayUrl(data.link1)}
                        </a>
                    )}
                    {data.link2 && (
                        <a href={data.link2} target="_blank" rel="noopener noreferrer" className="contact-item contact-link">
                            <LuLink size={14} />
                            {getDisplayUrl(data.link2)}
                        </a>
                    )}
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
