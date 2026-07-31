const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\d\s\-+().]{7,20}$/;
const YEAR_RE = /^(19|20)\d{2}$/;
const URL_RE = /^https?:\/\/.+/i;
const PLACEHOLDER_RE = /^\[(.+)\]$/;

export const HEADING_REQUIRED_FIELDS = [
    { id: 'firstName', label: 'First Name' },
    { id: 'lastName', label: 'Surname' },
    { id: 'profession', label: 'Profession' },
    { id: 'email', label: 'Email' },
    { id: 'phone', label: 'Phone' },
    { id: 'city', label: 'City' },
];

export function isPlaceholder(value) {
    if (!value?.trim()) return false;
    return PLACEHOLDER_RE.test(value.trim());
}

export function validateEmail(value) {
    const trimmed = value?.trim() || '';
    if (!trimmed) return 'Email is required';
    if (isPlaceholder(trimmed)) return 'Please replace the placeholder email';
    if (!EMAIL_RE.test(trimmed)) return 'Enter a valid email address';
    return null;
}

export function validatePhone(value) {
    const trimmed = value?.trim() || '';
    if (!trimmed) return 'Phone number is required';
    if (isPlaceholder(trimmed)) return 'Please replace the placeholder phone number';
    if (!PHONE_RE.test(trimmed)) return 'Enter a valid phone number (7–20 digits)';
    return null;
}

export function validateRequired(value, label) {
    const trimmed = value?.trim() || '';
    if (!trimmed) return `${label} is required`;
    if (isPlaceholder(trimmed)) return `Please replace the placeholder for ${label.toLowerCase()}`;
    return null;
}

export function validateYear(value) {
    const trimmed = value?.trim() || '';
    if (!trimmed) return 'Completion year is required';
    if (!YEAR_RE.test(trimmed)) return 'Enter a valid 4-digit year (e.g. 2024)';
    const year = parseInt(trimmed, 10);
    const currentYear = new Date().getFullYear();
    if (year > currentYear + 1) return `Year cannot be after ${currentYear + 1}`;
    if (year < 1950) return 'Year must be 1950 or later';
    return null;
}

export function validateOptionalUrl(value, label) {
    const trimmed = value?.trim() || '';
    if (!trimmed) return null;
    if (!URL_RE.test(trimmed)) return `${label} must start with http:// or https://`;
    return null;
}

export function validateExperienceYears(value) {
    const trimmed = value?.trim() || '';
    if (!trimmed) return 'Years of experience is required';
    const num = parseFloat(trimmed);
    if (isNaN(num) || num < 0 || num > 60) return 'Enter a valid number of years (0–60)';
    return null;
}

export function validateHeadingFields(personalInfo) {
    const errors = {};

    const firstNameErr = validateRequired(personalInfo.firstName, 'First name');
    if (firstNameErr) errors.firstName = firstNameErr;

    const lastNameErr = validateRequired(personalInfo.lastName, 'Surname');
    if (lastNameErr) errors.lastName = lastNameErr;

    const professionErr = validateRequired(personalInfo.profession, 'Profession');
    if (professionErr) errors.profession = professionErr;

    const emailErr = validateEmail(personalInfo.email);
    if (emailErr) errors.email = emailErr;

    const phoneErr = validatePhone(personalInfo.phone);
    if (phoneErr) errors.phone = phoneErr;

    const cityErr = validateRequired(personalInfo.city, 'City');
    if (cityErr) errors.city = cityErr;

    const link1Err = validateOptionalUrl(personalInfo.link1, 'LinkedIn URL');
    if (link1Err) errors.link1 = link1Err;

    const link2Err = validateOptionalUrl(personalInfo.link2, 'Portfolio URL');
    if (link2Err) errors.link2 = link2Err;

    return errors;
}

export function validateWizardAiFields(selections, stepIndex) {
    const errors = {};
    const step = stepIndex;

    if (step === 0) {
        const fullNameErr = validateRequired(selections.fullName, 'Full name');
        if (fullNameErr) errors.fullName = fullNameErr;
        else if (selections.fullName.trim().split(/\s+/).length < 2) {
            errors.fullName = 'Enter your first and last name';
        }

        const emailErr = validateEmail(selections.email);
        if (emailErr) errors.email = emailErr;

        const phoneErr = validatePhone(selections.phone);
        if (phoneErr) errors.phone = phoneErr;

        const cityErr = validateRequired(selections.city, 'City');
        if (cityErr) errors.city = cityErr;

        const linkedinErr = validateOptionalUrl(selections.linkedin, 'LinkedIn URL');
        if (linkedinErr) errors.linkedin = linkedinErr;

        const githubErr = validateOptionalUrl(selections.github, 'GitHub URL');
        if (githubErr) errors.github = githubErr;
    }

    if (step === 1) {
        const eduErr = validateRequired(selections.ai_education, 'Qualification');
        if (eduErr) errors.ai_education = eduErr;

        const schoolErr = validateRequired(selections.ai_school, 'Institute');
        if (schoolErr) errors.ai_school = schoolErr;

        const cityErr = validateRequired(selections.ai_school_city, 'Qualification city');
        if (cityErr) errors.ai_school_city = cityErr;

        const yearErr = validateYear(selections.ai_year);
        if (yearErr) errors.ai_year = yearErr;
    }

    if (step === 2) {
        const jdErr = validateRequired(selections.ai_jd, 'Job description');
        if (jdErr) errors.ai_jd = jdErr;
        else if (selections.ai_jd.trim().length < 50) {
            errors.ai_jd = 'Paste the full job description (at least 50 characters)';
        }
    }

    if (step === 3) {
        const yearsErr = validateExperienceYears(selections.experienceYears);
        if (yearsErr) errors.experienceYears = yearsErr;

        const summaryErr = validateRequired(selections.ai_summary, 'Experience summary');
        if (summaryErr) errors.ai_summary = summaryErr;
        else if (selections.ai_summary.trim().length < 30) {
            errors.ai_summary = 'Provide more detail about your experience (at least 30 characters)';
        }
    }

    return errors;
}

export function hasValidationErrors(errors) {
    return Object.keys(errors).length > 0;
}

export function formatValidationSummary(errors) {
    return Object.values(errors).join('\n');
}
