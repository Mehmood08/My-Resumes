import React from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { LuMail, LuPhone, LuMapPin, LuLink } from "react-icons/lu";
import CVPage from './shared/CVPage';
import './CVAcademic.css';

const CVAcademic = ({ data }) => {
    const getDisplayUrl = (url) => {
        try {
            return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
        } catch {
            return url;
        }
    };

    return (
        <CVPage theme="academic" className="cv-academic">
            {data.photo && (
                <div className="cv-photo-container">
                    <img src={data.photo} alt="Profile" className="cv-photo" />
                </div>
            )}
            <h1 className="name-center">{data.name}</h1>
            <div className="contact-center">
                {data.email && <span className="contact-item"><LuMail size={12} /> {data.email}</span>}
                {data.phone && <span className="contact-item"><LuPhone size={12} /> {data.phone}</span>}
                {data.city && <span className="contact-item"><LuMapPin size={12} /> {data.city}, {data.province}</span>}
                {data.link1 && (
                    <a href={data.link1} target="_blank" rel="noopener noreferrer" className="contact-item contact-link">
                        <LuLink size={12} /> {getDisplayUrl(data.link1)}
                    </a>
                )}
                {data.link2 && (
                    <a href={data.link2} target="_blank" rel="noopener noreferrer" className="contact-item contact-link">
                        <LuLink size={12} /> {getDisplayUrl(data.link2)}
                    </a>
                )}
            </div>

            {data.sections.map((sec, idx) => (
                <section key={idx} className="acad-section cv-section">
                    <h2 className="acad-section-title">{sec.title}</h2>
                    <div className="acad-body cv-section-body" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked(sec.content)) }} />
                </section>
            ))}
        </CVPage>
    );
};

export default CVAcademic;
