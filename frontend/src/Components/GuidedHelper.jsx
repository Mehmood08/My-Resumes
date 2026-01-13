import React, { useState } from 'react';
import { LuPlus, LuX, LuCheck } from "react-icons/lu";

/**
 * A modal form helper for adding structured items to the CV.
 * @param {string} type - 'experience', 'education', 'project', etc.
 * @param {function} onSave - Callback with the formatted markdown string.
 * @param {function} onClose - Callback to close the modal.
 */
const GuidedHelper = ({ type, onSave, onClose }) => {
    const [formData, setFormData] = useState({});

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        let markdown = "";

        switch (type) {
            case 'experience':
                // Format: ### Role | Company | Location
                // _Date_
                // * Description
                const role = formData.role || "Role";
                const company = formData.company || "Company";
                const date = formData.date || "Date Range";
                const location = formData.location ? ` | ${formData.location}` : "";
                const desc = formData.description || "";

                markdown = `### ${role} | ${company}${location}\n_${date}_\n\n${desc}`;
                break;

            case 'education':
                // Format: ### Degree | School | Location
                // _Date_
                const degree = formData.degree || "Degree";
                const school = formData.school || "School";
                const eduDate = formData.date || "Date Range";
                const eduLoc = formData.location ? ` | ${formData.location}` : "";
                const eduDesc = formData.description || "";

                markdown = `### ${degree} | ${school}${eduLoc}\n_${eduDate}_\n\n${eduDesc}`;
                break;

            case 'projects':
                // Format: ### Project Name | Tech Stack
                // * Description
                const projName = formData.name || "Project Name";
                const stack = formData.stack ? ` | ${formData.stack}` : "";
                const projDesc = formData.description || "";

                markdown = `### ${projName}${stack}\n\n${projDesc}`;
                break;

            case 'skills':
            case 'languages':
            case 'certifications':
                // List items
                const item = formData.item || "Item";
                markdown = `- ${item}`;
                break;

            default:
                markdown = formData.content || "";
        }

        onSave(markdown);
    };

    const renderFields = () => {
        switch (type) {
            case 'experience':
                return (
                    <>
                        <div className="form-group">
                            <label>Job Title / Role</label>
                            <input autoFocus placeholder="e.g. Senior Developer" onChange={e => handleChange('role', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Company</label>
                            <input placeholder="e.g. Google" onChange={e => handleChange('company', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Date Range</label>
                            <input placeholder="e.g. Jan 2020 - Present" onChange={e => handleChange('date', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Location (Optional)</label>
                            <input placeholder="e.g. New York, NY" onChange={e => handleChange('location', e.target.value)} />
                        </div>
                        <div className="form-group full-width">
                            <label>Description / Achievements (Markdown supported) </label>
                            <textarea
                                className="helper-textarea"
                                placeholder="- Led a team of 5 developers..."
                                onChange={e => handleChange('description', e.target.value)}
                            />
                        </div>
                    </>
                );
            case 'education':
                return (
                    <>
                        <div className="form-group">
                            <label>Degree / Certificate</label>
                            <input autoFocus placeholder="e.g. BS Computer Science" onChange={e => handleChange('degree', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>School / University</label>
                            <input placeholder="e.g. Harvard University" onChange={e => handleChange('school', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Date Range</label>
                            <input placeholder="e.g. 2016 - 2020" onChange={e => handleChange('date', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Location (Optional)</label>
                            <input placeholder="e.g. Cambridge, MA" onChange={e => handleChange('location', e.target.value)} />
                        </div>
                        <div className="form-group full-width">
                            <label>Description (Optional) </label>
                            <textarea
                                className="helper-textarea"
                                placeholder="Relevant coursework, honors..."
                                onChange={e => handleChange('description', e.target.value)}
                            />
                        </div>
                    </>
                );
            case 'projects':
                return (
                    <>
                        <div className="form-group">
                            <label>Project Name</label>
                            <input autoFocus placeholder="e.g. E-commerce Platform" onChange={e => handleChange('name', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Tech Stack / Tools</label>
                            <input placeholder="e.g. React, Node.js, MongoDB" onChange={e => handleChange('stack', e.target.value)} />
                        </div>
                        <div className="form-group full-width">
                            <label>Description</label>
                            <textarea
                                className="helper-textarea"
                                placeholder="- Built a scalable platform handling..."
                                onChange={e => handleChange('description', e.target.value)}
                            />
                        </div>
                    </>
                );
            case 'skills':
            case 'languages':
            case 'certifications':
                return (
                    <div className="form-group full-width">
                        <label>Item</label>
                        <input autoFocus placeholder={`Add a ${type.slice(0, -1)}...`} onChange={e => handleChange('item', e.target.value)} />
                    </div>
                );
            default:
                return <p>No helper available for this section.</p>;
        }
    };

    return (
        <div className="guided-helper-overlay">
            <div className="guided-helper-modal">
                <div className="helper-header">
                    <h3>Add {type.charAt(0).toUpperCase() + type.slice(1)}</h3>
                    <button className="close-btn" onClick={onClose}><LuX /></button>
                </div>
                <div className="helper-body form-grid">
                    {renderFields()}
                </div>
                <div className="helper-footer">
                    <button className="cancel-btn" onClick={onClose}>Cancel</button>
                    <button className="save-btn" onClick={handleSave}><LuCheck className="icon-sm" /> Add to CV</button>
                </div>
            </div>
        </div>
    );
};

export default GuidedHelper;
