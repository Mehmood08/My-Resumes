import React from 'react';
import { marked } from 'marked';
import './CVEuropean.css';

const CVEuropean = ({ data }) => {
    const renderSectionContent = (content) => {
        return <div dangerouslySetInnerHTML={{ __html: marked(content) }} />;
    };

    const initials = data.name ? data.name.substring(0, 2).toUpperCase() : "ME";

    return (
        <div className="cv-european">
            <aside className="cv-sidebar">
                <div className="user-initials">{initials}</div>
                <div className="sidebar-contact">
                    <h3>Contact</h3>
                    {data.email && <p className="contact-item"><strong>Email:</strong> {data.email}</p>}
                    {data.phone && <p className="contact-item"><strong>Phone:</strong> {data.phone}</p>}
                </div>
            </aside>

            <main className="cv-main">
                <header className="main-header">
                    <h1>{data.name || "Your Name"}</h1>
                    <div className="header-decoration"></div>
                </header>
                {data.intro && (
                    <div className="cv-intro" style={{ marginBottom: '25px', opacity: 0.8 }}>
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
            </main>
        </div>
    );
};

export default CVEuropean;
