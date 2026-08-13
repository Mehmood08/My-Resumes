import React from 'react';
import {
    Document,
    Page,
    View,
    Text,
    Image,
    StyleSheet,
    Link,
} from '@react-pdf/renderer';
import { getPdfTheme } from './pdfThemes';
import { parseSectionBlocks } from '../../utils/parseCvSectionMarkdown';

const PAGE_PADDING = 36;

function displayUrl(url = '') {
    return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

function buildContactParts(data, theme) {
    const parts = [];
    if (data.email) parts.push(data.email);
    if (data.phone) parts.push(data.phone);
    const location = [data.city, data.province, data.zip].filter(Boolean).join(', ');
    if (location) parts.push(location);
    if (data.link1) parts.push(displayUrl(data.link1));
    if (data.link2) parts.push(displayUrl(data.link2));
    return parts;
}

function SectionBlocks({ blocks, theme, styles }) {
    return blocks.map((block, idx) => {
        switch (block.type) {
            case 'h3':
                return (
                    <Text key={idx} style={styles.entryTitle}>
                        {block.text}
                    </Text>
                );
            case 'date':
                return (
                    <Text key={idx} style={styles.entryDate}>
                        {block.text}
                    </Text>
                );
            case 'ul':
                return (
                    <View key={idx} style={styles.list}>
                        {block.items.map((item, i) => (
                            <View key={i} style={styles.listItem}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={styles.listText}>{item}</Text>
                            </View>
                        ))}
                    </View>
                );
            default:
                return (
                    <Text key={idx} style={styles.paragraph}>
                        {block.text}
                    </Text>
                );
        }
    });
}

function CvSections({ data, theme, styles }) {
    if (!data.sections?.length) return null;

    return data.sections.map((section, idx) => (
        <View key={idx} style={styles.section}>
            {theme.sectionTitle.fill ? (
                <View style={[styles.sectionTitleBar, { backgroundColor: theme.sectionTitle.fill }]}>
                    <Text style={[styles.sectionTitleText, styles.sectionTitleOnFill]}>{section.title}</Text>
                </View>
            ) : (
                <View style={styles.sectionTitleRow}>
                    <Text style={styles.sectionTitleText}>{section.title.toUpperCase()}</Text>
                    <View style={[styles.sectionRule, { borderBottomColor: theme.sectionTitle.border }]} />
                </View>
            )}
            <View style={styles.sectionBody}>
                <SectionBlocks
                    blocks={parseSectionBlocks(section.content)}
                    theme={theme}
                    styles={styles}
                />
            </View>
        </View>
    ));
}

function ProfilePhoto({ data, styles }) {
    if (!data.photo || (!data.photo.startsWith('data:') && !data.photo.startsWith('http'))) {
        return null;
    }
    return <Image src={data.photo} style={styles.photo} />;
}

function ContactLine({ data, theme, styles, light = false }) {
    const parts = buildContactParts(data, theme);
    if (!parts.length) return null;
    return (
        <Text style={[styles.contact, light && styles.contactLight]}>
            {parts.join('   |   ')}
        </Text>
    );
}

function StandardHeader({ data, theme, styles }) {
    return (
        <View style={styles.header}>
            <ProfilePhoto data={data} styles={styles} />
            <View style={styles.titleBlock}>
                <Text style={styles.name}>{data.name || 'Your Name'}</Text>
                {data.profession ? <Text style={styles.profession}>{data.profession}</Text> : null}
            </View>
            <ContactLine data={data} theme={theme} styles={styles} />
        </View>
    );
}

function ExecutiveHeader({ data, theme, styles }) {
    return (
        <View style={[styles.header, styles.executiveHeader]}>
            <View style={styles.executiveLeft}>
                <ProfilePhoto data={data} styles={styles} />
                <View style={styles.titleBlock}>
                    <Text style={styles.name}>{data.name || 'Your Name'}</Text>
                    {data.profession ? <Text style={styles.professionItalic}>{data.profession}</Text> : null}
                </View>
            </View>
            <View style={styles.executiveRight}>
                {buildContactParts(data, theme).map((part, i) => (
                    <Text key={i} style={styles.contact}>{part}</Text>
                ))}
            </View>
        </View>
    );
}

function GulfHeader({ data, theme, styles }) {
    return (
        <View style={[styles.header, styles.gulfHeader, { backgroundColor: theme.headerBand.backgroundColor }]}>
            <ProfilePhoto data={data} styles={styles.gulfPhoto} />
            <View style={styles.titleBlock}>
                <Text style={[styles.name, styles.gulfName]}>{data.name || 'Your Name'}</Text>
                {data.profession ? <Text style={styles.gulfProfession}>{data.profession}</Text> : null}
            </View>
            <ContactLine data={data} theme={theme} styles={styles} light />
        </View>
    );
}

function CreativeHeader({ data, theme, styles }) {
    return (
        <View style={[styles.header, styles.creativeHeader, { backgroundColor: theme.headerBand.backgroundColor }]}>
            <ProfilePhoto data={data} styles={styles.creativePhoto} />
            <View style={styles.titleBlock}>
                <Text style={[styles.name, styles.creativeName]}>{data.name || 'Your Name'}</Text>
                {data.profession ? <Text style={styles.creativeProfession}>{data.profession}</Text> : null}
            </View>
        </View>
    );
}

function TechHeader({ data, theme, styles }) {
    return (
        <View style={[styles.header, styles.techHeader]}>
            <ProfilePhoto data={data} styles={styles.techPhoto} />
            <View style={[styles.titleBlock, styles.techBrand]}>
                <Text style={styles.name}>{data.name || 'Your Name'}</Text>
                {data.profession ? <Text style={styles.techTag}>{`> ${data.profession}`}</Text> : null}
            </View>
            <View style={styles.techContactCol}>
                {data.email ? <Text style={styles.techCode}>{data.email}</Text> : null}
                {data.phone ? <Text style={styles.techCode}>{data.phone}</Text> : null}
                {data.city ? <Text style={styles.techCode}>{data.city}</Text> : null}
                {data.link1 ? <Link src={data.link1} style={styles.techCode}>{displayUrl(data.link1)}</Link> : null}
                {data.link2 ? <Link src={data.link2} style={styles.techCode}>{displayUrl(data.link2)}</Link> : null}
            </View>
        </View>
    );
}

function SidebarLayout({ data, theme, styles, hideMainHeader = false }) {
    return (
        <View style={styles.sidebarLayout}>
            <View style={[styles.sidebar, { width: theme.sidebar.width, backgroundColor: theme.sidebar.backgroundColor }]}>
                <ProfilePhoto data={data} styles={styles.sidebarPhoto} />
                <Text style={styles.sidebarLabel}>CONTACT</Text>
                {buildContactParts(data, theme).map((part, i) => (
                    <Text key={i} style={styles.sidebarContact}>{part}</Text>
                ))}
            </View>
            <View style={styles.sidebarMain}>
                {!hideMainHeader && (
                    <View style={styles.titleBlock}>
                        <Text style={styles.name}>{data.name || 'Your Name'}</Text>
                        {data.profession ? <Text style={styles.profession}>{data.profession}</Text> : null}
                        <View style={[styles.accentBar, { backgroundColor: theme.accent }]} />
                    </View>
                )}
                <CvSections data={data} theme={theme} styles={styles} />
            </View>
        </View>
    );
}

function createStyles(theme) {
    return StyleSheet.create({
        page: {
            padding: theme.layout === 'sidebar' || theme.layout === 'gulf' ? 0 : PAGE_PADDING,
            fontFamily: theme.fontFamily,
            fontSize: theme.body.size,
            color: theme.page.color,
            backgroundColor: theme.page.backgroundColor,
            lineHeight: 1.45,
        },
        header: {
            marginBottom: 24,
            alignItems: theme.headerStyle === 'center' ? 'center' : 'flex-start',
            borderBottomWidth: theme.headerStyle === 'center' || theme.headerStyle === 'executive' ? 1 : 0,
            borderBottomColor: theme.accent,
            paddingBottom: theme.headerStyle === 'center' || theme.headerStyle === 'executive' ? 16 : 0,
        },
        titleBlock: {
            alignItems: theme.headerStyle === 'center' || theme.headerStyle === 'gulf' ? 'center' : 'flex-start',
            marginBottom: 4,
        },
        photo: {
            width: 72,
            height: 72,
            borderRadius: 36,
            marginBottom: 14,
            objectFit: 'cover',
        },
        name: {
            fontFamily: theme.headingFont,
            fontSize: theme.name.size,
            color: theme.name.color,
            lineHeight: 1.35,
            marginBottom: 8,
        },
        profession: {
            fontSize: theme.profession.size,
            color: theme.profession.color,
            lineHeight: 1.55,
            marginBottom: 12,
        },
        professionItalic: {
            fontSize: theme.profession.size,
            color: theme.profession.color,
            fontStyle: 'italic',
            lineHeight: 1.55,
            marginBottom: 12,
        },
        contact: {
            fontSize: theme.contact.size,
            color: theme.contact.color,
            textAlign: theme.headerStyle === 'center' ? 'center' : 'left',
            marginTop: 4,
            lineHeight: 1.5,
        },
        contactLight: {
            color: theme.contact.color,
        },
        section: {
            marginBottom: 14,
        },
        sectionTitleRow: {
            marginBottom: 6,
        },
        sectionTitleText: {
            fontFamily: theme.headingFont,
            fontSize: theme.sectionTitle.size,
            color: theme.sectionTitle.color,
            letterSpacing: 0.8,
            marginBottom: 3,
        },
        sectionTitleOnFill: {
            color: '#ffffff',
            marginBottom: 0,
        },
        sectionRule: {
            borderBottomWidth: 1,
            marginBottom: 4,
        },
        sectionTitleBar: {
            paddingVertical: 5,
            paddingHorizontal: 10,
            marginBottom: 8,
            borderRadius: 2,
        },
        sectionBody: {},
        entryTitle: {
            fontFamily: theme.headingFont,
            fontSize: theme.body.size + 0.5,
            color: theme.body.color,
            marginTop: 6,
            marginBottom: 2,
        },
        entryDate: {
            fontSize: theme.body.size - 1,
            color: theme.contact.color,
            marginBottom: 4,
        },
        paragraph: {
            fontSize: theme.body.size,
            color: theme.body.color,
            marginBottom: 4,
        },
        list: {
            marginTop: 2,
            marginBottom: 4,
        },
        listItem: {
            flexDirection: 'row',
            marginBottom: 2,
            paddingRight: 8,
        },
        bullet: {
            width: 10,
            fontSize: theme.body.size,
            color: theme.body.color,
        },
        listText: {
            flex: 1,
            fontSize: theme.body.size,
            color: theme.body.color,
        },
        executiveHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottomWidth: 2,
            borderBottomColor: theme.accent,
        },
        executiveLeft: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        executiveRight: {
            alignItems: 'flex-end',
        },
        gulfHeader: {
            padding: 28,
            alignItems: 'center',
            marginBottom: 20,
        },
        gulfPhoto: {
            width: 80,
            height: 80,
            borderRadius: 40,
            marginBottom: 14,
            objectFit: 'cover',
        },
        gulfName: {
            color: theme.name.color,
        },
        gulfProfession: {
            color: theme.profession.color,
            lineHeight: 1.55,
            marginBottom: 12,
        },
        creativeHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 24,
            marginBottom: 0,
            borderBottomWidth: 0,
        },
        creativePhoto: {
            width: 72,
            height: 72,
            borderRadius: 36,
            objectFit: 'cover',
            marginRight: 16,
        },
        creativeName: {
            color: theme.name.color,
        },
        creativeProfession: {
            color: theme.profession.color,
            lineHeight: 1.55,
            marginBottom: 12,
        },
        techHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            borderLeftWidth: 4,
            borderLeftColor: theme.accent,
            paddingLeft: 12,
            marginBottom: 20,
        },
        techPhoto: {
            width: 64,
            height: 64,
            objectFit: 'cover',
            borderWidth: 2,
            borderColor: theme.accent,
            marginRight: 12,
        },
        techBrand: {
            flex: 1,
        },
        techTag: {
            color: theme.profession.color,
            fontFamily: 'Courier',
            fontSize: theme.profession.size,
            lineHeight: 1.55,
            marginBottom: 12,
        },
        techContactCol: {
            alignItems: 'flex-end',
        },
        techCode: {
            fontFamily: 'Courier',
            fontSize: theme.contact.size,
            color: theme.contact.color,
            backgroundColor: '#1e293b',
            paddingHorizontal: 6,
            paddingVertical: 2,
            marginBottom: 3,
        },
        sidebarLayout: {
            flexDirection: 'row',
            minHeight: '100%',
        },
        sidebar: {
            paddingTop: 28,
            paddingHorizontal: 16,
            paddingBottom: 24,
        },
        sidebarPhoto: {
            width: 72,
            height: 72,
            borderRadius: 36,
            marginBottom: 16,
            objectFit: 'cover',
        },
        sidebarLabel: {
            fontFamily: theme.headingFont,
            fontSize: 9,
            color: theme.sidebarAccent,
            letterSpacing: 1,
            marginBottom: 10,
            borderBottomWidth: 1,
            borderBottomColor: '#334155',
            paddingBottom: 6,
        },
        sidebarContact: {
            fontSize: 8,
            color: theme.contact.color,
            marginBottom: 8,
            lineHeight: 1.35,
        },
        sidebarMain: {
            flex: 1,
            padding: PAGE_PADDING,
            paddingLeft: 28,
        },
        accentBar: {
            width: 40,
            height: 3,
            marginTop: 6,
            marginBottom: 18,
        },
        bodyPad: {
            paddingHorizontal: PAGE_PADDING,
            paddingBottom: PAGE_PADDING,
        },
    });
}

