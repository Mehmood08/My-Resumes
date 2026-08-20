import React from 'react';
import { LuMail, LuPhone, LuMapPin, LuLink } from 'react-icons/lu';
import CVPhoto from './CVPhoto';
import CVContact, { CVContactPlain } from './CVContact';
import { AMERICA_CONTACT_ORDER, getDisplayUrl } from './cvUtils';

function NameBlock({ data, nameClassName, professionClassName, professionTag: ProfessionTag = 'p', showProfession = true }) {
    return (
        <>
            <h1 className={nameClassName}>{data.name || 'Your Name'}</h1>
            {showProfession && data.profession ? (
                <ProfessionTag className={professionClassName}>{data.profession}</ProfessionTag>
            ) : null}
        </>
    );
}

function ProfessionalHeader({ data }) {
    return (
        <header className="cv-header">
            <CVPhoto photo={data.photo} name={data.name} />
            <div className="header-center">
                <NameBlock data={data} professionClassName="cv-profession" />
            </div>
            <CVContact data={data} className="contact-info" itemTag="div" />
        </header>
    );
}

function CenteredHeader({ data, includeZip, contactOrder, itemTag = 'span' }) {
    return (
        <header className="cv-header">
            <CVPhoto photo={data.photo} name={data.name} />
            <NameBlock data={data} professionClassName="cv-profession" />
            <CVContact
                data={data}
                className="contact-info"
                itemTag={itemTag}
                includeZip={includeZip}
                order={contactOrder}
            />
        </header>
    );
}

function MinimalistHeader({ data }) {
    return (
        <div className="mini-header">
            <CVPhoto photo={data.photo} name={data.name} />
            <h1>{data.name || 'Your Name'}</h1>
            {data.profession ? <div className="mini-profession">{data.profession}</div> : null}
            <CVContactPlain data={data} />
        </div>
    );
}

function EuropeanSidebarHeader({ data }) {
    return (
        <aside className="cv-sidebar">
            <CVPhoto photo={data.photo} name={data.name} fallback="initials" />
            <CVContact
                data={data}
                className="sidebar-contact"
                itemTag="p"
                includeZip
                linkIconOutside
                heading="Contact"
            />
        </aside>
    );
}

function EuropeanMainHeader({ data }) {
    return (
        <header className="main-header">
            <NameBlock data={data} professionClassName="cv-profession" />
            <div className="header-decoration" />
        </header>
    );
}

function CreativeBannerHeader({ data }) {
    return (
        <div className="creative-header">
            <div className="header-content-wrapper">
                <CVPhoto photo={data.photo} name={data.name} />
                <div className="header-content">
                    <NameBlock data={data} professionClassName="cv-profession" />
                </div>
            </div>
        </div>
    );
}

function CreativeSidebarHeader({ data }) {
    return (
        <aside className="creative-sidebar">
            <CVContact
                data={data}
                className="contact-block"
                itemTag="p"
                linkIconOutside
                heading="Contact"
            />
        </aside>
    );
}

function AcademicHeader({ data }) {
    return (
        <>
            <CVPhoto photo={data.photo} name={data.name} />
            <h1 className="name-center">{data.name}</h1>
            <CVContact
                data={data}
                className="contact-center"
                itemTag="span"
                iconSize={12}
            />
        </>
    );
}

function ExecutiveHeader({ data }) {
    return (
        <header className="exec-header">
            <div className="header-top-wrapper">
                <CVPhoto photo={data.photo} name={data.name} />
                <div className="title-block">
                    <h1>{data.name}</h1>
                    {data.profession ? <p className="subtitle">{data.profession}</p> : null}
                </div>
            </div>
            <CVContact data={data} className="info-block" itemTag="span" />
        </header>
    );
}

function ServiceHeader({ data }) {
    return (
        <header className="service-header">
            <CVPhoto photo={data.photo} name={data.name} />
            <div className="service-info">
                <h1>{data.name}</h1>
                <CVContact data={data} className="contact-list" itemTag="span" />
            </div>
        </header>
    );
}

function TechHeader({ data }) {
    return (
        <header className="tech-header">
            <CVPhoto photo={data.photo} name={data.name} />
            <div className="tech-branding">
                <h1>{data.name}</h1>
                {data.profession ? <div className="tag">&gt; {data.profession}</div> : null}
            </div>
            <div className="tech-info">
                {data.email && (
                    <code><LuMail size={12} style={{ marginRight: '5px' }} />{data.email}</code>
                )}
                {data.phone && (
                    <code><LuPhone size={12} style={{ marginRight: '5px' }} />{data.phone}</code>
                )}
                {data.city && (
                    <code><LuMapPin size={12} style={{ marginRight: '5px' }} />{data.city}</code>
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
    );
}

/**
 * Template header variants — composes CVPhoto + CVContact + name block.
 *
 * Variants:
 *   professional, centered, minimalist,
 *   european-sidebar, european-main,
 *   creative-banner, creative-sidebar,
 *   academic, executive, service, tech
 */
export default function CVHeader({ variant, data, includeZip, contactOrder, itemTag }) {
    switch (variant) {
        case 'professional':
            return <ProfessionalHeader data={data} />;
        case 'centered':
            return (
                <CenteredHeader
                    data={data}
                    includeZip={includeZip}
                    contactOrder={contactOrder || AMERICA_CONTACT_ORDER}
                    itemTag={itemTag}
                />
            );
        case 'minimalist':
            return <MinimalistHeader data={data} />;
        case 'european-sidebar':
            return <EuropeanSidebarHeader data={data} />;
        case 'european-main':
            return <EuropeanMainHeader data={data} />;
        case 'creative-banner':
            return <CreativeBannerHeader data={data} />;
        case 'creative-sidebar':
            return <CreativeSidebarHeader data={data} />;
        case 'academic':
            return <AcademicHeader data={data} />;
        case 'executive':
            return <ExecutiveHeader data={data} />;
        case 'service':
            return <ServiceHeader data={data} />;
        case 'tech':
            return <TechHeader data={data} />;
        default:
            return <CenteredHeader data={data} />;
    }
}
