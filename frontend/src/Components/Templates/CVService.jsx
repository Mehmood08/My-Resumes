import React from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { LuMail, LuPhone, LuMapPin, LuLink } from "react-icons/lu";
import CVPage from './shared/CVPage';
import './CVService.css';

const CVService = ({ data }) => {
    const getDisplayUrl = (url) => {
        try {
            return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
        } catch {
            return url;
        }
    };

    return (
        <CVPage theme="service" className="cv-service">
            <header className="service-header">
                {data.photo && (
                    <div className="cv-photo-container">
                        <img src={data.photo} alt="Profile" className="cv-photo" />
                    </div>
                )}
                <div className="service-info">
                    <h1>{data.name}</h1>
                    <div className="contact-list">
                        {data.email && <span className="contact-item"><LuMail size={14} /> {data.email}</span>}
                        {data.phone && <span className="contact-item"><LuPhone size={14} /> {data.phone}</span>}
                        {data.city && <span className="contact-item"><LuMapPin size={14} /> {data.city}, {data.province}</span>}
                        {data.link1 && (
                            <a href={data.link1} target="_blank" rel="noopener noreferrer" className="contact-item contact-link">
                                <LuLink size={14} /> {getDisplayUrl(data.link1)}
                            </a>
                        )}
                        {data.link2 && (
                            <a href={data.link2} target="_blank" rel="noopener noreferrer" className="contact-item contact-link">
                                <LuLink size={14} /> {getDisplayUrl(data.link2)}
                            </a>
                        )}
                    </div>
                </div>
            </header>

            <div className="service-content">
                {data.sections.map((sec, idx) => (
                    <section key={idx} className="service-section cv-section">
                        <h2 className="service-section-title">{sec.title}</h2>
                        <div className="service-section-body cv-section-body" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked(sec.content)) }} />
                    </section>
                ))}
            </div>
        </CVPage>
    );
};

export default CVService;