function PageContent({ data, format, styles, theme }) {
    if (theme.layout === 'sidebar') {
        return (
            <>
                {theme.headerStyle === 'creative' ? <CreativeHeader data={data} theme={theme} styles={styles} /> : null}
                <SidebarLayout
                    data={data}
                    theme={theme}
                    styles={styles}
                    hideMainHeader={theme.headerStyle === 'creative'}
                />
            </>
        );
    }

    if (theme.layout === 'gulf') {
        return (
            <>
                <GulfHeader data={data} theme={theme} styles={styles} />
                <View style={styles.bodyPad}>
                    <CvSections data={data} theme={theme} styles={styles} />
                </View>
            </>
        );
    }

    if (theme.layout === 'tech') {
        return (
            <View style={styles.bodyPad}>
                <TechHeader data={data} theme={theme} styles={styles} />
                <CvSections data={data} theme={theme} styles={styles} />
            </View>
        );
    }

    if (theme.headerStyle === 'executive') {
        return (
            <>
                <ExecutiveHeader data={data} theme={theme} styles={styles} />
                <CvSections data={data} theme={theme} styles={styles} />
            </>
        );
    }

    return (
        <>
            <StandardHeader data={data} theme={theme} styles={styles} />
            <CvSections data={data} theme={theme} styles={styles} />
        </>
    );
}

export default function CVPdfDocument({ data, format = 'Professional' }) {
    const theme = getPdfTheme(format);
    const styles = createStyles(theme);

    return (
        <Document title={data.name || 'Resume'} author={data.name || 'Resume'}>
            <Page size="A4" wrap style={styles.page}>
                <PageContent data={data} format={format} styles={styles} theme={theme} />
            </Page>
        </Document>
    );
}
