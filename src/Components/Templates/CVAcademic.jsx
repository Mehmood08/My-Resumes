import React from 'react';
import { marked } from 'marked';
import { LuMail, LuPhone, LuMapPin, LuLink } from "react-icons/lu";
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
        <div className="cv-academic">
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
                <section key={idx} className="acad-section">
                    <h3>{sec.title}</h3>
                    <div className="acad-body" dangerouslySetInnerHTML={{ __html: marked(sec.content) }} />
                </section>
            ))}
        </div>
    );
};

export default CVAcademic;
