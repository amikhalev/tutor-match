import { Request } from 'express';

import { hasRole } from '../config/auth';
import { UserRole } from '../entities';

export const home = {title: 'Home', href: '/', minimumRole: UserRole.None};
export const tutorSessions = {title: 'Tutor Sessions', href: '/tutor_sessions', minimumRole: UserRole.Student};

export const nav = [home, tutorSessions];

export function locals(req: Request) {
    const activeItem = nav.find(item => req.path === item.href);
    return {
        title: activeItem ? activeItem.title : 'Page',
        nav: nav.filter(item => hasRole(req, item.minimumRole))
            .map(item => ({
                ...item, active: item === activeItem,
            })),
        user: req.user,
    };
}
