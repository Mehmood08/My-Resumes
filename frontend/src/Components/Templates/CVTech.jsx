import React from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { LuMail, LuPhone, LuMapPin, LuLink } from "react-icons/lu";
import './CVTech.css';

const CVTech = ({ data }) => {
    const getDisplayUrl = (url) => {
        try {
            return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
        } catch {
            return url;
        }
    };
    return (
        <div className="cv-tech">
            <header className="tech-header">
                {data.photo && (
                    <div className="cv-photo-container">
                        <img src={data.photo} alt="Profile" className="cv-photo" />
                        <div className="photo-overlay"></div>
                    </div>
                )}
                <div className="tech-branding">
                    <h1>{data.name}</h1>
                    <div className="tag">&gt; {data.profession}</div>
                </div>
                <div className="tech-info">
                    {data.email && (
                        <code>
                            <LuMail size={12} style={{ marginRight: '5px' }} />
                            {data.email}
                        </code>
                    )}
                    {data.phone && (
                        <code>
                            <LuPhone size={12} style={{ marginRight: '5px' }} />
                            {data.phone}
                        </code>
                    )}
                    {data.city && (
                        <code>
                            <LuMapPin size={12} style={{ marginRight: '5px' }} />
                            {data.city}
                        </code>
                    )}
                    {data.link1 && (
                        <code>
                            <LuLink size={12} style={{ marginRight: '5px' }} />
                            <a href={data.link1} target="_blank" rel="noopener noreferrer" className="tech-link">
                                {getDisplayUrl(data.link1)}
                            </a>
                        </code>
                    )}
                    {data.link2 && (
                        <code>
                            <LuLink size={12} style={{ marginRight: '5px' }} />
                            <a href={data.link2} target="_blank" rel="noopener noreferrer" className="tech-link">
                                {getDisplayUrl(data.link2)}
                            </a>
                        </code>
                    )}
                </div>
            </header>

            <div className="tech-grid">
                {data.sections.map((sec, idx) => (
                    <section key={idx} className="tech-module">
                        <div className="module-header">// {sec.title}</div>
                        <div className="module-body" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked(sec.content)) }} />
                    </section>
                ))}
            </div>
        </div>
    );
};

export default CVTech;
