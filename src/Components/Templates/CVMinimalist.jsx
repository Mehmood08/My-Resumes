import React from 'react';
import { marked } from 'marked';
import { LuMail, LuPhone, LuMapPin, LuLink } from "react-icons/lu";
import './CVMinimalist.css';

const CVMinimalist = ({ data }) => {
    const renderSectionContent = (content) => {
        return <div dangerouslySetInnerHTML={{ __html: marked(content) }} />;
    };

    const getDisplayUrl = (url) => {
        try {
            return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
        } catch {
            return url;
        }
    };

    return (
        <div className="cv-minimalist">
            {/* Header Section */}
            <div className="mini-header">
                <h1>{data.name || "Your Name"}</h1>
                {data.profession && <div className="mini-profession">{data.profession}</div>}
            </div>

            {/* Contact Section - Separate Block */}
            <div className="mini-contact-section">
                {data.email && <div className="contact-line"><LuMail size={10} /> {data.email}</div>}
                {data.phone && <div className="contact-line"><LuPhone size={10} /> {data.phone}</div>}
                {data.city && <div className="contact-line"><LuMapPin size={10} /> {data.city}, {data.province}</div>}
                {data.link1 && (
                    <div className="contact-line">
                        <LuLink size={10} />
                        <a href={data.link1} target="_blank" rel="noopener noreferrer" className="contact-link">
                            {getDisplayUrl(data.link1)}
                        </a>
                    </div>
                )}
                {data.link2 && (
                    <div className="contact-line">
                        <LuLink size={10} />
                        <a href={data.link2} target="_blank" rel="noopener noreferrer" className="contact-link">
                            {getDisplayUrl(data.link2)}
                        </a>
                    </div>
                )}
            </div>

            {/* Divider */}
            <div className="mini-divider"></div>

            {/* Content Sections */}
            <div className="mini-content">
                {data.sections.map((sec, idx) => (
                    <div key={idx} className="mini-section">
                        <h2 className="section-title">{sec.title}</h2>
                        <div className="section-body">
                            {renderSectionContent(sec.content)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CVMinimalist;
