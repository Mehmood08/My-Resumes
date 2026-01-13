import React from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { LuMail, LuPhone, LuMapPin, LuLink } from "react-icons/lu";
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
        <div className="cv-minimalist">
            {/* Header Section */}
            <div className="mini-header">
                <h1>{data.name || "Your Name"}</h1>
                {data.profession && <div className="mini-profession">{data.profession}</div>}

                {/* Contact Sub-line (Integrated) */}
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
