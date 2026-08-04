import crypto from 'crypto';
import Invite from '../models/Invite.js';
import User from '../models/User.js';
import UserConfig from '../models/UserConfig.js';
import normalizeEmail from './normalizeEmail.js';
import {
    getEffectiveConfig,
    getInheritedMaskedFields,
    DEFAULT_GEMINI_MODEL,
} from './configHelper.js';

const INVITE_EXPIRY_DAYS = 7;

export async function createInvite(fromUserId, rawEmail) {
    const toUserEmail = normalizeEmail(rawEmail);
    if (!toUserEmail) {
        throw new Error('A valid email address is required.');
    }

    const existingUser = await User.findOne({ email: toUserEmail });
    if (existingUser) {
        throw new Error('A user with this email already exists.');
    }

    const activePending = await Invite.findOne({
        toUserEmail,
        status: 'pending',
        expiresAt: { $gt: new Date() },
    });

    if (activePending) {
        if (String(activePending.fromUserId) !== String(fromUserId)) {
            throw new Error('An invitation has already been sent to this email.');
        }

        activePending.token = crypto.randomBytes(32).toString('hex');
        activePending.expiresAt = new Date(Date.now() + INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
        await activePending.save();
        return { invite: activePending, resent: true };
    }

    await Invite.updateMany(
        { toUserEmail, status: 'pending', expiresAt: { $lte: new Date() } },
        { status: 'expired' }
    );

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    const invite = await Invite.create({
        fromUserId,
        toUserEmail,
        token,
        expiresAt,
    });

    return { invite, resent: false };
}

export async function validateInviteToken(token) {
    if (!token) {
        return { valid: false, message: 'Invitation token is required.' };
    }

    const invite = await Invite.findOne({ token });
    if (!invite) {
        return { valid: false, message: 'This invitation link is invalid.' };
    }

    if (invite.status === 'accepted') {
        return { valid: false, message: 'This invitation has already been used.' };
    }

    if (invite.status === 'expired' || invite.expiresAt < new Date()) {
        if (invite.status !== 'expired') {
            invite.status = 'expired';
            await invite.save();
        }
        return { valid: false, message: 'This invitation has expired.' };
    }

    const inviter = await User.findById(invite.fromUserId);
    return {
        valid: true,
        invite,
        email: invite.toUserEmail,
        inviterName: inviter?.name || 'A team member',
    };
}

export async function acceptInvite(invite, userId, userEmail) {
    const normalizedEmail = normalizeEmail(userEmail);
    if (normalizedEmail !== invite.toUserEmail) {
        throw new Error('This invitation was sent to a different email address.');
    }

    invite.status = 'accepted';
    invite.acceptedAt = new Date();
    invite.acceptedByUserId = userId;
    await invite.save();
}

export async function copyInviterSettingsToUser(fromUserId, toUserId) {
    const existing = await UserConfig.findOne({ userId: String(toUserId) });
    if (existing) return existing;

    const { config } = await getEffectiveConfig(fromUserId);
    const values = {
        GEMINI_API_KEY: config.GEMINI_API_KEY || '',
        GEMINI_MODEL: config.GEMINI_MODEL || DEFAULT_GEMINI_MODEL,
        RESEND_API_KEY: config.RESEND_API_KEY || '',
        EMAIL_FROM: config.EMAIL_FROM || '',
    };

    return UserConfig.create({
        userId: toUserId,
        ...values,
        copiedFromUserId: fromUserId,
        maskedFields: getInheritedMaskedFields(values),
    });
}
