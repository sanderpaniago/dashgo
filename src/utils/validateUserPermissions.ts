type User = {
    permissions: string[];
    roles: string[];
};

type ValidateUserPermissionsParams = {
    user: User;
    permissions?: string[];
    roles?: string[];
};

export function validateUserPermissions({
    user,
    permissions,
    roles,
}: ValidateUserPermissionsParams) {
    if (permissions?.length > 0) {
        const hasPermissions = permissions.every(permission => {
            return user.permissions.includes(permission);
        })

        if (!hasPermissions) {
            return false;
        }
    }

    if (roles?.length > 0) {
        const hasAllRoles = roles.some(role => {
            return user.roles.includes(role);
        })

        if (!hasAllRoles) {
            return false;
        }
    }

    return true;
}
