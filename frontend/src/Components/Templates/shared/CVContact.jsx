import React from 'react';
import { LuMail, LuPhone, LuMapPin, LuLink } from 'react-icons/lu';
import { getDisplayUrl, DEFAULT_CONTACT_ORDER } from './cvUtils';

const ICONS = {
    email: LuMail,
    phone: LuPhone,
    location: LuMapPin,
    link1: LuLink,
    link2: LuLink,
};

function formatLocation(data, { includeZip, includeProvince, cityOnly }) {
    if (!data.city && !cityOnly) return null;
    if (cityOnly) return data.city || null;
    const parts = [data.city, data.province].filter(Boolean).join(', ');
    const zip = includeZip && data.zip ? ` ${data.zip}` : '';
    return parts ? `${parts}${zip}` : null;
}

function ContactIcon({ type, size, showIcons }) {
    if (!showIcons) return null;
    const Icon = ICONS[type];
    return Icon ? <Icon size={size} /> : null;
}

function renderContactItem({
    type,
    data,
    iconSize,
    showIcons,
    itemTag: ItemTag,
    itemClassName,
    linkClassName,
    linkIconOutside,
    includeZip,
    includeProvince,
    cityOnly,
}) {
    if (type === 'email' && !data.email) return null;
    if (type === 'phone' && !data.phone) return null;
    if (type === 'location' && !formatLocation(data, { includeZip, includeProvince, cityOnly })) return null;
    if (type === 'link1' && !data.link1) return null;
    if (type === 'link2' && !data.link2) return null;

    const icon = <ContactIcon type={type} size={iconSize} showIcons={showIcons} />;
    const iconGap = showIcons ? ' ' : null;

    if (type === 'email') {
        return (
            <ItemTag key={type} className={itemClassName}>
                {icon}{iconGap}{data.email}
            </ItemTag>
        );
    }

    if (type === 'phone') {
        return (
            <ItemTag key={type} className={itemClassName}>
                {icon}{iconGap}{data.phone}
            </ItemTag>
        );
    }

    if (type === 'location') {
        return (
            <ItemTag key={type} className={itemClassName}>
                {icon}{iconGap}{formatLocation(data, { includeZip, includeProvince, cityOnly })}
            </ItemTag>
        );
    }

    const url = type === 'link1' ? data.link1 : data.link2;
    const label = getDisplayUrl(url);

    if (linkIconOutside) {
        return (
            <ItemTag key={type} className={itemClassName}>
                {icon}
                <a href={url} target="_blank" rel="noopener noreferrer" className={linkClassName}>
                    {label}
                </a>
            </ItemTag>
        );
    }

    return (
        <a
            key={type}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${itemClassName} ${linkClassName}`.trim()}
        >
            {icon}{iconGap}{label}
        </a>
    );
}

/**
 * Configurable contact block shared across CV templates.
 */
export default function CVContact({
    data,
    className = 'contact-info',
    itemClassName = 'contact-item',
    linkClassName = 'contact-link',
    itemTag = 'div',
    iconSize = 14,
    showIcons = true,
    includeZip = false,
    includeProvince = true,
    cityOnly = false,
    linkIconOutside = false,
    order = DEFAULT_CONTACT_ORDER,
    heading,
    headingTag: HeadingTag = 'h3',
}) {
    const ItemTag = itemTag;
    const items = order
        .map((type) =>
            renderContactItem({
                type,
                data,
                iconSize,
                showIcons,
                itemTag: ItemTag,
                itemClassName,
                linkClassName,
                linkIconOutside,
                includeZip,
                includeProvince,
                cityOnly,
            })
        )
        .filter(Boolean);

    if (!items.length && !heading) return null;

    return (
        <div className={className}>
            {heading && <HeadingTag>{heading}</HeadingTag>}
            {items}
        </div>
    );
}

/** Plain-text contact row (Minimalist — no icons). */
export function CVContactPlain({ data, className = 'mini-contact-row' }) {
    const items = [];

    if (data.email) items.push(<span key="email">{data.email}</span>);
    if (data.phone) items.push(<span key="phone">{data.phone}</span>);
    if (data.city) items.push(<span key="location">{data.city}, {data.province}</span>);
    if (data.link1) {
        items.push(
            <a key="link1" href={data.link1} target="_blank" rel="noopener noreferrer">
                {getDisplayUrl(data.link1)}
            </a>
        );
    }
    if (data.link2) {
        items.push(
            <a key="link2" href={data.link2} target="_blank" rel="noopener noreferrer">
                {getDisplayUrl(data.link2)}
            </a>
        );
    }

    if (!items.length) return null;
    return <div className={className}>{items}</div>;
}
