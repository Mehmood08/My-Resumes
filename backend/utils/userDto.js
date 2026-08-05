export function toSafeUser(user) {
    return {
        _id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        googleId: user.googleId || user._id.toString(),
    };
}
