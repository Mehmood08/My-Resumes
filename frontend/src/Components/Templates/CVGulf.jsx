import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { LuMail, LuPhone, LuMapPin, LuLink } from "react-icons/lu";
import './CVGulf.css';

const CVGulf = ({ data }) => {
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
        <div className="cv-gulf">
            <header className="cv-header">
                {data.photo && (
                    <div className="cv-photo-container">
                        <img src={data.photo} alt="Profile" className="cv-photo" />
                    </div>
                )}
                <h1>{data.name || "Your Name"}</h1>
                <p className="cv-profession">{data.profession}</p>
                <div className="contact-info">
                    {data.email && (
                        <div className="contact-item">
                            <LuMail size={14} /> {data.email}
                        </div>
                    )}
                    {data.phone && (
                        <div className="contact-item">
                            <LuPhone size={14} /> {data.phone}
                        </div>
                    )}
                    {data.city && (
                        <div className="contact-item">
                            <LuMapPin size={14} /> {data.city}, {data.province}
                        </div>
                    )}
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
            </header>
            <div className="cv-body">
                {data.intro && (
                    <div className="cv-intro" style={{ marginBottom: '20px', fontSize: '14px' }}>
                        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked(data.intro)) }} />
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
        </div>
    );
};

export default CVGulf;
