import React from 'react';
import { marked } from 'marked';
import { LuMail, LuPhone, LuMapPin, LuLink } from "react-icons/lu";
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
        <div className="cv-service">
            <header className="service-header">
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
                    <section key={idx} className="service-section">
                        <h4>{sec.title}</h4>
                        <div dangerouslySetInnerHTML={{ __html: marked(sec.content) }} />
                    </section>
                ))}
            </div>
        </div>
    );
};

export default CVService;
