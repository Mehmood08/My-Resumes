import React from 'react';
import { marked } from 'marked';
import { LuMail, LuPhone, LuMapPin, LuLink } from "react-icons/lu";
import './CVCreative.css';

const CVCreative = ({ data }) => {
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
        <div className="cv-creative">
            <div className="creative-header">
                <div className="header-blob"></div>
                <div className="header-content">
                    <h1>{data.name || "Your Name"}</h1>
                    <p className="cv-profession">{data.profession}</p>
                </div>
            </div>

            <div className="creative-layout">
                <aside className="creative-sidebar">
                    <div className="contact-block">
                        <h3>Contact</h3>
                        {data.email && (
                            <p className="contact-item">
                                <LuMail size={14} /> {data.email}
                            </p>
                        )}
                        {data.phone && (
                            <p className="contact-item">
                                <LuPhone size={14} /> {data.phone}
                            </p>
                        )}
                        {data.city && (
                            <p className="contact-item">
                                <LuMapPin size={14} /> {data.city}, {data.province}
                            </p>
                        )}
                        {data.link1 && (
                            <p className="contact-item">
                                <LuLink size={14} />
                                <a href={data.link1} target="_blank" rel="noopener noreferrer" className="contact-link">
                                    {getDisplayUrl(data.link1)}
                                </a>
                            </p>
                        )}
                        {data.link2 && (
                            <p className="contact-item">
                                <LuLink size={14} />
                                <a href={data.link2} target="_blank" rel="noopener noreferrer" className="contact-link">
                                    {getDisplayUrl(data.link2)}
                                </a>
                            </p>
                        )}
                    </div>
                </aside>

                <main className="creative-main">
                    {data.sections.map((sec, idx) => (
                        <section key={idx} className="cv-section">
                            <h2 className="section-title">{sec.title}</h2>
                            <div className="section-content">
                                {renderSectionContent(sec.content)}
                            </div>
                        </section>
                    ))}
                </main>
            </div>
        </div>
    );
};

export default CVCreative;
